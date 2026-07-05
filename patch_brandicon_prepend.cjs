const fs = require('fs');
let content = fs.readFileSync('src/components/BrandIcon.tsx', 'utf-8');

const hasBrandIconFunction = `
export function hasBrandIcon(brand: string): boolean {
  const normalizedBrand = brand.toLowerCase();
  if (normalizedBrand.includes('hyundai')) return true;
  if (normalizedBrand.includes('porsche')) return true;
  if (normalizedBrand.includes('toyota')) return true;
  if (normalizedBrand.includes('ford')) return true;
  if (normalizedBrand.includes('lexus')) return true;
  if (normalizedBrand.includes('honda')) return true;
  if (normalizedBrand.includes('mazda')) return true;
  if (normalizedBrand.includes('nissan')) return true;
  if (normalizedBrand.includes('jeep')) return true;
  if (normalizedBrand.includes('kia')) return true;
  if (normalizedBrand.includes('bmw')) return true;
  if (normalizedBrand.includes('mercedes')) return true;
  if (normalizedBrand.includes('audi')) return true;
  if (normalizedBrand.includes('tesla')) return true;
  if (normalizedBrand.includes('mg')) return true;
  return false;
}
`;

content = content.replace('export function BrandIcon', hasBrandIconFunction + '\nexport function BrandIcon');

fs.writeFileSync('src/components/BrandIcon.tsx', content);
console.log("Patched BrandIcon prepend!");
