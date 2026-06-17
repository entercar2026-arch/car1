import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from "react";
import { Car, ViewMode, CatalogFilters, Booking, Review } from "./types";
import { INITIAL_CARS } from "./data";
import { getCarImageSrc, getFallbackCarThumbnail } from "./utils/carImage";
import { BrandLogo } from "./components/BrandLogo";
import { CarCard } from "./components/CarCard";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { KhmerContractPDFModal } from "./components/KhmerContractPDFModal";
import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";
import { db } from "./lib/db";
import { supabase } from "./lib/supabase";
import {
  Search,
  MapPin,
  Lock,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  BadgePercent,
  CheckCircle2,
  PhoneCall,
  Menu,
  X,
  Plus,
  ArrowDown,
  HelpCircle,
  CarFront,
  Users,
  Settings2,
  Fuel,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building,
  Camera,
  FileText,
  Send,
  MessageCircle,
  Heart,
  Globe,
  Printer,
  FileSignature,
  Images,
  Eye,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Download,
  FileDown,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { PrintContractDoc } from "./components/PrintContractDoc";
import { QuotationDocumentContent } from "./components/QuotationDocumentContent";

const SECURE_TOKEN_KEY = "enter_admin_session_token";

class SearchService {
  private static value = "";
  private static listeners = new Set<(val: string) => void>();

  static get() {
    return this.value;
  }

  static set(val: string) {
    if (val !== this.value) {
      this.value = val;
      this.listeners.forEach(l => l(val));
    }
  }

  static subscribe(listener: (val: string) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

function useSearchValue() {
  const [val, setVal] = useState(() => SearchService.get());
  useEffect(() => {
    return SearchService.subscribe((newVal) => {
      setVal(newVal);
    });
  }, []);
  return [val, SearchService.set.bind(SearchService)] as const;
}

const DesktopSearchBar = React.memo(({
  t,
  cars,
  setFilters,
  scrollToAnchor,
}: {
  t: any;
  cars: Car[];
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  scrollToAnchor: (id: string) => void;
}) => {
  const [searchText, setSearchText] = useSearchValue();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchSuggestions = useMemo(() => {
    if (!searchText) return cars.slice(0, 4);
    return cars
      .filter((c) => c.name.toLowerCase().includes(searchText.toLowerCase()))
      .slice(0, 4);
  }, [cars, searchText]);

  return (
    <div className="relative w-36 focus-within:w-72 xl:focus-within:w-80 ml-4 group transition-all duration-300 ease-in-out">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-stone-400 group-focus-within:text-[#4C0027] transition-colors" />
      </div>
      <input
        id="global-input-search-desktop"
        type="text"
        placeholder={t.searchBox}
        value={searchText}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            scrollToAnchor("category-filter-container");
          }
        }}
        className="w-full pl-[38px] pr-10 py-2 bg-stone-50 border border-stone-200 rounded-full text-stone-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-2 focus:ring-[#4C0027]/20 transition-all font-sans font-medium placeholder:text-stone-400"
      />
      {searchText && (
        <button
          type="button"
          onClick={() => setSearchText("")}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-[#4C0027] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <AnimatePresence>
        {isSearchFocused && searchSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 py-1"
          >
            {searchSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFilters((prev: any) => ({ ...prev, searchTerm: suggestion.name }));
                  scrollToAnchor("category-filter-container");
                  setIsSearchFocused(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors flex items-center justify-between group/item"
              >
                <span className="text-sm font-semibold text-stone-800 group-hover/item:text-[#4C0027]">
                  {suggestion.name}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  ${suggestion.price}/mo
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const MobileSearchBar = React.memo(({
  t,
  cars,
  setFilters,
  scrollToAnchor,
  setIsMobileMenuOpen,
}: {
  t: any;
  cars: Car[];
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  scrollToAnchor: (id: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}) => {
  const [searchText, setSearchText] = useSearchValue();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchSuggestions = useMemo(() => {
    if (!searchText) return cars.slice(0, 4);
    return cars
      .filter((c) => c.name.toLowerCase().includes(searchText.toLowerCase()))
      .slice(0, 4);
  }, [cars, searchText]);

  return (
    <div className="relative w-full mb-2 group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-stone-400 group-focus-within:text-[#4C0027] transition-colors" />
      </div>
      <input
        id="global-input-search-mobile"
        type="text"
        placeholder={t.searchBox}
        value={searchText}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            scrollToAnchor("category-filter-container");
            setIsMobileMenuOpen(false);
          }
        }}
        className="w-full pl-[38px] pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium placeholder:text-stone-400"
      />
      {searchText && (
        <button
          type="button"
          onClick={() => setSearchText("")}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-[#4C0027] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <AnimatePresence>
        {isSearchFocused && searchSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 py-1"
          >
            {searchSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFilters((prev: any) => ({ ...prev, searchTerm: suggestion.name }));
                  scrollToAnchor("category-filter-container");
                  setIsSearchFocused(false);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-stone-50 transition-colors flex items-center justify-between group/item"
              >
                <span className="text-sm font-semibold text-stone-800 group-hover/item:text-[#4C0027]">
                  {suggestion.name}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  ${suggestion.price}/mo
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const FilterSectionSearchBar = React.memo(({
  t,
}: {
  t: any;
}) => {
  const [searchText, setSearchText] = useSearchValue();

  return (
    <div className="w-full flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
      <label className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono pl-1">
        {t.searchModelKeywords}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          id="filter-input-search"
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium placeholder:text-stone-400 shadow-sm"
        />
        {searchText && (
          <button
            type="button"
            onClick={() => setSearchText("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-[#4C0027] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
});

const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

import { translations } from "./translations";

// Verification helper checking token integrity and session time window
const isSessionTokenValid = (): boolean => {
  try {
    const token = safeStorage.getItem(SECURE_TOKEN_KEY);
    if (!token) return false;
    const decoded = atob(token);
    const session = JSON.parse(decoded);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (
      session &&
      session.root_auth === true &&
      session.user === "chan" &&
      session.role === "admin" &&
      now - session.verified_at < oneDay
    ) {
      return true;
    }
  } catch (e) {
    // Decrypting or validation failed
  }
  return false;
};

// Generation helper for state metadata
const generateSessionToken = (): string => {
  const session = {
    root_auth: true,
    user: "chan",
    role: "admin",
    verified_at: Date.now(),
  };
  return btoa(JSON.stringify(session));
};



const PrintPreviewOverlay = React.memo(({
  isOpen,
  onClose,
  printedCars,
  lang,
  t,
  setLightboxCar,
  setLightboxIndex,
}: {
  isOpen: boolean;
  onClose: () => void;
  printedCars: Car[];
  lang: string;
  t: any;
  setLightboxCar: (car: Car) => void;
  setLightboxIndex: (idx: number) => void;
}) => {
  const [zoom, setZoom] = useState(85);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const quotationRef = useRef<HTMLDivElement>(null);

  const includeContract = false;
  const showWatermark = false;

  if (!isOpen) return null;

  const handlePrint = () => {
    document.body.setAttribute("data-print-mode", "quotation");
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!quotationRef.current) return;
    setIsExportingPDF(true);

    const parent = quotationRef.current.parentElement;
    const originalTransform = parent ? parent.style.transform : "";

    try {
      // Revert any scale temporarily to ensure html2canvas captures full-resolution without cropping
      if (parent) {
        parent.style.transform = "none";
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(quotationRef.current, {
        scale: 2, // High resolution capture
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: true,
        imageTimeout: 10000,
      });

      // A4 dimensions: 210mm x 297mm
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      // Check for multi-page overflow
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      pdf.save(`ENTER_Car_Rental_Quotation_${dateStr}.pdf`);
    } catch (err) {
      console.error("Failed to export quotation as PDF:", err);
      alert("Failed to export as PDF. Please print via the Print PDF button as an alternative.");
    } finally {
      if (parent) {
        parent.style.transform = originalTransform;
      }
      setIsExportingPDF(false);
    }
  };

  const handleExportPNG = async () => {
    if (!quotationRef.current) return;
    setIsExporting(true);

    const parent = quotationRef.current.parentElement;
    const originalTransform = parent ? parent.style.transform : "";

    try {
      // Revert any scale temporarily to ensure html2canvas captures full-resolution without cropping
      if (parent) {
        parent.style.transform = "none";
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(quotationRef.current, {
        scale: 2, // High resolution PNG capture
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: true,
        imageTimeout: 10000,
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `ENTER_Car_Rental_Quotation_${dateStr}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("Failed to export quotation as image:", err);
      alert("Failed to export as PNG. Please print via the Print PDF button as an alternative.");
    } finally {
      if (parent) {
        parent.style.transform = originalTransform;
      }
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-stone-950/95 backdrop-blur-md select-none no-print font-sans">
      {/* Top Control Bar / Toolbar */}
      <div className="h-16 border-b border-stone-850 bg-stone-900/60 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        {/* Left: Back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-stone-300 hover:text-white text-xs sm:text-sm font-bold bg-stone-800 hover:bg-stone-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-stone-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">Document Drawer</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">PDF Quotation Preview</span>
          </div>
        </div>

        {/* Center: Interactive Zoom and Page Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-stone-950/60 p-1.5 rounded-lg border border-stone-800">
            <button
              disabled={zoom <= 50}
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer border-none bg-transparent"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-amber-400 min-w-[42px] text-center select-none">
              {zoom}%
            </span>
            <button
              disabled={zoom >= 130}
              onClick={() => setZoom(Math.min(130, zoom + 10))}
              className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer border-none bg-transparent"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-800 disabled:opacity-50 text-stone-100 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg hover:shadow-stone-750/10 uppercase tracking-widest transition-all cursor-pointer active:scale-95 border border-stone-700/50"
          >
            {isExportingPDF ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-stone-100 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-rose-400" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Export PNG Button */}
          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-800 disabled:opacity-50 text-stone-100 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg hover:shadow-stone-750/10 uppercase tracking-widest transition-all cursor-pointer active:scale-95 border border-stone-700/50"
          >
            {isExporting ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-stone-100 border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export PNG</span>
              </>
            )}
          </button>

          {/* Main Action Trigger */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg hover:shadow-amber-400/10 uppercase tracking-widest transition-all cursor-pointer active:scale-95 border border-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Outer scrolling canvas area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center bg-stone-900/40">
        {/* Realistic PDF View Container which acts as a desktop printer sheet */}
        <div
          className="w-full max-w-4xl transition-all duration-200 ease-out flex flex-col gap-10 items-center mt-4"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          {/* PAGE 1: THE ACTIVE QUOTE */}
          <div ref={quotationRef} className="bg-white text-stone-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-stone-200 rounded-sm w-[210mm] max-w-full p-12 relative flex flex-col justify-between min-h-[297mm]">
            {/* Paper Watermark Ornament for Premium Presentation */}
            <div className="absolute right-8 top-8 opacity-[0.03] select-none pointer-events-none">
              <span className="font-black text-6xl text-stone-950">ENTER</span>
            </div>

            <div>
              <QuotationDocumentContent
                printedCars={printedCars}
                lang={lang}
                t={t}
                setLightboxCar={setLightboxCar}
                setLightboxIndex={setLightboxIndex}
              />
            </div>

            {/* Real-time Document Status Bar */}
            <div className="w-full mt-10 pt-4 border-t border-stone-100 flex items-center justify-between text-[9px] text-stone-400 font-mono tracking-wider">
              <span>Ref: QT-2787-8ef4-31fc</span>
              <span>Page 1 of 1</span>
              <span>Printed via ENTER VIP Client Services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const ContractRequirementSection = React.memo(({ t, cars, lang, likedCars = [] }: { t: any, cars: Car[], lang: string, likedCars?: string[] }) => {
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name-asc" | "type-asc" | "type-desc" | "fuel-asc" | "fuel-desc">("default");
  const [selectedCarIds, setSelectedCarIds] = useState<Record<string, boolean>>({});
  const [includeContract, setIncludeContract] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState("");

  // High-Resolution Lightbox Gallery State
  const [lightboxCar, setLightboxCar] = useState<Car | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const getCarPhotos = (car: Car) => {
    const list: string[] = [];
    if (car.thumbnail) list.push(car.thumbnail);
    if (car.image && car.image !== car.thumbnail) list.push(car.image);
    if (car.photos && car.photos.length > 0) {
      car.photos.forEach(p => {
        if (!list.includes(p)) list.push(p);
      });
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800");
    }
    return list;
  };

  useEffect(() => {
    if (!lightboxCar) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const photos = getCarPhotos(lightboxCar);
      if (e.key === "ArrowLeft" && photos.length > 1) {
        setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
      } else if (e.key === "ArrowRight" && photos.length > 1) {
        setLightboxIndex((prev) => (prev + 1) % photos.length);
      } else if (e.key === "Escape") {
        setLightboxCar(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxCar, lightboxIndex]);

  const sortedCars = useMemo(() => {
    const list = [...cars];
    if (sortBy === "price-asc") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === "name-asc") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "type-asc") {
      return list.sort((a, b) => a.category.localeCompare(b.category));
    }
    if (sortBy === "type-desc") {
      return list.sort((a, b) => b.category.localeCompare(a.category));
    }
    if (sortBy === "fuel-asc") {
      return list.sort((a, b) => (a.fuelType || "Gasoline").localeCompare(b.fuelType || "Gasoline"));
    }
    if (sortBy === "fuel-desc") {
      return list.sort((a, b) => (b.fuelType || "Gasoline").localeCompare(a.fuelType || "Gasoline"));
    }
    return list;
  }, [cars, sortBy]);

  const displayedCars = useMemo(() => {
    if (!quoteSearchQuery) return sortedCars;
    const query = quoteSearchQuery.toLowerCase().trim();
    return sortedCars.filter(car => 
      car.name.toLowerCase().includes(query) || 
      car.category.toLowerCase().includes(query) ||
      (car.fuelType && car.fuelType.toLowerCase().includes(query))
    );
  }, [sortedCars, quoteSearchQuery]);

  // Reset or initialize selections when cars change or when the quotation modal opens
  useEffect(() => {
    if (cars && cars.length > 0) {
      const initial: Record<string, boolean> = {};
      const hasLikedCars = cars.some(car => likedCars?.includes(car.id));
      
      cars.forEach((car) => {
        if (hasLikedCars) {
          // Default select ONLY the wishlist/liked cars!
          initial[car.id] = likedCars?.includes(car.id) || false;
        } else {
          // If no wishlist cars, default select all
          initial[car.id] = true;
        }
      });
      setSelectedCarIds(initial);
    }
  }, [cars, likedCars, isQuotationModalOpen]);

  const toggleSelectCar = (id: string) => {
    setSelectedCarIds((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const toggleSelectAll = () => {
    const targetCars = quoteSearchQuery ? displayedCars : cars;
    const allSelected = targetCars.every((car) => selectedCarIds[car.id] !== false);
    const newState: Record<string, boolean> = { ...selectedCarIds };
    targetCars.forEach((car) => {
      newState[car.id] = !allSelected;
    });
    setSelectedCarIds(newState);
  };

  const printedCars = useMemo(() => {
    return sortedCars.filter((car) => selectedCarIds[car.id] !== false);
  }, [sortedCars, selectedCarIds]);

  return (
    <>
      <div className="max-w-5xl mx-auto mt-8 mb-8 animate-fade-in no-print">
        <div className="bg-[#4C0027] text-white rounded-3xl p-6 sm:p-8 border border-[#4C0027]/20 shadow-lg relative overflow-hidden flex flex-col justify-center items-center text-center select-none">
          {/* Subtle background abstract decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <span 
            onClick={() => setIsContractModalOpen(true)}
            className="text-[10px] sm:text-xs font-bold text-stone-300 uppercase tracking-[0.2em] font-mono mb-2 drop-shadow-xs cursor-pointer hover:text-amber-400 select-none flex items-center gap-1.5 transition-colors duration-200"
          >
            {t.contractRequirement}
          </span>

          <h2 className="text-3xl sm:text-4.5xl font-black text-amber-400 tracking-wider uppercase mb-3 drop-shadow-md">
            {t.sixMonthTerm}
          </h2>

          <p className="text-xs sm:text-sm font-mono text-stone-200 tracking-wider">
            {t.termDetail}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4 relative z-10 w-full px-4">
            <button
              type="button"
              onClick={() => setIsContractModalOpen(true)}
              className="px-6 py-2.5 bg-amber-400 text-stone-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              {t.viewContract}
            </button>
            <button
              type="button"
              onClick={() => setIsQuotationModalOpen(true)}
              className="px-6 py-2.5 bg-stone-800 border border-amber-400/50 text-amber-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              {t.viewQuotation || "View Quotation"}
            </button>
          </div>
        </div>

        {/* Contract Modal */}
        <AnimatePresence>
          {isContractModalOpen && (
            <KhmerContractPDFModal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} lang={lang} />
          )}
        </AnimatePresence>

        {/* Quotation Modal */}
        <AnimatePresence>
          {isQuotationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 min-w-[320px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsQuotationModalOpen(false)}
                className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-100 font-sans z-10 max-h-[85vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-200/60 shrink-0">
                  <h3 className="font-bold text-stone-900 flex items-center gap-2 text-xl tracking-wide uppercase">
                    <FileText className="w-6 h-6 text-[#4C0027]" />
                    {t.viewQuotation || "Quotation"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsQuotationModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Search & Sorting Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between items-stretch gap-4 mb-4 pb-3 border-b border-stone-150 shrink-0 select-none">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                    {/* Quotation Search Bar */}
                    <div className="relative flex-1 max-w-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-stone-400" />
                      </div>
                      <input
                        type="text"
                        placeholder={lang === "kh" ? "ស្វែងរករថយន្ត..." : lang === "zh" ? "搜索车型..." : "Search vehicles..."}
                        value={quoteSearchQuery}
                        onChange={(e) => setQuoteSearchQuery(e.target.value)}
                        className="block w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-xl focus:ring-1 focus:ring-[#4C0027] focus:border-[#4C0027] transition-all outline-hidden shadow-2xs placeholder-stone-400"
                      />
                      {quoteSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setQuoteSearchQuery("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <span className="text-xs text-stone-500 font-medium font-sans">
                      {printedCars.length} / {sortedCars.length} {t.resultsFound || "vehicles selected"}
                      {quoteSearchQuery && ` (${displayedCars.length} matching search)`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <label htmlFor="quote-sort" className="text-xs font-bold text-stone-600 font-sans uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#4C0027]" />
                      {(t.sortByLabel || "Sort by")}:
                    </label>
                    <select
                      id="quote-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold rounded-lg focus:ring-1 focus:ring-[#4C0027] focus:border-[#4C0027] p-1.5 pr-8 transition-colors outline-hidden cursor-pointer"
                    >
                      <option value="default">{t.defaultOrder || "Default Order"}</option>
                      <option value="type-asc">
                        {(t.category || "Body Type")}: {lang === "kh" ? "ក-អ" : lang === "zh" ? "A-Z" : "A-Z"}
                      </option>
                      <option value="type-desc">
                        {(t.category || "Body Type")}: {lang === "kh" ? "អ-ក" : lang === "zh" ? "Z-A" : "Z-A"}
                      </option>
                      <option value="fuel-asc">
                        {(t.fuelType || "Fuel Type")}: {lang === "kh" ? "ក-អ" : lang === "zh" ? "A-Z" : "A-Z"}
                      </option>
                      <option value="fuel-desc">
                        {(t.fuelType || "Fuel Type")}: {lang === "kh" ? "អ-ក" : lang === "zh" ? "Z-A" : "Z-A"}
                      </option>
                      <option value="price-asc">
                        {lang === "kh" ? "តម្លៃជួល: ពីទាបទៅខ្ពស់" : lang === "zh" ? "租金: 低到高" : "Monthly Rent: Low to High"}
                      </option>
                      <option value="price-desc">
                        {lang === "kh" ? "តម្លៃជួល: ពីខ្ពស់ទៅទាប" : lang === "zh" ? "租金: 高到低" : "Monthly Rent: High to Low"}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 -mr-2">
                  <div className="bg-white rounded-xl border border-stone-200/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left whitespace-nowrap min-w-[600px]">
                        <thead className="bg-[#4C0027] text-amber-400">
                          <tr>
                            <th className="px-4 py-4 font-bold tracking-wider text-xs uppercase w-12 text-center">
                              <input
                                type="checkbox"
                                checked={displayedCars.length > 0 && displayedCars.every((car) => selectedCarIds[car.id] !== false)}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 text-[#4C0527] bg-white border-stone-300 rounded focus:ring-[#4C0027] cursor-pointer"
                              />
                            </th>
                            <th className="px-6 py-4 font-bold tracking-wider text-xs uppercase">Vehicle Model</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-xs text-center uppercase">Fuel Type</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-xs text-center uppercase">Monthly Rent</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-xs text-center uppercase">Deposit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {displayedCars.map((car: Car) => (
                            <tr key={car.id} className={`hover:bg-stone-50/80 transition-colors group ${selectedCarIds[car.id] === false ? "opacity-50" : ""}`}>
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedCarIds[car.id] !== false}
                                  onChange={() => toggleSelectCar(car.id)}
                                  className="w-4 h-4 text-[#4C0027] bg-white border-stone-300 rounded focus:ring-[#4C0027] cursor-pointer"
                                  id={`quote-checkbox-${car.id}`}
                                />
                              </td>
                              <td className="px-6 py-4 font-semibold text-stone-800">
                                <div className="flex items-center gap-3.5">
                                  {/* Small crisp car thumbnail */}
                                  <div 
                                    onClick={() => {
                                      setLightboxCar(car);
                                      setLightboxIndex(0);
                                    }}
                                    className="w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 shrink-0 shadow-xs group-hover:border-amber-400 group-hover:scale-105 active:scale-95 cursor-zoom-in transition-all relative"
                                    title="Click to zoom gallery lightbox"
                                  >
                                    <img
                                      src={getCarImageSrc(car)}
                                      alt={car.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = getFallbackCarThumbnail(car.name, car.category);
                                      }}
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-stone-900 group-hover:text-[#4C0027] transition-colors">{car.name}</span>
                                    <span className="text-[10px] text-stone-400 uppercase tracking-wider hidden sm:block">{car.name.split(" ")[0]}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 text-stone-605 border border-stone-150 tracking-wide uppercase">
                                  {car.fuelType || "Gasoline"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center text-stone-900 font-bold font-mono">
                                ${car.price.toLocaleString()}/mo
                              </td>
                              <td className="px-6 py-4 text-center text-stone-600 font-medium font-mono border-l border-stone-100 bg-stone-50 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                                ${(car.price * 1).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-stone-200/60 bg-stone-50 rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 shadow-inner border border-stone-200">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="flex flex-col gap-1 items-center sm:items-start shrink-0">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] font-mono">Standard Terms</span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                        <span className="text-xs font-semibold text-stone-700">Minimum 6 mos</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs font-semibold text-stone-700">1 month deposit</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPrintPreviewOpen(true);
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-extrabold rounded-xl shadow-md uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-amber-500/20"
                    >
                      <Eye className="w-4 h-4 shrink-0 text-stone-950" />
                      Preview & Print PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsQuotationModalOpen(false)}
                      className="w-full sm:w-auto px-8 py-3 bg-[#4C0027] text-white text-xs font-bold rounded-xl shadow-xs uppercase tracking-wider transition-all hover:bg-[#5E0030] active:scale-95 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Print Preview Overlay */}
        <PrintPreviewOverlay
          isOpen={isPrintPreviewOpen}
          onClose={() => setIsPrintPreviewOpen(false)}
          printedCars={printedCars}
          lang={lang}
          t={t}
          setLightboxCar={setLightboxCar}
          setLightboxIndex={setLightboxIndex}
        />

        {/* High-Resolution Gallery Lightbox */}
        <AnimatePresence>
          {lightboxCar && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/90 backdrop-blur-md select-none no-print">
              {/* Close background trigger */}
              <div className="absolute inset-0 cursor-zoom-out" onClick={() => setLightboxCar(null)} />
              
              {/* Main content container */}
              <div className="relative z-10 max-w-5xl w-full px-4 flex flex-col items-center">
                
                {/* Header text with vehicle details */}
                <div className="w-full flex items-center justify-between text-white mb-4">
                  <div className="flex flex-col">
                    <h4 className="text-xl font-extrabold tracking-tight font-sans text-amber-400">
                      {lightboxCar.name}
                    </h4>
                    <p className="text-xs font-mono text-stone-300 uppercase tracking-wider">
                      {lightboxCar.category} • ${lightboxCar.price.toLocaleString()}/mo • {getCarPhotos(lightboxCar).length} Photos Available
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLightboxCar(null)}
                    className="p-2 bg-stone-850 hover:bg-stone-800 text-white rounded-full transition-colors cursor-pointer border border-stone-700 flex items-center justify-center shadow-md active:scale-95"
                    title="Close Gallery (Esc)"
                  >
                    <X className="w-6 h-6 text-stone-200" />
                  </button>
                </div>

                {/* Main slide display */}
                <div className="relative w-full aspect-video md:aspect-[16/10] bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 flex items-center justify-center group shadow-2xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${lightboxCar.id}-${lightboxIndex}`}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                      src={getCarPhotos(lightboxCar)[lightboxIndex]}
                      alt={`${lightboxCar.name} High Res Photo`}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </AnimatePresence>

                  {/* Arrow controls if there are multiple photos */}
                  {getCarPhotos(lightboxCar).length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setLightboxIndex((prev) => (prev - 1 + getCarPhotos(lightboxCar).length) % getCarPhotos(lightboxCar).length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-stone-900/60 hover:bg-stone-900/80 border border-stone-700 backdrop-blur-xs text-white opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
                        title="Previous Photo (Left/Right Arrows)"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setLightboxIndex((prev) => (prev + 1) % getCarPhotos(lightboxCar).length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-stone-900/60 hover:bg-stone-900/80 border border-stone-700 backdrop-blur-xs text-white opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
                        title="Next Photo (Left/Right Arrows)"
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                    </>
                  )}
                </div>

                {/* Carousel indicators dots / thumbnails */}
                {getCarPhotos(lightboxCar).length > 1 && (
                  <div className="flex items-center gap-2 mt-5 flex-wrap justify-center max-w-full">
                    {getCarPhotos(lightboxCar).map((photoUrl, idx) => {
                      const isActive = idx === lightboxIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightboxIndex(idx)}
                          className={`w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden border-2 transition-all relative cursor-pointer ${isActive ? "border-amber-400 scale-105" : "border-stone-700 hover:border-stone-500 opacity-60 hover:opacity-100"}`}
                        >
                          <img
                            src={photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Printable Quotation Document (Beautifully styled & optimized exclusively for Print / Save to PDF) */}
      <div id="print-section" className="print-only-layout p-12 bg-white text-stone-900">
        <QuotationDocumentContent
          printedCars={printedCars}
          lang={lang}
          t={t}
          setLightboxCar={setLightboxCar}
          setLightboxIndex={setLightboxIndex}
        />
      </div>
    </>
  );
});

export default function App() {
  // Cars Fleet State
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = safeStorage.getItem("enter_cars");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved cars", e);
      }
    }
    return INITIAL_CARS;
  });

  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (supabase) {
      db.cars.getAll().then(async (data) => {
        if (data) {
          if (data.length === 0) {
            // Seed initial data to Supabase
            console.log("Database is empty. Seeding initial cars...");
            for (const car of INITIAL_CARS) {
              try {
                await db.cars.create(car);
              } catch (e) {
                console.error("Failed to seed car", e);
              }
            }
            // Fetch again after seeding
            const refreshedData = await db.cars.getAll();
            if (refreshedData) setCars(refreshedData);
          } else {
            setCars(data);
          }
        }
        setIsLoadingData(false);
      }).catch(err => {
        console.error("Failed to fetch initial cars from Supabase", err);
        setIsLoadingData(false);
      });
    } else {
      // Simulate loading if no db
      setTimeout(() => setIsLoadingData(false), 800);
    }
  }, []);

  // Liked cars state
  const [likedCars, setLikedCars] = useState<string[]>(() => {
    const saved = safeStorage.getItem("enter_liked_cars");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved liked cars", e);
      }
    }
    return [];
  });

  // Track if clear favorites confirmation modal is open
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Track session authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => {
      return isSessionTokenValid();
    },
  );

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Back to Top State
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Support Floating Button State
  const [isSupportExpanded, setIsSupportExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past roughly the hero section (e.g., 600px)
      if (window.scrollY > 600) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.removeAttribute("data-print-mode");
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  // Current Screen / Node View
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const isAuth = isSessionTokenValid();
    return isAuth ? "admin" : "customer";
  });

  // Language state
  const [lang, setLang] = useState<"en" | "kh" | "zh">(() => {
    const saved = localStorage.getItem("preferredLanguage");
    if (saved === "en" || saved === "kh" || saved === "zh") return saved as "en" | "kh" | "zh";
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("preferredLanguage", lang);
  }, [lang]);

  const t = translations[lang];

  // Filter criteria state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFiltersRaw] = useState<CatalogFilters>(() => {
    const params = new URLSearchParams(window.location.search);
    const initialModel = params.get('model') || "";
    return {
      searchTerm: initialModel,
      category: "All",
      maxPrice: 5000,
      transmission: "All",
      fuelType: "All",
      seats: "All",
      brand: "All",
      likedOnly: false,
    };
  });

  const setFilters = React.useCallback((action: any) => {
    React.startTransition(() => {
      setFiltersRaw(action);
    });
  }, []);

  // Synchronizing filters.searchTerm with SearchService on external updates
  useEffect(() => {
    if (filters.searchTerm !== SearchService.get()) {
      SearchService.set(filters.searchTerm);
    }
  }, [filters.searchTerm]);

  // Debounced subscription to SearchService to apply changes to state without input lag
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const unsubscribe = SearchService.subscribe((val) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setFilters((prev) => {
          if (prev.searchTerm === val) return prev;
          return { ...prev, searchTerm: val };
        });
      }, 150);
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Sorting state
  const [sortByRaw, setSortByRaw] = useState<"default" | "price-asc" | "price-desc" | "alphabetical">("default");
  const sortBy = sortByRaw;
  const setSortBy = React.useCallback((val: "default" | "price-asc" | "price-desc" | "alphabetical") => {
    React.startTransition(() => {
      setSortByRaw(val);
    });
  }, []);

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Booking details toast state
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  // Persistence containers for bookings and reviews
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = safeStorage.getItem("enter_bookings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved bookings", e);
      }
    }
    return [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = safeStorage.getItem("enter_reviews");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved reviews", e);
      }
    }
    // High-quality sample initial reviews
    return [
      {
        id: "rev-init-1",
        carId: "car-1",
        customerName: "Alistair Sterling",
        rating: 5,
        comment:
          "Outstanding pickup service at the airport hub. The cabin was clean and smelled of fine leather.",
        createdAt: "2026-06-02",
        isApproved: true,
      },
      {
        id: "rev-init-2",
        carId: "car-2",
        customerName: "Charlotte Vance",
        rating: 5,
        comment:
          "Pure luxury. Cruising on zero emissions in the Mach-E was the highlight of our weekend trip.",
        createdAt: "2026-06-03",
        isApproved: true,
      },
      {
        id: "rev-init-3",
        carId: "car-3",
        customerName: "Nathaniel West",
        rating: 5,
        comment:
          "Absolute monster of a machine. Power delivery is linear, gearbox response is lightning fast.",
        createdAt: "2026-06-03",
        isApproved: false, // awaits moderator approval
      },
    ];
  });

  // Synchronize state changes directly to Local Storage
  useEffect(() => {
    safeStorage.setItem("enter_cars", JSON.stringify(cars));
  }, [cars]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      safeStorage.setItem("enter_admin_auth", "true");
      safeStorage.setItem(SECURE_TOKEN_KEY, generateSessionToken());
    } else {
      safeStorage.removeItem("enter_admin_auth");
      safeStorage.removeItem(SECURE_TOKEN_KEY);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    safeStorage.setItem("enter_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    safeStorage.setItem("enter_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    safeStorage.setItem("enter_liked_cars", JSON.stringify(likedCars));
  }, [likedCars]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "/") {
        if (!isInput) {
          e.preventDefault();
          const desktopSearch = document.getElementById("filter-input-search");
          const mobileSearch = document.getElementById("global-input-search-mobile");

          if (window.innerWidth < 1024 && mobileSearch) {
            setIsMobileMenuOpen(true);
            setTimeout(() => {
              document.getElementById("global-input-search-mobile")?.focus();
            }, 100);
          } else if (desktopSearch) {
            desktopSearch.focus();
            const element = document.getElementById("search-filters-container");
            if (element) {
              const y = element.getBoundingClientRect().top + window.scrollY - 100;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }
        }
      } else if (e.key === "Escape") {
        if (isInput) {
          target.blur();
        }
        setIsMobileMenuOpen(false);
        setShowClearConfirm(false);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Handle addition of a new vehicle catalog item
  const handleAddCar = async (newCarFields: Omit<Car, "id">) => {
    const freshCar: Car = {
      ...newCarFields,
      id: `car-${Date.now()}`,
    };
    setCars((prev) => [freshCar, ...prev]);

    if (supabase) {
      try {
        const dbCar = await db.cars.create(newCarFields);
        if (dbCar) {
          setCars((prev) => prev.map(c => c.id === freshCar.id ? dbCar : c));
        }
      } catch (err: any) {
        console.error("Failed to add car to Supabase", err);
        alert(`Failed to sync with Supabase: ${err.message || "Unknown error"}. Please make sure your database schema is up-to-date.`);
      }
    }
  };

  // Handle updating an existing vehicle listing
  const handleUpdateCar = async (updatedCar: Car) => {
    setCars((prev) =>
      prev.map((car) => (car.id === updatedCar.id ? updatedCar : car)),
    );
    if (supabase) {
      try {
        await db.cars.update(updatedCar.id, updatedCar);
      } catch (err: any) {
        console.error("Failed to update car in Supabase", err);
        alert(`Failed to sync with Supabase: ${err.message || "Unknown error"}`);
      }
    }
  };

  // Handle removing a vehicle catalog item
  const handleDeleteCar = async (carId: string) => {
    setCars((prev) => prev.filter((car) => car.id !== carId));
    if (supabase) {
      try {
        await db.cars.delete(carId);
      } catch (err: any) {
        console.error("Failed to delete car from Supabase", err);
        alert(`Failed to delete from Supabase: ${err.message || "Unknown error"}`);
      }
    }
  };

  // Handle addition of reviews with moderation pending state
  const handleAddReview = React.useCallback((
    carId: string,
    rating: number,
    comment: string,
    customerName: string,
  ) => {
    const freshReview: Review = {
      id: `rev-${Date.now()}`,
      carId,
      customerName,
      rating,
      comment,
      createdAt: new Date().toISOString().split("T")[0],
      isApproved: false, // Awaits admin approval!
    };
    setReviews((prev) => [freshReview, ...prev]);

    // Quick advisory toast
    setBookingToast(
      `Review saved! An administrator will review your comment for approval.`,
    );
    setTimeout(() => setBookingToast(null), 4000);
  }, []);

  // Handle booking reservations from customer catalog
  const handleConfirmBook = React.useCallback((
    carId: string,
    bookingFields: {
      customerName: string;
      pickupDate: string;
      pickupTime: string;
      location: string;
      contactMethod: "whatsapp" | "telegram" | "none";
      message: string;
      totalCost: number;
    },
  ): Booking => {
    const targetCar = cars.find((c) => c.id === carId);

    const freshBooking: Booking = {
      id: `ENTR-${Math.floor(1000 + Math.random() * 9000)}`,
      carId,
      carName: targetCar ? targetCar.name : "Exclusive Enterprise Model",
      carImage: targetCar ? targetCar.image : "",
      customerName: bookingFields.customerName,
      pickupDate: bookingFields.pickupDate,
      pickupTime: bookingFields.pickupTime,
      location: bookingFields.location,
      contactMethod: bookingFields.contactMethod,
      message: bookingFields.message,
      totalCost: bookingFields.totalCost,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      setBookings((prev) => [freshBooking, ...prev]);
    }, 0);
    return freshBooking;
  }, [cars]);

  // Admin Bookings & Reviews controls
  const handleUpdateBookingStatus = (
    bookingId: string,
    status: Booking["status"],
  ) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
    );
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleApproveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isApproved: true } : r)),
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  // Handle login completion
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setViewMode("admin");
  };

  // Logout routine
  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setViewMode("customer");
  };

  // Safe reset routine for filtering
  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      category: "All",
      maxPrice: 5000,
      transmission: "All",
      fuelType: "All",
      seats: "All",
      brand: "All",
      likedOnly: false,
    });
  };

  const handleToggleLike = React.useCallback((carId: string) => {
    setLikedCars((prev) => {
      if (prev.includes(carId)) {
        const newLikes = prev.filter((id) => id !== carId);
        if (newLikes.length === 0 && filters.likedOnly) {
          setFilters(f => ({ ...f, likedOnly: false, category: "All" }));
        }
        return newLikes;
      }
      const car = cars.find(c => c.id === carId);
      if (car) {
        setBookingToast(`${car.name} added to your Wishlist!`);
        setTimeout(() => setBookingToast(null), 3000);
      }
      return [...prev, carId];
    });
  }, [filters.likedOnly, cars]);

  const handleClearLikes = () => {
    setShowClearConfirm(true);
  };

  const confirmClearLikes = () => {
    setLikedCars([]);
    if (filters.likedOnly) {
      setFilters(prev => ({ ...prev, likedOnly: false, category: "All" }));
    }
    setShowClearConfirm(false);
  };

  const getBrandFromName = (name: string) => {
    const multiWordBrands = [
      "Range Rover", "Land Rover", "Aston Martin", "Alfa Romeo", "Ssang Yong", 
      "Rolls Royce", "Mercedes Benz", "Great Wall"
    ];
    for (const brand of multiWordBrands) {
      if (name.toLowerCase().startsWith(brand.toLowerCase())) {
        return brand;
      }
    }
    return name.split(" ")[0];
  };

  // Dynamically extract unique brands from current fleet state
  const dynamicBrands = useMemo(() => {
    const list = cars.map((car) => getBrandFromName(car.name));
    return ["All", ...Array.from(new Set(list))];
  }, [cars]);

  // Category statistics counting dynamically based on current fleet state
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: cars.length };
    cars.forEach((car) => {
      counts[car.category] = (counts[car.category] || 0) + 1;
    });
    return counts;
  }, [cars]);

  // Filter computation logic
  const [isFiltering, setIsFiltering] = useState(false);
  const handleGridFilterSelect = React.useCallback((filterType: "category" | "transmission" | "fuelType" | "seats", value: string | number) => {
    setFilters({
      searchTerm: "",
      category: "All",
      maxPrice: 5000,
      transmission: "All",
      fuelType: "All",
      seats: "All",
      brand: "All",
      likedOnly: false,
      [filterType]: value
    });
    scrollToAnchor("category-filter-container");
  }, []);

  const [activeFiltersRaw, setActiveFiltersRaw] = useState<CatalogFilters>(filters);

  const activeFilters = activeFiltersRaw;
  const setActiveFilters = React.useCallback((val: CatalogFilters | ((prev: CatalogFilters) => CatalogFilters)) => {
    React.startTransition(() => {
      setActiveFiltersRaw(val);
    });
  }, []);
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentPageRaw, setCurrentPageRaw] = useState(1);
  const currentPage = currentPageRaw;
  const setCurrentPage = React.useCallback((val: number | ((prev: number) => number)) => {
    React.startTransition(() => {
      setCurrentPageRaw(val);
    });
  }, []);

  useEffect(() => {
    setIsFiltering(true);
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => {
      setActiveFilters(filters);
      setCurrentPage(1);
      setIsFiltering(false);
    }, 300);
    return () => {
      if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    };
  }, [filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const filteredCars = useMemo(() => {
    const searchPattern = activeFilters.searchTerm.trim().toLowerCase();
    const activeCategory = activeFilters.category;
    const activeMaxPrice = activeFilters.maxPrice;
    const activeTrans = activeFilters.transmission;
    const activeFuel = activeFilters.fuelType;
    const activeSeats = String(activeFilters.seats);
    const activeBrand = activeFilters.brand.toLowerCase();
    const activeLikedOnly = activeFilters.likedOnly;

    const results = cars.filter((car) => {
      // 1. Price check (numeric check is extremely fast, do first to exit early)
      if (car.price > activeMaxPrice) return false;

      // 2. Category check
      if (activeCategory !== "All" && car.category !== activeCategory) return false;

      // 3. Transmission check
      if (activeTrans !== "All" && car.transmission !== activeTrans) return false;

      // 4. Fuel check
      if (activeFuel !== "All" && car.fuelType !== activeFuel) return false;

      // 5. Seats check
      if (activeSeats !== "All" && String(car.seats) !== activeSeats) return false;

      // 6. Brand check
      if (activeBrand !== "all") {
        const carBrand = getBrandFromName(car.name).toLowerCase();
        if (carBrand !== activeBrand) return false;
      }

      // 7. Liked only check
      if (activeLikedOnly && !likedCars.includes(car.id)) return false;

      // 8. Search check (do string operations last as they are computationally heavier)
      if (searchPattern) {
        const nameMatch = car.name.toLowerCase().includes(searchPattern);
        if (nameMatch) return true;

        if (car.description) {
          const descMatch = car.description.toLowerCase().includes(searchPattern);
          if (descMatch) return true;
        }
        return false;
      }

      return true;
    });

    if (sortBy === "price-asc") {
      return [...results].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...results].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "alphabetical") {
      return [...results].sort((a, b) => a.name.localeCompare(b.name));
    }
    return results;
  }, [cars, activeFilters, likedCars, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / 12));

  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * 12;
    return filteredCars.slice(startIndex, startIndex + 12);
  }, [filteredCars, currentPage]);

  // Smooth scroll helper matching IDs
  const scrollToAnchor = (elementId: string) => {
    setIsMobileMenuOpen(false);
    const target = document.getElementById(elementId);
    if (target) {
      const headerOffset = 80; // approximate sticky header height
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Hero Search execution and viewport scroll
  const handleHeroSearch = () => {
    scrollToAnchor("category-filter-container");
  };

  // Trigger booking success toast from CarCard notifications
  const handleBookingToast = React.useCallback((carName: string) => {
    setBookingToast(
      `Successfully requested booking for ${carName}! Access code generated.`,
    );
    setTimeout(() => {
      setBookingToast(null);
    }, 4500);
  }, []);

  // Brand color constant
  const brandPlum = "#4C0027";

  // Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Master router render
  if (viewMode === "login") {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToCustomer={() => setViewMode("customer")}
      />
    );
  }

  if (viewMode === "admin" && isAdminAuthenticated) {
    return (
      <AdminDashboard
        cars={cars}
        onAddCar={handleAddCar}
        onUpdateCar={handleUpdateCar}
        onDeleteCar={handleDeleteCar}
        onLogout={handleLogout}
        onNavigateToCustomer={() => setViewMode("customer")}
        // Stateful administration parameters linked
        bookings={bookings}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onDeleteBooking={handleDeleteBooking}
        reviews={reviews}
        onApproveReview={handleApproveReview}
        onDeleteReview={handleDeleteReview}
      />
    );
  }

  return (
    <div
      id="customer-application-root"
      className="min-h-screen bg-[#4C0027] text-stone-900 flex flex-col justify-between relative"
    >
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-amber-400 z-[100] origin-left"
      />
      {/* 1. Responsive & Sticky Navigation Header */}
      <header
        id="main-public-header"
        className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs relative no-print"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto py-2.5 lg:py-0 lg:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => scrollToAnchor("home-panel")}
          >
            <BrandLogo size="md" variant="light" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-sans">
            <button
              id="nav-link-home"
              onClick={() => scrollToAnchor("home-panel")}
              className="text-stone-600 text-xs font-extrabold uppercase tracking-widest hover:text-[#4C0027] transition-colors cursor-pointer"
            >
              {t.navHome}
            </button>
            <button
              id="nav-link-catalog"
              onClick={() => scrollToAnchor("category-filter-container")}
              className="text-stone-600 text-xs font-extrabold uppercase tracking-widest hover:text-[#4C0027] transition-colors cursor-pointer"
            >
              {t.navCatalog}
            </button>
            <button
              id="nav-link-about"
              onClick={() => scrollToAnchor("about-section")}
              className="text-stone-600 text-xs font-extrabold uppercase tracking-widest hover:text-[#4C0027] transition-colors cursor-pointer"
            >
              {t.navAbout}
            </button>
            <button
              id="nav-link-workflow"
              onClick={() => scrollToAnchor("workflow-section")}
              className="text-stone-600 text-xs font-extrabold uppercase tracking-widest hover:text-[#4C0027] transition-colors cursor-pointer"
            >
              {t.navWorkflow}
            </button>
            <button
              id="nav-link-faq"
              onClick={() => scrollToAnchor("faq-section")}
              className="text-stone-600 text-xs font-extrabold uppercase tracking-widest hover:text-[#4C0027] transition-colors cursor-pointer"
            >
              {t.navFAQ}
            </button>

            {/* Desktop Global Search Bar */}
            <DesktopSearchBar
              t={t}
              cars={cars}
              setFilters={setFilters}
              scrollToAnchor={scrollToAnchor}
            />
          </nav>

          {/* Desktop Right Actions Container (visible only on lg screens & up) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Favorites Icon */}
            <div className="flex items-center relative gap-0.5 mr-2">
              <button
                onClick={() => {
                  if (likedCars.length > 0) {
                    setFilters((prev) => ({ ...prev, likedOnly: true, category: "All" }));
                  } else {
                    setFilters((prev) => ({ ...prev, likedOnly: false, category: "All" }));
                  }
                  scrollToAnchor("category-filter-container");
                }}
                className={`p-2 lg:p-2.5 rounded-full transition-all border ${filters.likedOnly ? "bg-rose-50 text-rose-600 border-rose-200 shadow-sm scale-105" : "bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-rose-500 border-stone-200 hover:scale-105 active:scale-95"}`}
                title={(t as any).liked || "Wishlist"}
              >
                <Heart className={`w-4 h-4 lg:w-4.5 lg:h-4.5 ${filters.likedOnly ? "fill-current" : ""}`} />
              </button>
              {likedCars.length > 0 && (
                <span className="absolute -top-1.5 -right-0.5 lg:-top-1.5 lg:right-4 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {likedCars.length}
                </span>
              )}
              {likedCars.length > 0 && (
                  <button
                    onClick={handleClearLikes}
                    className="ml-1 text-stone-400 hover:text-rose-600 p-1 rounded-full hover:bg-rose-50 transition-colors"
                    title="Clear favorites"
                  >
                    <X className="w-4 h-4" />
                  </button>
              )}
            </div>

            {/* Quick Station info with Telegram & WhatsApp */}
            <div className="flex items-center select-none animate-fade-in pr-1">
              <div className="flex flex-row flex-nowrap items-center gap-1.5 sm:gap-4">
                {/* Language Switcher */}
                <button
                  onClick={() => React.startTransition(() => setLang(l => l === "en" ? "kh" : l === "kh" ? "zh" : "en"))}
                  className="px-2 py-1 flex items-center gap-1.5 shrink-0 lg:mr-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer"
                  title="Toggle Language"
                >
                  <img 
                    src={lang === "en" ? "https://flagcdn.com/w40/kh.png" : lang === "kh" ? "https://flagcdn.com/w40/cn.png" : "https://flagcdn.com/w40/us.png"} 
                    alt="flag" 
                    className="w-4 h-auto rounded-[2px] shadow-sm border border-stone-200" 
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
                    {lang === "en" ? "KH" : lang === "kh" ? "ZH" : "EN"}
                  </span>
                </button>

                <a
                  href="tel:0966714442"
                  className="text-xs sm:text-lg font-black text-[#4C0027] hover:underline whitespace-nowrap flex items-center gap-1 sm:gap-1.5 font-mono"
                  style={{ color: brandPlum }}
                >
                  <PhoneCall
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4C0027]"
                    style={{ color: brandPlum }}
                  />
                  <span>096 671 4442</span>
                </a>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <a
                    href="https://t.me/+855966714442"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Telegram"
                    className="p-1.5 sm:p-2 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:scale-110 active:scale-90 rounded-full transition-all border border-sky-100/60 shadow-3xs flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-12 -translate-x-0.5" />
                  </a>
                  <a
                    href="https://wa.me/855966714442"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                    className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-110 active:scale-90 rounded-full transition-all border border-emerald-100/60 shadow-3xs flex items-center justify-center cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Right Actions Container (Stacked into 2 rows, visible only on mobile/tablet) */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Elegant 2-Row Stack */}
            <div className="flex flex-col items-end justify-center py-1 select-none">
              {/* Row 1: Phone Button */}
              <a
                href="tel:0966714442"
                className="text-xs sm:text-sm font-bold text-[#4C0027] hover:underline whitespace-nowrap flex items-center gap-1 font-mono hover:scale-[1.02] transition-transform"
                style={{ color: brandPlum }}
              >
                <PhoneCall className="w-3 h-3 text-[#4C0027]" style={{ color: brandPlum }} />
                <span>096 671 4442</span>
              </a>

              {/* Row 2: Social Buttons & Favorites Icon */}
              <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                {/* Language Switcher (Mobile) */}
                <button
                  onClick={() => React.startTransition(() => setLang(l => l === "en" ? "kh" : l === "kh" ? "zh" : "en"))}
                  className="px-1.5 py-0.5 flex items-center gap-1 shrink-0 rounded-md bg-stone-100 hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer shadow-3xs"
                  title="Toggle Language"
                >
                  <img 
                    src={lang === "en" ? "https://flagcdn.com/w40/kh.png" : lang === "kh" ? "https://flagcdn.com/w40/cn.png" : "https://flagcdn.com/w40/us.png"} 
                    alt="flag" 
                    className="w-3.5 h-auto rounded-[2px] shadow-sm border border-stone-200" 
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600">
                    {lang === "en" ? "KH" : lang === "kh" ? "ZH" : "EN"}
                  </span>
                </button>

                {/* Telegram */}
                <a
                  href="https://t.me/+855966714442"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Telegram"
                  className="p-1 sm:p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:scale-105 active:scale-95 rounded-full transition-all border border-sky-100/60 flex items-center justify-center cursor-pointer shadow-3xs"
                >
                  <Send className="w-3 h-3 -rotate-12 -translate-x-0.25" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/855966714442"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  className="p-1 sm:p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 active:scale-95 rounded-full transition-all border border-emerald-100/60 flex items-center justify-center cursor-pointer shadow-3xs"
                >
                  <MessageCircle className="w-3 h-3" />
                </a>

                {/* Favorites button with heart + clear */}
                <div id="mobile-header-fav-wrapper" className="relative flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      if (likedCars.length > 0) {
                        setFilters((prev) => ({ ...prev, likedOnly: true, category: "All" }));
                      } else {
                        setFilters((prev) => ({ ...prev, likedOnly: false, category: "All" }));
                      }
                      setIsMobileMenuOpen(false);
                      scrollToAnchor("category-filter-container");
                    }}
                    className={`p-1 sm:p-1.5 rounded-full transition-all border ${filters.likedOnly ? "bg-rose-50 text-rose-600 border-rose-200 shadow-xs scale-105" : "bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-rose-500 border-stone-200 hover:scale-105 active:scale-95"}`}
                    title={(t as any).liked || "Wishlist"}
                  >
                    <Heart className={`w-3 h-3 ${filters.likedOnly ? "fill-current" : ""}`} />
                  </button>
                  {likedCars.length > 0 && (
                    <span className="absolute -top-1 -right-0.5 bg-rose-500 text-white text-[8px] font-semibold px-1 rounded-full shadow-xs z-10 scale-90">
                      {likedCars.length}
                    </span>
                  )}
                  {likedCars.length > 0 && (
                    <button
                      onClick={handleClearLikes}
                      className="ml-0.5 text-stone-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 transition-colors"
                      title="Clear favorites"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 text-stone-700 hover:bg-stone-50 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-stone-100 ml-0.5 sm:ml-1"
            >
              {isMobileMenuOpen ? (
                <X className="w-4.5 h-4.5" />
              ) : (
                <Menu className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-drawer-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-t border-stone-200 overflow-hidden font-sans shadow-lg absolute top-full left-0 right-0 w-full z-50 origin-top"
            >
              <div className="px-4 py-5 space-y-4">
                {/* Mobile Global Search Bar */}
                <MobileSearchBar
                  t={t}
                  cars={cars}
                  setFilters={setFilters}
                  scrollToAnchor={scrollToAnchor}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <a
                  id="mobile-link-home"
                  href="#home-panel"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-xs font-black text-stone-800 uppercase tracking-widest hover:text-[#4C0027] cursor-pointer"
                >
                  {t.navHome}
                </a>
                <a
                  id="mobile-link-catalog"
                  href="#category-filter-container"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-xs font-black text-stone-800 uppercase tracking-widest hover:text-[#4C0027] cursor-pointer"
                >
                  {t.navCatalog}
                </a>
                <a
                  id="mobile-link-about"
                  href="#about-section"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-xs font-black text-stone-800 uppercase tracking-widest hover:text-[#4C0027] cursor-pointer"
                >
                  {t.navAbout}
                </a>
                <a
                  id="mobile-link-workflow"
                  href="#workflow-section"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-xs font-black text-stone-800 uppercase tracking-widest hover:text-[#4C0027] cursor-pointer"
                >
                  {t.navWorkflow}
                </a>
                <a
                  id="mobile-link-faq"
                  href="#faq-section"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-xs font-black text-stone-800 uppercase tracking-widest hover:text-[#4C0027] cursor-pointer"
                >
                  {t.navFAQ}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Public Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Home Anchor panel wrapper */}
        <section id="home-panel" className="scroll-mt-24 select-none pb-2">
          {/* Hero Welcome Banner */}
          <div className="bg-stone-50 rounded-3xl p-8 sm:p-12 border border-stone-200 flex flex-col items-center text-center justify-center mb-10 overflow-hidden select-none relative max-w-5xl mx-auto shadow-xs no-print">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#4C0027]/3 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4C0027]/2 rounded-tr-full pointer-events-none" />

            <div className="space-y-4 max-w-3xl flex flex-col items-center">
              <span className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black bg-yellow-400 text-black border border-yellow-500/20 uppercase tracking-widest shadow-xs">
                {t.deliveryBadge}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight max-w-2xl">
                {t.heroTitle}
              </h1>
              <p className="text-stone-500 font-medium text-xs sm:text-sm leading-relaxed max-w-xl font-sans text-center">
                {t.heroDesc}
              </p>

              <div className="pt-2 flex flex-col items-center gap-4 w-full">
                {/* Interactive Buttons Group: Find and Explore Catalog side-by-side */}
                <div className="flex sm:flex-row flex-col items-stretch sm:items-center justify-center gap-3 mt-4 select-none w-full max-w-md">
                  <button
                    id="hero-btn-search-trigger"
                    type="button"
                    onClick={() => scrollToAnchor("search-filters-container")}
                    className="flex-1 px-8 py-3.5 bg-[#4C0027] hover:bg-[#5E0030] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: brandPlum }}
                  >
                    <Search className="w-4 h-4" />
                    <span>{t.findBtn}</span>
                  </button>

                  <button
                    id="hero-btn-catalog"
                    type="button"
                    onClick={() => scrollToAnchor("category-filter-container")}
                    className="flex-1 px-8 py-3.5 border border-[#4C0027]/20 hover:bg-[#4C0027]/5 text-[#4C0027] text-xs sm:text-sm font-extrabold rounded-xl shadow-2xs transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer whitespace-nowrap bg-white"
                  >
                    <span>{t.exploreCatalog}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Requirement Visual Highlight Board */}
          <ContractRequirementSection t={t} cars={cars} lang={lang} likedCars={likedCars} />
        </section>

        {/* Catalog Anchor Target */}
        <section id="catalog-section" className="scroll-mt-24">
          {/* 3. Search parameters panel */}
          <section
            id="search-filters-container"
            className="scroll-mt-24 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm mb-8 space-y-4"
          >
            <div className="flex flex-col gap-4 select-none">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center justify-between pl-1 cursor-pointer group shrink-0"
                  onClick={() => setIsFiltersOpen(prev => !prev)}
                >
                  <h2 className="font-sans font-black text-stone-900 text-lg sm:text-xl tracking-tight flex items-center gap-2 group-hover:text-[#4C0027] transition-colors whitespace-nowrap">
                    <SlidersHorizontal
                      className="w-5 h-5 text-[#4C0027]"
                      style={{ color: brandPlum }}
                    />
                    {t.findYourCar}
                    <span className="flex items-center gap-1 text-sm font-semibold text-stone-500 ml-2 group-hover:text-stone-700 transition-colors">
                      {t.advanceSearch}
                      <motion.div
                        animate={{ rotate: isFiltersOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      </motion.div>
                    </span>
                  </h2>
                </div>
                
                <button
                  id="btn-reset-filters"
                  onClick={(e) => { e.stopPropagation(); handleResetFilters(); }}
                  className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-stone-200 text-[11px] sm:text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition-all cursor-pointer bg-white whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t.resetFiltersText}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full">
                {/* Search Box - Now in header */}
                <FilterSectionSearchBar t={t} />

                {/* Max Monthly Fee Slider - Now in header */}
                <div className="w-full flex flex-col justify-center bg-stone-50 rounded-xl px-5 py-3 border border-stone-100 shadow-sm" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] sm:text-[11px] font-bold text-stone-500 uppercase tracking-wider font-mono">
                      {t.maxMonthlyFee}
                    </label>
                    <span
                      id="price-slider-display"
                      className="text-[11px] font-mono font-bold text-red-600 bg-white px-2.5 py-1 rounded-md border border-stone-200 shadow-sm"
                    >
                      {t.upTo} ${filters.maxPrice}{t.monthSuffix}
                    </span>
                  </div>

                  {/* Quick Range Shortcuts */}
                  <div className="flex gap-2 mb-3">
                    {[500, 1000, 2000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, maxPrice: val })); }}
                        className={`flex-1 py-1 px-2 text-[10px] sm:text-[11px] font-mono font-bold rounded text-center transition-colors shadow-sm ${
                          filters.maxPrice === val 
                            ? 'bg-amber-400 text-stone-900 border border-amber-500/30' 
                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>

                  <input
                    id="filter-slider-price"
                    type="range"
                    min="300"
                    max="5000"
                    step="100"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: Number(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#4C0027]"
                    style={{ accentColor: brandPlum }}
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-2 font-mono">
                    <span>$300{t.perMonth ? "/" + t.perMonth : "/mo"}</span>
                    <span>$5,000{t.perMonth ? "/" + t.perMonth : "/mo"}</span>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isFiltersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{
                    height: { type: "spring", stiffness: 450, damping: 40 },
                    opacity: { duration: 0.25 },
                    marginTop: { type: "spring", stiffness: 450, damping: 40 }
                  }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-4">
              {/* Row 2: Dropdowns */}
              <div className="col-span-1 lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    {t.brand}
                  </label>
                  <div className="relative">
                    <select
                      value={filters.brand}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          brand: e.target.value,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {dynamicBrands.map((b) => (
                        <option value={b} key={b}>
                          {b === "All" ? t.allCategories : b}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    {t.category}
                  </label>
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          category: e.target.value as any,
                          likedOnly: false,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {["All", "Sedan", "SUV", "MPV", "Pickup", "Truck"].map(
                        (cat) => {
                          const tCat = cat === "All" ? t.allCategories : 
                           cat === "Sedan" ? t.sedan : 
                           cat === "SUV" ? t.suv : 
                           cat === "MPV" ? t.mpv : 
                           cat === "Pickup" ? t.pickup : 
                           cat === "Truck" ? t.truck : cat;
                          return (
                          <option value={cat} key={cat}>
                            {tCat}
                          </option>
                        )}
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    {t.fuelType}
                  </label>
                  <div className="relative">
                    <select
                      value={filters.fuelType}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          fuelType: e.target.value as any,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {[
                        "All",
                        "Gasoline",
                        "Diesel",
                        "LPG",
                        "Hybrid",
                        "Electric",
                      ].map((fuel) => {
                        const tFuel = fuel === "All" ? t.allCategories :
                                      fuel === "Gasoline" ? t.petrol :
                                      fuel === "Diesel" ? t.diesel :
                                      fuel === "LPG" ? "LPG" :
                                      fuel === "Hybrid" ? t.hybrid :
                                      fuel === "Electric" ? t.electric : fuel;
                        return (
                        <option value={fuel} key={fuel}>
                          {tFuel}
                        </option>
                      )})}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    {t.transmission}
                  </label>
                  <div className="relative">
                    <select
                      value={filters.transmission}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          transmission: e.target.value as any,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {["All", "Automatic", "Manual"].map((mode) => {
                        const tMode = mode === "All" ? t.allCategories :
                                      mode === "Automatic" ? t.automatic :
                                      mode === "Manual" ? t.manual : mode;
                        return (
                        <option value={mode} key={mode}>
                          {tMode}
                        </option>
                      )})}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    {t.seats}
                  </label>
                  <div className="relative">
                    <select
                      value={filters.seats}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          seats: e.target.value as any,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {["All", "2", "4", "5", "7", "8", "9", "10", "12", "15"].map((count) => (
                        <option value={count} key={count}>
                          {count === "All" ? t.allCategories : t.formatSeats(count)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters Bar */}
            {(() => {
              const activeTags = [];
              if (filters.searchTerm) activeTags.push({ id: 'searchTerm', label: `"${filters.searchTerm}"`, onRemove: () => setFilters(pre => ({ ...pre, searchTerm: "" })) });
              if (filters.brand !== "All") activeTags.push({ id: 'brand', label: `${filters.brand}`, onRemove: () => setFilters(pre => ({ ...pre, brand: "All" })) });
              if (filters.category !== "All") {
                const tCat = filters.category === "Sedan" ? t.sedan : filters.category === "SUV" ? t.suv : filters.category === "MPV" ? t.mpv : filters.category === "Pickup" ? t.pickup : filters.category === "Truck" ? t.truck : filters.category;
                activeTags.push({ id: 'category', label: `${tCat}`, onRemove: () => setFilters(pre => ({ ...pre, category: "All" })) });
              }
              if (filters.fuelType !== "All") {
                const fType = filters.fuelType === "Gasoline" ? t.petrol : filters.fuelType === "Diesel" ? t.diesel : filters.fuelType === "Hybrid" ? t.hybrid : filters.fuelType === "Electric" ? t.electric : filters.fuelType;
                activeTags.push({ id: 'fuelType', label: `${fType}`, onRemove: () => setFilters(pre => ({ ...pre, fuelType: "All" })) });
              }
              if (filters.transmission !== "All") {
                const trType = filters.transmission === "Automatic" ? t.automatic : filters.transmission === "Manual" ? t.manual : filters.transmission;
                activeTags.push({ id: 'transmission', label: `${trType}`, onRemove: () => setFilters(pre => ({ ...pre, transmission: "All" })) });
              }
              if (filters.maxPrice < 5000) activeTags.push({ id: 'maxPrice', label: `Max $${filters.maxPrice}/mo`, onRemove: () => setFilters(pre => ({ ...pre, maxPrice: 5000 })) });
              if (filters.seats !== "All") activeTags.push({ id: 'seats', label: `${filters.seats} Seats`, onRemove: () => setFilters(pre => ({ ...pre, seats: "All" })) });
              if (filters.likedOnly) activeTags.push({ id: 'likedOnly', label: `${t.liked || 'Liked'}`, onRemove: () => setFilters(pre => ({ ...pre, likedOnly: false })) });

              if (activeTags.length === 0) return null;

              return (
                <div className="flex flex-wrap items-center gap-2 pt-4 mt-2 border-t border-stone-100">
                  <span className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
                    Active Filters:
                  </span>
                  <AnimatePresence>
                    {activeTags.map(tag => (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-100 border border-stone-200 text-[10px] sm:text-[11px] font-semibold text-stone-700"
                      >
                        {tag.label}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); tag.onRemove(); }}
                          className="p-0.5 rounded-sm hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
                          title="Remove filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {activeTags.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleResetFilters(); }}
                      className="text-[10px] sm:text-[11px] font-bold text-[#4C0027] hover:underline ml-1"
                    >
                      {t.clearFilters || "Clear All"}
                    </button>
                  )}
                </div>
              );
            })()}
          </section>

          {/* 4. Horizontal Category Tab Selector Bar */}
          <section
            id="category-filter-container"
            className="scroll-mt-24 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="font-sans font-black text-stone-900 text-lg sm:text-xl tracking-tight flex items-center gap-2">
                <CarFront
                  className="w-5 h-5 text-[#4C0027]"
                  style={{ color: brandPlum }}
                />
                {t.exploreOurCatalog}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Liked Filter Button */}
              <button
                id="filter-liked-cars"
                onClick={() => {
  // Helper to handle like filter selection
                if (likedCars.length === 0) {
                  setFilters((prev) => ({ ...prev, likedOnly: false, category: "All", searchTerm: "" }));
                } else {
                  setFilters((prev) => ({
                    ...prev,
                    likedOnly: !prev.likedOnly,
                    searchTerm: "",
                    ...(!prev.likedOnly ? { category: "All" } : {})
                  }));
                }
              }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${filters.likedOnly ? "bg-rose-100/50 text-rose-600 border-rose-200 shadow-sm" : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"}`}
              >
                <Heart className={`w-3.5 h-3.5 ${filters.likedOnly ? "fill-current" : ""}`} />
                <span>{t.liked}</span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${filters.likedOnly ? "bg-rose-200/50 text-rose-700" : "bg-stone-100 text-stone-400"}`}>
                  {likedCars.length}
                </span>
              </button>

              <div className="w-[1px] h-6 bg-stone-200 mx-2 hidden sm:block"></div>

              {["All", "Sedan", "SUV", "MPV", "Pickup", "Truck"].map((cat) => {
                const isSelected = filters.category === cat;
                const count = categoryCounts[cat] || 0;
                
                const tCat = cat === "All" ? t.allCategories : 
                             cat === "Sedan" ? t.sedan : 
                             cat === "SUV" ? t.suv : 
                             cat === "MPV" ? t.mpv : 
                             cat === "Pickup" ? t.pickup : 
                             cat === "Truck" ? t.truck : cat;

                return (
                  <button
                    key={cat}
                    id={`filter-cat-tab-${cat}`}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, category: cat as any, likedOnly: false, searchTerm: "" }))
                    }
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${isSelected ? "bg-[#4C0027] text-white border-[#4C0027] shadow-sm" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-black"}`}
                  >
                    <span>{tCat}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-stone-200 text-stone-500"}`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. Car catalog grid block */}
          <div id="catalog-header" className="flex flex-col sm:flex-row sm:items-center justify-start gap-4 mb-4 px-2 scroll-mt-24">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider font-mono text-white/70 hidden sm:inline-block">
                  {t.sortByPrice}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSortBy(sortBy === "price-asc" ? "default" : "price-asc")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${sortBy === "price-asc" ? "bg-white text-stone-900 border-white shadow-sm" : "bg-white/10 border-white/20 text-stone-200 hover:bg-white/20 hover:text-white"}`}
                  >
                    {t.lowestToHighest}
                  </button>
                  <button
                    onClick={() => setSortBy(sortBy === "price-desc" ? "default" : "price-desc")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${sortBy === "price-desc" ? "bg-white text-stone-900 border-white shadow-sm" : "bg-white/10 border-white/20 text-stone-200 hover:bg-white/20 hover:text-white"}`}
                  >
                    {t.highestToLowest}
                  </button>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-medium text-stone-500 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
                {lang === "en" ? (
                  <>
                    Showing <span className="font-bold text-[#4C0027]" style={{ color: brandPlum }}>{filteredCars.length}</span> of <span className="font-bold text-stone-800">{cars.length}</span> vehicles
                  </>
                ) : lang === "zh" ? (
                  <>
                    正在显示 <span className="font-bold text-[#4C0027]" style={{ color: brandPlum }}>{filteredCars.length}</span> 辆车，共 <span className="font-bold text-stone-800">{cars.length}</span> 辆
                  </>
                ) : (
                  <>
                    កំពុងបង្ហាញរថយន្ដ <span className="font-bold text-[#4C0027]" style={{ color: brandPlum }}>{filteredCars.length}</span> នៃ <span className="font-bold text-stone-800">{cars.length}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div id="collection-grid-view">
            {isFiltering || isLoadingData ? (
              <div
                id="cars-grid-loading"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                 {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-3 border border-stone-100 shadow-sm flex flex-col justify-between" style={{ minHeight: '380px' }}>
                    <div className="w-full h-40 sm:h-52 shimmer rounded-2xl mb-4" />
                    <div className="px-3">
                      <div className="w-3/4 h-6 shimmer-dark rounded-lg mb-2" />
                      <div className="flex gap-2 mb-4">
                        <div className="w-1/3 h-8 shimmer rounded-xl" />
                        <div className="w-1/3 h-8 shimmer rounded-xl" />
                        <div className="w-1/3 h-8 shimmer rounded-xl" />
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="w-20 h-8 shimmer-dark rounded-md" />
                        <div className="w-24 h-10 shimmer-dark rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCars.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-xs flex flex-col items-center justify-center select-none"
              >
                <motion.div 
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-16 h-16 bg-stone-50 text-stone-300 rounded-2xl flex items-center justify-center mb-4 text-stone-400"
                >
                  <CarFront className="w-8 h-8 opacity-50" />
                </motion.div>
                <h3 className="font-extrabold text-black text-lg">
                  {t.noCarsMatch}
                </h3>
                <p className="text-xs text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                  {t.tryAdjusting}
                </p>
                <button
                  id="btn-empty-state-reset"
                  onClick={handleResetFilters}
                  className="mt-5 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                  style={{ backgroundColor: brandPlum }}
                >
                  {t.clearFilters}
                </button>
              </motion.div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {paginatedCars.map((car, index) => (
                      <motion.div
                        key={car.id}
                        layout="position"
                        initial={{ opacity: 0, y: 70, scale: 0.95, rotateX: 6, rotateY: -1 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0, rotateY: 0 }}
                        viewport={{ once: true, margin: "0px 0px -60px 0px", amount: 0.05 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{
                          layout: { type: "spring", stiffness: 350, damping: 30 },
                          opacity: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                          scale: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
                          rotateX: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
                          rotateY: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
                          y: { type: "spring", stiffness: 75, damping: 14, mass: 1.1 },
                          delay: (index % 3) * 0.08
                        }}
                        style={{ perspective: 1200 }}
                        className="h-full pt-2 pb-2"
                      >
                        <CarCard
                          car={car}
                          isAdminMode={isAdminAuthenticated}
                          onBookSuccess={handleBookingToast}
                          reviews={reviews}
                          onAddReview={handleAddReview}
                          onConfirmBook={(bookingFields) =>
                            handleConfirmBook(car.id, bookingFields)
                          }
                          isLiked={likedCars.includes(car.id)}
                          onToggleLike={handleToggleLike}
                          lang={lang}
                          onFilterSelect={handleGridFilterSelect}
                          onEdit={handleUpdateCar}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div id="cars-pagination" className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-stone-100">
                    <button
                      id="btn-pagination-prev"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        const element = document.getElementById("catalog-header");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      ← Previous
                    </button>
                    <div className="flex gap-1 items-center">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        const shouldShow =
                          totalPages <= 7 ||
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(currentPage - pageNum) <= 1;

                        if (!shouldShow) {
                          if (pageNum === 2 || pageNum === totalPages - 1) {
                            return <span key={pageNum} className="text-stone-400 text-xs px-1 select-none">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            id={`btn-pagination-page-${pageNum}`}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              const element = document.getElementById("catalog-header");
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth", block: "start" });
                              }
                            }}
                            className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                              currentPage === pageNum
                                ? "bg-[#4C0027] text-white border-[#4C0027] shadow-sm font-extrabold"
                                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      id="btn-pagination-next"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        const element = document.getElementById("catalog-header");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white text-[#4C0027] hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs flex items-center gap-1 bg-white hover:text-[#4C0027]"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* About Us Section */}
        <section
          id="about-section"
          className="scroll-mt-24 mt-16 select-none bg-stone-50 border border-stone-200/60 rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden shadow-xs animate-fade-in mx-auto max-w-5xl font-sans"
        >
          {/* Ambient background accent decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#4C0027]/2 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#4C0027]/2 rounded-full blur-xl pointer-events-none" />

          <div className="relative text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4C0027]/5 rounded-full text-[10px] font-black uppercase text-[#4C0027] tracking-widest mb-4">
              <Award className="w-3.5 h-3.5" style={{ color: brandPlum }} />
              <span>{t.established2021}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-4">
              {t.providingConnections}
            </h2>
            <div className="w-12 h-1 bg-[#4C0027] mx-auto rounded-full mb-4" style={{ backgroundColor: brandPlum }} />
            <p className="text-stone-600 text-sm leading-relaxed max-w-2xl mx-auto">
              {t.brokerageDesc}
            </p>
          </div>

          {/* Visual Narrative & Philosophy */}
          <div className="max-w-3xl mx-auto space-y-10 relative mb-16">
            <div className="space-y-6 text-center bg-white border border-stone-150 rounded-2xl p-8 sm:p-10 shadow-3xs">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-[#4C0027]/5 text-[#4C0027] mb-2" style={{ color: brandPlum }}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                {t.trustBuilt}
              </h3>
              <div className="space-y-4 text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                <p dangerouslySetInnerHTML={{ __html: t.foundedDesc.replace('2021', '<strong>2021</strong>') }} />
                <p>
                  {t.agentDesc}
                </p>
                <div className="pt-4 pb-2">
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    {t.directVerif}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Philosophy Quote */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute -top-3 -left-3 text-[#4C0027]/20">
                <Sparkles className="w-8 h-8 pointer-events-none" />
              </div>
              <div className="bg-stone-50 border border-[#4C0027]/10 rounded-xl p-6 sm:p-8 text-center shadow-xs relative z-10">
                <div className="text-[10px] text-[#4C0027] font-extrabold uppercase tracking-widest mb-3" style={{ color: brandPlum }}>
                  {t.agentPhiloTitle}
                </div>
                <blockquote className="text-stone-800 font-medium italic text-sm sm:text-base leading-relaxed">
                  {t.agentPhiloDesc}
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Our Process Workflow Section */}
        <section
          id="workflow-section"
          className="scroll-mt-24 select-none bg-yellow-50 border border-yellow-200/60 rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden shadow-xs animate-fade-in mx-auto max-w-5xl font-sans"
        >
          {/* Unified 5-Step Work Flow Highlight */}
          <div className="pt-2">
            <h3 className="text-stone-900 font-extrabold text-2xl sm:text-3xl text-center mb-8 tracking-tight font-sans">
              {t.processWorkflow}
            </h3>
            <div className="relative max-w-2xl mx-auto px-4 sm:px-8">
              {/* Vertical connecting line */}
              <div className="absolute top-10 bottom-10 left-[43px] sm:left-[59px] w-[2px] bg-stone-200"></div>

              <div className="space-y-0 relative z-10">
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <Search className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">1</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      {t.wfSelectTitle}
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      {t.wfSelectDesc}
                    </p>
                  </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <Users className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">2</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      {t.wfOwnerTitle}
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      {t.wfOwnerDesc}
                    </p>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <MapPin className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">3</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      {t.wfDeliveryTitle}
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      {t.wfDeliveryDesc}
                    </p>
                  </div>
                </motion.div>

                {/* Step 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <FileText className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">4</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      {t.wfAgreementTitle}
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      {t.wfAgreementDesc}
                    </p>
                  </div>
                </motion.div>

                {/* Step 5 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <ShieldCheck className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">5</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      {t.wfAftercareTitle}
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      {t.wfAftercareDesc}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq-section"
          className="scroll-mt-24 select-none bg-stone-50 border border-stone-200/60 rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden shadow-xs animate-fade-in mx-auto max-w-5xl font-sans"
        >
          <div className="pt-2 w-full mx-auto px-0 sm:px-8">
            <h3 className="text-stone-900 font-extrabold text-2xl sm:text-3xl text-center mb-8 tracking-tight font-sans">
              {t.frequentlyAskedQuestions}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {[
                { question: t.q1Title, answer: t.q1Desc },
                { question: t.q2Title, answer: t.q2Desc },
                { question: t.q3Title, answer: t.q3Desc },
                { question: t.q4Title, answer: t.q4Desc },
                { question: t.q5Title, answer: t.q5Desc },
              ].map((faq, index) => (
                <motion.div 
                  key={index} 
                  layout="position"
                  className={`border rounded-2xl overflow-hidden shadow-xs transition-all duration-300 ${
                    openFaq === index 
                      ? "border-amber-200/80 bg-amber-50/20 shadow-xs" 
                      : "border-stone-200 bg-white hover:border-stone-300/80 hover:shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left transition duration-300 focus:outline-none group"
                  >
                    <span className="font-bold text-stone-900 pr-4 transition-colors duration-200 group-hover:text-[#4C0027]">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      className="shrink-0"
                    >
                      <ChevronDown
                        className="w-5 h-5 text-[#4C0027]"
                        style={{ color: brandPlum }}
                      />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="p-5 pt-0 border-t border-stone-100 text-stone-500 text-sm leading-relaxed"
                        >
                          {faq.answer}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 7. Toast Alerts container absolutely positioned */}
      <AnimatePresence>
        {bookingToast !== null && (
          <motion.div
            id="global-toast-alert"
            initial={{ opacity: 0, y: 70, scale: 0.85, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 25, scale: 0.9, filter: "blur(2px)", transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ type: "spring", damping: 18, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm overflow-hidden"
          >
            {/* Visual accent backdrop shine */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#4C0027]/15 rounded-full blur-xl pointer-events-none" />

            {/* Micro-particle Burst & Animating Icon Container */}
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              {/* Pulsing Backlight Halo */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-emerald-500/20"
              />
              
              {/* Micro-Particles Confetti Burst on Mount */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 360) / 12;
                const distance = 24 + Math.random() * 24;
                const radian = (angle * Math.PI) / 180;
                const targetX = Math.cos(radian) * distance;
                const targetY = Math.sin(radian) * distance;
                const particleColors = ["#10B981", "#34D399", "#A7F3D0", "#F43F5E", "#FBBF24"];
                const color = particleColors[i % particleColors.length];
                
                return (
                  <motion.span
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: color,
                      left: "13px",
                      top: "13px",
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: targetX,
                      y: targetY,
                      scale: [0, 1.3, 0],
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      duration: 0.9,
                      ease: "easeOut",
                      delay: 0.05 + Math.random() * 0.1
                    }}
                  />
                );
              })}

              {/* Success Checkmark Icon with Spring Entrance */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 11, stiffness: 220, delay: 0.1 }}
                className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
              </motion.div>
            </div>

            {/* Success Details Text */}
            <div className="flex-1 min-w-0 pr-2">
              <motion.p
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xs font-semibold leading-relaxed text-stone-200 font-sans"
              >
                {bookingToast}
              </motion.p>
            </div>

            {/* Precise Interaction Dismiss Button */}
            <motion.button
              id="btn-close-toast"
              onClick={() => setBookingToast(null)}
              whileHover={{ rotate: 90, scale: 1.15 }}
              whileActive={{ scale: 0.9 }}
              className="text-stone-400 hover:text-white font-black leading-none cursor-pointer text-base shrink-0 p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              &times;
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Favorites Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop slide-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs"
            />

            {/* Dialog Content Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 text-center font-sans z-10"
            >
              {/* Alert icon with subtle glow */}
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 text-rose-500 shadow-3xs">
                <HelpCircle className="w-6 h-6 animate-pulse" />
              </div>

              {/* Title & Warning description */}
              <h3 className="text-stone-900 font-extrabold text-base mb-2 font-sans tracking-tight">
                {t.clearFavoritesTitle}
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-[270px] mx-auto mb-6 font-sans">
                {t.clearFavoritesDesc}
              </p>

              {/* Modulated Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold font-sans hover:bg-stone-50 transition-all cursor-pointer active:scale-95"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={confirmClearLikes}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-sans transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {t.yesClear}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Modern Aesthetic Footer */}
      <footer
        id="global-theme-footer"
        className="bg-stone-900 text-stone-200 mt-20 border-t border-stone-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 select-none">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <BrandLogo size="md" variant="dark" />
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed font-sans">
                {t.footerDesc}
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-extrabold text-stone-300 uppercase tracking-widest mb-4">
                {t.quickNavigation}
              </h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold"
                  >
                    {t.navHome}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToAnchor("category-filter-container")}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold"
                  >
                    {t.navCatalog}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToAnchor("about-section")}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold"
                  >
                    {t.navAbout}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToAnchor("workflow-section")}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold"
                  >
                    {t.navWorkflow}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToAnchor("faq-section")}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold"
                  >
                    {t.navFAQ}
                  </button>
                </li>
                <li className="pt-2">
                  <button
                    onClick={() =>
                      setViewMode(isAdminAuthenticated ? "admin" : "login")
                    }
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold"
                  >
                    {t.adminSecurityPortal}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-extrabold text-stone-300 uppercase tracking-widest mb-4">
                {t.topBrands}
              </h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li>
                  <button onClick={() => { scrollToAnchor("category-filter-container"); setFilters(prev => ({ ...prev, brand: 'Toyota' })); }} className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-2.5 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M12 3.848C5.223 3.848 0 7.298 0 12c0 4.702 5.224 8.152 12 8.152S24 16.702 24 12c0-4.702-5.223-8.152-12-8.152zm7.334 3.839c0 1.08-1.725 1.913-4.488 2.246-.26-2.58-1.005-4.279-1.963-4.913 2.948.184 6.45 1.227 6.45 2.667zM12 16.401c-.96 0-1.746-1.5-1.808-4.389.577.047 1.18.072 1.808.072.628 0 1.23-.025 1.807-.072-.061 2.89-.847 4.389-1.807 4.389zm0-6.308c-.59 0-1.155-.019-1.69-.054.261-1.728.92-3.15 1.69-3.15.77 0 1.428 1.422 1.689 3.15-.535.034-1.099.054-1.689.054zm-.882-5.075c-.956.633-1.706 2.333-1.964 4.915C6.391 9.6 4.665 8.767 4.665 7.687c0-1.44 3.504-2.49 6.453-2.669zM2.037 11.68a5.265 5.265 0 011.048-3.164c.27 1.547 2.522 2.881 5.972 3.37V12c0 3.772.879 6.203 2.087 6.97-5.107-.321-9.107-3.48-9.107-7.29zm10.823 7.29c1.207-.767 2.087-3.198 2.087-6.97v-.115c3.447-.488 5.704-1.826 5.972-3.37a5.26 5.26 0 011.049 3.165c-.004 3.81-4.008 6.969-9.109 7.29z"/></svg>
                    Toyota
                  </button>
                </li>
                <li>
                  <button onClick={() => { scrollToAnchor("category-filter-container"); setFilters(prev => ({ ...prev, brand: 'Lexus' })); }} className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-2.5 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M12 2C6.48 2 2 4.686 2 8s4.48 6 10 6 10-2.686 10-6-4.48-6-10-6zm0 10.5c-4.687 0-8.5-2.015-8.5-4.5S7.313 3.5 12 3.5s8.5 2.015 8.5 4.5-3.813 4.5-8.5 4.5zM9 5h1.5v4H15v1.5H9V5z"/></svg>
                    Lexus
                  </button>
                </li>
                <li>
                  <button onClick={() => { scrollToAnchor("category-filter-container"); setFilters(prev => ({ ...prev, brand: 'Ford' })); }} className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-2.5 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M12 8.236C5.872 8.236.905 9.93.905 12.002S5.872 15.767 12 15.767c6.127 0 11.094-1.693 11.094-3.765 0-2.073-4.967-3.766-11.094-3.766zm-5.698 6.24c-.656.005-1.233-.4-1.3-1.101a1.415 1.415 0 0 1 .294-1.02c.195-.254.525-.465.804-.517.09-.017.213-.006.264.054.079.093.056.194-.023.234-.213.109-.47.295-.597.55a.675.675 0 0 0 .034.696c.263.397.997.408 1.679-.225.169-.156.32-.304.473-.48.3-.344.4-.47.8-1.024.005-.006.006-.014.004-.018-.003-.007-.009-.01-.02-.01-.267.007-.5.087-.725.255-.065.048-.159.041-.2-.021-.046-.07-.013-.163.062-.215.363-.253.76-.298 1.166-.367 0 0 .028.002.051-.03.167-.213.292-.405.47-.621.178-.22.41-.42.586-.572.246-.212.404-.283.564-.37.043-.022-.005-.049-.018-.049-.896-.168-1.827-.386-2.717-.056-.616.23-.887.718-.757 1.045.093.231.397.27.683.13a1.55 1.55 0 0 0 .611-.544c.087-.134.27-.038.171.195-.26.611-.757 1.097-1.363 1.118-.516.016-.849-.363-.848-.831.002-.924 1.03-1.532 2.11-1.622 1.301-.108 2.533.239 3.825.395.989.12 1.938.123 2.932-.106.118-.025.2.05.193.168-.01.172-.143.337-.47.516-.373.204-.763.266-1.17.27-.984.008-1.901-.376-2.85-.582.002.041.012.091-.023.117-.525.388-1 .782-1.318 1.334-.011.013-.005.025.013.024.277-.015.525-.022.783-.042.045-.004.047-.015.043-.048a.64.64 0 0 1 .2-.558c.172-.153.387-.17.53-.06.16.126.147.353.058.523a.63.63 0 0 1-.382.31s-.03.006-.026.034c.006.043.2.151.217.18.017.027.008.07-.021.102a.123.123 0 0 1-.095.045c-.033 0-.053-.012-.096-.035a.92.92 0 0 1-.27-.217c-.024-.031-.037-.032-.099-.029-.279.017-.714.059-1.009.096-.071.008-.082.022-.096.047-.47.775-.972 1.61-1.523 2.17-.592.6-1.083.758-1.604.762zM19.05 10.71c-.091.158-1.849 2.834-1.96 3.11-.035.088-.04.155-.004.204.092.124.297.051.425-.038.381-.262.645-.58.937-.858.017-.013.046-.018.065 0 .043.04.106.091.15.137a.04.04 0 0 1 .002.057 5.873 5.873 0 0 1-.904.911c-.47.364-.939.457-1.172.224a.508.508 0 0 1-.14-.316c-.002-.057-.031-.06-.058-.034-.278.275-.76.579-1.198.362-.366-.18-.451-.618-.383-.986.001-.008-.006-.06-.051-.03a1.28 1.28 0 0 1-.3.162.853.853 0 0 1-.366.077.518.518 0 0 1-.451-.253.759.759 0 0 1-.095-.347c-.001-.011-.017-.032-.033-.005-.3.457-.579.899-.875 1.363-.016.022-.03.036-.06.037l-.587.001c-.036 0-.053-.028-.034-.063.104-.2.674-1.03 1.06-1.736.107-.194.085-.294.019-.337-.083-.054-.248.027-.387.133-.379.287-.697.735-.859.935-.095.117-.185.291-.433.56-.391.425-.91.669-1.408.5a.848.848 0 0 1-.546-.58c-.015-.052-.044-.066-.073-.032-.08.1-.245.249-.383.342-.015.011-.052.033-.084.017a.851.851 0 0 1-.152-.199.07.07 0 0 1 .016-.08c.197-.173.305-.271.391-.38.064-.08.113-.17.17-.315.12-.302.393-.866.938-1.158a1.81 1.81 0 0 1 .652-.219c.1-.01.183.002.213.08.011.033.039.105.056.158.011.032.003.057-.035.071-.32.122-.643.311-.865.61-.253.338-.321.746-.152.98.123.17.322.2.514.139.29-.092.538-.363.666-.663.138-.329.16-.717.058-1.059-.016-.059-.001-.104.037-.136.077-.063.184-.112.215-.128a.14.14 0 0 1 .182.045c.106.157.163.378.17.607.006.049.026.05.05.025.19-.202.366-.418.568-.58.185-.147.422-.267.643-.262.286.006.428.2.419.546-.001.044.03.04.051.011a1.19 1.19 0 0 1 .24-.264c.198-.163.4-.236.611-.222.26.02.468.257.425.527a.53.53 0 0 1-.281.406.362.362 0 0 1-.405-.044.336.336 0 0 1-.096-.322c.005-.025-.027-.048-.054-.02-.254.264-.273.606-.107.76.183.17.458.056.658-.075.366-.239.65-.563.979-.813.218-.166.467-.314.746-.351a.87.87 0 0 1 .454.052c.2.081.326.25.342.396.004.043.036.048.063.01.158-.246 1.005-1.517 1.075-1.65.02-.041.044-.047.089-.047h.606c.035 0 .051.02.036.047zm-2.32 2.204a.053.053 0 0 0-.003.04c.003.02.03.04.056.05.01.003.015.01.004.032-.075.16-.143.252-.237.391a1.472 1.472 0 0 1-.3.325c-.178.147-.424.307-.628.2-.09-.047-.13-.174-.127-.276.004-.288.132-.584.369-.875.288-.355.607-.539.816-.438.216.103.148.354.05.55zm-5.949-1.881a.398.398 0 0 1 .132-.345c.057-.05.133-.062.18-.022.052.045.027.157-.026.234a.43.43 0 0 1-.245.177c-.018.004-.034-.004-.041-.044zM12 7.5C5.34 7.5 0 9.497 0 12c0 2.488 5.383 4.5 12 4.5s12-2.02 12-4.5-5.383-4.5-12-4.5zm0 8.608C5.649 16.108.5 14.27.5 12.002.5 9.733 5.65 7.895 12 7.895s11.498 1.838 11.498 4.107c0 2.268-5.148 4.106-11.498 4.106z"/></svg>
                    Ford
                  </button>
                </li>
                <li>
                  <button onClick={() => { scrollToAnchor("category-filter-container"); setFilters(prev => ({ ...prev, brand: 'MG' })); }} className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-2.5 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M23.835 8.428c-.015-.184-.034-.368-.053-.552-.016-.138-.034-.274-.052-.411a.592.592 0 0 0-.104-.243c-.087-.11-.175-.217-.266-.323l-.365-.429a42.198 42.198 0 0 0-2.509-2.638A42.774 42.774 0 0 0 17.3 1.064c-.11-.088-.222-.174-.336-.257a.664.664 0 0 0-.252-.1 21.852 21.852 0 0 0-1-.102 45.346 45.346 0 0 0-3.71-.158 45.291 45.291 0 0 0-4.286.211c-.142.015-.284.03-.426.048a.664.664 0 0 0-.253.1c-.113.085-.225.17-.337.258a42.775 42.775 0 0 0-3.185 2.768A42.467 42.467 0 0 0 .641 6.898c-.09.107-.18.215-.267.324a.609.609 0 0 0-.105.243c-.019.137-.035.273-.05.41-.02.185-.038.37-.056.553A41.387 41.387 0 0 0 0 12.001a41.35 41.35 0 0 0 .163 3.574l.057.552c.014.138.03.274.05.41.015.087.052.17.104.244a24.04 24.04 0 0 0 .633.753 42.577 42.577 0 0 0 2.507 2.636A42.394 42.394 0 0 0 6.7 22.938c.112.087.224.172.337.255a.663.663 0 0 0 .253.102l.426.048c.19.018.383.037.574.053 1.234.103 2.473.157 3.712.157 1.237 0 2.476-.054 3.71-.157.193-.016.384-.035.573-.053.144-.015.287-.031.427-.048a.66.66 0 0 0 .252-.102c.115-.083.227-.168.336-.255a42.392 42.392 0 0 0 3.187-2.767 42.424 42.424 0 0 0 2.509-2.637l.365-.43c.09-.106.18-.215.266-.323a.596.596 0 0 0 .104-.243c.018-.137.036-.273.052-.411A39.963 39.963 0 0 0 24 12c0-1.191-.058-2.384-.165-3.573m-1.805 6.601c-.013.156-.029.313-.044.469l-.044.348a.499.499 0 0 1-.089.205c-.073.092-.148.185-.225.276l-.31.363a35.829 35.829 0 0 1-2.126 2.234c-.86.827-1.762 1.61-2.7 2.346a7.787 7.787 0 0 1-.285.216.551.551 0 0 1-.214.087l-.362.04a38.171 38.171 0 0 1-3.63.178c-1.05 0-2.1-.045-3.146-.132l-.486-.045-.362-.041a.547.547 0 0 1-.214-.087 9.555 9.555 0 0 1-.285-.216c-.127-.099-.251-.2-.376-.3a35.855 35.855 0 0 1-2.324-2.046 36.03 36.03 0 0 1-2.125-2.234c-.182-.21-.361-.423-.536-.639a.515.515 0 0 1-.089-.205 33.972 33.972 0 0 1-.09-.817 34.723 34.723 0 0 1-.138-3.028c.003-1.01.047-2.02.138-3.029.015-.155.03-.311.048-.467.012-.118.026-.232.042-.348a.506.506 0 0 1 .089-.206 21.379 21.379 0 0 1 .536-.638 36.255 36.255 0 0 1 2.125-2.236 36.3 36.3 0 0 1 2.7-2.346c.094-.073.189-.146.285-.218a.553.553 0 0 1 .214-.084c.282-.035.565-.063.848-.086a38.642 38.642 0 0 1 3.146-.135 38.792 38.792 0 0 1 3.63.18c.122.012.243.026.362.04a.56.56 0 0 1 .214.085 26.752 26.752 0 0 1 .662.517 36.24 36.24 0 0 1 2.323 2.047c.74.715 1.45 1.46 2.126 2.236l.31.364c.077.09.152.181.225.274a.5.5 0 0 1 .089.205l.044.349c.015.155.031.312.044.467.091 1.009.14 2.019.14 3.029 0 1.01-.048 2.021-.14 3.028m-1.225-3c-.098-.01-.981-.012-1.456-.017-.622-.005-1.042 0-1.246-.001-.06 0-.068-.003-.135 0-.003.047-.003.071-.005.13-.002.043-.01.19-.018.384-.012.326-.026.787-.018 1.116l.001.114c.036.002.616.002 1.007.005.053 0 .057.001.11.003-.001.027 0 .052.001.097 0 .048-.055.74-.088.94-.1.149-.163.23-.367.456-.217.24-.256.3-.934.984-.704.712-2.035 1.867-2.513 2.263a9.84 9.84 0 0 0-.303.257s.007-.243-.002-.361c.018-4.565.013-7.807-.004-12.84.008-.114-.005-.209 0-.347.15.117.156.123.259.208.7.594 1.438 1.203 2.024 1.79.81.815 1.156 1.174 1.74 1.863.058.073.069.088.108.15.01.064.01.076.021.157.023.193.062.588.068.696.002.062.009.091.007.151.06.006.1 0 .16.004.352.006.77.008 1.167.006.133-.001.265-.003.39-.006.068 0 .072.002.128 0a1.427 1.427 0 0 0 0-.17 12.32 12.32 0 0 0-.097-1.292 2.536 2.536 0 0 0-.032-.267c-.05-.068-.081-.1-.128-.155A28.182 28.182 0 0 0 18.5 6.02c-1.795-1.721-2.75-2.375-2.75-2.375s-.077-.057-.134-.095c-.075-.014-.058-.01-.13-.02a31.483 31.483 0 0 0-2.608-.168c-.124-.004-.16-.007-.293-.001.006.15.002.153-.002.267.014 6.216-.02 10.641-.009 16.813v.188s.088.008.203.004c.734 0 2.167-.08 2.534-.14.142-.022.219-.027.319-.056.075-.043.115-.074.176-.126a36.5 36.5 0 0 0 2.616-2.267c.983-.941 1.876-1.96 2.09-2.2.09-.099.15-.176.256-.315.045-.166.034-.215.054-.347.093-1.076.167-1.752.167-2.977-.004-.064-.002-.095-.007-.169-.089-.005-.128-.004-.177-.008m-9.539-8.672c-.152.006-.43-.003-.942.026-.537.031-.85.064-.977.075-.073.007-.117.007-.17.013-.022.048-.019.042-.042.103-.779 1.95-1.788 4.655-2.627 6.666-.042.085-.128.3-.128.3s-.039-.064-.139-.267A85.298 85.298 0 0 0 4.67 7.276c-.046-.077-.128-.246-.128-.246s-.123.132-.204.204c-.173.155-.805.878-.93 1.046-.064.083-.085.107-.157.21-.03.117-.036.187-.058.316-.045.257-.153 1.364-.18 2.852.004 1.21.076 2.292.186 3.498l.031.322s.137.186.166.219c.605.71 1.046 1.217 1.463 1.643l.358.365s-.018-.257-.025-.39l-.024-.413c-.082-1.297-.244-3.484-.29-4.621-.008-.144.018-.824.018-.824l1.742 3.508s.13-.315.188-.447c.7-1.754 1.366-3.327 2.05-5.081.047-.11.294-.77.294-.77s.007.712 0 .866c-.034 4.924-.019 7.741-.012 10.444l.001.249c0 .138-.003.156-.003.247.181.03.163.03.261.042.317.04.313.051.686.075.385.024.806.035 1.142.043.086-.004.133-.004.175-.006.003-.08.003-.118.003-.193-.029-6.302.044-16.917.044-16.917s.003-.057 0-.162a2.544 2.544 0 0 0-.2.001"/></svg>
                    MG
                  </button>
                </li>
                <li>
                  <button onClick={() => { scrollToAnchor("category-filter-container"); setFilters(prev => ({ ...prev, brand: 'Nissan' })); }} className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-2.5 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M20.576 14.955l-.01.028c-1.247 3.643-4.685 6.086-8.561 6.086-3.876 0-7.32-2.448-8.562-6.09l-.01-.029H.71v.329l1.133.133c.7.08.847.39 1.038.78l.048.096c1.638 3.495 5.204 5.752 9.08 5.752 3.877 0 7.443-2.257 9.081-5.747l.048-.095c.19-.39.338-.7 1.038-.781l1.134-.134v-.328zM3.443 9.012c1.247-3.643 4.686-6.09 8.562-6.09 3.876 0 7.319 2.447 8.562 6.09l.01.028h2.728v-.328l-1.134-.133c-.7-.081-.847-.39-1.038-.781l-.047-.096C19.448 4.217 15.88 1.96 12.005 1.96c-3.881 0-7.443 2.257-9.081 5.752l-.048.095c-.19.39-.338.7-1.038.781l-1.133.133v.329h2.724zm13.862 1.586l-1.743 2.795h.752l.31-.5h2.033l.31.5h.747l-1.743-2.795zm1.033 1.766h-1.395l.7-1.124zm2.81-1.066l2.071 2.095H24v-2.795h-.614v2.085l-2.062-2.085h-.795v2.795h.619zM0 13.393h.619v-2.095l2.076 2.095h.781v-2.795h-.619v2.085L.795 10.598H0zm4.843-2.795h.619v2.795h-.62zm4.486 2.204c-.02.005-.096.005-.124.005H6.743v.572h2.5c.019 0 .167 0 .195-.005.51-.048.743-.472.743-.843 0-.381-.243-.79-.705-.833-.09-.01-.166-.01-.2-.01H7.643a.83.83 0 0 1-.181-.014c-.129-.034-.176-.148-.176-.243 0-.086.047-.2.18-.238a.68.68 0 0 1 .172-.014h2.357v-.562H7.6c-.1 0-.176.004-.238.014a.792.792 0 0 0-.695.805c0 .343.214.743.685.81.086.009.205.009.258.009H9.2c.029 0 .1 0 .114.005.181.023.243.157.243.276a.262.262 0 0 1-.228.266zm4.657 0c-.02.005-.096.005-.129.005H11.4v.572h2.5c.019 0 .167 0 .195-.005.51-.048.743-.472.743-.843 0-.381-.243-.79-.705-.833-.09-.01-.166-.01-.2-.01H12.3a.83.83 0 0 1-.181-.014c-.129-.034-.176-.148-.176-.243 0-.086.047-.2.18-.238a.68.68 0 0 1 .172-.014h2.357v-.562h-2.395c-.1 0-.176.004-.238.014a.792.792 0 0 0-.695.805c0 .343.214.743.686.81.085.009.204.009.257.009h1.59c.029 0 .1 0 .114.005.181.023.243.157.243.276a.267.267 0 0 1-.228.266Z"/></svg>
                    Nissan
                  </button>
                </li>
                <li>
                  <button onClick={() => { scrollToAnchor("category-filter-container"); setFilters(prev => ({ ...prev, brand: 'Mazda' })); }} className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mr-2.5 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M11.999 12.876c-.036 0-.105-.046-.222-.26a7.531 7.531 0 00-1.975-2.353A8.255 8.255 0 007.7 9.065a17.945 17.945 0 00-.345-.136c-1.012-.4-2.061-.813-3.035-1.377A8.982 8.982 0 014 7.362c.194-.34.42-.665.67-.962a6.055 6.055 0 011.253-1.131 7.126 7.126 0 011.618-.806c1.218-.434 2.677-.647 4.458-.649 1.783.002 3.241.215 4.459.65a7.097 7.097 0 011.619.805c.471.319.892.699 1.253 1.13.25.298.475.623.67.963-.103.064-.212.129-.32.192-.976.564-2.023.977-3.037 1.376l-.345.136a8.26 8.26 0 00-2.1 1.198 7.519 7.519 0 00-1.975 2.354c-.117.213-.187.259-.224.259m0 7.072c-1.544-.002-2.798-.129-3.83-.387-1.013-.252-1.855-.64-2.576-1.188a5.792 5.792 0 01-1.392-1.537 7.607 7.607 0 01-.81-1.768 10.298 10.298 0 01-.467-2.983c0-.674.047-1.313.135-1.901 1.106.596 2.153.895 3.08 1.16l.215.06c1.29.371 2.314.857 3.135 1.488.475.368.89.793 1.23 1.264.369.508.663 1.088.877 1.725.096.289.2.468.403.468.207 0 .308-.18.405-.468a6.124 6.124 0 012.107-2.988c.82-.632 1.845-1.118 3.135-1.489l.216-.06c.926-.265 1.973-.564 3.078-1.16.09.589.136 1.227.136 1.9 0 .458-.046 1.664-.465 2.984a7.626 7.626 0 01-.809 1.768 5.789 5.789 0 01-1.396 1.537c-.723.548-1.565.936-2.574 1.188-1.035.258-2.288.385-3.833.387m9.692-14.556c-1.909-2.05-4.99-2.99-9.692-2.995-4.7.005-7.781.944-9.69 2.994C.89 6.913 0 9.018 0 11.874c0 1.579.39 5.6 3.564 7.676 1.9 1.242 4.354 2.046 8.435 2.052 4.083-.006 6.536-.81 8.437-2.052C23.609 17.474 24 13.452 24 11.874c0-2.848-.897-4.968-2.31-6.483Z"/></svg>
                    Mazda
                  </button>
                </li>
              </ul>
            </div>


            <div>
              <h4 className="text-[10px] font-extrabold text-stone-300 uppercase tracking-widest mb-4 font-mono">
                {t.followUs}
              </h4>
              <ul className="space-y-4 text-xs text-stone-400">
                <li>
                  <a href="#" className="hover:text-amber-300 transition-colors flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-3 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-300 transition-colors flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-3 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 6.162 4.604 11.233 10.643 11.95z" fillRule="evenodd"/></svg>
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-300 transition-colors flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-3 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.96-.5 3.96-1.82 5.36-1.27 1.3-3.08 2-4.93 1.92-1.99-.1-3.86-1.23-4.83-2.92-1.2-2.11-1.07-4.9.41-6.86 1.25-1.64 3.32-2.4 5.32-2.44v4.11c-1.11.02-2.29.35-2.99 1.25-.66.86-.71 2.1-.13 2.99.53.81 1.55 1.17 2.49 1.05 1-.13 1.84-.96 2.05-1.93.08-.34.11-.69.11-1.04-.02-5.75-.01-11.5-.02-17.25z"/></svg>
                    TikTok
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-300 transition-colors flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-3 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M11.42 21.815a10.024 10.024 0 0 1-5.11-1.402l-.367-.217-3.8.995 1.015-3.7-.24-.38a9.986 9.986 0 0 1-1.535-5.356c0-5.523 4.54-10.038 10.039-10.038 2.68 0 5.192 1.036 7.085 2.92 1.892 1.884 2.932 4.382 2.932 7.042C21.439 17.2 16.924 21.8 11.42 21.8v.015zm0-18.368c-4.57 0-8.315 3.738-8.319 8.35-.002 1.488.384 2.946 1.121 4.225l.135.234-.595 2.169 2.227-.584.251.15c1.248.742 2.673 1.135 4.148 1.136 4.607 0 8.322-3.725 8.327-8.318.002-2.232-.862-4.327-2.433-5.908A8.258 8.258 0 0 0 11.42 3.447v-.001zm4.654 11.758c-.255-.128-1.507-.745-1.74-.83-.233-.086-.403-.128-.573.127-.171.255-.658.831-.806 1.002-.15.17-.298.192-.553.064-.255-.128-1.077-.397-2.052-1.266-.758-.676-1.269-1.51-1.42-1.765-.15-.255-.015-.392.112-.52.114-.114.255-.297.382-.447.128-.15.17-.255.255-.425.085-.17.043-.319-.021-.447-.064-.128-.574-1.383-.787-1.894-.207-.497-.418-.43-.574-.438-.15-.008-.32-.008-.49-.008-.17 0-.447.064-.68.32-.234.255-.893.872-.893 2.128s.915 2.468 1.042 2.638c.128.171 1.796 2.744 4.348 3.844.607.262 1.08.418 1.448.535.608.194 1.162.166 1.597.1.488-.074 1.507-.617 1.72-1.213.213-.596.213-1.106.15-1.213-.064-.106-.235-.17-.49-.297h-.002z"/></svg>
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-300 transition-colors flex items-center group">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mr-3 fill-current opacity-70 group-hover:opacity-100 transition-opacity"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500 font-sans">
            <p>
              {t.copyrightLine}
            </p>
            <div className="flex gap-4">
              <span className="hover:text-stone-300 cursor-pointer">
                {t.privacyPolicy}
              </span>
              <span>•</span>
              <span className="hover:text-stone-300 cursor-pointer">
                {t.termsOfService}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 30 }}
            whileHover={{ scale: 1.1, translateY: -4 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 p-3.5 bg-white text-stone-900 rounded-full shadow-lg border border-stone-200 transition-shadow duration-300 hover:shadow-xl cursor-pointer focus:outline-none"
            aria-label="Back to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Support Floating Button */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        <AnimatePresence>
          {isSupportExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 origin-bottom-left"
            >
              <a
                href="tel:+855966714442"
                className="flex items-center gap-3 px-4 py-3 bg-stone-900 text-white rounded-2xl shadow-lg border border-stone-800 transition-all hover:bg-stone-800 hover:scale-105 active:scale-95"
              >
                <div className="bg-white/10 p-1.5 rounded-full inline-flex">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold font-mono tracking-widest">+855 96 671 4442</span>
              </a>
              <a
                href="https://t.me/+855966714442"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-[#4C0027] text-white rounded-2xl shadow-lg border border-[#4C0027]/80 transition-all hover:bg-[#600030] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="bg-white/10 p-1.5 rounded-full inline-flex">
                  <Send className="w-4 h-4 -rotate-12 -translate-x-0.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Telegram</span>
              </a>
              <a
                href="https://wa.me/855966714442"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg border border-emerald-500 transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="bg-white/10 p-1.5 rounded-full inline-flex">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">WhatsApp</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsSupportExpanded((prev) => !prev)}
          className={`group flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none ${
            isSupportExpanded
              ? "bg-white text-stone-900 border border-stone-200"
              : "bg-[#4C0027] text-white border border-[#4C0027]"
          }`}
        >
          {isSupportExpanded ? (
            <X className="w-5 h-5 transition-transform duration-300 rotate-90 group-hover:rotate-180" />
          ) : (
            <>
              <HelpCircle className="w-5 h-5 animate-pulse" />
              <span className="text-xs flex items-center pt-0.5 font-bold uppercase tracking-widest">
                {t.support}
              </span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
