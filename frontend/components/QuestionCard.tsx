'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface QuestionCardProps {
  label: string;
  text: string;
  clinicalNote?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function QuestionCard({
  label,
  text,
  clinicalNote,
  isSelected,
  onSelect,
}: QuestionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/80 shadow-xs'
          : 'border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors mt-0.5 ${
            isSelected
              ? 'bg-indigo-600 text-white'
              : 'border border-gray-300 text-gray-500 bg-gray-50'
          }`}
        >
          {isSelected ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : label}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs leading-relaxed ${
              isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
            }`}
          >
            {text}
          </p>
          {clinicalNote && (
            <p className="text-[10px] text-gray-400 mt-1 leading-normal">
              <span className="font-medium text-gray-500">ผลในระบบ:</span> {clinicalNote}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
