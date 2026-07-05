const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

// Replace the dots flex-wrap with overflow-x-auto flex-nowrap scrollbar-hide
content = content.replace(
  '<div className="flex items-center gap-0 flex-wrap">',
  '<div className="flex items-center gap-1 overflow-x-auto flex-nowrap scrollbar-hide flex-1 pb-1 pt-1 -mx-1 px-1">'
);

// Also change the dot itself to not shrink
content = content.replace(
  'className="w-5 h-5 flex items-center justify-center cursor-pointer group"',
  'className="w-5 h-5 shrink-0 flex items-center justify-center cursor-pointer group"'
);

// Fix the video button to not shrink
content = content.replace(
  /className=\{\`w-7 h-7 mr-1 rounded-full flex items-center justify-center/g,
  'className={`w-7 h-7 shrink-0 mr-1 rounded-full flex items-center justify-center'
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard horizontal dots!");
