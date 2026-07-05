const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

let newContent = content.replace(
  'const filteredCars = useMemo(() => {',
  'const deferredSortBy = React.useDeferredValue(sortBy);\n  const filteredCars = useMemo(() => {'
);

newContent = newContent.replace(
  '    if (sortBy === "price-asc") {',
  '    if (deferredSortBy === "price-asc") {'
).replace(
  '    if (sortBy === "price-desc") {',
  '    if (deferredSortBy === "price-desc") {'
).replace(
  '    if (sortBy === "alphabetical") {',
  '    if (deferredSortBy === "alphabetical") {'
).replace(
  '  }, [cars, activeFilters, likedCars, sortBy]);',
  '  }, [cars, activeFilters, likedCars, deferredSortBy]);'
);

newContent = newContent.replace(
  'const paginatedCars = useMemo(() => {',
  'const deferredCurrentPage = React.useDeferredValue(currentPage);\n  const paginatedCars = useMemo(() => {'
);

newContent = newContent.replace(
  '    const startIndex = (currentPage - 1) * 12;',
  '    const startIndex = (deferredCurrentPage - 1) * 12;'
).replace(
  '  }, [filteredCars, currentPage]);',
  '  }, [filteredCars, deferredCurrentPage]);'
);

fs.writeFileSync('src/App.tsx', newContent);
console.log("Replaced deferred values!");
