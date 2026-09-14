import { SkinClass } from '../types';

export interface SkinIssueClinicalData {
  issue: SkinClass;
  thaiName: string;
  pathophysiology: string;
  primaryActives: string[];
  secondaryActives: string[];
  sensitiveAlternatives: string[];
  contraindications: string[];
}

export const SKIN_ISSUES_CLINICAL_DATA: Record<SkinClass, SkinIssueClinicalData> = {
  'Inflammatory acne': {
    issue: 'Inflammatory acne',
    thaiName: 'สิวอักเสบ (Papules, Pustules)',
    pathophysiology: 'การเพิ่มจำนวนของแบคทีเรีย C. acnes กระตุ้นระบบภูมิคุ้มกันผ่าน TLR-2 หลั่งไซโตไคน์อักเสบ (IL-1, IL-8)',
    primaryActives: [
      'Benzoyl Peroxide (BPO)',
      'Salicylic Acid (BHA)',
      'Azelaic Acid',
      'Succinic Acid'
    ],
    secondaryActives: [
      'Niacinamide (Vitamin B3)',
      'Licochalcone A',
      'Centella Asiatica / Zinc PCA'
    ],
    sensitiveAlternatives: ['Succinic Acid', 'Centella Asiatica', 'Zinc PCA'],
    contraindications: [
      'ห้ามขัดถูหน้าด้วย Physical Scrubs (ป้องกันการแพร่กระจายเชื้อ)',
      'ห้ามใช้ Benzoyl Peroxide ร่วมกับ Antioxidants ที่ไวต่อปฏิกิริยา เช่น L-Ascorbic Acid'
    ]
  },
  'Blackheads': {
    issue: 'Blackheads',
    thaiName: 'สิวอุดตันหัวดำ (Open Comedones)',
    pathophysiology: 'การอุดตันของซีบัมและเซลล์ผิวตายในรูขุมขนที่เปิดกว้าง สัมผัสออกซิเจนจนเกิดปฏิกิริยา Oxidation กลายเป็นสารสีดำ',
    primaryActives: [
      'Topical Retinoids (Adapalene, Retinol)',
      'Salicylic Acid (BHA)',
      'AHA (Glycolic Acid / Lactic Acid)'
    ],
    secondaryActives: ['Niacinamide', 'Zinc PCA'],
    sensitiveAlternatives: ['Bakuchiol', 'LHA (Capryloyl Salicylic Acid)'],
    contraindications: [
      'หลีกเลี่ยงส่วนผสมที่อุดตันสูง (Highly Comedogenic) เช่น Isopropyl Myristate, Coconut Oil'
    ]
  },
  'Whiteheads': {
    issue: 'Whiteheads',
    thaiName: 'สิวอุดตันหัวขาว (Closed Comedones)',
    pathophysiology: 'ภาวะ Hyperkeratinization ปากรูขุมขนปิดสนิท ขี้ไคลสะสมขัง Sebum ใต้ผิว เกิดเป็นตุ่มนูนสีขาว',
    primaryActives: [
      'Topical Retinoids (Adapalene, Retinol)',
      'Salicylic Acid (BHA)',
      'AHA (Glycolic Acid / Lactic Acid)'
    ],
    secondaryActives: ['Azelaic Acid', 'Niacinamide'],
    sensitiveAlternatives: ['PHA (Gluconolactone, Lactobionic Acid)', 'Bakuchiol'],
    contraindications: [
      'หลีกเลี่ยง Heavy Occlusives / บัตเตอร์หนักๆ ที่เคลือบปิดปากรูขุมขน'
    ]
  },
  'Pigmentation & Dark spots': {
    issue: 'Pigmentation & Dark spots',
    thaiName: 'ฝ้า กระ รอยดำ (Pigmentation / PIH)',
    pathophysiology: 'การกระตุ้นเอนไซม์ Tyrosinase จากรังสี UV, การอักเสบ หรือฮอร์โมน ทำให้ผลิตเมลานินสะสมในผิวชั้นบน',
    primaryActives: [
      'Thiamidol',
      'Vitamin C (L-Ascorbic Acid / THD Ascorbate)',
      'Alpha Arbutin',
      'Tranexamic Acid',
      'Hexylresorcinol',
      'Niacinamide',
      'AHA'
    ],
    secondaryActives: ['Licorice Root Extract', 'Kojic Acid', 'Glutathione'],
    sensitiveAlternatives: ['Tranexamic Acid', 'Alpha Arbutin', 'Niacinamide', 'THD Ascorbate'],
    contraindications: [
      'ห้ามใช้ L-Ascorbic Acid ร่วมกับ Copper Peptides (เกิดปฏิกิริยา Chelation วิตามินซีเสื่อมสภาพ)',
      'หากใช้ Cysteamine ต้องล้างออกหลังทา 15 นาที (Short-contact therapy)'
    ]
  },
  'Redness': {
    issue: 'Redness',
    thaiName: 'รอยแดง ผิวอักเสบ เส้นเลือดฝอย (Redness / PIE)',
    pathophysiology: 'การขยายตัวของหลอดเลือดฝอยใต้ผิวหนังจากการอักเสบ หรือเกราะป้องกันผิวบอบบางไวเกิน',
    primaryActives: [
      'Azelaic Acid',
      'Niacinamide (Vitamin B3)',
      'Centella Asiatica (TECA / Madecassoside)',
      'Panthenol (Vitamin B5) / Allantoin',
      'Ectoin'
    ],
    secondaryActives: ['Ceramides', 'Bisabolol', 'Green Tea Extract'],
    sensitiveAlternatives: ['Ectoin', 'Centella Asiatica', 'Panthenol', 'Allantoin'],
    contraindications: [
      'ห้ามใช้สารกลุ่ม Vasodilators เช่น สารสกัด Menthol, Peppermint, Camphor, Eucalyptus',
      'เลี่ยงกรดผลัดเซลล์ผิวเข้มข้นสูง (High-strength AHA)'
    ]
  },
  'Pores': {
    issue: 'Pores',
    thaiName: 'รูขุมขนกว้าง (Enlarged Pores)',
    pathophysiology: 'ต่อมไขมันผลิตน้ำมันมากเกินไปดันให้ท่อรูขุมขนขยาย และคอลลาเจนรอบรูขุมขนเสื่อมสภาพ',
    primaryActives: [
      'Niacinamide',
      'Salicylic Acid (BHA)',
      'Zinc PCA',
      'Retinoids',
      'Enantia Chlorantha Bark Extract'
    ],
    secondaryActives: ['Green Tea Extract', 'Peptides', 'LHA'],
    sensitiveAlternatives: ['Niacinamide', 'Zinc PCA', 'Bakuchiol'],
    contraindications: [
      'หลีกเลี่ยง Astringents ที่ผสม Alcohol Denat เข้มข้นสูง เพราะทำให้เกิด Rebound Seborrhea'
    ]
  },
  'Wrinkles': {
    issue: 'Wrinkles',
    thaiName: 'ริ้วรอยและความหย่อนคล้อย (Wrinkles & Aging)',
    pathophysiology: 'แสงแดดและอายุขัยกระตุ้นเอนไซม์ MMPs ให้ย่อยสลาย Collagen Type I, III และ Elastin เสื่อมสภาพ',
    primaryActives: [
      'Retinoids (Retinol, Retinaldehyde)',
      'Peptides (Copper Peptides, Matrixyl, Argireline)',
      'Vitamin C',
      'Bakuchiol'
    ],
    secondaryActives: ['Hyaluronic Acid', 'Polyglutamic Acid (PGA)', 'Ceramides'],
    sensitiveAlternatives: ['Bakuchiol', 'Peptides', 'Hyaluronic Acid'],
    contraindications: [
      'เปปไทด์จะเสื่อมในสภาพกรดจัด ห้ามทาพร้อมกับ AHA, BHA หรือ L-Ascorbic Acid ในขั้นตอนเดียวกัน'
    ]
  }
};

export const CHEMICAL_INCOMPATIBILITIES = [
  {
    title: 'pH Clash: Peptides + กรดเข้มข้น',
    detail: 'ห้ามทา Peptides พร้อมกับ L-Ascorbic Acid หรือ AHA เข้มข้นในขั้นตอนเดียวกัน เพราะความเป็นกรดจะทำลายพันธะเปปไทด์ (แนะนำแยกใช้เช้า-เย็น)',
  },
  {
    title: 'Oxidative Clash: BPO + Antioxidants',
    detail: 'ห้ามทา Benzoyl Peroxide คู่กับ L-Ascorbic Acid พร้อมกัน เพราะ BPO เป็นสารออกซิไดเซอร์จะทำลายฤทธิ์วิตามินซีทันที',
  },
  {
    title: 'Irritation Threshold: Retinoids + กรดผลัดเซลล์',
    detail: 'ไม่ควรใช้ Retinoids ซ้อนกับ AHA/BHA เข้มข้นในคืนเดียวกัน เพื่อป้องกันเกราะป้องกันผิวอักเสบพัง',
  }
];
