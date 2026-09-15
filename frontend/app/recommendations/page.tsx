'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Compass, Calendar, Droplets } from 'lucide-react';
import { useSkinContext } from '../../context/SkinContext';
import ProductCard from '../../components/ProductCard';
import { PRODUCT_CATEGORIES, SkincareCategory } from '../../types';

const categoryLabels: Record<SkincareCategory, string> = {
  Serum: 'เซรั่ม (Serum)',
  Moisturizer: 'มอยส์เจอร์ไรเซอร์ (Moisturizer)',
  Cleanser: 'คลีนเซอร์ล้างหน้า (Cleanser)',
  Toner: 'โทนเนอร์ / น้ำตบ (Toner)',
  Cream: 'ครีมฟื้นบำรุงเข้มข้น (Cream)',
  Sunscreen: 'ครีมกันแดด (Sunscreen)',
};

export default function RecommendationsPage() {
  const router = useRouter();
  const { topRecommendations, clinicalProfile, isHydrated } = useSkinContext();

  useEffect(() => {
    if (!isHydrated) return;
    if (!clinicalProfile) {
      router.push('/');
    }
  }, [isHydrated, clinicalProfile, router]);

  if (!isHydrated || !clinicalProfile) return null;

  return (
    <div className="min-h-screen px-5 pt-6 pb-20 max-w-md mx-auto w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/results')}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900">
            สกินแคร์ที่แนะนำเฉพาะคุณ
          </h1>
          <p className="text-[11px] text-gray-400">คัดสรรอันดับ 1 ที่ตรงกับสภาพผิวในแต่ละหมวด</p>
        </div>
      </div>

      {/* Routine Guidelines Note */}
      {clinicalProfile.routineRules.length > 0 && (
        <div className="p-4 bg-white rounded-3xl border border-gray-200/80 shadow-xs text-left">
          <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs mb-2">
            <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            แนวทางการจัดตารางสกินแคร์ (Clinical Routine)
          </div>
          <div className="space-y-1 text-[11px] text-gray-600 leading-relaxed">
            {clinicalProfile.routineRules.slice(0, 3).map((rule, idx) => (
              <p key={idx}>• {rule}</p>
            ))}
          </div>
        </div>
      )}

      {/* Category Recommendations */}
      <div className="space-y-6">
        {PRODUCT_CATEGORIES.map((category) => {
          const product = topRecommendations[category];
          if (!product) return null;

          return (
            <div key={category} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-900 tracking-wide flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-indigo-600" />
                  {categoryLabels[category]}
                </h2>
                <button
                  type="button"
                  onClick={() => router.push(`/browse?category=${category}`)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  ตัวเลือกอื่น
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <ProductCard product={product} featured />
            </div>
          );
        })}
      </div>

      {/* Browse All CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => router.push('/browse')}
          className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl py-3 px-6 text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
        >
          <Compass className="w-4 h-4 text-indigo-600" />
          ดูคลังสกินแคร์ทั้งหมดและค้นหา
        </button>
      </div>
    </div>
  );
}
