const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

// Replace flex-wrap with overflow-x-auto
content = content.replace(
  '<div className="flex justify-center gap-2 mt-4 flex-wrap">',
  '<div className="flex justify-start sm:justify-center gap-2 mt-4 overflow-x-auto w-full max-w-full pb-2 px-4 scrollbar-hide snap-x">'
);

content = content.replace(
  /className=\{\`relative overflow-hidden rounded-lg transition-all border-2 \$\{/g,
  'className={`relative overflow-hidden rounded-lg transition-all border-2 shrink-0 snap-center ${'
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched modal horizontal!");
