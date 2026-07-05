const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

content = content.replace(
  'JSON.stringify(prev.car) === JSON.stringify(next.car) &&',
  'prev.car.id === next.car.id && prev.car === next.car &&'
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard memo!");
