FROM python:3.11-slim

WORKDIR /app

# ติดตั้ง System Dependencies ที่จำเป็นสำหรับ OpenCV / Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโค้ดและไฟล์โมเดล
COPY . .

# กำหนด Port สำหรับ Cloud (เช่น Railway, Render ที่ส่งผ่าน $PORT)
ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
