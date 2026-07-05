const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(
  /onUpdateBookingStatus\(\s*book\.id,\s*"Cancelled",\s*\)/g,
  'startTransition(() => onUpdateBookingStatus(book.id, "Cancelled"))'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard INP 4!");
