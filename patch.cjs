const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const newContent = content
  .replace(/const setFilters = React\.useCallback\(\(action: any\) => \{\n\s*React\.startTransition\(\(\) => \{\n\s*setFiltersRaw\(action\);\n\s*\}\);\n\s*\}, \[\]\);/g, 
  "const setFilters = React.useCallback((action: any) => {\n    setFiltersRaw(action);\n  }, []);")
  .replace(/const setSortBy = React\.useCallback\(\(val: "default" \| "price-asc" \| "price-desc" \| "alphabetical"\) => \{\n\s*React\.startTransition\(\(\) => \{\n\s*setSortByRaw\(val\);\n\s*\}\);\n\s*\}, \[\]\);/g,
  "const setSortBy = React.useCallback((val: \"default\" | \"price-asc\" | \"price-desc\" | \"alphabetical\") => {\n    setSortByRaw(val);\n  }, []);")
  .replace(/const setCurrentPage = React\.useCallback\(\(val: number \| \(\(prev: number\) => number\)\) => \{\n\s*React\.startTransition\(\(\) => \{\n\s*setCurrentPageRaw\(val\);\n\s*\}\);\n\s*\}, \[\]\);/g,
  "const setCurrentPage = React.useCallback((val: number | ((prev: number) => number)) => {\n    setCurrentPageRaw(val);\n  }, []);");
fs.writeFileSync('src/App.tsx', newContent);
console.log("Replaced!");
