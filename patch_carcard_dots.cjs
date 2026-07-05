const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

// Replace the wrapper
content = content.replace(
  '<div className="flex items-center gap-1 overflow-x-auto flex-nowrap scrollbar-hide flex-1 pb-1 pt-1 -mx-1 px-1">',
  '<div className="flex items-center gap-[2px] overflow-hidden flex-nowrap flex-1 pb-1 pt-1">'
);

// Replace the video button size (w-7 h-7 -> w-6 h-6)
content = content.replace(
  /className=\{\`w-7 h-7 shrink-0 mr-1 rounded-full flex items-center/g,
  'className={`w-6 h-6 shrink-0 mr-1 rounded-full flex items-center'
);

// We need to also reduce the SVG inside the video button slightly
content = content.replace(
  '<svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">',
  '<svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">'
);

content = content.replace(
  '<Play className="w-3 h-3 fill-current text-current ml-0.5" />',
  '<Play className="w-2.5 h-2.5 fill-current text-current ml-[1px]" />'
);

// Replace the dot button size (w-5 h-5 -> w-4 h-4)
content = content.replace(
  /className="w-5 h-5 shrink-0 flex items-center justify-center cursor-pointer group"/g,
  'className="w-4 h-4 shrink-0 flex items-center justify-center cursor-pointer group"'
);

// Replace the inner dot size (w-3.5 h-3.5 -> w-2.5 h-2.5)
content = content.replace(
  /className=\{\`w-3\.5 h-3\.5 rounded-full transition-all \$\{/g,
  'className={`w-2.5 h-2.5 rounded-full transition-all ${'
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard dots to fit 1 row!");
