"use client";

import React, { useState, useMemo } from "react";
import { SkincareCategory, ScoredProduct, ClinicalProfile } from "../types";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Clock,
  Info,
  X
} from "lucide-react";

interface CatalogStepProps {
  scoredProducts: ScoredProduct[];
  initialCategory?: SkincareCategory | "All";
  clinicalProfile: ClinicalProfile;
  onBackToRecommendations: () => void;
}

const CATEGORIES: { key: SkincareCategory | "All"; label: string }[] = [
  { key: "All", label: "ทั้งหมด" },
  { key: "Serum", label: "เซรั่ม (Serum)" },
  { key: "Moisturizer", label: "มอยส์เจอร์ไรเซอร์" },
  { key: "Cleanser", label: "คลีนเซอร์" },
  { key: "Toner", label: "โทนเนอร์" },
  { key: "Cream", label: "ครีม" },
  { key: "Sunscreen", label: "กันแดด" },
];

export default function CatalogStep({
  scoredProducts,
  initialCategory = "All",
  clinicalProfile,
  onBackToRecommendations,
}: CatalogStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkincareCategory | "All">(initialCategory);
  const [onlyCompatible, setOnlyCompatible] = useState(false);

  const filteredProducts = useMemo(() => {
    return scoredProducts.filter((item) => {
      const p = item.product;

      // 1. หมวดหมู่
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }

      // 2. ตัวกรองความเข้ากันได้
      if (onlyCompatible && !item.isCompatible) {
        return false;
      }

      // 3. ช่องค้นหา (ชื่อ, แบรนด์, ส่วนผสม, คำอธิบาย)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesActives = p.keyActives.some((act) => act.toLowerCase().includes(query));
        const matchesCategory = p.category.toLowerCase().includes(query);

        if (!matchesName && !matchesBrand && !matchesDesc && !matchesActives && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [scoredProducts, selectedCategory, onlyCompatible, searchQuery]);

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
          <Search className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          คลังรวมสกินแคร์ทั้งหมด
        </h2>
      </div>
      <p className="text-xs text-gray-400 mb-6 text-center">
        ค้นหาและเปรียบเทียบสกินแคร์ทุกรายการ พร้อมระบบคัดกรองความปลอดภัยต่อผิวของคุณ
      </p>

      {/* คำแนะนำสำหรับการเพิ่มข้อมูล */}
      <div className="w-full mb-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-left">
        <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-900 leading-relaxed">
          <strong>การจัดการฐานข้อมูล:</strong> สามารถเพิ่มสกินแคร์ใหม่ได้โดยตรงที่ไฟล์{" "}
          <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono text-[10px]">
            frontend/data/skincareProducts.ts
          </code>{" "}
          ระบบจะประมวลผลการจัดอันดับโดยอัตโนมัติ
        </p>
      </div>

      {/* กล่องค้นหา */}
      <div className="w-full relative mb-3">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อสินค้า, แบรนด์, หรือสารออกฤทธิ์ (เช่น BHA, Niacinamide, Ceramide)..."
          className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ตัวกรองหมวดหมู่ */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all cursor-pointer ${
              selectedCategory === cat.key
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* สวิตช์เปิด/ปิดเฉพาะอันที่เข้ากับผิวฉัน */}
      <div className="w-full flex items-center justify-between mb-4 px-1">
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyCompatible}
            onChange={(e) => setOnlyCompatible(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          แสดงเฉพาะรายการที่เข้ากันได้กับสภาพผิวของคุณ
        </label>
        <span className="text-[11px] text-gray-500 font-medium">
          พบ {filteredProducts.length} รายการ
        </span>
      </div>

      {/* รายการสกินแคร์ */}
      <div className="w-full space-y-3 mb-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(({ product, isCompatible, matchReasons, warningReasons }) => (
            <div
              key={product.id}
              className={`w-full bg-white rounded-2xl p-4 border transition-all text-left shadow-xs ${
                isCompatible
                  ? "border-gray-200 hover:border-indigo-200"
                  : "border-amber-200 bg-amber-50/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-semibold">
                    {product.category}
                  </span>
                  {isCompatible ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-semibold flex items-center gap-1 border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      เหมาะกับสภาพผิวของคุณ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded-md text-[10px] font-semibold flex items-center gap-1 border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      มีสารที่ควรระวังในขณะนี้
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-900 flex-shrink-0">
                  {product.price || "฿฿"}
                </span>
              </div>

              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block">
                {product.brand}
              </span>
              <h4 className="text-xs font-bold text-gray-900 mb-1 leading-snug">
                {product.name}
              </h4>
              <p className="text-[11px] text-gray-500 mb-2.5 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-700 border border-gray-200">
                  เนื้อ {product.vehicleType}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-700 border border-gray-200 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-gray-500" />
                  {product.usageTime}
                </span>
                {product.keyActives.map((act, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-medium"
                  >
                    {act}
                  </span>
                ))}
              </div>

              {/* Match or Warning Reasons */}
              {isCompatible && matchReasons.length > 0 && (
                <div className="text-[10px] text-emerald-900 bg-emerald-50/70 p-2 rounded-lg mt-1.5 border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span>{matchReasons.slice(0, 2).join(" • ")}</span>
                </div>
              )}

              {warningReasons.length > 0 && (
                <div className="text-[10px] text-amber-900 bg-amber-50 p-2 rounded-lg mt-1.5 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                  <span>{warningReasons.join(" • ")}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700 mb-1">ไม่พบสกินแคร์ที่ตรงกับคำค้นหา</p>
            <p className="text-[11px] text-gray-400 mb-4">
              กรุณาลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setOnlyCompatible(false);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-all cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBackToRecommendations}
        className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 hover:bg-gray-50 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        ย้อนกลับไปหน้าสกินแคร์แนะนำ
      </button>
    </div>
  );
}
