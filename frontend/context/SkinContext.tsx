'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import {
  AIPredictResponse,
  QuestionnaireAnswers,
  ClinicalProfile,
  SkincareProduct,
  ScoredProduct,
  SkincareCategory,
} from '../types';
import { SKINCARE_PRODUCTS } from '../data/skincareProducts';
import {
  generateClinicalProfile,
  scoreAndFilterProducts,
  getTopRecommendations,
} from '../lib/clinicalEngine';
import { isSupabaseConfigured, fetchProductsFromSupabase } from '../lib/supabase';

const initialAnswers: Partial<QuestionnaireAnswers> = {};

interface SkinSyncState {
  capturedFile: File | null;
  capturedImage: string | null;
  aiResult: AIPredictResponse | null;
  answers: Partial<QuestionnaireAnswers>;
  isQuestionnaireCompleted: boolean;
  clinicalProfile: ClinicalProfile | null;
  products: SkincareProduct[];
  scoredProducts: ScoredProduct[];
  topRecommendations: Record<SkincareCategory, ScoredProduct | null>;
  isAnalyzing: boolean;
  analysisError: string | null;
  isHydrated: boolean;
}

interface SkinSyncActions {
  setScanResult: (file: File, previewUrl: string, result: AIPredictResponse) => void;
  setAnswer: <K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => void;
  completeQuestionnaire: (finalAnswers: QuestionnaireAnswers) => void;
  processAnalysis: () => void;
  reset: () => void;
}

type SkinContextType = SkinSyncState & SkinSyncActions;

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export function SkinProvider({ children }: { children: ReactNode }) {
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIPredictResponse | null>(null);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>(initialAnswers);
  const [isQuestionnaireCompleted, setIsQuestionnaireCompleted] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [products, setProducts] = useState<SkincareProduct[]>(SKINCARE_PRODUCTS);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // กู้คืนข้อมูลจาก sessionStorage เมื่อผู้ใช้รีเฟรชหน้าเว็บ (ป้องกันผลตรวจหาย)
  useEffect(() => {
    try {
      const savedAi = sessionStorage.getItem('skinsync_ai_result');
      if (savedAi) {
        setAiResult(JSON.parse(savedAi));
      }

      const savedAnswers = sessionStorage.getItem('skinsync_answers');
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }

      const savedImg = sessionStorage.getItem('skinsync_captured_image');
      if (savedImg) {
        setCapturedImage(savedImg);
      }
    } catch (e) {
      console.warn('Failed to rehydrate session data:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // ดึงข้อมูลจาก Supabase อัตโนมัติ (หากยังไม่ได้ตั้งค่า จะใช้ Local Database เป็น Fallback เสมอ)
  useEffect(() => {
    async function loadSupabaseProducts() {
      if (!isSupabaseConfigured()) return;
      try {
        const remoteProducts = await fetchProductsFromSupabase();
        if (remoteProducts && remoteProducts.length > 0) {
          setProducts(remoteProducts);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local products:', err);
      }
    }

    loadSupabaseProducts();
  }, []);

  // ตรวจสอบว่าผู้ใช้ตอบคำถามครบทั้ง 4 หมวดแล้วหรือไม่
  const isAllAnswered = !!(
    answers.barrier &&
    answers.sensitivity &&
    answers.sebum &&
    answers.fitzpatrick
  );

  // คำนวณโปรไฟล์ทางคลินิกเมื่อมีทั้ง aiResult และ answers ครบถ้วน
  const clinicalProfile: ClinicalProfile | null = useMemo(() => {
    if (!aiResult || !isAllAnswered) return null;
    return generateClinicalProfile(aiResult.all_scores, answers as QuestionnaireAnswers);
  }, [aiResult, answers, isAllAnswered]);

  // คำนวณคะแนนสกินแคร์ทั้งหมด (หากยังไม่สแกนหรือยังตอบไม่ครบ จะให้คะแนนเริ่มต้นเพื่อให้ Browse ดูสินค้าได้)
  const scoredProducts: ScoredProduct[] = useMemo(() => {
    if (!clinicalProfile || !aiResult || !isAllAnswered) {
      return products.map((product) => ({
        product,
        score: 0,
        isCompatible: true,
        matchReasons: [],
        warningReasons: [],
      }));
    }
    return scoreAndFilterProducts(
      products,
      clinicalProfile,
      answers as QuestionnaireAnswers,
      aiResult.all_scores
    );
  }, [clinicalProfile, answers, aiResult, products, isAllAnswered]);

  // สกินแคร์อันดับ 1 ในแต่ละหมวดหมู่ 6 หมวด
  const topRecommendations = useMemo(() => {
    return getTopRecommendations(scoredProducts);
  }, [scoredProducts]);

  const setScanResult = useCallback((file: File, previewUrl: string, result: AIPredictResponse) => {
    setCapturedFile(file);
    setCapturedImage(previewUrl);
    setAiResult(result);
    setAnswers({});
    setIsQuestionnaireCompleted(false);
    setAnalysisError(null);

    try {
      sessionStorage.setItem('skinsync_ai_result', JSON.stringify(result));
      sessionStorage.removeItem('skinsync_answers');
      sessionStorage.setItem('skinsync_captured_image', previewUrl);
    } catch (e) {
      console.warn('Failed to save scan result to sessionStorage:', e);
    }
  }, []);

  const setAnswer = useCallback(<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => {
    setAnswers((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        sessionStorage.setItem('skinsync_answers', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save answers to sessionStorage:', e);
      }
      return updated;
    });
  }, []);

  const completeQuestionnaire = useCallback((finalAnswers: QuestionnaireAnswers) => {
    setAnswers(finalAnswers);
    setIsQuestionnaireCompleted(true);
    try {
      sessionStorage.setItem('skinsync_answers', JSON.stringify(finalAnswers));
    } catch (e) {
      console.warn('Failed to save complete answers to sessionStorage:', e);
    }
  }, []);

  const processAnalysis = useCallback(() => {
    setIsAnalyzing(false);
  }, []);

  const reset = useCallback(() => {
    if (capturedImage && capturedImage.startsWith('blob:')) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedFile(null);
    setCapturedImage(null);
    setAiResult(null);
    setAnswers(initialAnswers);
    setIsQuestionnaireCompleted(false);
    setIsAnalyzing(false);
    setAnalysisError(null);

    try {
      sessionStorage.removeItem('skinsync_ai_result');
      sessionStorage.removeItem('skinsync_answers');
      sessionStorage.removeItem('skinsync_captured_image');
    } catch (e) {
      console.warn('Failed to clear sessionStorage on reset:', e);
    }
  }, [capturedImage]);

  const value: SkinContextType = {
    capturedFile,
    capturedImage,
    aiResult,
    answers,
    isQuestionnaireCompleted,
    clinicalProfile,
    products,
    scoredProducts,
    topRecommendations,
    isAnalyzing,
    analysisError,
    isHydrated,
    setScanResult,
    setAnswer,
    completeQuestionnaire,
    processAnalysis,
    reset,
  };

  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useSkinContext() {
  const context = useContext(SkinContext);
  if (!context) {
    throw new Error('useSkinContext must be used within a SkinProvider');
  }
  return context;
}
