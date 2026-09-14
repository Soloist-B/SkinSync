import {
  AIDetectionScore,
  QuestionnaireAnswers,
  ClinicalProfile,
  SkincareProduct,
  ScoredProduct,
  SkincareCategory
} from '../types';
import { SKIN_ISSUES_CLINICAL_DATA, CHEMICAL_INCOMPATIBILITIES } from '../data/ingredients';

export function generateClinicalProfile(
  aiScores: AIDetectionScore[],
  answers: QuestionnaireAnswers
): ClinicalProfile {
  const isCompromised = answers.barrier === 'compromised';
  const isMildlyImpaired = answers.barrier === 'mildly_impaired';
  const isHighSensitivity = answers.sensitivity === 'high';
  const isDarkSkin = answers.fitzpatrick === 'dark';

  // 1. หมวดเกราะป้องกันผิว
  let barrierTitle = 'เกราะป้องกันผิวแข็งแรง (Healthy Barrier)';
  let barrierDesc = 'อัตราการสูญเสียน้ำทางผิวหนัง (TEWL) อยู่ในเกณฑ์ปกติ เซลล์ผิวเชื่อมแน่น สามารถใช้สารออกฤทธิ์และผลัดเซลล์ได้ตามมาตรฐาน';
  if (isCompromised) {
    barrierTitle = 'เกราะป้องกันผิวถูกทำลาย (Compromised Barrier)';
    barrierDesc = 'พบภาวะสูญเสียน้ำออกจากผิวสูง (TEWL) ผิวลอก แสบ หรือคัน ระบบสั่งหยุดใช้สารผลัดเซลล์ผิวและเรตินอยด์ชั่วคราว พร้อมเร่งเสริม Ceramide 3:1:1';
  } else if (isMildlyImpaired) {
    barrierTitle = 'เกราะป้องกันผิวเริ่มมีปัญหา (Mildly Impaired)';
    barrierDesc = 'ผิวเริ่มสูญเสียความชุ่มชื้นและไวต่อสิ่งเร้า ควรระมัดระวังความเข้มข้นและความถี่ในการผลัดเซลล์ผิว';
  }

  // 2. หมวดความไวผิว
  let sensTitle = 'ผิวทนทาน / ไม่แพ้ง่าย (Low Sensitivity)';
  let sensDesc = 'ผิวมีความทนทานต่อสารออกฤทธิ์และสารกระตุ้นภายนอกได้ดี';
  const sensBans: string[] = [];
  const sensMods: string[] = [];

  if (isHighSensitivity) {
    sensTitle = 'ผิวบอบบางแพ้ง่ายมาก (High Sensitivity)';
    sensDesc = 'ระบบภูมิคุ้มกันผิวไวต่อสารกระตุ้น เกิดผื่นแดง แสบร้อน หรือสิวเห่อง่ายเมื่อเปลี่ยนผลิตภัณฑ์';
    sensBans.push('Fragrance (น้ำหอมสังเคราะห์)', 'Essential Oils (น้ำมันหอมระเหย)', 'Alcohol Denat (แอลกอฮอล์แปลงสภาพ)', 'Harsh Preservatives');
    sensMods.push('เปลี่ยน Pure L-Ascorbic Acid เป็นอนุพันธ์วิตามินซีที่ pH เป็นกลาง เช่น THD Ascorbate หรือ SAP', 'เลือกผลิตภัณฑ์ที่มีผลทดสอบ Hypoallergenic');
  } else if (answers.sensitivity === 'medium') {
    sensTitle = 'ผิวไวปานกลาง (Medium Sensitivity)';
    sensDesc = 'อาจมีอาการคันยุบยิบหรือแดงชั่วคราวเมื่อเริ่มสารสกัดใหม่ แนะนำทำ Patch Test ก่อนเสมอ';
  }

  // 3. หมวดการผลิตน้ำมัน
  let sebumTitle = 'ผิวผสม / ธรรมดา (Combination / Normal)';
  let vehicleType = 'เนื้อโลชั่น (Lotion), เจลครีม (Gel-Cream), อิมัลชันบางเบา';
  const sebumAvoid: string[] = [];
  const sebumPrefer: string[] = [];

  if (answers.sebum === 'oily') {
    sebumTitle = 'ผิวมัน เป็นสิวง่าย (Oily / Acne-Prone)';
    vehicleType = 'เนื้อเจลใส (Aqueous-based Gel), ซีรั่มสูตรน้ำ, ฟลูอิดบางเบา (Light Fluid)';
    sebumAvoid.push('สารกลุ่ม Highly Occlusive (Petrolatum หนา)', 'น้ำมันที่มีกรด Oleic Acid สูง', 'บัตเตอร์หนักๆ เช่น Shea Butter ปริมาณมาก');
    sebumPrefer.push('Aqueous Gel', 'Salicylic Acid (BHA)', 'Zinc PCA', 'Niacinamide');
  } else if (answers.sebum === 'dry') {
    sebumTitle = 'ผิวแห้ง ขาดน้ำมัน (Dry / Alipidic)';
    vehicleType = 'เนื้อครีมเข้มข้น (Rich Cream), บาล์ม (Balm), Water-in-Oil Emulsion';
    sebumAvoid.push('Astringents ผสมแอลกอฮอล์', 'โฟมล้างหน้าที่ชะล้างไขมันผิวรุนแรง');
    sebumPrefer.push('Occlusives เคลือบกักเก็บน้ำ', 'Squalane', 'Ceramides', 'Shea Butter');
  }

  // 4. Fitzpatrick
  let fitzTitle = 'ผิวขาวมาก (Fitzpatrick I-II)';
  let fitzDesc = 'ผิวไหม้แดดง่ายมากแต่แทบไม่คล้ำ ไวต่อแสง UV สูง';
  const fitzCautions: string[] = ['ต้องทาครีมกันแดด Broad-spectrum SPF 50+ สม่ำเสมอ'];

  if (isDarkSkin) {
    fitzTitle = 'ผิวโทนเอเชีย / คล้ำง่าย (Fitzpatrick IV-VI)';
    fitzDesc = 'เมลาโนไซต์ตอบสนองต่อการกระตุ้นได้ไว มีความเสี่ยงสูงมากต่อการเกิดรอยดำหลังการอักเสบ (Severe PIH)';
    fitzCautions.push(
      'ห้ามลอกผิวด้วยกรดความเข้มข้นสูง (Chemical Peels)',
      'เปลี่ยนไปใช้กรดโมเลกุลใหญ่ที่ซึมช้าและอ่อนโยน เช่น Mandelic Acid หรือ PHA',
      'การใช้ Retinol ต้องจำกัดความเข้มข้นเริ่มต้นที่ระดับต่ำสุดเสมอ'
    );
  } else if (answers.fitzpatrick === 'medium') {
    fitzTitle = 'ผิวสองสี (Fitzpatrick III)';
    fitzDesc = 'มีโอกาสไหม้แดงเล็กน้อยแล้วค่อยๆ คล้ำลง มีความเสี่ยงรอยดำปานกลาง';
  }

  // 5. แนะนำสารออกฤทธิ์ตามผลตรวจ AI (Threshold 0.20)
  const bannedActives: string[] = [];
  if (isCompromised) {
    bannedActives.push('AHA (Glycolic Acid, Lactic Acid)', 'BHA (Salicylic Acid)', 'Retinoids (Retinol, Adapalene)', 'Physical Scrubs');
  }

  const targetActives = aiScores
    .filter((s) => s.probability >= 0.20)
    .map((item) => {
      const clinicalData = SKIN_ISSUES_CLINICAL_DATA[item.class_name];
      let primary = clinicalData.primaryActives;
      let secondary = clinicalData.secondaryActives;

      // ปรับปรุงกรณีผิวแพ้ง่ายมาก
      if (isHighSensitivity && clinicalData.sensitiveAlternatives.length > 0) {
        primary = clinicalData.sensitiveAlternatives;
      }

      // ปรับปรุงกรณีเกราะป้องกันผิวพัง
      if (isCompromised) {
        primary = primary.filter(
          (act) =>
            !act.includes('Retin') &&
            !act.includes('AHA') &&
            !act.includes('BHA') &&
            !act.includes('Salicylic') &&
            !act.includes('Glycolic')
        );
      }

      return {
        issue: item.class_name,
        probability: item.probability,
        primaryActives: primary,
        secondaryActives: secondary,
        contraindications: clinicalData.contraindications
      };
    });

  // 6. Routine Rules (กฎการจัดตารางเวลาและการเข้ากันของสาร)
  const routineRules: string[] = [];
  if (isCompromised) {
    routineRules.push('[คำสั่งด่วนทางการแพทย์] OVERRIDE ACTIVE: หยุดพักสารผลัดเซลล์และกรดทุกชนิด 2-4 สัปดาห์ เน้นเฉพาะการบำรุงและฟื้นฟูเกราะป้องกันผิว');
  } else {
    routineRules.push('ช่วงเช้า: เน้นสารต้านอนุมูลอิสระ (เช่น Niacinamide, อนุพันธ์วิตามินซี) มอยส์เจอร์ไรเซอร์ และครีมกันแดด');
    routineRules.push('ช่วงก่อนนอน: เวลาที่เหมาะสมในการใช้สารผลัดเซลล์ผิว (BHA/AHA) หรือสารกลุ่ม Retinoids ตามด้วยมอยส์เจอร์ไรเซอร์');
  }

  routineRules.push(...CHEMICAL_INCOMPATIBILITIES.map((c) => `ข้อควรระวัง: ${c.title} - ${c.detail}`));

  return {
    barrier: {
      status: answers.barrier,
      title: barrierTitle,
      description: barrierDesc,
      override: isCompromised
    },
    sensitivity: {
      level: answers.sensitivity,
      title: sensTitle,
      description: sensDesc,
      bans: sensBans,
      modifications: sensMods
    },
    sebum: {
      rate: answers.sebum,
      title: sebumTitle,
      vehicleType,
      avoid: sebumAvoid,
      prefer: sebumPrefer
    },
    fitzpatrick: {
      type: answers.fitzpatrick,
      title: fitzTitle,
      description: fitzDesc,
      cautions: fitzCautions
    },
    mandatoryRepair: isCompromised,
    bannedActives,
    targetActives,
    routineRules
  };
}

