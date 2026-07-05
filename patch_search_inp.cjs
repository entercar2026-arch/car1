const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The input looks like:
// value={filters.searchTerm}
// onChange={(e) => startTransition(() => setFilters((prev: any) => ({ ...prev, searchTerm: e.target.value })))}

// Instead of rewriting all of App.tsx to use local state, let's just make it update synchronously.
content = content.replace(
  'onChange={(e) => startTransition(() => setFilters((prev: any) => ({ ...prev, searchTerm: e.target.value })))}',
  'onChange={(e) => setFilters((prev: any) => ({ ...prev, searchTerm: e.target.value }))}'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched search input INP!");
