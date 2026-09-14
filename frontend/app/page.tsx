'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Camera, ClipboardCheck, Sparkles, ArrowRight, Compass } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Camera,
    title: 'ถ่ายภาพใบหน้า',
    desc: 'สแกนสภาพผิวด้วยโมเดล Deep Learning 7 รูปแบบ',
  },
  {
    step: '02',
    icon: ClipboardCheck,
    title: 'แบบประเมินทางคลินิก',
    desc: 'คัดกรองเกราะป้องกันผิว ความไว และการผลิตน้ำมัน',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'แนะนำสกินแคร์เฉพาะคุณ',
    desc: 'จับคู่สารออกฤทธิ์และคัดกรองส่วนผสมที่ควรหลีกเลี่ยง',
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-12 max-w-md mx-auto w-full">
      {/* Top Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-4"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 bg-white text-[11px] font-medium tracking-wider text-gray-500 uppercase mb-4 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Clinical Skin Analysis
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          SkinSync
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
          ระบบวิเคราะห์และคัดกรองสารสกินแคร์เฉพาะบุคคล ด้วย AI ร่วมกับหลักสรีรวิทยาผิวหนัง
        </p>
      </motion.div>

      {/* Steps / Process Cards */}
      <div className="my-8 space-y-3">
        {steps.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.1, duration: 0.4 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <item.icon className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">{item.title}</h2>
                <span className="text-[11px] font-mono text-gray-400 font-medium">{item.step}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-normal">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="space-y-3"
      >
        <button
          type="button"
          onClick={() => router.push('/camera')}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-2xl py-3.5 px-6 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm cursor-pointer"
        >
          เริ่มการประเมินสภาพผิว
          <ArrowRight className="w-4 h-4 text-gray-300" />
        </button>

        <button
          type="button"
          onClick={() => router.push('/browse')}
          className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl py-3 px-6 text-xs font-medium transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-gray-500" />
          ค้นหาคลังผลิตภัณฑ์ทั้งหมด
        </button>

        <p className="text-[11px] text-gray-400 text-center pt-2">
          ไม่มีการบันทึกภาพลงฐานข้อมูล • การวิเคราะห์ประมวลผลบนเซิร์ฟเวอร์แบบส่วนตัว
        </p>
      </motion.div>
    </div>
  );
}