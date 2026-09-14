"use client";

import React, { useState } from "react";
import { CLINICAL_QUESTIONS } from "../data/questions";
import { QuestionnaireAnswers } from "../types";
import { ChevronRight, ChevronLeft, Check, ClipboardCheck, Sparkles } from "lucide-react";

interface QuestionnaireStepProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onBack: () => void;
}

export default function QuestionnaireStep({ onComplete, onBack }: QuestionnaireStepProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({
    barrier: undefined,
    sensitivity: undefined,
    sebum: undefined,
    fitzpatrick: undefined,
  });

  const question = CLINICAL_QUESTIONS[currentQuestionIndex];
  const totalQuestions = CLINICAL_QUESTIONS.length;
  const currentAnswer = answers[question.id];

  const handleSelectOption = (value: any) => {
    const updated = {
      ...answers,
      [question.id]: value,
    };
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // ครบทุกข้อแล้ว
      if (
        answers.barrier &&
        answers.sensitivity &&
        answers.sebum &&
        answers.fitzpatrick
      ) {
        onComplete(answers as QuestionnaireAnswers);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  const isCurrentAnswered = currentAnswer !== undefined;

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">
          แบบประเมินสรีรวิทยาผิว
        </h2>
      </div>
      <p className="text-xs text-gray-400 mb-6 text-center max-w-xs">
        มาตรฐานทางคลินิก (Baumann & Fitzpatrick Scale) เพื่อจับคู่สารบำรุงที่ปลอดภัย
      </p>

      {/* Progress Bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between items-center text-xs font-medium text-gray-500 mb-1.5">
          <span>คำถามข้อที่ {currentQuestionIndex + 1} จาก {totalQuestions}</span>
          <span className="text-indigo-600 font-semibold">
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Card คำถาม */}
      <div className="w-full bg-gray-50/80 rounded-2xl p-4 sm:p-5 border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            หมวดที่ {question.categoryNumber}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">
          {question.title}
        </h3>
        <p className="text-[11px] text-gray-600 mb-4 bg-white p-2.5 rounded-xl border border-gray-200/70">
          <span className="font-semibold text-gray-700">จุดประสงค์ทางคลินิก:</span> {question.clinicalObjective}
        </p>

        <p className="text-xs font-medium text-gray-800 mb-4 leading-relaxed">
          {question.question}
        </p>

        {/* ตัวเลือก A, B, C */}
        <div className="space-y-2.5">
          {question.options.map((opt) => {
            const isSelected = currentAnswer === opt.value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.value)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-400 shadow-xs ring-1 ring-indigo-300"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : opt.id}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-xs leading-snug ${
                      isSelected ? "font-semibold text-indigo-950" : "text-gray-700 font-medium"
                    }`}
                  >
                    {opt.text}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                    <span className="font-medium text-gray-600">ผลในระบบ:</span> {opt.clinicalNote}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={handlePrev}
          className="py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-medium transition-all flex items-center justify-center gap-1.5 hover:bg-gray-50 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentQuestionIndex === 0 ? "กลับไปหน้าถ่ายรูป" : "ย้อนกลับ"}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!isCurrentAnswered}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] ${
            isCurrentAnswered
              ? "bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {currentQuestionIndex < totalQuestions - 1 ? (
            <>
              ข้อถัดไป
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              ดูผลวิเคราะห์ใบหน้า
            </>
          )}
        </button>
      </div>
    </div>
  );
}
