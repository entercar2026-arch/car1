const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

// Replace relative h-48 with aspect-[16/9] w-full
content = content.replace(
  /className="relative h-48 bg-stone-50 overflow-hidden cursor-zoom-in group\/media"/g,
  'className="relative aspect-[16/9] w-full bg-stone-50 overflow-hidden cursor-zoom-in group/media"'
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard aspect ratio!");
