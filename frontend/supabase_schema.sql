-- ==============================================================================
-- 🧴 SkinSync - Supabase Database Schema for Skincare Products (Idempotent / Re-runnable)
-- ==============================================================================
-- วิธีใช้งาน: คัดลอกโค้ดทั้งหมดนี้ไปวางใน "SQL Editor" บน Supabase แล้วกด "Run"
-- สคริปต์นี้สามารถรันซ้ำกี่ครั้งก็ได้ ไม่เกิด Error นโยบายซ้ำซ้อน
-- ==============================================================================

-- 1. สร้างตาราง skincare_products
CREATE TABLE IF NOT EXISTS public.skincare_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Serum', 'Moisturizer', 'Cleanser', 'Toner', 'Cream', 'Sunscreen')),
    price TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    key_actives TEXT[] DEFAULT '{}',
    target_issues TEXT[] DEFAULT '{}',
    suitable_skin_types TEXT[] DEFAULT '{}',
    suitable_barrier TEXT[] DEFAULT '{}',
    vehicle_type TEXT NOT NULL,
    is_fragrance_free BOOLEAN DEFAULT true,
    is_alcohol_free BOOLEAN DEFAULT true,
    usage_time TEXT DEFAULT 'Both' CHECK (usage_time IN ('AM', 'PM', 'Both')),
    clinical_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. สร้าง Indexes เพื่อให้การค้นหาและเรียงลำดับรวดเร็ว
CREATE INDEX IF NOT EXISTS idx_skincare_products_category ON public.skincare_products(category);
CREATE INDEX IF NOT EXISTS idx_skincare_products_brand ON public.skincare_products(brand);
CREATE INDEX IF NOT EXISTS idx_skincare_products_created_at ON public.skincare_products(created_at DESC);

-- 3. เปิดระบบ Row Level Security (RLS)
ALTER TABLE public.skincare_products ENABLE ROW LEVEL SECURITY;

-- 4. ลบ Policy เดิมก่อน (ถ้ามี) แล้วสร้างใหม่ เพื่อป้องกัน Error Policy ซ้ำ
DROP POLICY IF EXISTS "Allow public read access" ON public.skincare_products;
CREATE POLICY "Allow public read access"
ON public.skincare_products
FOR SELECT
TO public
USING (true);

-- 5. ลบ Policy เดิมก่อน (ถ้ามี) แล้วสร้างใหม่สำหรับ Authenticated / Admin
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.skincare_products;
CREATE POLICY "Allow authenticated full access"
ON public.skincare_products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- เสร็จสิ้น! ตาราง skincare_products พร้อมใช้งานและ Import ข้อมูลได้ทันที
-- ==============================================================================
