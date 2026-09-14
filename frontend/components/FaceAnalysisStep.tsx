"use client";

import React from "react";
import { AIPredictResponse, QuestionnaireAnswers, ClinicalProfile } from "../types";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Droplets,
  Sun,
  Flame,
  ArrowRight,
  RotateCcw,
  Search,
  Check
} from "lucide-react";

interface FaceAnalysisStepProps {
  imagePreview: string;
  aiResult: AIPredictResponse;
  answers: QuestionnaireAnswers;
  clinicalProfile: ClinicalProfile;
  onViewRecommendations: () => void;
  onViewCatalog: () => void;
  onRetake: () => void;
}

export default function FaceAnalysisStep({
  imagePreview,
  aiResult,
  clinicalProfile,
  onViewRecommendations,
  onViewCatalog,
  onRetake
}: FaceAnalysisStepProps) {
  const isCompromised = clinicalProfile.barrier.override;

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
          <Activity className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          ผลการวิเคราะห์สภาพผิวหน้า
        </h2>
      </div>
      <p className="text-xs text-gray-400 mb-6 text-center">
        ประมวลผลร่วมกันระหว่าง AI Model (EfficientNetV2) และ Clinical Triage Guidelines
      </p>

      {/* รูปภาพและสรุปผลตรวจหลัก */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-xs p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-28 h-36 rounded-xl overflow-hidden bg-black border border-gray-200 flex-shrink-0 relative shadow-inner flex items-center justify-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="User Face"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-400">ไม่มีรูปภาพ</span>
            )}
            <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
              ภาพสแกน
            </span>
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                aiResult.detected_count > 0
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {aiResult.detected_count > 0 ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {aiResult.message}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              ตรวจพบปัญหาผิวที่มีระดับความน่าจะเป็นตั้งแต่ 20% ขึ้นไป จำนวน{" "}
              <span className="font-bold text-gray-900">{aiResult.detected_count}</span> จุด
            </p>
          </div>
        </div>
      </div>

      {/* การแจ้งเตือนกรณีฉุกเฉินทางการแพทย์ (Override Alert) */}
      {isCompromised && (
        <div className="w-full mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            คำสั่งด่วนทางการแพทย์: CLINICAL OVERRIDE
          </div>
          <p className="text-[11px] text-rose-900 leading-relaxed mb-2">
            เนื่องจากแบบประเมินระบุว่า <strong>เกราะป้องกันผิวถูกทำลาย (Compromised Barrier)</strong>{" "}
            ระบบได้สั่งระงับการจ่ายสารผลัดเซลล์ผิว (AHA, BHA) และเรตินอยด์ทุกชนิดชั่วคราว
            และบังคับจ่ายสารกลุ่ม <strong>Lipid Matrix Repair (Ceramide + Cholesterol + Free Fatty Acids ในสัดส่วน 3:1:1)</strong> เพื่อเร่งสมานชั้นผิวก่อน
          </p>
        </div>
      )}

      {/* สรุปข้อมูลสรีรวิทยา 4 มิติ (Physiological Profile) */}
      <div className="w-full mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          โปรไฟล์สรีรวิทยาผิว (Clinical Baseline)
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Barrier */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              เกราะป้องกันผิว
            </div>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {clinicalProfile.barrier.title.split(" (")[0]}
            </p>
          </div>

          {/* Sensitivity */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              ระดับความไวผิว
            </div>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {clinicalProfile.sensitivity.title.split(" (")[0]}
            </p>
          </div>

          {/* Sebum */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              อัตราการผลิตน้ำมัน
            </div>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {clinicalProfile.sebum.title.split(" (")[0]}
            </p>
          </div>

          {/* Fitzpatrick */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium mb-1">
              <Sun className="w-3.5 h-3.5 text-orange-500" />
              โทนสีผิวธรรมชาติ
            </div>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {clinicalProfile.fitzpatrick.title.split(" (")[0]}
            </p>
          </div>
        </div>
      </div>

      {/* แถบคะแนนทั้ง 7 คลาสจาก AI Model */}
      <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-700 text-xs mb-3 flex justify-between items-center">
          <span>สัดส่วนความน่าจะเป็นที่ AI ตรวจพบ (7 Classes)</span>
          <span className="text-[10px] text-gray-400 font-normal">เกณฑ์ Threshold 20%</span>
        </h3>

        <div className="space-y-2.5">
          {aiResult.all_scores.map((item, index) => {
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
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDetected ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(Number(percent), 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* สารออกฤทธิ์ที่แนะนำเฉพาะคุณ (Targeting Actives) */}
      <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mb-6 text-left">
        <h3 className="font-semibold text-gray-800 text-xs mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          สารออกฤทธิ์สำคัญที่เหมาะกับผิวของคุณ (Clinical Actives)
        </h3>

        {clinicalProfile.targetActives.length > 0 ? (
          <div className="space-y-3 mt-3">
            {clinicalProfile.targetActives.map((target, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <div className="font-semibold text-gray-800 mb-1 flex items-center justify-between">
                  <span>{target.issue}</span>
                  <span className="text-[10px] text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    AI {(target.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mb-1.5">
                  <strong className="text-gray-700">สารออกฤทธิ์หลัก:</strong>{" "}
                  {target.primaryActives.join(", ") || "งดสารผลัดเซลล์ (เน้นการปลอบประโลมผิว)"}
                </p>
                {target.secondaryActives.length > 0 && (
                  <p className="text-[10px] text-gray-500">
                    <strong>สารเสริมประสิทธิภาพ:</strong> {target.secondaryActives.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 mt-2">
            ผิวของคุณอยู่ในเกณฑ์สมบูรณ์ ไม่พบปัญหาที่ต้องได้รับการรักษาเร่งด่วน แนะนำเน้นมอยส์เจอร์ไรเซอร์พื้นฐานและครีมกันแดดเพื่อปกป้องผิว
          </p>
        )}
      </div>

      {/* ปุ่มนำทางไปหน้าถัดไป */}
      <div className="flex flex-col gap-2.5 w-full">
        <button
          type="button"
          onClick={onViewRecommendations}
          className="w-full py-3.5 px-4 rounded-xl text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-[0.98] cursor-pointer"
        >
          ดูรายการสกินแคร์ที่แนะนำสำหรับคุณ (Top 6 หมวด)
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex gap-2.5 w-full">
          <button
            type="button"
            onClick={onRetake}
            className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ตรวจใหม่อีกครั้ง
          </button>

          <button
            type="button"
            onClick={onViewCatalog}
            className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            ค้นหาในคลังสกินแคร์
          </button>
        </div>
      </div>
    </div>
  );
}
