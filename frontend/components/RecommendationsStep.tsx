"use client";

import React from "react";
import { SkincareCategory, ScoredProduct, ClinicalProfile } from "../types";
import {
  Activity,
  ArrowRight,
  ChevronLeft,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Calendar,
  Sparkles,
  Droplet
} from "lucide-react";

interface RecommendationsStepProps {
  topRecommendations: Record<SkincareCategory, ScoredProduct | null>;
  clinicalProfile: ClinicalProfile;
  onBackToAnalysis: () => void;
  onViewCatalog: (categoryFilter?: SkincareCategory | "All") => void;
}

const CATEGORY_ORDER: { key: SkincareCategory; labelThai: string }[] = [
  { key: "Serum", labelThai: "เซรั่ม (Serum)" },
  { key: "Moisturizer", labelThai: "มอยส์เจอร์ไรเซอร์ (Moisturizer)" },
  { key: "Cleanser", labelThai: "คลีนเซอร์ล้างหน้า (Cleanser)" },
  { key: "Toner", labelThai: "โทนเนอร์ / น้ำตบ (Toner)" },
  { key: "Cream", labelThai: "ครีมฟื้นบำรุงเข้มข้น (Cream)" },
  { key: "Sunscreen", labelThai: "ครีมกันแดด (Sunscreen)" },
];

export default function RecommendationsStep({
  topRecommendations,
  clinicalProfile,
  onBackToAnalysis,
  onViewCatalog,
}: RecommendationsStepProps) {
  return (
    <div className="w-full flex flex-col items-center animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
          <Activity className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          สกินแคร์ที่แนะนำสำหรับสภาพผิวของคุณ
        </h2>
      </div>
      <p className="text-xs text-gray-500 mb-6 text-center">
        คัดเลือกอันดับ 1 ในแต่ละหมวดหมู่ตามสรีรวิทยาผิวและปัญหาที่ตรวจพบ
      </p>

      {/* Routine Schedule Note */}
      <div className="w-full mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left">
        <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs mb-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          แนวทางการจัดตารางสกินแคร์ (Clinical Routine Guidelines)
        </div>
        <div className="space-y-1.5 text-[11px] text-gray-700">
          {clinicalProfile.routineRules.slice(0, 3).map((rule, idx) => (
            <p key={idx} className="leading-relaxed">
              {rule}
            </p>
          ))}
        </div>
      </div>

      {/* 6 Category Top Picks */}
      <div className="w-full space-y-4 mb-6">
        {CATEGORY_ORDER.map(({ key, labelThai }) => {
          const scored = topRecommendations[key];

          if (!scored) {
            return (
              <div key={key} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left">
                <span className="text-xs font-semibold text-gray-600">{labelThai}</span>
                <p className="text-xs text-gray-400 mt-1">ยังไม่มีผลิตภัณฑ์ในหมวดหมู่นี้ในฐานข้อมูล</p>
              </div>
            );
          }

          const { product, matchReasons, warningReasons, isCompatible } = scored;

          return (
            <div
              key={key}
              className={`w-full bg-white rounded-2xl p-4 sm:p-5 border transition-all text-left shadow-xs ${
                isCompatible
                  ? "border-gray-200 hover:border-indigo-300"
                  : "border-amber-200 bg-amber-50/20"
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-[11px] font-semibold">
                  <Droplet className="w-3 h-3 text-indigo-600" />
                  {labelThai}
                </span>
                <span className="text-xs font-semibold text-gray-800">
                  {product.price || "฿฿"}
                </span>
              </div>

              {/* Product Title & Brand */}
              <div className="mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
                  {product.brand}
                </span>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">
                  {product.name}
                </h3>
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* Badges: Vehicle, Usage Time */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                  เนื้อ {product.vehicleType}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-gray-500" />
                  {product.usageTime === "Both"
                    ? "ใช้ได้ทั้งเช้าและก่อนนอน"
                    : product.usageTime === "AM"
                    ? "ทาตอนเช้า"
                    : "ทาก่อนนอน"}
                </span>
                {product.isFragranceFree && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                    ปราศจากน้ำหอม
                  </span>
                )}
                {product.isAlcoholFree && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                    ปราศจากแอลกอฮอล์
                  </span>
                )}
              </div>

              {/* Key Actives */}
              <div className="mb-3">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
                  สารออกฤทธิ์สำคัญ:
                </span>
                <div className="flex flex-wrap gap-1">
                  {product.keyActives.map((act, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-medium"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Reasons */}
              {matchReasons.length > 0 && (
                <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100 mb-2 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    เหตุผลความเหมาะสมกับผิวของคุณ:
                  </span>
                  <ul className="text-[11px] text-emerald-900 space-y-0.5 pl-4 list-disc">
                    {matchReasons.slice(0, 3).map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning Reasons (ถ้ามี) */}
              {warningReasons.length > 0 && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 mb-2 space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-700" />
                    ข้อสังเกตทางการแพทย์:
                  </span>
                  <ul className="text-[11px] text-amber-900 space-y-0.5 pl-4 list-disc">
                    {warningReasons.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* View more in category */}
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => onViewCatalog(key)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  ดูตัวเลือกอื่นในหมวดนี้
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 w-full">
        <button
          type="button"
          onClick={() => onViewCatalog("All")}
          className="w-full py-3.5 px-4 rounded-xl text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <Search className="w-4 h-4" />
          ดูคลังสกินแคร์ทั้งหมด และค้นหาเพิ่มเติม
        </button>

        <button
          type="button"
          onClick={onBackToAnalysis}
          className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          ย้อนกลับไปดูผลวิเคราะห์ผิวหน้า
        </button>
      </div>
    </div>
  );
}
