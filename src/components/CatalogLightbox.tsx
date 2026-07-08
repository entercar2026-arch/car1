import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Car } from "../types";
import { translations } from "../translations";

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

export const CatalogLightbox = ({ lang }: { lang: "en" | "kh" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [carIndex, setCarIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

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
  
  const getCarPhotos = (c: Car | undefined) => {
    if (!c) return [];
    const list: string[] = [];
    if (c.image) list.push(c.image);
    if (c.photos && c.photos.length > 0) {
      c.photos.forEach(p => { if (p && p !== c.image) list.push(p); });
    }
    return list;
  };
  
  const allPhotos = getCarPhotos(car);
  const hasPrevCar = carIndex > 0;
  const hasNextCar = carIndex < cars.length - 1;

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

  if (!isOpen || !car) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex flex-col items-center justify-between p-4 pb-6 bg-black/90 backdrop-blur-md select-none"
        onClick={() => startTransition(() => setIsOpen(false))}
      >
        <div className="w-full max-w-5xl flex items-center justify-between px-4 pt-2 mb-2 z-10" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col">
            <span className="text-white font-sans font-bold text-lg">{car.name}</span>
            <span className="text-red-500 font-sans font-bold text-xl">${car.price.toLocaleString()}/mo</span>
          </div>
          <div className="flex items-center gap-2">
            {hasPrevCar && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-stone-200" />
                <span>{t.prevCar || "Previous"}</span>
              </button>
            )}
            {hasNextCar && (
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
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

        <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            <motion.img
              key={`${car.id}-${photoIndex}`}
              src={allPhotos[photoIndex]}
              alt={`${car.name} view ${photoIndex + 1}`}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              draggable={false}
            />
          </AnimatePresence>

          {(allPhotos.length > 1 || hasPrevCar) && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-2 sm:left-4 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {(allPhotos.length > 1 || hasNextCar) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-2 sm:right-4 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="w-full max-w-3xl overflow-x-auto pb-2 custom-scrollbar flex items-center gap-3 px-4 z-10" onClick={(e) => e.stopPropagation()}>
          {allPhotos.map((photoUrl, idx) => (
            <button
              key={idx}
              onClick={() => startTransition(() => setPhotoIndex(idx))}
              className={`relative h-16 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shadow-md ${
                idx === photoIndex ? "border-amber-400 scale-110 z-10 opacity-100" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
              }`}
            >
              <img src={photoUrl} alt="Thumbnail" className="h-full w-auto object-cover" draggable={false} />
            </button>
          ))}
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
