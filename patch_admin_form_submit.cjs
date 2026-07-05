const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(
  'const handleFormSubmit = (e: React.FormEvent) => {\n    e.preventDefault();',
  'const handleFormSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (isUploading) return;'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard form submit!");
