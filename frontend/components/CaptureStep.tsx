"use client";

import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, Activity, AlertCircle, Loader2, Image as ImageIcon, RotateCcw, ShieldAlert } from "lucide-react";
import { AIPredictResponse } from "../types";

interface CaptureStepProps {
  onScanComplete: (file: File, previewUrl: string, apiResult: AIPredictResponse) => void;
}

export default function CaptureStep({ onScanComplete }: CaptureStepProps) {
  const webcamRef = useRef<Webcam>(null);
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState<boolean>(true);

  // ตรวจสอบว่าเบราว์เซอร์รองรับกล้องหรือไม่ (ถ้าต่อผ่าน IP แบบ HTTP เบราว์เซอร์มือถือจะปิดสิทธิ์ getUserMedia)
  useEffect(() => {
    const checkCameraSupport = () => {
      if (typeof window === "undefined") return;

      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const hasMedia = !!(
        navigator &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
      );

      // ถ้าไม่ใช่ localhost และไม่ใช่ HTTPS เบราว์เซอร์มือถือจะไม่มี getUserMedia
      const supported = (isLocal || window.isSecureContext) && hasMedia;
      setIsCameraSupported(supported);

      // หากไม่รองรับ ให้สลับไปโหมด Upload อัตโนมัติ เพื่อให้ผู้ใช้กดถ่ายรูปจากกล้องมือถือผ่าน file input ได้
      if (!supported) {
        setMode("upload");
      }
    };

    checkCameraSupport();
  }, []);

  const clearCurrentPreview = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setErrorMessage(null);
  };

  // 1. ถ่ายรูป + ครอปเฉพาะทรงวงรี
  const captureAndCrop = () => {
    setErrorMessage(null);
    const video = webcamRef.current?.video;
    if (!video || video.readyState !== 4) {
      setErrorMessage("กล้องยังไม่พร้อมใช้งาน กรุณารอสักครู่");
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const clientWidth = video.clientWidth;
    const clientHeight = video.clientHeight;

    const scale = Math.max(clientWidth / videoWidth, clientHeight / videoHeight);
    const displayedVideoWidth = videoWidth * scale;
    const displayedVideoHeight = videoHeight * scale;
    const offsetX = (displayedVideoWidth - clientWidth) / 2;
    const offsetY = (displayedVideoHeight - clientHeight) / 2;

    const guideWidthOnScreen = 192;
    const guideHeightOnScreen = 256;
    const guideLeftOnScreen = (clientWidth - guideWidthOnScreen) / 2;
    const guideTopOnScreen = (clientHeight - guideHeightOnScreen) / 2;

    const cropWidth = guideWidthOnScreen / scale;
    const cropHeight = guideHeightOnScreen / scale;
    const startX = (guideLeftOnScreen + offsetX) / scale;
    const startY = (guideTopOnScreen + offsetY) / scale;

    const canvas = document.createElement("canvas");
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mask ทรงวงรี
    ctx.beginPath();
    ctx.ellipse(
      cropWidth / 2,
      cropHeight / 2,
      cropWidth / 2,
      cropHeight / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.clip();

    // Mirror แนวนอน
    ctx.translate(cropWidth, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
      video,
      startX,
      startY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const dataUrl = canvas.toDataURL("image/png");

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], "face-oval-capture.png", { type: "image/png" });
      setSelectedFile(croppedFile);
      setImagePreview(dataUrl);
    }, "image/png");
  };

  // 2. เลือกไฟล์รูปภาพ (โหมด Upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. กดยืนยันส่งรูปไปประมวลผลที่ Backend API
  const handleConfirmScan = async () => {
    if (!selectedFile || !imagePreview) return;

    setLoading(true);
    setErrorMessage(null);

    // ลำดับความสำคัญของ API URL:
    // 1. ดึงจาก NEXT_PUBLIC_API_URL ใน Environment Variables ก่อนเสมอ (เช่น ngrok หรือ Cloud Backend)
    // 2. ถ้าไม่ได้ตั้งไว้ และเปิดผ่าน IP เครื่อง Local (192.168.x.x) ให้ส่งไปที่พอร์ต 8000 ของเครื่องนั้น
    // 3. ค่าเริ่มต้น 127.0.0.1:8000
    let apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';
    if (!apiUrl) {
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        apiUrl = `http://${window.location.hostname}:8000`;
      } else {
        apiUrl = 'http://127.0.0.1:8000';
      }
    }

    try {
      const formData = new FormData();
      const fileName = selectedFile.name || "image.png";
      formData.append("file", selectedFile, fileName);

      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: {
         "ngrok-skip-browser-warning": "69420", // ค่าอะไรก็ได้ที่ไม่ใช่ค่าว่าง
        },
        body: formData,
      });      

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Server error: HTTP ${response.status}`);
      }

      const data: AIPredictResponse = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการประมวลผล");
      }

      // ส่งต่อไปยังแบบสอบถาม Triage
      onScanComplete(selectedFile, imagePreview, data);
    } catch (err: any) {
      console.error("Prediction error:", err);
      setErrorMessage(err.message || "ไม่สามารถเชื่อมต่อ Server ได้ กรุณาตรวจสอบว่า Backend เปิดทำงานอยู่หรือไม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
          <Activity className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">SkinSync</h1>
      </div>
      <p className="text-xs text-gray-500 mb-6 text-center">
        ระบบวิเคราะห์ปัญหาผิวหน้าด้วยปัญญาประดิษฐ์และคัดกรองตามมาตรฐานคลินิก
      </p>

      {/* สลับโหมด ถ่ายรูป / อัปโหลด */}
      {!imagePreview && (
        <div className="flex w-full mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("camera");
              clearCurrentPreview();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              mode === "camera"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Camera className="w-4 h-4" />
            โหมดกล้องถ่ายรูป
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("upload");
              clearCurrentPreview();
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              mode === "upload"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            โหมดอัปโหลดรูปภาพ
          </button>
        </div>
      )}

      {/* เมื่อมีรูปพรีวิวแล้ว */}
      {imagePreview ? (
        <div className="w-full flex flex-col items-center animate-fadeIn">
          <div className="mb-4 rounded-2xl overflow-hidden bg-gray-50 aspect-[3/4] w-full border border-gray-200 relative shadow-inner flex items-center justify-center">
            <img src={imagePreview} alt="Face Preview" className="w-full h-full object-contain" />
          </div>

          {errorMessage && (
            <div className="w-full mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={clearCurrentPreview}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-medium transition-all flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              ถ่ายใหม่ / เลือกใหม่
            </button>

            <button
              type="button"
              onClick={handleConfirmScan}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl text-white text-xs font-medium transition-all flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 shadow-xs active:scale-[0.98] disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังส่งข้อมูลวิเคราะห์...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  ยืนยันภาพเพื่อเริ่มการคัดกรอง
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* โหมดถ่ายรูป หรือ โหมดอัปโหลด */
        mode === "camera" ? (
          isCameraSupported ? (
            <div className="w-full flex flex-col items-center">
              {cameraError && (
                <div className="w-full mb-4 p-3.5 bg-amber-50 text-amber-900 rounded-xl text-xs flex items-center gap-2.5 border border-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700" />
                  <span>{cameraError}</span>
                </div>
              )}

              <div className="rounded-2xl overflow-hidden mb-4 bg-black aspect-[3/4] w-full relative shadow-inner flex items-center justify-center">
                <Webcam
                  key={mode}
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  onUserMediaError={() => {
                    setCameraError("ไม่สามารถเปิดกล้องได้ โปรดอนุญาตสิทธิ์กล้อง หรือใช้โหมดอัปโหลดรูปภาพ");
                  }}
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                
                {/* กรอบวงรีแนะนำตำแหน่งด้วย SVG Mask ป้องกันข้อผิดพลาดของ Layer บนมือถือ */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <defs>
                    <mask id="face-hole-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <ellipse cx="50%" cy="50%" rx="96" ry="128" fill="black" />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.4)" mask="url(#face-hole-mask)" />
                  <ellipse cx="50%" cy="50%" rx="96" ry="128" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeDasharray="6 6" />
                </svg>

                <span className="absolute bottom-4 text-white/90 text-[11px] bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs pointer-events-none font-medium">
                  จัดตำแหน่งใบหน้าให้อยู่ในกรอบวงรี
                </span>
              </div>

              <button
                type="button"
                onClick={captureAndCrop}
                className="w-full py-3.5 px-4 rounded-xl text-white text-xs font-medium transition-all flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                บันทึกภาพใบหน้า
              </button>
            </div>
          ) : (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center mb-4">
              <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-xs font-bold text-gray-800 mb-1">กล้องสดจำเป็นต้องใช้งานผ่าน HTTPS หรือ Localhost</h3>
              <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                เนื่องจากข้อกำหนดความปลอดภัยของเบราว์เซอร์บนมือถือ (iOS/Android) สิทธิ์การเปิดกล้องผ่าน IP ต้องใช้ HTTPS กรุณาใช้โหมดอัปโหลดรูปภาพ ซึ่งสามารถกดถ่ายรูปได้เช่นเดียวกัน
              </p>
              <button
                type="button"
                onClick={() => setMode("upload")}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                สลับไปใช้โหมดอัปโหลดรูปภาพ
              </button>
            </div>
          )
        ) : (
          <div className="w-full flex flex-col items-center">
            <label className="mb-4 w-full aspect-[3/4] bg-gray-50 border border-dashed border-gray-300 hover:border-gray-400 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-all group">
              <div className="p-3 bg-white rounded-full shadow-xs mb-2 group-hover:scale-105 transition-transform text-gray-500">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">คลิกเพื่อเลือกหรือถ่ายภาพใบหน้า</span>
              <span className="text-[10px] text-gray-400 mt-0.5">รองรับการกดถ่ายรูปโดยตรง หรือเลือกจากคลังภาพ</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )
      )}
    </div>
  );
}
