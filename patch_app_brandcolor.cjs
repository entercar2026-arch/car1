const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import { getBrandColor, splitCarName }')) {
  content = content.replace(
    'import { getFallbackCarThumbnail } from "./utils/carImage";',
    'import { getFallbackCarThumbnail } from "./utils/carImage";\nimport { getBrandColor, splitCarName } from "./utils/brandColors";'
  );
}

content = content.replace(
  /<span className="text-stone-900 group-hover:text-\[\#4C0027\] transition-colors">\{car\.name\}<\/span>/g,
  `<span className="text-stone-900 group-hover:text-[#4C0027] transition-colors">
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

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx brand color!");
