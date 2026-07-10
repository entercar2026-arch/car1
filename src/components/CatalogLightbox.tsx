import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { Car } from "../types";
import { translations } from "../translations";
import { getCarColorInfo } from "./CarCard";

type LightboxEvent = {
  cars: Car[];
  startIndex: number;
};

let lightboxListener: ((event: LightboxEvent | null) => void) | null = null;

export const openCatalogLightbox = (cars: Car[], startIndex: number) => {
  if (lightboxListener) {
    lightboxListener({ cars, startIndex });
  }
};

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.startsWith("data:image/")) return false;
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|avif|heic)(\?.*)?$/i)) return false;
  return !!(
    lower.match(/\.(mp4|webm|ogg|quicktime|mov|avi|mkv)(\?.*)?$/i) || 
    (lower.includes("video") && !lower.startsWith("data:")) || 
    lower.startsWith("data:video/") || 
    lower.includes("youtube.com") || 
    lower.includes("youtu.be") || 
    (lower.includes("drive.google.com") && (lower.includes("/file/") || lower.includes("id=")))
  );
};

const getYoutubeId = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getGoogleDriveId = (url?: string): string | null => {
  if (!url || !url.includes("drive.google.com")) return null;
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }
  return null;
};

export const CatalogLightbox = ({ lang }: { lang: "en" | "kh" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [carIndex, setCarIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    lightboxListener = (event) => {
      if (event) {
        startTransition(() => {
          setCars(event.cars);
          setCarIndex(event.startIndex);
          setPhotoIndex(0);
          setIsOpen(true);
        });
      } else {
        startTransition(() => setIsOpen(false));
      }
    };
    return () => {
      lightboxListener = null;
    };
  }, []);

  const car = cars[carIndex];

  useEffect(() => {
    if (car) {
      setActiveVariantId(car.id);
    } else {
      setActiveVariantId(null);
    }
  }, [carIndex, car?.id]);

  const activeCar = car?.variants?.find(v => v.id === activeVariantId) || car;
  
  const getCarPhotos = (c: Car | undefined) => {
    if (!c) return [];
    const list: string[] = [];
    if (c.videoUrl) list.push(c.videoUrl);
    if (c.image) list.push(c.image);
    if (c.photos && c.photos.length > 0) {
      c.photos.forEach(p => { if (p && p !== c.image && p !== c.videoUrl) list.push(p); });
    }
    return list;
  };
  
  const allPhotos = getCarPhotos(activeCar);
  const hasPrevCar = carIndex > 0;
  const hasNextCar = carIndex < cars.length - 1;

  const handlePrevCar = () => {
    if (hasPrevCar) {
      startTransition(() => {
        setCarIndex(carIndex - 1);
        setPhotoIndex(0);
      });
    }
  };

  const handleNextCar = () => {
    if (hasNextCar) {
      startTransition(() => {
        setCarIndex(carIndex + 1);
        setPhotoIndex(0);
      });
    }
  };

  const handlePrev = () => {
    if (photoIndex > 0) {
      startTransition(() => setPhotoIndex(photoIndex - 1));
    } else if (hasPrevCar) {
      startTransition(() => {
        setCarIndex(carIndex - 1);
        const prevPhotos = getCarPhotos(cars[carIndex - 1]);
        setPhotoIndex(prevPhotos.length - 1);
      });
    } else if (allPhotos.length > 1) {
      startTransition(() => setPhotoIndex(allPhotos.length - 1));
    }
  };

  const handleNext = () => {
    if (photoIndex < allPhotos.length - 1) {
      startTransition(() => setPhotoIndex(photoIndex + 1));
    } else if (hasNextCar) {
      startTransition(() => {
        setCarIndex(carIndex + 1);
        setPhotoIndex(0);
      });
    } else if (allPhotos.length > 1) {
      startTransition(() => setPhotoIndex(0));
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") startTransition(() => setIsOpen(false));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, photoIndex, carIndex, allPhotos.length, cars.length]);

  if (!isOpen || !car || !activeCar) return null;

  const currentMediaUrl = allPhotos[photoIndex];
  const isVideo = currentMediaUrl === activeCar.videoUrl || isVideoUrl(currentMediaUrl);
  const ytId = getYoutubeId(currentMediaUrl);
  const driveId = getGoogleDriveId(currentMediaUrl);

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex flex-col items-center justify-between p-4 pb-6 bg-black/95 backdrop-blur-xl select-none"
        onClick={() => startTransition(() => setIsOpen(false))}
      >
        <div className="w-full max-w-7xl flex items-center justify-between px-4 pt-2 mb-2 z-10" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col">
            <span className="text-white font-sans font-bold text-lg">{activeCar.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-red-500 font-sans font-bold text-xl">${activeCar.price.toLocaleString()}/mo</span>
              {car.variants && car.variants.length > 1 && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-stone-300 tracking-wider uppercase">
                    {lang === "en" ? "Color:" : "ពណ៌:"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {car.variants.map((v) => {
                      const vColor = getCarColorInfo(v);
                      const isCurrent = v.id === activeVariantId;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVariantId(v.id);
                            setPhotoIndex(0); // Reset carousel to first image when changing color
                          }}
                          className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-125 active:scale-95 cursor-pointer ${
                            isCurrent 
                              ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-black" 
                              : "border border-white/30 hover:border-white/60"
                          }`}
                          style={{ backgroundColor: vColor.hex }}
                          title={vColor.name}
                        >
                          {isCurrent && (
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              vColor.hex === '#FFFFFF' ? 'bg-[#4C0027]' : 'bg-white'
                            }`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-stone-200 ml-1">
                    {getCarColorInfo(activeCar).name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPrevCar && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevCar(); }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-stone-200" />
                <span>{t.prevCar || "Previous"}</span>
              </button>
            )}
            {hasNextCar && (
              <button
                onClick={(e) => { e.stopPropagation(); handleNextCar(); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-md ${
                  photoIndex === allPhotos.length - 1
                    ? "bg-amber-400 text-stone-950 border-amber-300 hover:bg-amber-300 animate-pulse"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                }`}
              >
                <span>{t.nextCar || "Next"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => startTransition(() => setIsOpen(false))}
              className="text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/10 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative w-full max-w-7xl flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCar.id}-${photoIndex}`}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full flex items-center justify-center"
            >
              {ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0`}
                  className="w-full h-full max-w-5xl aspect-video rounded-xl shadow-2xl bg-black"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              ) : driveId ? (
                <iframe
                  src={`https://drive.google.com/file/d/${driveId}/preview`}
                  className="w-full h-full max-w-5xl aspect-video rounded-xl shadow-2xl border-none bg-black"
                  allow="autoplay"
                  allowFullScreen
                />
              ) : isVideo ? (
                <video
                  src={currentMediaUrl}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-black/50"
                  autoPlay
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={currentMediaUrl}
                  alt={`${activeCar.name} view ${photoIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {(allPhotos.length > 1 || hasPrevCar) && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-2 sm:left-4 z-20 w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {(allPhotos.length > 1 || hasNextCar) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-2 sm:right-4 z-20 w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>

        <div className="w-full max-w-5xl overflow-x-auto pb-2 custom-scrollbar flex items-center gap-3 px-4 z-10" onClick={(e) => e.stopPropagation()}>
          {allPhotos.map((photoUrl, idx) => {
            const isThumbVideo = photoUrl === activeCar.videoUrl || isVideoUrl(photoUrl);
            const isThumbActive = idx === photoIndex;
            const thumbYtId = getYoutubeId(photoUrl);
            const thumbDriveId = getGoogleDriveId(photoUrl);

            return (
              <button
                key={idx}
                onClick={() => startTransition(() => setPhotoIndex(idx))}
                className={`relative h-14 sm:h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shadow-md flex items-center justify-center bg-stone-900 ${
                  isThumbActive ? "border-amber-400 scale-110 z-10 opacity-100" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                }`}
                style={{ aspectRatio: "16/9" }}
              >
                {thumbYtId ? (
                  <>
                    <img src={`https://img.youtube.com/vi/${thumbYtId}/hqdefault.jpg`} alt="YouTube Thumbnail" className="w-full h-full object-cover opacity-70" draggable={false} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white opacity-90 fill-white drop-shadow-md" />
                    </div>
                  </>
                ) : (isThumbVideo || thumbDriveId) ? (
                  <>
                    {thumbDriveId ? (
                      <img src={`https://drive.google.com/thumbnail?id=${thumbDriveId}&sz=w400`} alt="Drive Video Thumbnail" className="w-full h-full object-cover opacity-70" draggable={false} />
                    ) : activeCar.thumbnail ? (
                      <img src={activeCar.thumbnail} alt="Video Thumbnail" className="w-full h-full object-cover opacity-70" draggable={false} />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full bg-stone-800 gap-1">
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white opacity-80 fill-white drop-shadow-md" />
                    </div>
                  </>
                ) : (
                  <img src={photoUrl} alt="Thumbnail" className="w-full h-full object-cover" draggable={false} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
