const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(/onClick=\{\(\) => setIsFormOpen\(/g, 'onClick={() => startTransition(() => setIsFormOpen(');

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard INP 2!");
