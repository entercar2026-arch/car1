const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

const returnUrlRegex = /  if \(url.includes\('\\/upload\\/'\) && !url.includes\('wikimedia.org'\)\) \{/g;
content = content.replace(returnUrlRegex, "  if (url.startsWith('data:')) return url;\n\n  if (url.includes('/upload/') && !url.includes('wikimedia.org')) {");

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched getOptimizedImageUrl!");
