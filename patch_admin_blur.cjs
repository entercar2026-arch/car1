const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Add import
content = content.replace(
  'import { getFallbackCarThumbnail as getAdminFallbackCarThumbnail } from "../utils/carImage";',
  'import { getFallbackCarThumbnail as getAdminFallbackCarThumbnail } from "../utils/carImage";\nimport { blurLicensePlate } from "../utils/blur-plate";'
);

// Add isUploading state
content = content.replace(
  '  const [isFormOpen, setIsFormOpen] = useState(false);',
  '  const [isFormOpen, setIsFormOpen] = useState(false);\n  const [isUploading, setIsUploading] = useState(false);'
);

// Replace handleImageUpload
const newHandleImageUpload = `  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit. Please provide a URL instead of uploading large media directly.");
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          try {
            const blurred = await blurLicensePlate(reader.result);
            setFormImage(blurred);
          } catch (e) {
            setFormImage(reader.result);
          }
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };`;

content = content.replace(
  /  const handleImageUpload = \(e: React.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\n  \};\n/,
  newHandleImageUpload + '\n'
);

// Replace handleGalleryUpload
const newHandleGalleryUpload = `  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          alert("File " + file.name + " exceeds 10MB limit. Skipping.");
          continue;
        }
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            if (typeof reader.result === "string") {
              try {
                const blurred = await blurLicensePlate(reader.result);
                setFormPhotos((prev) => prev ? prev + "\\n" + blurred : blurred);
              } catch (e) {
                setFormPhotos((prev) => prev ? prev + "\\n" + reader.result : reader.result);
              }
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      setIsUploading(false);
    }
  };`;

content = content.replace(
  /  const handleGalleryUpload = \(e: React.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\n  \};\n/,
  newHandleGalleryUpload + '\n'
);

// Add loading indicator to UI
content = content.replace(
  '<h2 className="text-xl font-bold text-black mb-1 flex items-center gap-2">',
  `{isUploading && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
                    <Loader2 className="w-10 h-10 text-[#4C0027] animate-spin mb-4" />
                    <p className="text-stone-800 font-bold text-sm">Processing Image & Detecting License Plate...</p>
                  </div>
                )}
                <h2 className="text-xl font-bold text-black mb-1 flex items-center gap-2">`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard for blur!");
