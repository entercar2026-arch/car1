const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

content = content.replace(/setIsPhotosOpen\(true\);/g, 'startTransition(() => setIsPhotosOpen(true));');
content = content.replace(/setIsPhotosOpen\(false\);/g, 'startTransition(() => setIsPhotosOpen(false));');

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard INP 2!");
