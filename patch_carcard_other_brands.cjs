const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

// Replace line 1594-1595 (Booking modal)
content = content.replace(
  /<BrandIcon brand=\{car\.name\} className="w-5 h-5 fill-current shrink-0" \/>\s*\{car\.name\}\s*<\/h4>/,
  `<BrandIcon brand={car.name} className="w-5 h-5 fill-current shrink-0" />
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
                      </h4>`
);

// Replace line 1827-1828 (Reviews modal)
content = content.replace(
  /<BrandIcon brand=\{car\.name\} className="w-5 h-5 fill-current shrink-0" \/>\s*\{car\.name\} Experience Reviews\s*<\/h3>/,
  `<BrandIcon brand={car.name} className="w-5 h-5 fill-current shrink-0" />
                    {(() => {
                      const { brand, model } = splitCarName(car.name);
                      const brandColor = getBrandColor(brand);
                      return (
                        <span>
                          <span className={brandColor}>{brand}</span>
                          {model ? \` \${model}\` : ''} Experience Reviews
                        </span>
                      );
                    })()}
                  </h3>`
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched other BrandIcon places!");
