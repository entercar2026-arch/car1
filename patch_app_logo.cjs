const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('hasBrandIcon')) {
  content = content.replace(
    'import { BrandIcon } from "./components/BrandIcon";',
    'import { BrandIcon, hasBrandIcon } from "./components/BrandIcon";'
  );
  if (!content.includes('hasBrandIcon')) {
    // maybe BrandIcon is not imported in App.tsx
    content = content.replace(
      'import { getBrandColor, splitCarName } from "./utils/brandColors";',
      'import { getBrandColor, splitCarName } from "./utils/brandColors";\nimport { hasBrandIcon } from "./components/BrandIcon";'
    );
  }
}

content = content.replace(
  /<span className=\{brandColor\}>\{brand\}<\/span>\n\s*\{model \? \` \$\{model\}\` : ''\}/g,
  `{!hasBrandIcon(brand) && <span className={brandColor}>{brand}</span>}
                                            {model || hasBrandIcon(brand) ? \` \${model}\` : ''}`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx logo!");
