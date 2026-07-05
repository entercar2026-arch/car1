const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

content = content.replace(
  "  if (url.includes('/upload/') && !url.includes('wikimedia.org')) {",
  "  if (url.startsWith('data:')) return url;\n\n  if (url.includes('/upload/') && !url.includes('wikimedia.org')) {"
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched getOptimizedImageUrl 2!");
