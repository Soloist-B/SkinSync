'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Flame,
  Droplets,
  Sun,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useSkinContext } from '../../context/SkinContext';
import SkinConcernCard from '../../components/SkinConcernCard';

export default function ResultsPage() {
  const router = useRouter();
  const { capturedImage, aiResult, clinicalProfile, isHydrated, reset } = useSkinContext();

  useEffect(() => {
    if (!isHydrated) return;
    if (!aiResult || !clinicalProfile) {
      router.push('/');
    }
  }, [isHydrated, aiResult, clinicalProfile, router]);

  if (!isHydrated || !aiResult || !clinicalProfile) return null;

  const isCompromised = clinicalProfile.barrier.override;

  return (
    <div className="min-h-screen px-5 pt-6 pb-20 max-w-md mx-auto w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center pt-2">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 shadow-xs">
          Analysis Report
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-2.5">
          ผลการประเมินสภาพผิว
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          ประมวลผลร่วมกันระหว่าง AI Model (EfficientNetV2) และ Clinical Triage Guidelines
        </p>
      </div>

      {/* User Photo & AI Summary */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-20 h-24 rounded-2xl overflow-hidden bg-black border border-gray-200 flex-shrink-0 relative shadow-inner flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="User Face" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-gray-400">ไม่มีรูปภาพ</span>
            )}
            <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1.5 py-0.5 rounded backdrop-blur-xs font-medium">
              ภาพสแกน
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1.5 ${
                aiResult.detected_count > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {aiResult.detected_count > 0 ? (
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span className="truncate">{aiResult.message}</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              ตรวจพบปัญหาผิวที่มีระดับความน่าจะเป็นตั้งแต่ 20% ขึ้นไป จำนวน{' '}
              <span className="font-bold text-gray-900">{aiResult.detected_count}</span> อาการ
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: AI Detected Concerns */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            ปัญหาผิวจากแบบจำลอง AI
          </h2>
          <span className="text-[11px] font-medium text-gray-400">เกณฑ์ตรวจพบ &ge; 20%</span>
        </div>

        <div className="space-y-2">
          {aiResult.all_scores.map((scoreItem) => (
            <SkinConcernCard
              key={scoreItem.class_name}
              concern={scoreItem.class_name}
              probability={scoreItem.probability}
              isDetected={scoreItem.probability >= 0.2}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Clinical Skin Profile (Triage) */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          ข้อมูลสรีรวิทยาผิว (Clinical Baseline)
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              icon: ShieldCheck,
              label: 'เกราะป้องกันผิว',
              value: clinicalProfile.barrier.title.split(' (')[0],
              color: 'text-indigo-600',
            },
            {
              icon: Flame,
              label: 'ระดับความไวผิว',
              value: clinicalProfile.sensitivity.title.split(' (')[0],
              color: 'text-amber-600',
            },
            {
              icon: Droplets,
              label: 'อัตราผลิตน้ำมัน',
              value: clinicalProfile.sebum.title.split(' (')[0],
              color: 'text-blue-600',
            },
            {
              icon: Sun,
              label: 'โทนสีผิวธรรมชาติ',
              value: clinicalProfile.fitzpatrick.title.split(' (')[0],
              color: 'text-orange-600',
            },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 mb-1 text-gray-400">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-[11px] text-gray-500 font-medium">{item.label}</span>
              </div>
              <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Formulation Logic & Guidelines */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          เกณฑ์คัดกรองสารออกฤทธิ์เฉพาะบุคคล
        </h2>

        <div className="space-y-2.5">
          {/* Clinical Override Alert */}
          {isCompromised && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs shadow-xs">
              <div className="flex items-center gap-2 text-rose-800 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                คำสั่งด่วนทางการแพทย์: CLINICAL OVERRIDE
              </div>
              <p className="text-rose-900 text-[11px] leading-relaxed">
                เนื่องจากแบบประเมินระบุว่า <strong>เกราะป้องกันผิวถูกทำลาย (Compromised Barrier)</strong>{' '}
                ระบบได้สั่งระงับการจ่ายสารผลัดเซลล์ผิว (AHA, BHA) และเรตินอยด์ทุกชนิดชั่วคราว
                และบังคับจ่ายสารกลุ่ม <strong>Lipid Matrix Repair (Ceramide + Cholesterol + Free Fatty Acids 3:1:1)</strong> เพื่อเร่งสมานชั้นผิวก่อน
              </p>
            </div>
          )}

          {/* Recommended Targeting Actives */}
          {clinicalProfile.targetActives.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-xs text-xs space-y-2">
              <span className="font-bold text-gray-900 block">
                สารออกฤทธิ์สำคัญที่แนะนำเฉพาะคุณ:
              </span>
              <div className="space-y-2">
                {clinicalProfile.targetActives.map((t, idx) => (
                  <div key={idx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800 text-[11px]">{t.issue}</span>
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">
                        AI {(t.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      <strong>สารหลัก:</strong> {t.primaryActives.join(', ') || 'งดสารผลัดเซลล์ (เน้นปลอบประโลม)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banned Actives */}
          {clinicalProfile.bannedActives.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-xs text-xs">
              <span className="font-bold text-gray-900 block mb-1">สารที่สั่งระงับชั่วคราว:</span>
              <p className="text-rose-600 text-[11px] font-medium leading-relaxed">
                {clinicalProfile.bannedActives.join(', ')}
              </p>
            </div>
          )}

          {/* Recommended Vehicle Types */}
          {clinicalProfile.sebum.vehicleType && (
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-xs text-xs">
              <span className="font-bold text-gray-900 block mb-1">เนื้อสัมผัสที่แนะนำ:</span>
              <p className="text-gray-700 text-[11px]">{clinicalProfile.sebum.vehicleType}</p>
            </div>
          )}
        </div>
      </section>

      {/* Action CTA */}
      <div className="pt-2 space-y-2.5">
        <button
          type="button"
          onClick={() => router.push('/recommendations')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-3.5 px-6 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer"
        >
          ดูรายการสกินแคร์ที่แนะนำสำหรับคุณ (Top 6 หมวด)
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            reset();
            router.push('/');
          }}
          className="w-full text-gray-400 hover:text-gray-700 text-xs flex items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          เริ่มต้นประเมินใหม่
        </button>
      </div>
    </div>
  );
}
