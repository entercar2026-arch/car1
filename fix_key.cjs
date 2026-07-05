const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  '${currentPage}-${sortBy}',
  '${deferredCurrentPage}-${deferredSortBy}'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed key");
