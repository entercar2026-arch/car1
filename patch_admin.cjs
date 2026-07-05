const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const galleryUploadHandler = `
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.size > 10 * 1024 * 1024) {
          alert("File " + file.name + " exceeds 10MB limit. Skipping.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setFormPhotos((prev) => prev ? prev + "\\n" + reader.result : reader.result);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
`;

content = content.replace(
  '  const brandPlum = "#4C0027";',
  galleryUploadHandler + '\n  const brandPlum = "#4C0027";'
);

const uploadButtonHTML = `
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Vehicle Image/Video Gallery (Optional, one URL per line, space, or comma)
                      </label>
                      <label className="text-[10px] font-bold text-[#4C0027] bg-[#4C0027]/10 px-2 py-0.5 rounded cursor-pointer hover:bg-[#4C0027]/20 transition-colors flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Upload
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleGalleryUpload}
                        />
                      </label>
                    </div>`;

content = content.replace(
  '<label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">\n                      Vehicle Image/Video Gallery (Optional, one URL per line, space, or comma)\n                    </label>',
  uploadButtonHTML
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard!");
