const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const splitUrlsReplacement = `const splitUrls = (input: string): string[] => {
  if (!input) return [];
  const normalized = input.replace(/(?<!^)(https?:\\/\\/|data:)/gi, '\\n$1');
  const lines = normalized.split(/\\n/);
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data:')) {
      result.push(trimmed);
    } else {
      const parts = trimmed.split(/[\\s,;]+/).filter(Boolean);
      result.push(...parts);
    }
  }
  return result.map(p => p.trim()).filter(Boolean);
};`;

content = content.replace(
  /const splitUrls = \(input: string\): string\[\] => \{[\s\S]*?\n\};\n/,
  splitUrlsReplacement + '\n'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched splitUrls!");
