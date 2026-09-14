import sys
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image, UnidentifiedImageError
import numpy as np
import io

app = FastAPI(title="SkinSync API", version="1.0.0")

# อนุญาต CORS สำหรับการเชื่อมต่อจาก Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("กำลังโหลดโมเดล 7 Classes...")
model = load_model("skin_efficientnetv2_7classes_best.keras", compile=False)
print("[INFO] โหลดโมเดลสำเร็จ")

# ชื่อคลาส 7 อย่างตามโมเดล
CLASSES = [
    'Pigmentation & Dark spots',
    'Redness',
    'Inflammatory acne',
    'Blackheads',
    'Whiteheads',
    'Pores',
    'Wrinkles'
]
THRESHOLD = 0.20  # 20%
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ไฟล์รูปภาพไม่ถูกต้องหรือไม่สามารถเปิดได้"
        )
    # ขนาด 384x384 ตามที่โมเดลระบุ
    img = img.resize((384, 384))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}

# ใช้ฟังก์ชัน def ปกติเพื่อให้ FastAPI รันใน background threadpool อัตโนมัติ ไม่บล็อก Asyncio Event Loop
@app.post("/predict")
def predict_acne(file: UploadFile = File(...)):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ประเภทไฟล์ไม่ถูกต้อง ({file.content_type}) ต้องเป็นไฟล์รูปภาพเท่านั้น"
        )

    try:
        contents = file.file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="ขนาดไฟล์เกินขีดจำกัดสูงสุด (15 MB)"
            )
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ไฟล์ว่างเปล่า"
            )

        processed_image = preprocess_image(contents)

        # รันโมเดลโดยตรง ลด overhead ของ model.predict() เมื่อทำนายภาพเดี่ยว
        raw_predictions = model(processed_image, training=False).numpy()[0]

        all_scores = []
        detected_issues = []

        # วนลูปเช็คทั้ง 7 คลาส
        for i, pred in enumerate(raw_predictions):
            score = float(pred)
            item = {"class_name": CLASSES[i], "probability": score}
            all_scores.append(item)

            # ถ้าเกิน Threshold 20% ถือว่าพบปัญหา
            if score >= THRESHOLD:
                detected_issues.append(item)

        # เรียงลำดับคะแนนจากความน่าจะเป็นสูงสุดลงไป
        sorted_scores = sorted(all_scores, key=lambda x: x["probability"], reverse=True)

        return {
            "status": "success",
            "detected_count": len(detected_issues),
            "detected_issues": detected_issues,
            "all_scores": sorted_scores,
            "message": "พบปัญหาผิวที่ควรได้รับการดูแล" if len(detected_issues) > 0 else "ผิวอยู่ในเกณฑ์สมบูรณ์ ไม่พบปัญหาหลัก"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"เกิดข้อผิดพลาดในการประมวลผล: {str(e)}"
        )