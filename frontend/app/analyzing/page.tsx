'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSkinContext } from '../../context/SkinContext';
import { Loader2, AlertCircle } from 'lucide-react';

const statusMessages = [
  'กำลังเตรียมข้อมูลภาพถ่าย...',
  'วิเคราะห์ด้วยโมเดล Deep Learning 7 Classes...',
  'ประเมินระดับความน่าจะเป็นของปัญหาผิว...',
  'ประมวลผลคำแนะนำเฉพาะบุคคลตามมาตรฐานคลินิก...',
];

export default function AnalyzingPage() {
  const router = useRouter();
  const { aiResult, analysisError, processAnalysis, isHydrated } = useSkinContext();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (aiResult) {
      processAnalysis();
      const timer = setTimeout(() => {
        router.push('/results');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, aiResult, processAnalysis, router]);

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto w-full">
      {!aiResult || analysisError ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs w-full max-w-sm"
        >
          <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            {analysisError ? 'เกิดข้อผิดพลาดในการประมวลผล' : 'ไม่พบข้อมูลภาพถ่าย'}
          </h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            {analysisError || 'กรุณาถ่ายภาพหรืออัปโหลดรูปภาพใบหน้าก่อนทำการประเมิน'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/camera')}
            className="w-full bg-gray-900 text-white rounded-2xl py-3 text-xs font-semibold hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
          >
            ถ่ายภาพหรือเลือกภาพใหม่อีกครั้ง
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 max-w-xs w-full"
        >
          {/* Minimalist Spinner */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-xs">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Processing
            </span>

            <div className="h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs sm:text-sm font-semibold text-gray-800"
                >
                  {statusMessages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <p className="text-[11px] text-gray-400">กรุณารอสักครู่ ระบบกำลังประมวลผลร่วมกับ Triage Guidelines</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
