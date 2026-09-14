const fs = require('fs');
const path = require('path');

// Read skincareProducts.ts
const tsContent = fs.readFileSync(path.join(__dirname, '../data/skincareProducts.ts'), 'utf8');

// Match products using regex or require ts-node
const productRegex = /\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?clinicalNotes:\s*['"]([^'"]*)['"]\s*\}/g;

const lines = [
  'id,name,brand,category,price,image_url,description,key_actives,target_issues,suitable_skin_types,suitable_barrier,vehicle_type,is_fragrance_free,is_alcohol_free,usage_time,clinical_notes'
];

// Let's parse with an evaluator
const script = `
const { SKINCARE_PRODUCTS } = require('./dist_temp.js');
const escapeCsv = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

const rows = SKINCARE_PRODUCTS.map(p => {
  const formatArray = (arr) => '{' + arr.map(item => '"' + item.replace(/"/g, '\\\\"') + '"').join(',') + '}';
  return [
    escapeCsv(p.id),
    escapeCsv(p.name),
    escapeCsv(p.brand),
    escapeCsv(p.category),
    escapeCsv(p.price || ''),
    escapeCsv(p.imageUrl || ''),
    escapeCsv(p.description || ''),
    escapeCsv(formatArray(p.keyActives || [])),
    escapeCsv(formatArray(p.targetIssues || [])),
    escapeCsv(formatArray(p.suitableSkinTypes || [])),
    escapeCsv(formatArray(p.suitableBarrier || [])),
    escapeCsv(p.vehicleType),
    escapeCsv(p.isFragranceFree ? 'true' : 'false'),
    escapeCsv(p.isAlcoholFree ? 'true' : 'false'),
    escapeCsv(p.usageTime || 'Both'),
    escapeCsv(p.clinicalNotes || '')
  ].join(',');
});

console.log(rows.join('\\n'));
`;
