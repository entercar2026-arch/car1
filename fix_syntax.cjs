const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(/startTransition\(\(\) => setIsFormOpen\((.*?)\}/g, 'startTransition(() => setIsFormOpen($1)}');
// Wait, the regex replaced `onClick={() => setIsFormOpen(` with `onClick={() => startTransition(() => setIsFormOpen(`.
// Let's just fix it globally.
// The original was `onClick={() => setIsFormOpen(false)}`
// Now it's `onClick={() => startTransition(() => setIsFormOpen(false)}` (missing the closing paren for startTransition).
content = content.replace(/startTransition\(\(\) => setIsFormOpen\(false\)\}/g, 'startTransition(() => setIsFormOpen(false))}');

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
