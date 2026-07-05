const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

if (!content.includes('import { getBrandColor, splitCarName }')) {
  content = content.replace(
    'import { getFallbackCarThumbnail as getAdminFallbackCarThumbnail } from "../utils/carImage";',
    'import { getFallbackCarThumbnail as getAdminFallbackCarThumbnail } from "../utils/carImage";\nimport { getBrandColor, splitCarName } from "../utils/brandColors";'
  );
}

content = content.replace(
  /<span\s+id=\{`admin-car-name-\$\{car\.id\}`\}\s+className="font-bold text-stone-900 block text-sm"\s*>\s*\{car\.name\}\s*<\/span>/g,
  `<span
            id={\`admin-car-name-\${car.id}\`}
            className="font-bold text-stone-900 block text-sm"
          >
            {(() => {
              const { brand, model } = splitCarName(car.name);
              const brandColor = getBrandColor(brand);
              return (
                <span>
                  <span className={brandColor}>{brand}</span>
                  {model ? \` \${model}\` : ''}
                </span>
              );
            })()}
          </span>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard brand color!");
