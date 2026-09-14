import { createClient } from '@supabase/supabase-js';
import { SkincareProduct } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your-project-url' &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function ช่วยแปลงข้อมูลจากรูปแบบ Database ให้ตรงกับ SkincareProduct Interface
function parseArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    // กรณี format "{item1,item2}" ของ PostgreSQL
    if (val.startsWith('{') && val.endsWith('}')) {
      return val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
    }
    // กรณีคั่นด้วย ; หรือ , ใน Excel
    const delimiter = val.includes(';') ? ';' : ',';
    return val
      .split(delimiter)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function fetchProductsFromSupabase(): Promise<SkincareProduct[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('skincare_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products from Supabase:', error);
    throw error;
  }

  if (!data) return [];

  return data.map((row: any): SkincareProduct => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price || '',
    imageUrl: (row.image_url || '').trim(),
    description: row.description || '',
    keyActives: parseArray(row.key_actives),
    targetIssues: parseArray(row.target_issues) as any,
    suitableSkinTypes: parseArray(row.suitable_skin_types) as any,
    suitableBarrier: parseArray(row.suitable_barrier) as any,
    vehicleType: row.vehicle_type,
    isFragranceFree: Boolean(row.is_fragrance_free),
    isAlcoholFree: Boolean(row.is_alcohol_free),
    usageTime: row.usage_time || 'Both',
    clinicalNotes: row.clinical_notes || '',
  }));
}
