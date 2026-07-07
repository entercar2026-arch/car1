const fs = require('fs');
let code = fs.readFileSync('api/blur-license-plate.ts', 'utf8');
code = code.replace(/Failed to fetch image: \$\{imageRes\.statusText\}/g, `Failed to fetch image at \${imageUrl}: \${imageRes.statusText}`);
code = code.replace(/Failed to fetch image URL: \$\{fetchErr\.message\}/g, `Failed to fetch image URL (\${imageUrl}): \${fetchErr.message}`);
fs.writeFileSync('api/blur-license-plate.ts', code);
