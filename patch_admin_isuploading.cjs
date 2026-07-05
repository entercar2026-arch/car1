const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(
  '<button\n                    id="btn-save-car"\n                    type="submit"\n                    className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all hover:brightness-110 cursor-pointer"\n                    style={{ backgroundColor: brandPlum }}\n                  >\n                    {editingCar ? "Update Specifications" : "Save Vehicle"}\n                  </button>',
  `<button
                    id="btn-save-car"
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all hover:brightness-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: brandPlum }}
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing Images...
                      </span>
                    ) : editingCar ? "Update Specifications" : "Save Vehicle"}
                  </button>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard isUploading!");
