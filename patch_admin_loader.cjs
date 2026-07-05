const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(
  '  FileWarning,\n} from "lucide-react";',
  '  FileWarning,\n  Loader2,\n} from "lucide-react";'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched Loader2 import!");
