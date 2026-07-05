const fs = require('fs');
let content = fs.readFileSync('src/components/CarCard.tsx', 'utf-8');

// Add play button overlay in the card image container
content = content.replace(
  '</AnimatePresence>\n\n              {/* Beautiful linear cover shadow */}',
  `</AnimatePresence>

              {/* Floating Play Button Overlay */}
              {hasVideo && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl">
                    <Play className="w-5 h-5 text-white ml-1 fill-current opacity-90" />
                  </div>
                </div>
              )}

              {/* Beautiful linear cover shadow */}`
);

// Fix indicators container in card for 1 photo but it's a video
content = content.replace(
  'allPhotos.length > 1 && allPhotos.map((itemUrl, idx) => {',
  '(allPhotos.length > 1 || hasVideo) && allPhotos.map((itemUrl, idx) => {'
);
content = content.replace(
  '{allPhotos.length > 1 && allPhotos.map((itemUrl, idx) => {',
  '{(allPhotos.length > 1 || hasVideo) && allPhotos.map((itemUrl, idx) => {'
);

fs.writeFileSync('src/components/CarCard.tsx', content);
console.log("Patched CarCard!");
