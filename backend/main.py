import sys
import os
import io
from contextlib import asynccontextmanager
from PIL import Image, UnidentifiedImageError
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

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
DEFAULT_THRESHOLD = float(os.getenv("DETECTION_THRESHOLD", "0.20"))  # 20%
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 15 * 1024 * 1024))  # 15 MB

# เก็บโมเดลไว้ใน Dictionary เพื่อบริหารจัดการด้วย FastAPI Lifespan
ml_models = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    model_path = os.getenv("MODEL_PATH", "skin_efficientnetv2_7classes_best.keras")
    print(f"กำลังโหลดโมเดล 7 Classes จาก {model_path}...")
    try:
        ml_models["model"] = load_model(model_path, compile=False)
        print("[INFO] โหลดโมเดลสำเร็จ พร้อมให้บริการ")
    except Exception as e:
        print(f"[ERROR] โหลดโมเดลล้มเหลว: {e}")
        ml_models["model"] = None
    yield
    print("[INFO] กำลังปิดระบบและเคลียร์โมเดล...")
    ml_models.clear()

app = FastAPI(
    title="SkinSync API",
    version="1.0.0",
    description="Skin analysis API using EfficientNetV2 deep learning model",
    lifespan=lifespan
)

# อนุญาต CORS สำหรับการเชื่อมต่อจาก Frontend (รองรับการตั้งค่าผ่าน ALLOWED_ORIGINS)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    is_ready = ml_models.get("model") is not None
    return {
        "status": "ok" if is_ready else "degraded",
        "model_loaded": is_ready,
        "threshold": DEFAULT_THRESHOLD,
        "classes_count": len(CLASSES)
    }

# ใช้ฟังก์ชัน def ปกติเพื่อให้ FastAPI รันใน background threadpool อัตโนมัติ ไม่บล็อก Asyncio Event Loop
@app.post("/predict")
def predict_acne(file: UploadFile = File(...)):
    model = ml_models.get("model")
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="โมเดล AI ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง"
        )

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

            # ถ้าเกิน Threshold ถือว่าพบปัญหา
            if score >= DEFAULT_THRESHOLD:
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