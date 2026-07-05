const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(
  'import { BrandIcon } from "./BrandIcon";',
  'import { BrandIcon, hasBrandIcon } from "./BrandIcon";'
);

content = content.replace(
  /<span className=\{brandColor\}>\{brand\}<\/span>\n\s*\{model \? \` \$\{model\}\` : ''\}/g,
  `{!hasBrandIcon(brand) && <span className={brandColor}>{brand}</span>}
                  {model || hasBrandIcon(brand) ? \` \${model}\` : ''}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard logo!");
