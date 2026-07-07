const fs = require('fs');
let code = fs.readFileSync('api/blur-license-plate.ts', 'utf8');
code = code.replace(/await fetch\(imageUrl\);/g, `await fetch(imageUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7", "Accept-Language": "en-US,en;q=0.9" } });`);
fs.writeFileSync('api/blur-license-plate.ts', code);
