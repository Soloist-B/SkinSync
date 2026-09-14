'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SkincareProduct, ScoredProduct } from '../types';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface ProductCardProps {
  product: SkincareProduct | ScoredProduct;
  featured?: boolean;
}

function isScoredProduct(item: SkincareProduct | ScoredProduct): item is ScoredProduct {
  return 'product' in item && 'score' in item;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const scored = isScoredProduct(product);
  const p = scored ? product.product : product;
  const isCompatible = scored ? product.isCompatible : true;
  const matchScore = scored ? product.score : 0;
  const matchReasons = scored ? product.matchReasons : [];
  const warningReasons = scored ? product.warningReasons : [];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs flex flex-col justify-between ${
        !isCompatible
          ? 'border-amber-200 bg-amber-50/10'
          : 'border-gray-200/90 hover:border-indigo-300'
      }`}
    >
      <div>
        {/* Product Image / Brand Visual Banner */}
        <div
          className={`relative bg-white border-b border-gray-100 overflow-hidden ${
            featured ? 'h-40' : 'h-28'
          } flex items-center justify-center p-2`}
        >
          {p.imageUrl && !imageError ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center rounded-xl">
              <span className="text-gray-400 font-mono text-xl tracking-wider font-light uppercase">
                {p.brand.slice(0, 3)}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">{p.brand}</span>
            </div>
          )}

          {scored && matchScore > 0 && isCompatible && (
            <div className="absolute top-2.5 right-2.5 bg-gray-900 text-white text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md shadow-xs z-10">
              {Math.min(matchScore, 100)}% Match
            </div>
          )}

          {scored && !isCompatible && (
            <div className="absolute top-2.5 right-2.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 z-10">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              มีสารควรระวัง
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3.5">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              {p.category}
            </span>
            {p.price && (
              <span className="text-[11px] font-mono font-semibold text-gray-700">
                {p.price}
              </span>
            )}
          </div>

          <h3
            className={`font-semibold text-gray-900 ${
              featured ? 'text-sm' : 'text-xs'
            } leading-snug line-clamp-2 mt-1`}
          >
            {p.name}
          </h3>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">
            {p.brand}
          </p>

          {/* Badges for Featured View */}
          {featured && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">
                เนื้อ {p.vehicleType}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-gray-500" />
                {p.usageTime === 'Both'
                  ? 'ใช้ได้ทั้งเช้าและก่อนนอน'
                  : p.usageTime === 'AM'
                  ? 'ทาตอนเช้า'
                  : 'ทาก่อนนอน'}
              </span>
              {p.isFragranceFree && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                  ปราศจากน้ำหอม
                </span>
              )}
              {p.isAlcoholFree && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                  ปราศจากแอลกอฮอล์
                </span>
              )}
            </div>
          )}

          {/* Key Actives Pills */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {p.keyActives.slice(0, featured ? 5 : 2).map((active) => (
              <span
                key={active}
                className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200/60 font-medium"
              >
                {active}
              </span>
            ))}
          </div>

          {/* Match Reasons for Featured View */}
          {featured && matchReasons.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                ความเหมาะสมกับผิว:
              </span>
              {matchReasons.slice(0, 3).map((reason, i) => (
                <p key={i} className="text-[11px] text-emerald-900 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </p>
              ))}
            </div>
          )}

          {/* Warning Reasons */}
          {featured && warningReasons.length > 0 && (
            <div className="mt-2.5 p-2 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              {warningReasons.map((warn, i) => (
                <p key={i} className="text-[10px] text-amber-900 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </p>
              ))}
            </div>
          )}

          {/* Description */}
          {featured && p.description && (
            <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {p.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
