"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, Sparkles, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, RotateCcw } from "lucide-react";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // สร้าง State เพื่อสลับโหมดระหว่าง 'camera' และ 'upload'
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  
  // State สำหรับเก็บรูปภาพที่อัปโหลด หรือรูปที่แคปจากกล้อง (มาพรีวิวก่อนส่ง)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ฟังก์ชันหลักสำหรับส่งรูป (Blob/File) ไปยัง API
  const sendToAPI = async (fileBlob: Blob) => {
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", fileBlob, "image.jpg");

      // เปลี่ยน IP กลับเป็น 127.0.0.1 สำหรับเทสในคอม
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ status: "error", message: "ไม่สามารถเชื่อมต่อ Server ได้" });
    } finally {
      setLoading(false);
    }
  };

  // 1. ฟังก์ชันเมื่อกดถ่ายรูปจากกล้อง (พร้อมกลับด้านภาพ และครอปตามกรอบหน้า)
  const captureAndPredict = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cropWidth = img.width * 0.65;
      const cropHeight = img.height * 0.75;
      const startX = (img.width - cropWidth) / 2;
      const startY = (img.height - cropHeight) / 2;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // กลับด้านภาพ (Flip Horizontal) ให้ตรงกับที่ผู้ใช้เห็นในจอพรีวิว
      ctx.translate(cropWidth, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(
        img,
        startX, startY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      canvas.toBlob((blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
        setSelectedFile(croppedFile);
        setImagePreview(URL.createObjectURL(blob));
        setResult(null);
      }, "image/jpeg", 0.95);
    };
  };

  // 2. ฟังก์ชันเมื่อเลือกไฟล์รูปภาพ (โหมดอัปโหลด)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file)); 
      setResult(null); 
    }
  };

  // 3. ฟังก์ชันเมื่อกดยืนยันส่งรูปไป API
  const confirmAndPredict = () => {
    if (!selectedFile) return;
    sendToAPI(selectedFile);
  };

  // 4. รีเซ็ตภาพเพื่อถ่าย/เลือกใหม่ (รวมถึงเปิดสิทธิ์กล้องใหม่ป้องกันเว็บหลับ)
  const handleRetake = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResult(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md flex flex-col items-center transition-all">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">SkinSync</h1>
        </div>
        <p className="text-xs text-gray-400 mb-6 text-center">วิเคราะห์ปัญหาผิวและสิวด้วยเทคโนโลยีปัญญาประดิษฐ์</p>
        
        {/* ปุ่มสลับโหมด */}
        {!imagePreview && (
          <div className="flex w-full mb-6 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => { setMode("camera"); handleRetake(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                mode === "camera" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Camera className="w-4 h-4" />
              ใช้กล้อง
            </button>
            <button
              onClick={() => { setMode("upload"); handleRetake(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                mode === "upload" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Upload className="w-4 h-4" />
              อัปโหลดรูป
            </button>
          </div>
        )}

        {/* กรณีที่มีรูปพรีวิวแล้ว */}
        {imagePreview ? (
          <div className="w-full flex flex-col items-center">
            <div className="mb-4 rounded-2xl overflow-hidden bg-gray-50 aspect-[3/4] w-full border border-gray-100 relative">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleRetake}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                ถ่ายใหม่ / เปลี่ยนรูป
              </button>
              
              <button
                onClick={confirmAndPredict}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl text-white text-sm font-medium transition-all flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 shadow-sm active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    ยืนยันสแกน
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* กรณีที่ยังไม่มีรูป ให้แสดงจอตามโหมดที่เลือก */
          mode === "camera" ? (
            <div className="w-full flex flex-col items-center">
              {/* กล้องแบบ Mirror บังคับให้แสดงผลสลับซ้ายขวาถูกต้อง */}
              <div className="rounded-2xl overflow-hidden mb-4 bg-black aspect-[3/4] w-full relative shadow-inner flex items-center justify-center">
                <Webcam
                  key={mode}
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {/* กรอบหน้าแนะนำ (Face Guide Overlay) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-64 border-2 border-dashed border-white/70 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"></div>
                </div>
                <span className="absolute bottom-4 text-white/80 text-[11px] bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                  จัดใบให้อยู่ในกรอบวงรี
                </span>
              </div>

              <button
                onClick={captureAndPredict}
                className="w-full py-3 px-4 rounded-xl text-white text-sm font-medium transition-all flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 shadow-sm active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" />
                ถ่ายภาพใบหน้า
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <label className="mb-4 w-full aspect-[3/4] bg-gray-50/50 border border-dashed border-gray-200 hover:border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-all group">
                <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-105 transition-transform text-gray-400 group-hover:text-gray-600">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-500">คลิกเพื่อเลือกรูปภาพใบหน้า</span>
                <span className="text-[10px] text-gray-400 mt-0.5">รองรับไฟล์ JPG, PNG</span>
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

        {/* แสดงผลลัพธ์การวิเคราะห์ */}
        {result && (
          <div className="mt-6 w-full animate-fadeIn">
            {result.status === "success" ? (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                <div className={`p-3.5 text-center text-xs font-semibold flex items-center justify-center gap-2 ${
                  result.detected_count > 0 ? 'bg-rose-50 text-rose-600 border-b border-rose-100' : 'bg-emerald-50 text-emerald-600 border-b border-emerald-100'
                }`}>
                  {result.detected_count > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {result.message}
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-500 mb-3 text-[11px] uppercase tracking-wider">เปอร์เซ็นต์การวิเคราะห์ผิว (Threshold 20%)</h3>
                  <div className="space-y-3">
                    {result.all_scores.map((item: any, index: number) => {
                      const isDetected = item.probability >= 0.20;
                      const percent = (item.probability * 100).toFixed(1);
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={isDetected ? "font-semibold text-rose-600" : "text-gray-600"}>
                              {item.class_name}
                            </span>
                            <span className={isDetected ? "font-semibold text-rose-600" : "text-gray-400"}>
                              {percent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200/70 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isDetected ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(Number(percent), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs text-center border border-rose-100 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {result.message || "เกิดข้อผิดพลาดในการวิเคราะห์"}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}