const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

// Replace line 1485
content = content.replace(
  /<p className="font-bold text-stone-800 truncate mt-0\.5">\s*\{car\.name\}\s*<\/p>/g,
  `<p className="font-bold text-stone-800 truncate mt-0.5">
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
                        </p>`
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched more BrandIcon places!");
