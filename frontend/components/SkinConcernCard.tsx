'use client';

import { motion } from 'framer-motion';
import { SkinClass, SKIN_CLASS_METADATA } from '../types';

interface SkinConcernCardProps {
  concern: SkinClass;
  probability: number;
  isDetected: boolean;
}

export default function SkinConcernCard({
  concern,
  probability,
  isDetected,
}: SkinConcernCardProps) {
  const meta = SKIN_CLASS_METADATA[concern] || {
    th: concern,
    shortTh: concern,
    en: concern,
  };
  const percentage = (probability * 100).toFixed(1);
  const percentNumber = Math.min(Math.max(Number(percentage), 0), 100);

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all ${
        isDetected
          ? 'bg-white border-rose-200/90 shadow-xs ring-1 ring-rose-100'
          : 'bg-white/70 border-gray-200/60 opacity-70'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isDetected && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
          )}
          <span
            className={`text-xs ${
              isDetected ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
            }`}
          >
            {meta.th}
          </span>
          <span className="text-[10px] text-gray-400">({meta.en})</span>
        </div>
        <span
          className={`text-[11px] font-mono ${
            isDetected ? 'font-bold text-rose-600' : 'font-medium text-gray-400'
          }`}
        >
          {percentage}%
        </span>
      </div>

      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentNumber}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isDetected ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        />
      </div>
    </div>
  );
}
