'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useSkinContext } from '../../context/SkinContext';
import ProductCard from '../../components/ProductCard';
import { PRODUCT_CATEGORIES, SkincareCategory } from '../../types';

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { scoredProducts, clinicalProfile } = useSkinContext();

  const initialCategory = searchParams.get('category') as SkincareCategory | null;
  const [selectedCategory, setSelectedCategory] = useState<SkincareCategory | 'all'>(
    initialCategory || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyCompatible, setOnlyCompatible] = useState(false);

  const productsToShow = useMemo(() => {
    let list = scoredProducts;

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.product.category === selectedCategory);
    }

    // Filter by Compatibility
    if (onlyCompatible && clinicalProfile) {
      list = list.filter((p) => p.isCompatible);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const p = item.product;
        return (
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.keyActives.some((act) => act.toLowerCase().includes(query)) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      });
    }

    return list;
  }, [scoredProducts, selectedCategory, onlyCompatible, searchQuery, clinicalProfile]);

  return (
    <div className="min-h-screen px-5 pt-6 pb-16 max-w-md mx-auto w-full space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">คลังสกินแคร์</h1>
          <p className="text-[11px] text-gray-400">ทั้งหมด {productsToShow.length} รายการ</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อ แบรนด์ หรือสารสำคัญ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 bg-white rounded-2xl border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-gray-900 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          ทั้งหมด
        </button>
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Optional Compatibility Switch */}
      {clinicalProfile && (
        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyCompatible}
              onChange={(e) => setOnlyCompatible(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            แสดงเฉพาะรายการที่เข้ากันได้กับสภาพผิวของคุณ
          </label>
        </div>
      )}

      {/* Products Grid */}
      {productsToShow.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 shadow-xs">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 text-xs font-semibold mb-1">ไม่พบผลิตภัณฑ์ที่ตรงกับการค้นหา</p>
          <p className="text-[11px] text-gray-400 mb-3">กรุณาลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyCompatible(false);
            }}
            className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            ล้างการค้นหาทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {productsToShow.map((item) => (
            <ProductCard key={item.product.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-4 pt-8 text-center text-gray-400 text-xs">
          กำลังโหลด...
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
