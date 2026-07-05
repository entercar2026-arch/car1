const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix sortedCars
content = content.replace(
  'const sortedCars = useMemo(() => {\n    const list = [...cars];\n    if (deferredSortBy === "price-asc") {',
  'const sortedCars = useMemo(() => {\n    const list = [...cars];\n    if (sortBy === "price-asc") {'
);
content = content.replace(
  '    }\n    if (deferredSortBy === "price-desc") {\n      return list.sort((a, b) => b.price - a.price);\n    }',
  '    }\n    if (sortBy === "price-desc") {\n      return list.sort((a, b) => b.price - a.price);\n    }'
);

// Fix filteredCars
content = content.replace(
  '    if (sortBy === "price-asc") {\n      return [...results].sort((a, b) => a.price - b.price);\n    }',
  '    if (deferredSortBy === "price-asc") {\n      return [...results].sort((a, b) => a.price - b.price);\n    }'
);
content = content.replace(
  '    if (sortBy === "price-desc") {\n      return [...results].sort((a, b) => b.price - a.price);\n    }',
  '    if (deferredSortBy === "price-desc") {\n      return [...results].sort((a, b) => b.price - a.price);\n    }'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed!");
