const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove isFiltering, activeFilters, and their useEffect
content = content.replace(
  /const \[isFiltering, setIsFiltering\] = useState\(false\);\n[\s\S]*?const filterTimeoutRef = useRef<NodeJS\.Timeout \| null>\(null\);\n[\s\S]*?}, \[filters\]\);\n/m,
  ''
);

// Replace activeFilters with deferredFilters in filteredCars
content = content.replace(
  'const deferredSortBy = React.useDeferredValue(sortBy);',
  'const deferredSortBy = React.useDeferredValue(sortBy);\n  const deferredFilters = React.useDeferredValue(filters);'
);

content = content.replace(
  'const searchPattern = activeFilters.searchTerm.trim().toLowerCase();',
  'const searchPattern = deferredFilters.searchTerm.trim().toLowerCase();'
);
content = content.replace(/activeFilters\./g, 'deferredFilters.');

// Change dependencies of filteredCars
content = content.replace(
  '}, [cars, activeFilters, likedCars, deferredSortBy]);',
  '}, [cars, deferredFilters, likedCars, deferredSortBy]);'
);

// Remove isFiltering from rendering
content = content.replace(
  '{isFiltering || isLoadingData ? (',
  '{isLoadingData ? ('
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced!");
