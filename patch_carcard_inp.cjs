const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

content = content.replace(/setCurrentPhotoIndex\(\(prev\) => \(prev - 1 \+ allPhotos\.length\) % allPhotos\.length\);/g, 'startTransition(() => setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length));');
content = content.replace(/setCurrentPhotoIndex\(\(prev\) => \(prev \+ 1\) % allPhotos\.length\);/g, 'startTransition(() => setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length));');
content = content.replace(/setCurrentPhotoIndex\(idx\);/g, 'startTransition(() => setCurrentPhotoIndex(idx));');
content = content.replace(/setCurrentPhotoIndex\(index\);/g, 'startTransition(() => setCurrentPhotoIndex(index));');
content = content.replace(/setCurrentPhotoIndex\(0\);/g, 'startTransition(() => setCurrentPhotoIndex(0));');

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard INP!");