export function scoreAndFilterProducts(
  products: SkincareProduct[],
  profile: ClinicalProfile,
  answers: QuestionnaireAnswers,
  aiScores: AIDetectionScore[]
): ScoredProduct[] {
  const isCompromised = answers.barrier === 'compromised';
  const isHighSensitivity = answers.sensitivity === 'high';

  const activeIssues = aiScores.filter((s) => s.probability >= 0.20);

  return products.map((product) => {
    let score = 20; // Base score
    let isCompatible = true;
    const matchReasons: string[] = [];
    const warningReasons: string[] = [];

    // 1. ตรวจสอบความปลอดภัยตามเกราะป้องกันผิว (Barrier Rule)
    if (isCompromised && !product.suitableBarrier.includes('compromised')) {
      isCompatible = false;
      score -= 50;
      warningReasons.push('ไม่แนะนำขณะเกราะป้องกันผิวบกพร่อง (มีสารผลัดเซลล์หรือเรตินอยด์ที่อาจก่อความระคายเคือง)');
    } else if (product.suitableBarrier.includes(answers.barrier)) {
      score += 20;
    }

    // กรณีเกราะป้องกันผิวพัง ให้คะแนนพิเศษกับสารซ่อมแซมไขมัน (Ceramide 3:1:1 / B5)
    if (isCompromised) {
      const hasRepair = product.keyActives.some(
        (a) =>
          a.toLowerCase().includes('ceramide') ||
          a.toLowerCase().includes('panthenol') ||
          a.toLowerCase().includes('b5') ||
          a.toLowerCase().includes('centella')
      );
      if (hasRepair) {
        score += 45;
        matchReasons.push('เสริมเกราะป้องกันผิวเร่งด่วน (Lipid Repair)');
      }
    }

    // 2. ตรวจสอบสภาพผิวตาม Sebum (Dry / Combination / Oily)
    if (product.suitableSkinTypes.includes(answers.sebum)) {
      score += 25;
      matchReasons.push(`เนื้อสัมผัส ${product.vehicleType} เข้ากับสภาพผิว (${profile.sebum.title.split(' ')[0]})`);
    } else {
      if (answers.sebum === 'oily' && (product.vehicleType === 'Balm' || product.vehicleType === 'Cream')) {
        score -= 20;
        warningReasons.push('เนื้อสัมผัสอาจหนักหรืออุดตันง่ายสำหรับสภาพผิวมัน');
      }
    }

    // 3. ตรวจสอบความไวผิว (Sensitivity)
    if (isHighSensitivity) {
      if (!product.isFragranceFree || !product.isAlcoholFree) {
        score -= 25;
        warningReasons.push('มีส่วนผสมของน้ำหอมหรือแอลกอฮอล์ อาจไม่เหมาะกับผู้ที่มีภาวะผิวแพ้ง่ายมาก');
      } else {
        score += 15;
        matchReasons.push('สูตรอ่อนโยน ปราศจากน้ำหอมและแอลกอฮอล์');
      }
    }

    // 4. ตรวจสอบความตรงกับปัญหาที่ AI ตรวจพบ
    for (const issue of activeIssues) {
      if (product.targetIssues.includes(issue.class_name)) {
        const boost = Math.round(issue.probability * 30);
        score += boost;
        const thaiName = SKIN_ISSUES_CLINICAL_DATA[issue.class_name]?.thaiName || issue.class_name;
        matchReasons.push(`ช่วยดูแล${thaiName.split(' ')[0]} (AI ตรวจพบ ${(issue.probability * 100).toFixed(0)}%)`);
      }
    }

    return {
      product,
      score,
      isCompatible,
      matchReasons,
      warningReasons
    };
  }).sort((a, b) => b.score - a.score);
}

export function getTopRecommendations(
  scoredProducts: ScoredProduct[]
): Record<SkincareCategory, ScoredProduct | null> {
  const categories: SkincareCategory[] = [
    'Serum',
    'Moisturizer',
    'Cleanser',
    'Toner',
    'Cream',
    'Sunscreen'
  ];

  const recommendations: Record<SkincareCategory, ScoredProduct | null> = {
    Serum: null,
    Moisturizer: null,
    Cleanser: null,
    Toner: null,
    Cream: null,
    Sunscreen: null
  };

  for (const cat of categories) {
    const candidate = scoredProducts.find((p) => p.product.category === cat && p.isCompatible);
    if (candidate) {
      recommendations[cat] = candidate;
    } else {
      const fallback = scoredProducts.find((p) => p.product.category === cat);
      recommendations[cat] = fallback || null;
    }
  }

  return recommendations;
}
