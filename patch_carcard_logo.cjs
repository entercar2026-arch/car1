const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

content = content.replace(
  'import { BrandIcon } from "./BrandIcon";',
  'import { BrandIcon, hasBrandIcon } from "./BrandIcon";'
);

// We need to replace in 4 places where brandColor is used in CarCard.tsx
// 1. Line 1150
content = content.replace(
  /<span className=\{brandColor\}>\{brand\}<\/span>\n\s*\{model \? \` \$\{model\}\` : ''\}/g,
  `{!hasBrandIcon(brand) && <span className={brandColor}>{brand}</span>}
                                {model || hasBrandIcon(brand) ? \` \${model}\` : ''}`
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard logo!");
