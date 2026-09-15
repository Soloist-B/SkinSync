'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import {
  Camera,
  Upload,
  Activity,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  RotateCcw,
  ShieldAlert,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Crop,
  Check,
} from 'lucide-react';
import { useSkinContext } from '../../context/SkinContext';
import { AIPredictResponse } from '../../types';

export default function CameraPage() {
  const router = useRouter();
  const { setScanResult } = useSkinContext();

  const webcamRef = useRef<Webcam>(null);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState<boolean>(true);

  // States สำหรับโหมดจัดตำแหน่งรูปภาพที่อัปโหลด (Interactive Pan & Zoom Cropper)
  const [rawUploadSrc, setRawUploadSrc] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 360, height: 480 });

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const rawImgRef = useRef<HTMLImageElement>(null);

  // ตรวจสอบว่าเบราว์เซอร์รองรับกล้องหรือไม่ (ถ้าต่อผ่าน IP แบบ HTTP เบราว์เซอร์มือถือจะปิดสิทธิ์ getUserMedia)
  useEffect(() => {
    const checkCameraSupport = () => {
      if (typeof window === 'undefined') return;

      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      const hasMedia = !!(
        navigator &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function'
      );

      // ถ้าไม่ใช่ localhost และไม่ใช่ HTTPS เบราว์เซอร์มือถือจะไม่มี getUserMedia
      const supported = (isLocal || window.isSecureContext) && hasMedia;
      setIsCameraSupported(supported);

      // หากไม่รองรับ ให้สลับไปโหมด Upload อัตโนมัติ เพื่อให้ผู้ใช้กดถ่ายรูปจากกล้องมือถือผ่าน file input ได้
      if (!supported) {
        setMode('upload');
      }
    };

    checkCameraSupport();
  }, []);

  // ปรับขนาด Container สำหรับคำนวณการจัดตำแหน่งรูปภาพ
  useEffect(() => {
    if (cropContainerRef.current) {
      setContainerSize({
        width: cropContainerRef.current.clientWidth || 360,
        height: cropContainerRef.current.clientHeight || 480,
      });
    }
  }, [rawUploadSrc]);

  // คำนวณขนาดภาพเริ่มต้นเพื่อครอบคลุมกล่อง 3:4
  const imageDisplayDimensions = React.useMemo(() => {
    if (!naturalSize) return null;
    const baseScale = Math.max(
      containerSize.width / naturalSize.width,
      containerSize.height / naturalSize.height
    );
    return {
      baseWidth: naturalSize.width * baseScale,
      baseHeight: naturalSize.height * baseScale,
    };
  }, [naturalSize, containerSize]);

  const clearCurrentPreview = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setRawUploadSrc(null);
    setRawFile(null);
    setNaturalSize(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setErrorMessage(null);
  };

  // 1. ถ่ายรูป + ครอปเฉพาะทรงวงรีด้วยความละเอียดสูง
  const captureAndCrop = () => {
    setErrorMessage(null);
    const video = webcamRef.current?.video;
    if (!video || video.readyState !== 4) {
      setErrorMessage('กล้องยังไม่พร้อมใช้งาน กรุณารอสักครู่');
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

    // คำนวณพิกเซลจริงตามความละเอียดกล้อง 1:1 Native Resolution
    const cropWidth = Math.round(guideWidthOnScreen / scale);
    const cropHeight = Math.round(guideHeightOnScreen / scale);
    const startX = Math.round((guideLeftOnScreen + offsetX) / scale);
    const startY = Math.round((guideTopOnScreen + offsetY) / scale);

    // สร้าง Canvas ตามความละเอียดจริง 100% จากกล้อง ไม่มีการลดทอนหรือสเกล
    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');
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

    // Mirror แนวนอน (เพื่อให้ตรงกับภาพมุมมองกล้องหน้าที่ผู้ใช้เห็นบนจอ)
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

    const dataUrl = canvas.toDataURL('image/png');

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], 'face-oval-capture.png', { type: 'image/png' });
      setSelectedFile(croppedFile);
      setImagePreview(dataUrl);
    }, 'image/png');
  };

  // จัดการการลาก (Pan/Drag) รูปภาพ
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // หมุนลูกกลิ้งเมาส์เพื่อซูม
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3.5));
  };

  // 2. เลือกไฟล์รูปภาพ (โหมด Upload) แล้วเปิดโหมดจัดตำแหน่ง (Pan & Zoom)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
          setRawUploadSrc(result);
          setRawFile(file);
          setZoom(1);
          setPan({ x: 0, y: 0 });
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // กดยืนยันการตัดภาพตามตำแหน่งที่ผู้ใช้จัด (Zoom & Pan)
  const confirmUploadCrop = () => {
    if (!cropContainerRef.current || !rawImgRef.current || !naturalSize || !rawFile) return;

    const currentContainerWidth = cropContainerRef.current.clientWidth || 360;
    const currentContainerHeight = cropContainerRef.current.clientHeight || 480;

    const baseScale = Math.max(
      currentContainerWidth / naturalSize.width,
      currentContainerHeight / naturalSize.height
    );
    const displayedWidth = naturalSize.width * baseScale * zoom;
    const displayedHeight = naturalSize.height * baseScale * zoom;

    const centerX = currentContainerWidth / 2;
    const centerY = currentContainerHeight / 2;

    const imgLeft = centerX + pan.x - displayedWidth / 2;
    const imgTop = centerY + pan.y - displayedHeight / 2;

    // ขนาดกรอบวงรีมาตรฐาน (rx=96, ry=128)
    const guideRx = 96;
    const guideRy = 128;
    const ovalLeft = centerX - guideRx;
    const ovalTop = centerY - guideRy;
    const ovalWidth = guideRx * 2;
    const ovalHeight = guideRy * 2;

    // คำนวณพิกัดบนรูปภาพขนาดจริง 1:1
    const screenToNatural = naturalSize.width / displayedWidth;
    const cropX = (ovalLeft - imgLeft) * screenToNatural;
    const cropY = (ovalTop - imgTop) * screenToNatural;
    const cropW = ovalWidth * screenToNatural;
    const cropH = ovalHeight * screenToNatural;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(cropW));
    canvas.height = Math.max(1, Math.round(cropH));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Mask ทรงวงรี
    ctx.beginPath();
    ctx.ellipse(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      canvas.height / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.clip();

    ctx.drawImage(
      rawImgRef.current,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const dataUrl = canvas.toDataURL('image/png');
    canvas.toBlob((blob) => {
      if (!blob) return;
      const cropped = new File([blob], 'face-oval-upload.png', { type: 'image/png' });
      setSelectedFile(cropped);
      setImagePreview(dataUrl);
      setRawUploadSrc(null);
    }, 'image/png');
  };

  // ยกเลิกการจัดตำแหน่ง แล้วกลับไปเลือกรูปใหม่
  const cancelUploadCrop = () => {
    setRawUploadSrc(null);
    setRawFile(null);
    setNaturalSize(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 3. กดยืนยันส่งรูปไปประมวลผลที่ Backend API
  const handleConfirmScan = async () => {
    if (!selectedFile || !imagePreview) return;

    setLoading(true);
    setErrorMessage(null);

    // ลำดับความสำคัญของ API URL:
    // 1. ดึงจาก NEXT_PUBLIC_API_URL ใน Environment Variables ก่อนเสมอ (เช่น ngrok หรือ Cloud Backend)
    // 2. ถ้าไม่ได้ตั้งไว้ ให้ใช้ hostname และ protocol เดียวกับที่กำลังเปิดเว็บ
    // 3. ค่าเริ่มต้น 127.0.0.1:8000
    let apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';
    if (!apiUrl) {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          apiUrl = `${protocol}//${hostname}:8000`;
        } else {
          apiUrl = `${protocol}//127.0.0.1:8000`;
        }
      } else {
        apiUrl = 'http://127.0.0.1:8000';
      }
    }

    try {
      const formData = new FormData();
      const fileName = selectedFile.name || 'image.png';
      formData.append('file', selectedFile, fileName);

      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': '69420',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Server error: HTTP ${response.status}`);
      }

      const data: AIPredictResponse = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการประมวลผล');
      }

      // บันทึกผลลัพธ์ลง Context และส่งต่อไปยังแบบสอบถาม Triage
      setScanResult(selectedFile, imagePreview, data);
      router.push('/questionnaire');
    } catch (err: any) {
      console.error('Prediction error:', err);
      let msg = err.message || 'ไม่สามารถเชื่อมต่อ Server ได้ กรุณาตรวจสอบว่า Backend เปิดทำงานอยู่หรือไม่';
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && apiUrl.startsWith('http://')) {
        msg = 'ไม่สามารถส่งข้อมูลได้เนื่องจากเว็บไซต์เปิดด้วย HTTPS แต่ Backend เป็น HTTP (Mixed Content Blocked) กรุณาตั้งค่า NEXT_PUBLIC_API_URL เป็น HTTPS (เช่น ngrok หรือ Cloud Backend)';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 pt-5 pb-8 max-w-md mx-auto w-full">
      <div className="w-full flex flex-col items-center">
        {/* Top Navigation */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
            Face Scanner
          </span>
          <div className="w-9" />
        </div>

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">SkinSync</h1>
        </div>
        <p className="text-xs text-gray-500 mb-5 text-center leading-relaxed">
          ระบบวิเคราะห์ปัญหาผิวหน้าด้วยปัญญาประดิษฐ์และคัดกรองตามมาตรฐานคลินิก
        </p>

        {/* สลับโหมด ถ่ายรูป / อัปโหลด */}
        {!imagePreview && !rawUploadSrc && (
          <div className="flex w-full mb-5 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
            <button
              type="button"
              onClick={() => {
                setMode('camera');
                clearCurrentPreview();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                mode === 'camera'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              โหมดกล้องถ่ายรูป
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                clearCurrentPreview();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                mode === 'upload'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
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
            <div className="mb-4 rounded-3xl overflow-hidden bg-gray-50 aspect-[3/4] w-full border border-gray-200 relative shadow-xs flex items-center justify-center">
              <img src={imagePreview} alt="Face Preview" className="w-full h-full object-contain" />
            </div>

            {errorMessage && (
              <div className="w-full mb-4 p-3 bg-rose-50 text-rose-700 rounded-2xl text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={clearCurrentPreview}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 text-gray-700 text-xs font-medium transition-all flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                ถ่ายใหม่ / เลือกใหม่
              </button>

              <button
                type="button"
                onClick={handleConfirmScan}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-2xl text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 shadow-xs active:scale-[0.98] disabled:opacity-70 cursor-pointer"
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
          mode === 'camera' ? (
            isCameraSupported ? (
              <div className="w-full flex flex-col items-center">
                {cameraError && (
                  <div className="w-full mb-4 p-3.5 bg-amber-50 text-amber-900 rounded-2xl text-xs flex items-center gap-2.5 border border-amber-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-700" />
                    <span>{cameraError}</span>
                  </div>
                )}

                <div className="rounded-3xl overflow-hidden mb-4 bg-black aspect-[3/4] w-full relative shadow-xs flex items-center justify-center border border-gray-800">
                  <Webcam
                    key={mode}
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: 'user',
                      width: { ideal: 3840 },
                      height: { ideal: 2160 },
                    }}
                    onUserMediaError={() => {
                      setCameraError('ไม่สามารถเปิดกล้องได้ โปรดอนุญาตสิทธิ์กล้อง หรือใช้โหมดอัปโหลดรูปภาพ');
                    }}
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />

                  {/* กรอบวงรีแนะนำตำแหน่งด้วย SVG Mask */}
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
                  className="w-full py-3.5 px-4 rounded-2xl text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  บันทึกภาพใบหน้า
                </button>
              </div>
            ) : (
              <div className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-6 text-center mb-4">
                <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h3 className="text-xs font-bold text-gray-800 mb-1">กล้องสดจำเป็นต้องใช้งานผ่าน HTTPS หรือ Localhost</h3>
                <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                  เนื่องจากข้อกำหนดความปลอดภัยของเบราว์เซอร์บนมือถือ สิทธิ์การเปิดกล้องผ่าน IP ต้องใช้ HTTPS กรุณาใช้โหมดอัปโหลดรูปภาพ ซึ่งสามารถกดถ่ายรูปได้เช่นเดียวกัน
                </p>
                <button
                  type="button"
                  onClick={() => setMode('upload')}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  สลับไปใช้โหมดอัปโหลดรูปภาพ
                </button>
              </div>
            )
          ) : (
            rawUploadSrc ? (
              <div className="w-full flex flex-col items-center animate-fadeIn">
                {/* Header / Instructions */}
                <div className="flex items-center justify-between w-full mb-2.5">
                  <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5 text-indigo-600" />
                    จัดตำแหน่งใบหน้าให้ตรงกรอบวงรี
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono font-medium">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* Cropper Viewport */}
                <div
                  ref={cropContainerRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onWheel={handleWheel}
                  className="rounded-3xl overflow-hidden mb-3 bg-black aspect-[3/4] w-full relative shadow-xs flex items-center justify-center border border-gray-800 touch-none select-none cursor-grab active:cursor-grabbing"
                >
                  {imageDisplayDimensions && (
                    <img
                      ref={rawImgRef}
                      src={rawUploadSrc}
                      alt="Uploaded Face"
                      draggable={false}
                      className="absolute max-w-none pointer-events-none origin-center"
                      style={{
                        width: `${imageDisplayDimensions.baseWidth}px`,
                        height: `${imageDisplayDimensions.baseHeight}px`,
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      }}
                    />
                  )}

                  {/* SVG Oval Guide Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                    <defs>
                      <mask id="face-hole-mask-upload">
                        <rect width="100%" height="100%" fill="white" />
                        <ellipse cx="50%" cy="50%" rx="96" ry="128" fill="black" />
                      </mask>
                    </defs>
                    <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#face-hole-mask-upload)" />
                    <ellipse cx="50%" cy="50%" rx="96" ry="128" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeDasharray="6 6" />
                  </svg>

                  <span className="absolute bottom-3 text-white/90 text-[11px] bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs pointer-events-none font-medium">
                    แตะลากเพื่อเลื่อน • ใช้แถบเพื่อซูม
                  </span>
                </div>

                {/* Zoom Controls */}
                <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-2.5 mb-4 shadow-xs flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))}
                    className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="ซูมออก"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <input
                    type="range"
                    min="1"
                    max="3.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.5, +(z + 0.2).toFixed(2)))}
                    className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="ซูมเข้า"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                    }}
                    className="text-[10px] font-medium text-gray-400 hover:text-indigo-600 px-2 py-1 rounded-md border border-gray-200 hover:border-indigo-200 transition-colors cursor-pointer"
                  >
                    รีเซ็ต
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={cancelUploadCrop}
                    className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 text-gray-700 text-xs font-medium transition-all flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    เลือกรูปใหม่
                  </button>

                  <button
                    type="button"
                    onClick={confirmUploadCrop}
                    className="flex-1 py-3 px-4 rounded-2xl text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-[0.98] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    ตัดภาพตามตำแหน่งนี้
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <label className="mb-4 w-full aspect-[3/4] bg-white border-2 border-dashed border-gray-200 hover:border-indigo-300 rounded-3xl flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-all group shadow-xs">
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl shadow-xs mb-3 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800">คลิกเพื่อเลือกหรือถ่ายภาพใบหน้า</span>
                  <span className="text-[11px] text-gray-400 mt-1">รองรับการกดถ่ายรูปโดยตรง หรือเลือกจากคลังภาพ</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )
          )
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-[11px] pt-4">
        SkinSync AI Skincare Triage Platform
      </footer>
    </div>
  );
}
