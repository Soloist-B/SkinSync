export type SkinClass =
  | 'Pigmentation & Dark spots'
  | 'Redness'
  | 'Inflammatory acne'
  | 'Blackheads'
  | 'Whiteheads'
  | 'Pores'
  | 'Wrinkles';

export interface AIDetectionScore {
  class_name: SkinClass;
  probability: number;
}

export interface AIPredictResponse {
  status: 'success' | 'error';
  detected_count: number;
  detected_issues: AIDetectionScore[];
  all_scores: AIDetectionScore[];
  message: string;
}

export type BarrierStatus = 'healthy' | 'mildly_impaired' | 'compromised';
export type SensitivityLevel = 'low' | 'medium' | 'high';
export type SebumRate = 'dry' | 'combination' | 'oily';
export type FitzpatrickType = 'light' | 'medium' | 'dark';

export interface QuestionnaireAnswers {
  barrier: BarrierStatus;
  sensitivity: SensitivityLevel;
  sebum: SebumRate;
  fitzpatrick: FitzpatrickType;
}

export interface QuestionOption<T> {
  id: 'A' | 'B' | 'C';
  text: string;
  value: T;
  clinicalNote: string;
}

export interface ClinicalQuestion<T> {
  id: keyof QuestionnaireAnswers;
  categoryNumber: number;
  title: string;
  clinicalObjective: string;
  question: string;
  options: QuestionOption<T>[];
}

export type SkincareCategory =
  | 'Serum'
  | 'Moisturizer'
  | 'Cleanser'
  | 'Toner'
  | 'Cream'
  | 'Sunscreen';

export interface SkincareProduct {
  id: string;
  name: string;
  brand: string;
  category: SkincareCategory;
  price?: string;
  imageUrl?: string;
  description: string;
  keyActives: string[];
  targetIssues: SkinClass[];
  suitableSkinTypes: ('dry' | 'combination' | 'oily')[];
  suitableBarrier: ('healthy' | 'mildly_impaired' | 'compromised')[];
  vehicleType: 'Gel' | 'Cream' | 'Lotion' | 'Liquid' | 'Balm' | 'Fluid';
  isFragranceFree: boolean;
  isAlcoholFree: boolean;
  usageTime: 'AM' | 'PM' | 'Both';
  clinicalNotes?: string;
}

export interface ScoredProduct {
  product: SkincareProduct;
  score: number;
  isCompatible: boolean;
  matchReasons: string[];
  warningReasons: string[];
}

export interface ClinicalProfile {
  barrier: {
    status: BarrierStatus;
    title: string;
    description: string;
    override: boolean;
  };
  sensitivity: {
    level: SensitivityLevel;
    title: string;
    description: string;
    bans: string[];
    modifications: string[];
  };
  sebum: {
    rate: SebumRate;
    title: string;
    vehicleType: string;
    avoid: string[];
    prefer: string[];
  };
  fitzpatrick: {
    type: FitzpatrickType;
    title: string;
    description: string;
    cautions: string[];
  };
  mandatoryRepair: boolean;
  bannedActives: string[];
  targetActives: {
    issue: SkinClass;
    probability: number;
    primaryActives: string[];
    secondaryActives: string[];
    contraindications: string[];
  }[];
  routineRules: string[];
}

export const PRODUCT_CATEGORIES: SkincareCategory[] = [
  'Cleanser',
  'Toner',
  'Serum',
  'Moisturizer',
  'Cream',
  'Sunscreen',
];

export const SKIN_CLASSES: SkinClass[] = [
  'Pigmentation & Dark spots',
  'Redness',
  'Inflammatory acne',
  'Blackheads',
  'Whiteheads',
  'Pores',
  'Wrinkles',
];

export const SKIN_CLASS_METADATA: Record<
  SkinClass,
  { th: string; shortTh: string; en: string; icon: string }
> = {
  'Pigmentation & Dark spots': {
    th: 'ฝ้า กระ จุดด่างดำ',
    shortTh: 'ฝ้า กระ',
    en: 'Pigmentation & Dark Spots',
    icon: 'Sun',
  },
  'Redness': {
    th: 'รอยแดง ผิวอักเสบ',
    shortTh: 'รอยแดง',
    en: 'Redness & Irritation',
    icon: 'Flame',
  },
  'Inflammatory acne': {
    th: 'สิวอักเสบ',
    shortTh: 'สิวอักเสบ',
    en: 'Inflammatory Acne',
    icon: 'AlertCircle',
  },
  'Blackheads': {
    th: 'สิวอุดตันหัวดำ',
    shortTh: 'สิวหัวดำ',
    en: 'Blackheads',
    icon: 'Circle',
  },
  'Whiteheads': {
    th: 'สิวอุดตันหัวขาว',
    shortTh: 'สิวหัวขาว',
    en: 'Whiteheads',
    icon: 'CircleDashed',
  },
  'Pores': {
    th: 'รูขุมขนกว้าง',
    shortTh: 'รูขุมขน',
    en: 'Enlarged Pores',
    icon: 'Maximize2',
  },
  'Wrinkles': {
    th: 'ริ้วรอยและความหย่อนคล้อย',
    shortTh: 'ริ้วรอย',
    en: 'Wrinkles & Fine Lines',
    icon: 'Waves',
  },
};
