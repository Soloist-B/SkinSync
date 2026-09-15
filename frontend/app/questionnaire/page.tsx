'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useSkinContext } from '../../context/SkinContext';
import { CLINICAL_QUESTIONS } from '../../data/questions';
import QuestionCard from '../../components/QuestionCard';
import ProgressBar from '../../components/ProgressBar';

export default function QuestionnairePage() {
  const router = useRouter();
  const { answers, setAnswer, aiResult, isHydrated } = useSkinContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // หากยังไม่ได้สแกนภาพใบหน้า ให้กลับไปหน้าถ่ายรูป (รอ hydrate ก่อน)
  useEffect(() => {
    if (!isHydrated) return;
    if (!aiResult) {
      router.push('/camera');
    }
  }, [isHydrated, aiResult, router]);

  const currentQuestion = CLINICAL_QUESTIONS[currentIndex];
  const selectedValue = answers[currentQuestion.id];

  const goBack = useCallback(() => {
    if (currentIndex === 0) {
      router.push('/camera');
    } else {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, router]);

  const selectOption = useCallback(
    (value: any) => {
      setAnswer(currentQuestion.id, value);

      setTimeout(() => {
        if (currentIndex < CLINICAL_QUESTIONS.length - 1) {
          setDirection(1);
          setCurrentIndex((prev) => prev + 1);
        } else {
          router.push('/analyzing');
        }
      }, 300);
    },
    [currentQuestion.id, currentIndex, setAnswer, router]
  );

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 pt-6 pb-8 max-w-md mx-auto w-full">
      <div>
        {/* Top Nav */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <ProgressBar total={CLINICAL_QUESTIONS.length} current={currentIndex} />
          </div>
          <span className="text-[11px] font-mono text-gray-400 w-8 text-right font-medium">
            {currentIndex + 1}/{CLINICAL_QUESTIONS.length}
          </span>
        </div>

        {/* Question Header & Options */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold tracking-wide uppercase">
                หมวดที่ {currentQuestion.categoryNumber}
              </div>

              <h2 className="text-base font-bold text-gray-900 leading-snug">
                {currentQuestion.title}
              </h2>

              <p className="text-xs text-gray-500 leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((option) => (
                  <QuestionCard
                    key={option.id}
                    label={option.id}
                    text={option.text}
                    clinicalNote={option.clinicalNote}
                    isSelected={selectedValue === option.value}
                    onSelect={() => selectOption(option.value)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-6 text-center">
        <p className="text-[11px] text-gray-400">
          ตอบตามความเป็นจริงของสภาพผิวในช่วง 1-2 สัปดาห์ล่าสุด • อ้างอิงตามมาตรฐานคลินิก
        </p>
      </div>
    </div>
  );
}
