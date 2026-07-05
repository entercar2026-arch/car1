const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

content = content.replace(
  /className="w-auto max-w-full max-h-\[60vh\] sm:max-h-\[65vh\] object-contain rounded-2xl shadow-2xl border border-white\/5 bg-black\/40"/g,
  'className="w-full max-w-4xl h-[60vh] sm:h-[65vh] object-cover rounded-2xl shadow-2xl border border-white/5 bg-black/40"'
);

content = content.replace(
  /className="w-full max-w-4xl h-\[60vh\] sm:h-\[65vh\] object-contain rounded-2xl shadow-2xl border border-white\/5 bg-black\/40"/g,
  'className="w-full max-w-4xl h-[60vh] sm:h-[65vh] object-cover rounded-2xl shadow-2xl border border-white/5 bg-black/40"'
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched modal cover!");
