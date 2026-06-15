import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  FileText
} from "lucide-react";
import { PrintContractDoc } from "./PrintContractDoc";

interface KhmerContractPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "kh" | "en" | "zh";
}

export const KhmerContractPDFModal: React.FC<KhmerContractPDFModalProps> = ({ isOpen, onClose, lang = "kh" }) => {
  const [zoom, setZoom] = useState(100);
  const [activePage, setActivePage] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Synced scroll tracking to update the page number control
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const element = scrollContainerRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      const pageHeight = scrollHeight / 3;
      const currentScrollPage = Math.min(
        3,
        Math.max(1, Math.round((scrollTop + clientHeight / 2) / pageHeight) + 1)
      );
      
      setActivePage(currentScrollPage);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isOpen]);

  const scrollToPage = (pageNumber: number) => {
    setActivePage(pageNumber);
    const targetRef = pageNumber === 1 ? page1Ref : pageNumber === 2 ? page2Ref : page3Ref;
    if (targetRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: targetRef.current.offsetTop - 24,
        behavior: "smooth"
      });
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 15));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 15));
  };

  const handleToggleFullscreen = () => {
    refFullScreen();
  };

  const refFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Mock download of clean text configuration file
  const handleDownload = () => {
    let textData = "";
    let downloadFilename = "";
    if (lang === "kh") {
      textData = `
========== ENTER CAR RENTAL CONTRACT (KHMER) ==========
ព្រះរាជាណាចក្រកម្ពុជា
ជាតិ សាសនា ព្រះមហាក្សត្រ
*****
កិច្ចសន្យាជួលរថយន្ត / CAR RENTAL CONTRACT

កិច្ចសន្យានេះ ត្រូវបានធ្វើឡើងនៅថ្ងៃទី ..../..../.... រវាងគូភាគី៖
ភាគី (ក)៖ ម្ចាស់រថយន្ត (ម្ចាស់ផ្ទាល់)
ភាគី (ខ)៖ អ្នកជួលរថយន្ត

ប្រការនានានៃកិច្ចសន្យា៖
ប្រការ 1-14 លម្អិតស្របតាមច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។
      `;
      downloadFilename = "Enter_Car_Rental_Contract_KH.txt";
    } else if (lang === "zh") {
      textData = `
========== ENTER CAR RENTAL CONTRACT (CHINESE) ==========
柬埔寨王国
民族 • 宗教 • 国王
*****
汽车租赁合同 / CAR RENTAL CONTRACT

本租赁合同由以下双方于 2026年....月....日 自愿签署：
甲方（出借方）：车辆合法所有人
乙方（承租方）：车辆承租人

合同条款：
第1至14条 柬埔寨法律条款细节。
      `;
      downloadFilename = "Enter_Car_Rental_Contract_ZH.txt";
    } else {
      textData = `
========== ENTER CAR RENTAL CONTRACT (ENGLISH) ==========
KINGDOM OF CAMBODIA
NATION - RELIGION - KING
*****
CAR RENTAL LEASE AGREEMENT

This lease agreement is made and executed on: ..../..../2026 by and between:
PARTY (A): VEHICLE OWNER (LESSOR)
PARTY (B): VEHICLE RENTER (LESSEE)

Terms and conditions:
Articles 1 to 14 in compliance with the laws of Cambodia.
      `;
      downloadFilename = "Enter_Car_Rental_Contract_EN.txt";
    }
    const blob = new Blob([textData.trim()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden font-sans no-print select-none">
      
      {/* 1. TOP BAR TOOLBAR (Adobe Reader style sleek desktop header) */}
      <header className="h-14 bg-stone-950 text-stone-200 px-4 flex items-center justify-between border-b border-stone-800 shrink-0 z-10 shadow-md">
        
        {/* Left Side: Logo & Filename */}
        <div className="flex items-center gap-3">
          <div className="bg-[#4C0027] p-2 rounded-lg shadow-inner flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wider text-stone-150 truncate max-w-[200px] sm:max-w-[340px]">
              {lang === "kh" ? "Enter_Car_Rental_Contract_KH.pdf" : lang === "zh" ? "Enter_Car_Rental_Contract_ZH.pdf" : "Enter_Car_Rental_Contract_EN.pdf"}
            </span>
            <span className="text-[10px] text-stone-400 font-mono tracking-wider">
              1.2 MB • {lang === "kh" ? "Khmer Certified PDF" : lang === "zh" ? "Chinese Certified PDF" : "English Certified PDF"}
            </span>
          </div>
        </div>

        {/* Center: Controls - Page nav and Zoom */}
        <div className="hidden md:flex items-center gap-6 bg-stone-900 px-4 py-1.5 rounded-full border border-stone-800">
          
          {/* Page controls */}
          <div className="flex items-center gap-2 border-r border-stone-800 pr-4">
            <button
              onClick={() => activePage > 1 && scrollToPage(activePage - 1)}
              disabled={activePage === 1}
              className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs tracking-wider min-w-[70px] text-center font-mono">
              Page <span className="bg-stone-950 px-2 py-0.5 rounded text-amber-400 font-bold border border-stone-800">{activePage}</span> of 3
            </span>
            <button
              onClick={() => activePage < 3 && scrollToPage(activePage + 1)}
              disabled={activePage === 3}
              className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-3 border-r border-stone-800 pr-4 text-stone-300">
            <button 
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-stone-800 active:scale-95 transition-all text-stone-400 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold tracking-wider min-w-[40px] text-center">
              {zoom}%
            </span>
            <button 
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-stone-800 active:scale-95 transition-all text-stone-400 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Rotate control */}
          <button
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Tools Buttons & Close */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button
            onClick={() => setShowSidebar(prev => !prev)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showSidebar 
                ? "bg-[#4C0027] border-[#4C0027] text-white" 
                : "bg-stone-900 border-stone-800 hover:bg-stone-800 text-stone-400"
            }`}
            title="Toggle Page Navigation Sidebar"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Print Contract Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Download Contract Code/Text"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="hidden sm:inline-flex p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Viewer"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <div className="h-6 w-[1px] bg-stone-800 mx-1 sm:mx-2" />

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer border border-red-900/45"
            title="Close Viewer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* 2. VIEWER SUB-BAR (Showing on mobile to ensure mobile navigation is super easy) */}
      <div className="md:hidden h-11 bg-stone-900 text-stone-300 px-4 flex items-center justify-between border-b border-stone-800 shrink-0 z-10 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => activePage > 1 && scrollToPage(activePage - 1)}
            disabled={activePage === 1}
            className="p-1 rounded bg-stone-950 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono px-2 text-[11px]">
            Page {activePage} of 3
          </span>
          <button
            onClick={() => activePage < 3 && scrollToPage(activePage + 1)}
            disabled={activePage === 3}
            className="p-1 rounded bg-stone-950 disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-stone-950"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] bg-stone-950 px-1.5 py-0.5 rounded">
            {zoom}%
          </span>
          <button 
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-stone-950"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. CORE VIEWER BODY */}
      <div className="flex flex-1 overflow-hidden bg-stone-800 relative">
        
        {/* Left Page Thumbnails Bar (Fully styled PDF sidebar) */}
        {showSidebar && (
          <aside className="hidden lg:flex flex-col w-[200px] border-r border-stone-800 bg-stone-900 shrink-0 select-none overflow-y-auto p-4 gap-6 scrollbar-thin">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1 font-mono">
              Page Thumbnails
            </h4>

            {/* Thumbnail page 1 */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => scrollToPage(1)}
                className={`group text-left border rounded-lg overflow-hidden transition-all duration-200 outline-hidden ${
                  activePage === 1 ? "border-amber-500 ring-2 ring-amber-500/20" : "border-stone-800 hover:border-stone-600"
                }`}
              >
                <div className="aspect-[1/1.414] bg-stone-50 p-2 text-[2.5px] font-khmer text-stone-800 opacity-80 group-hover:opacity-100 transition-opacity line-clamp-10 select-none scale-100 origin-top overflow-hidden">
                  <div className="text-center font-bold block scale-[0.8] tracking-tighter leading-none mb-1 text-[4px] font-khmer-moul">
                    {lang === "kh" ? "ព្រះរាជាណាចក្រកម្ពុជា" : lang === "zh" ? "柬埔寨王国" : "KINGDOM OF CAMBODIA"}
                  </div>
                  <div className="text-center tracking-tighter leading-none text-[#4C0027] mb-2 font-bold scale-[0.6]">
                    {lang === "kh" ? "កិច្ចសន្យាជួលរថយន្ត" : lang === "zh" ? "汽车租赁合同" : "LEASE AGREEMENT"}
                  </div>
                  <div className="h-4 w-full bg-stone-200 mb-1 rounded-xs" />
                  <div className="h-6 w-full bg-stone-100 rounded-xs" />
                </div>
              </button>
              <span className="text-[11px] font-mono font-semibold text-center text-stone-400">Page 1</span>
            </div>

            {/* Thumbnail page 2 */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => scrollToPage(2)}
                className={`group text-left border rounded-lg overflow-hidden transition-all duration-200 outline-hidden ${
                  activePage === 2 ? "border-amber-500 ring-2 ring-amber-500/20" : "border-stone-800 hover:border-stone-600"
                }`}
              >
                <div className="aspect-[1/1.414] bg-stone-50 p-2 text-[2.5px] font-khmer text-stone-800 opacity-80 group-hover:opacity-100 transition-opacity line-clamp-10 select-none scale-100 origin-top overflow-hidden">
                  <div className="font-bold scale-[0.7] font-mono text-[3px] mb-1">
                    {lang === "kh" ? "ប្រការនៃកិច្ចសន្យា" : lang === "zh" ? "租赁合同条款" : "LEASE CONDITIONS"}
                  </div>
                  <div className="h-2 w-full bg-stone-200 mb-1 rounded-xs" />
                  <div className="h-2 w-full bg-stone-100 mb-1 rounded-xs" />
                  <div className="h-2 w-full bg-stone-200 mb-1 rounded-xs" />
                  <div className="h-2 w-full bg-stone-100 mb-1 rounded-xs" />
                </div>
              </button>
              <span className="text-[11px] font-mono font-semibold text-center text-stone-400">Page 2</span>
            </div>

            {/* Thumbnail page 3 */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => scrollToPage(3)}
                className={`group text-left border rounded-lg overflow-hidden transition-all duration-200 outline-hidden ${
                  activePage === 3 ? "border-amber-500 ring-2 ring-amber-500/20" : "border-stone-800 hover:border-stone-600"
                }`}
              >
                <div className="aspect-[1/1.414] bg-stone-50 p-2 text-[2.5px] font-khmer text-stone-800 opacity-80 group-hover:opacity-100 transition-opacity line-clamp-10 select-none scale-100 origin-top overflow-hidden">
                  <div className="font-bold scale-[0.7] text-center mb-1">
                    {lang === "kh" ? "ហត្ថលេខាភាគី" : lang === "zh" ? "签字盖章栏" : "SIGNATURE BLOCKS"}
                  </div>
                  <div className="h-4 w-full bg-stone-200 mb-1 rounded-xs" />
                  <div className="h-4 w-full bg-stone-200 mb-1 rounded-xs" />
                  <div className="grid grid-cols-2 gap-1 mt-3">
                    <div className="h-3 bg-stone-300 rounded-xs" />
                    <div className="h-3 bg-stone-300 rounded-xs" />
                  </div>
                </div>
              </button>
              <span className="text-[11px] font-mono font-semibold text-center text-stone-400">Page 3</span>
            </div>
          </aside>
        )}

        {/* Core Scroll Viewport */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin flex flex-col items-center gap-8 animate-fade-in"
        >
          {/* Printable & Zoomable Area Wrapper */}
          <div 
            id="khmer-printable-contract"
            className="flex flex-col items-center gap-10 origin-center transition-all duration-200 max-w-full"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              width: "100%",
              maxWidth: `${820 * (zoom / 100)}px`
            }}
          >
            <PrintContractDoc 
              lang={lang} 
              page1Ref={page1Ref} 
              page2Ref={page2Ref} 
              page3Ref={page3Ref} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
