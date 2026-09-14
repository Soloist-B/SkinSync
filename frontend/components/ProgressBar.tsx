'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  total: number;
  current: number;
}

export default function ProgressBar({ total, current }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full overflow-hidden bg-gray-200"
        >
          <motion.div
            initial={false}
            animate={{
              width: i <= current ? '100%' : '0%',
              backgroundColor: i <= current ? '#4F46E5' : '#E5E7EB',
            }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          />
        </div>
      ))}
    </div>
  );
}
