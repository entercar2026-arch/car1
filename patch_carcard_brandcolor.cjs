const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

content = content.replace(
  'import { BrandIcon } from "./BrandIcon";',
  'import { BrandIcon } from "./BrandIcon";\nimport { getBrandColor, splitCarName } from "../utils/brandColors";'
);

content = content.replace(
  '<span className="truncate">{car.name}</span>',
  `{(() => {
                      const { brand, model } = splitCarName(car.name);
                      const brandColor = getBrandColor(brand);
                      return (
                        <span className="truncate">
                          <span className={brandColor}>{brand}</span>
                          {model ? \` \${model}\` : ''}
                        </span>
                      );
                    })()}`
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard brand color!");
