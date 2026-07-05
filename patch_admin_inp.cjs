const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(
  /    if \(editingCar\) \{\n      onUpdateCar\(\{([\s\S]*?)\}\);\n    \} else \{\n      onAddCar\(\{([\s\S]*?)\}\);\n    \}\n    setIsFormOpen\(false\);/,
  `    startTransition(() => {
      if (editingCar) {
        onUpdateCar({$1});
      } else {
        onAddCar({$2});
      }
      setIsFormOpen(false);
    });`
);

content = content.replace(
  /  const handleDeleteConfirm = \(\) => \{\n    if \(carToDelete\) \{\n      onDeleteCar\(carToDelete\);\n      setCarToDelete\(null\);\n    \}\n  \};/,
  `  const handleDeleteConfirm = () => {
    if (carToDelete) {
      startTransition(() => {
        onDeleteCar(carToDelete);
        setCarToDelete(null);
      });
    }
  };`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard INP!");
