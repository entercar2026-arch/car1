const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Add state variables
content = content.replace(
  '  const [isUploading, setIsUploading] = useState(false);',
  '  const [isUploading, setIsUploading] = useState(false);\n  const [isDraggingImage, setIsDraggingImage] = useState(false);\n  const [isDraggingGallery, setIsDraggingGallery] = useState(false);'
);

// Add drop handlers
const dropHandlers = `  const handleDropImage = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
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
  };

  const handleDropGallery = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingGallery(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          alert("File " + file.name + " exceeds 10MB limit. Skipping.");
          continue;
        }
        await new Promise((resolve) => {
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
  /  const handleGalleryUpload = async \(e: React.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\n  \};\n/,
  match => match + '\n\n' + dropHandlers + '\n'
);

// Update Image Input Div
content = content.replace(
  '<div className="relative">\n                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">',
  '<div className={`relative border-2 border-dashed rounded-xl transition-all ${isDraggingImage ? "border-[#4C0027] bg-[#4C0027]/5" : "border-transparent"}`} onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }} onDragLeave={() => setIsDraggingImage(false)} onDrop={handleDropImage}>\n                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">'
);
content = content.replace(
  'placeholder="Paste image/video link(s). Multiple links pasted together are split automatically!"',
  'placeholder="Paste image/video link(s) or drag & drop file here"'
);

// Update Gallery Input Div
content = content.replace(
  '<div className="relative">\n                      <span className="absolute top-2.5 left-0 pl-3.5 flex text-stone-400">',
  '<div className={`relative border-2 border-dashed rounded-xl transition-all ${isDraggingGallery ? "border-[#4C0027] bg-[#4C0027]/5" : "border-transparent"}`} onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }} onDragLeave={() => setIsDraggingGallery(false)} onDrop={handleDropGallery}>\n                      <span className="absolute top-2.5 left-0 pl-3.5 flex text-stone-400">'
);
content = content.replace(
  'placeholder="https://... (link 1)&#10;https://... (link 2)&#10;Paste multiple URLs separated by newlines, commas, spaces, or concatenated directly"',
  'placeholder="https://... (link 1)&#10;https://... (link 2)&#10;Paste URLs or drag & drop files here"'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log("Patched drag and drop!");
