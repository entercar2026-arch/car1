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
  FileText,
  Check
} from "lucide-react";

interface KhmerContractPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KhmerContractPDFModal: React.FC<KhmerContractPDFModalProps> = ({ isOpen, onClose }) => {
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
  }, []);

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
    document.body.setAttribute("data-print-mode", "contract");
    window.print();
  };

  // Mock download of clean text configuration file
  const handleDownload = () => {
    const textData = `
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
    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Enter_Car_Rental_Contract_KH.txt";
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
              Enter_Car_Rental_Contract_KH.pdf
            </span>
            <span className="text-[10px] text-stone-400 font-mono tracking-wider">
              1.2 MB • Khmer Certified PDF
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono min-w-[45px] text-center font-bold">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-40 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Rotate controls */}
          <div className="flex items-center border-l border-stone-800 pl-4 gap-1">
            <button
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="Rotate Page"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Actions (Print, Download, Fullscreen, Close) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Print Contract Template"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Download Contract Draft"
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
            className="p-1 rounded text-stone-400 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono">Page {activePage} of 3</span>
          <button 
            onClick={() => activePage < 3 && scrollToPage(activePage + 1)}
            disabled={activePage === 3}
            className="p-1 rounded text-stone-400 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-1 text-stone-400 cursor-pointer"><ZoomOut className="w-4 h-4" /></button>
          <span className="font-mono font-bold text-amber-500">{zoom}%</span>
          <button onClick={handleZoomIn} className="p-1 text-stone-400 cursor-pointer"><ZoomIn className="w-4 h-4" /></button>
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
                  <div className="text-center font-bold block scale-[0.8] tracking-tighter leading-none mb-1 text-[4px] font-khmer-moul">ព្រះរាជាណាចក្រកម្ពុជា</div>
                  <div className="text-center tracking-tighter leading-none text-[#4C0027] mb-2 font-bold scale-[0.6]">កិច្ចសន្យាជួលរថយន្ត</div>
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
                  <div className="font-bold scale-[0.7] font-mono text-[3px] mb-1">CONDITIONS CONTINUED</div>
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
                  <div className="font-bold scale-[0.7] text-center mb-1">SIGNATURE BLOCK</div>
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
          className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin flex flex-col items-center gap-8"
        >
          {/* Printable & Zoomable Area Wrapper */}
          <div 
            id="khmer-printable-contract"
            className="flex flex-col items-center gap-10 origin-center transition-all duration-200"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              width: "100%",
              maxWidth: `${820 * (zoom / 100)}px`
            }}
          >

            {/* PAGE 1 */}
            <div 
              ref={page1Ref}
              className="pdf-page bg-white text-stone-900 shadow-xl border border-stone-200 p-8 sm:p-14 w-full text-left relative overflow-hidden select-text tracking-wide font-khmer transition-all duration-150"
              style={{ minHeight: "1123px" }}
            >
              {/* Header Box (Logo + Kingdom text) */}
              <div className="flex flex-col items-center text-center mb-8 relative">
                
                {/* Kingdom Title Header */}
                <div className="flex flex-col gap-0.5 mb-6">
                  <h1 className="font-khmer-moul text-sm sm:text-base tracking-[0.05em] text-stone-900 leading-relaxed font-bold">
                    ព្រះរាជាណាចក្រកម្ពុជា
                  </h1>
                  <h2 className="font-khmer-moul text-xs sm:text-sm tracking-[0.05em] text-stone-900 font-bold">
                    ជាតិ សាសនា ព្រះមហាក្សត្រ
                  </h2>
                  <div className="text-center mt-1 font-bold text-xs tracking-widest text-stone-800">
                    *****
                  </div>
                </div>

                {/* Grid layout for Logo and Title */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-12 gap-4 items-center border-t-2 border-stone-800 pt-6 mt-4">
                  
                  {/* Logo block */}
                  <div className="sm:col-span-4 flex items-center justify-start gap-2.5">
                    <div className="w-12 h-12 rounded-xl bg-[#4C0027] flex items-center justify-center text-white shrink-0 shadow-md font-bold text-center">
                      <span className="text-xs font-serif italic text-amber-400">Enter</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-xs tracking-tight uppercase text-stone-900 font-sans block leading-none">
                        ENTER CAR RENTAL
                      </span>
                      <span className="text-[8px] font-mono text-stone-500 tracking-wider">
                        PROFESSIONAL CAR SERVICES
                      </span>
                    </div>
                  </div>

                  {/* Document Title header block */}
                  <div className="sm:col-span-8 flex flex-col text-right sm:items-end">
                    <h3 className="font-khmer-moul text-[#4C0027] text-base sm:text-xl font-black tracking-normal leading-relaxed">
                      កិច្ចសន្យាជួលរថយន្ត
                    </h3>
                    <span className="font-serif italic font-bold text-[9px] sm:text-xs text-stone-500 tracking-wider uppercase block leading-none mt-1">
                      CAR RENTAL CONTRACT
                    </span>
                  </div>
                </div>

                <div className="w-full border-b-[3px] border-[#4C0027] mt-3" />
              </div>

              {/* Sub-header prompt */}
              <p className="text-[12px] sm:text-sm leading-relaxed text-stone-800 mb-6 font-semibold">
                កិច្ចសន្យា នេះ ត្រូវបានធ្វើឡើងនៅថ្ងៃទី <span className="font-mono text-stone-400">..../..../....</span> រវាងគូភាគីដូចខាងក្រោម៖
              </p>

              {/* SECTION ក: ម្ចាស់រថយន្ត BOX */}
              <div className="border border-stone-300 rounded-xl overflow-hidden mb-6 bg-stone-50/50 shadow-xs">
                <div className="bg-[#4C0027]/10 px-4 py-2.5 border-b border-stone-200 flex justify-between items-center">
                  <h4 className="font-khmer-moul text-xs sm:text-sm text-[#4C0027] font-semibold flex items-center gap-2">
                    <span className="text-[10px] w-5 h-5 bg-[#4C0027] text-white flex items-center justify-center rounded-full font-sans font-bold">ក</span>
                    ភាគី (ក)៖ ម្ចាស់រថយន្ត (ម្ចាស់ផ្ទាល់)
                  </h4>
                </div>
                <div className="p-4 sm:p-5 text-xs sm:text-[13px] leading-8 text-stone-800 flex flex-col gap-3">
                  <div>
                    ឈ្មោះពេញ៖ <span className="font-mono tracking-widest text-stone-400">...........................................................................................................</span>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      ភេទ៖ 
                      <span className="inline-flex items-center gap-1.5 ml-1"><span className="w-3.5 h-3.5 border border-stone-400 rounded-xs inline-block" /> ប្រុស</span>
                      <span className="inline-flex items-center gap-1.5 ml-4"><span className="w-3.5 h-3.5 border border-stone-400 rounded-xs inline-block" /> ស្រី</span>
                    </div>
                    <div>
                      អាយុ៖ <span className="font-mono text-stone-400">..........</span> ឆ្នាំ
                    </div>
                    <div>
                      សញ្ជាតិ៖ <span className="font-bold">ខ្មែរ</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-[#4C0027] text-white flex items-center justify-center rounded-sm"><Check className="w-3 h-3 text-amber-400" /></span>
                      អត្តសញ្ញាណប័ណ្ណ
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 border border-stone-400 rounded-sm inline-block" />
                      លិខិតឆ្លងដែន
                    </div>
                    <div className="flex-1">
                      លេខ៖ <span className="font-mono tracking-widest text-stone-400">...........................................................................................................</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-3 border-t border-stone-200/80">
                    <span className="font-semibold text-stone-900 block mb-1">ត្រូវជាម្ចាស់កម្មសិទ្ធិស្របច្បាប់លើរថយន្ត៖</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      <div>ម៉ាក៖ <span className="font-mono tracking-widest text-stone-400">..................................................</span></div>
                      <div>ពណ៌៖ <span className="font-mono tracking-widest text-stone-400">..................................................</span></div>
                      <div>ឆ្នាំផលិត៖ <span className="font-mono tracking-widest text-stone-400">...............................................</span></div>
                      <div>ស្លាកលេខ៖ <span className="font-mono tracking-widest text-stone-400">.............................................</span></div>
                      <div>លេខតួ៖ <span className="font-mono tracking-widest text-stone-400">...............................................</span></div>
                      <div>លេខម៉ាស៊ីន៖ <span className="font-mono tracking-widest text-stone-400">............................................</span></div>
                    </div>
                  </div>

                  <div className="text-right mt-1.5 font-mono text-[10px] text-stone-500 italic block">
                    ចាប់ពីពេលនេះតទៅហៅកាត់ថា «ភាគី (ក)»
                  </div>
                </div>
              </div>

              {/* SECTION ខ: អ្នកជួលរថយន្ត BOX */}
              <div className="border border-stone-300 rounded-xl overflow-hidden mb-6 bg-stone-50/50 shadow-xs">
                <div className="bg-[#4C0027]/10 px-4 py-2.5 border-b border-stone-200 flex justify-between items-center">
                  <h4 className="font-khmer-moul text-xs sm:text-sm text-[#4C0027] font-semibold flex items-center gap-2">
                    <span className="text-[10px] w-5 h-5 bg-[#4C0027] text-white flex items-center justify-center rounded-full font-sans font-bold">ខ</span>
                    ភាគី (ខ)៖ អ្នកជួលរថយន្ត
                  </h4>
                </div>
                <div className="p-4 sm:p-5 text-xs sm:text-[13px] leading-8 text-stone-800 flex flex-col gap-3">
                  <div>
                    ឈ្មោះពេញ៖ <span className="font-mono tracking-widest text-stone-400">...........................................................................................................</span>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div className="flex items-center gap-2">
                      ភេទ៖ 
                      <span className="inline-flex items-center gap-1.5 ml-1"><span className="w-3.5 h-3.5 border border-stone-400 rounded-xs inline-block" /> ប្រុស</span>
                      <span className="inline-flex items-center gap-1.5 ml-4"><span className="w-3.5 h-3.5 border border-stone-400 rounded-xs inline-block" /> ស្រី</span>
                    </div>
                    <div>
                      អាយុ៖ <span className="font-mono text-stone-400">..........</span> ឆ្នាំ
                    </div>
                    <div>
                      សញ្ជាតិ៖ <span className="font-bold">ខ្មែរ</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-[#4C0027] text-white flex items-center justify-center rounded-sm"><Check className="w-3 h-3 text-amber-400" /></span>
                      អត្តសញ្ញាណប័ណ្ណ
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 border border-stone-400 rounded-sm inline-block" />
                      លិខិតឆ្លងដែន
                    </div>
                    <div className="flex-1">
                      លេខ៖ <span className="font-mono tracking-widest text-stone-400">...........................................................................................................</span>
                    </div>
                  </div>

                  <div className="text-right mt-1.5 font-mono text-[10px] text-stone-500 italic block">
                    ចាប់ពីពេលនេះតទៅហៅកាត់ថា «ភាគី (ខ)»
                  </div>
                </div>
              </div>

              {/* Pre-terms statement */}
              <p className="text-[11px] sm:text-[13px] text-stone-900 font-bold mb-5 italic border-l-4 border-[#4C0027] pl-3">
                គូភាគីទាំងពីរបានព្រមព្រៀងគ្នាខ្ជាប់ខ្ជួនលើលក្ខខណ្ឌនានាដូចខាងក្រោម៖
              </p>

              {/* TERMS LAYOUT ON PAGE 1 */}
              <div className="flex flex-col gap-4 text-xs sm:text-[13px] leading-relaxed text-stone-800">
                <div>
                  <h5 className="font-bold text-stone-900 font-khmer-moul text-xs sm:text-sm mb-1 text-[#4C0027]">
                    ប្រការ 1៖ កម្មវត្ថុនៃការជួល
                  </h5>
                  <p className="pl-4">
                    ភាគី (ក) យល់ព្រមជួល ហើយភាគី (ខ) យល់ព្រមជួលរថយន្តដែលបានកំណត់អត្តសញ្ញាណក្នុងចំណុចខាងលើ ដែលជាកម្មសិទ្ធិស្របច្បាប់របស់ភាគី (ក)។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-stone-900 font-khmer-moul text-xs sm:text-sm mb-1 text-[#4C0027]">
                    ប្រការ 2៖ គោលបំណងនៃការប្រើប្រាស់
                  </h5>
                </div>
              </div>

              {/* Page Number footer */}
              <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-xs text-stone-400 font-bold">
                Page 1 of 3
              </div>
            </div>


            {/* PAGE 2 */}
            <div 
              ref={page2Ref}
              className="pdf-page bg-white text-stone-900 shadow-xl border border-stone-200 p-8 sm:p-14 w-full text-left relative overflow-hidden select-text tracking-wide font-khmer transition-all duration-150"
              style={{ minHeight: "1123px" }}
            >
              <div className="flex flex-col gap-5 text-xs sm:text-[13px] leading-relaxed text-stone-800 pt-4">
                
                <p className="pl-4">
                  ភាគី (ខ) ជួលរថយន្តនេះ ដើម្បីប្រើប្រាស់ក្នុងគោលបំណង៖ <span className="font-bold text-stone-900">ដំណើរការកម្សាន្តលក្ខណៈគ្រួសារ</span>។ ភាគី (ខ) មិនអាចយករថយន្តនេះ ទៅធ្វើអាជីវកម្ម ឬប្រើប្រាស់ក្រៅពីគោលបំណងខាងលើបានឡើយ លុះត្រាតែមានការយល់ព្រមជាលាយលក្ខណ៍អក្សរជាមុនពីភាគី (ក)។
                </p>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 3៖ រយៈពេលនៃកិច្ចសន្យា
                  </h5>
                  <p className="pl-4">
                    កិច្ចសន្យានេះមានសុពលភាពរយៈពេល <span className="font-bold text-stone-900 border-b border-stone-900 pb-0.5 px-3">1 ខែ</span> ដោយគិតចាប់ពីថ្ងៃទី <span className="font-bold text-[#4C0027] font-mono">20/06/2026</span> រហូតដល់ថ្ងៃទី <span className="font-bold text-[#4C0027] font-mono">20/07/2026</span> ។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 4៖ ថ្លៃជួលរថយន្ត
                  </h5>
                  <p className="pl-4 leading-8">
                    ថ្លៃជួលរថយន្តនេះ ត្រូវបានកំណត់ចំនួន <span className="font-mono text-stone-400">........................</span> ដុល្លារអាមេរិក (USD) ក្នុងមួយខែ (ឬក្នុងមួយថ្ងៃ)។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 5៖ ប្រាក់កក់
                  </h5>
                  <p className="pl-4 leading-7">
                    ភាគី (ខ) ត្រូវប្រគល់ប្រាក់កក់ចំនួន <span className="font-mono text-stone-400">........................</span> ដុល្លារអាមេរិក (USD) ជូនភាគី (ក) នៅពេលចុះកិច្ចសន្យានេះ។ ប្រាក់កក់នេះ នឹងត្រូវប្រើប្រាស់ដើម្បីទូទាត់រាល់ការខូចខាតទាំងឡាយដែលបង្កឡើងដោយចេតនា ឬអចេតនាដោយទង្វើរបស់ភាគី (ខ) ក្នុងអំឡុងពេលជួល។ ប្រាក់កក់នេះ នឹងត្រូវប្រគល់ជូនភាគី (ខ) វិញទាំងស្រុង ក្រោយពេលបញ្ចប់កិច្ចសន្យា និងបន្ទាប់ពីការពិនិត្យឃើញថារថយន្តគ្មានការខូចខាត។ ករណីភាគី (ខ) បញ្ឈប់កិច្ចសន្យាមុនកំណត់ ប្រាក់កក់នេះ នឹងត្រូវរឹបអូសដោយស្វ័យប្រវត្តដោយភាគី (ក)។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 6៖ របៀបនៃការបង់ប្រាក់
                  </h5>
                  <p className="pl-4 leading-8">
                    ភាគី (ខ) ត្រូវបង់ប្រាក់ឈ្នួលជួលរថយន្តឱ្យបានទៀងទាត់ជាប្រចាំខែ ដោយត្រូវបង់ជូនភាគី (ក) នៅរៀងរាល់ថ្ងៃទី <span className="font-mono text-stone-400">...........</span> នៃខែនីមួយៗ។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 7៖ ការហាមឃាត់ការជួលបន្ត
                  </h5>
                  <p className="pl-4">
                    ភាគី (ខ) មិនអាចយករថយន្តដែលជួលពីភាគី (ក) ទៅជួលបន្ត ធ្វើអាជីវកម្មបន្ត ឬផ្ទេរការប្រើប្រាស់ទៅឱ្យតតិយជន (ជនទីបី) ដោយគ្មានការអនុញ្ញាតជាលាយលក្ខណ៍អក្សរពីភាគី (ក) ដែលជាម្ចាស់រថយន្តឡើយ។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 8៖ ការទទួលខុសត្រូវចំពោះមុខច្បាប់
                  </h5>
                  <p className="pl-4">
                    ក្នុងករណីភាគី (ខ) ប្រព្រឹត្តសកម្មភាពល្មើសច្បាប់ណាមួយដោយប្រើប្រាស់រថយន្តជួលនេះ ក្នុងអំឡុងពេលជួល ភាគី (ខ) ត្រូវទទួលខុសត្រូវចំពោះមុខច្បាប់តែម្នាក់ឯងគត់ ដោយមិនពាក់ព័ន្ធនឹងភាគី (ក) ឡើយ។ ភាគី (ក) មិនទទួលខុសត្រូវរាល់ការខូចខាត ឬការបាត់បង់ណាមួយដែលកើតចេញពីការប្រើប្រាស់រថយន្តរបស់ភាគី (ខ) ឡើយ។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 9៖ ករណីខូចខាតរថយន្ត
                  </h5>
                  <div className="pl-4 flex flex-col gap-2.5">
                    <p>
                      <span className="font-bold text-stone-900">9.1៖</span> ករណីរថយន្តមានការខូចខាតតិចតួច ឬធ្ងន់ធ្ងរ ដោយសារការប្រើប្រាស់ធ្វេសប្រហែស ឬកំហុសរបស់ភាគី (ខ) ការចំណាយលើការជួសជុលជាបន្ទុករបស់ភាគី (ខ) ទាំងស្រុង។ លើកលែងតែការសឹករិល ឬការខូចខាតដោយសារកត្តាប្រើប្រាស់ធម្មជាតិ (Wear and Tear) ទើបជាបន្ទុករបស់ភាគី (ក)។
                    </p>
                    <p>
                      <span className="font-bold text-stone-900">9.2៖</span> ភាគី (ខ) ត្រូវទទួលខុសត្រូវទាំងស្រុងលើករណីរថយន្តខូចខាតធ្ងន់ធ្ងរ (ដូចជា បុក ក្រឡាប់ ធ្លាក់ទឹក ចោរលួច ឆេះ ឬឧប្បត្តិហេតុផ្សេងៗ) ដោយត្រូវសងសំណងតាមការព្រមព្រៀងគ្នាស្មើនឹង <span className="font-bold underline text-[#4C0027] decoration-amber-500 decoration-2">តាមតម្លៃទីផ្សារជាក់ស្តែង</span> ជូនភាគី (ក)។
                    </p>
                    <p>
                      <span className="font-bold text-stone-900">9.3៖</span> ករណីភាគី (ខ) ប្រើប្រាស់រថយន្តមានការប៉ះទង្គិច ឬឆ្កូត ត្រូវតែជូនដំណឹងដល់ភាគី (ក) ជាបន្ទាន់។ មិនអនុញ្ញាតឱ្យភាគី (ខ) លាក់បាំងព័ត៌មាន រួចយកថយន្តទៅជួសជុលដោយគ្មានការឯកភាពពីភាគី (ក) ឡើយ។
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 10៖ ការធានាខុសត្រូវរដ្ឋប្បវេណី និងព្រហ្មទណ្ឌ
                  </h5>
                  <p className="pl-4">
                    រាល់ការខូចខាត ឬគ្រោះថ្នាក់ចរាចរណ៍ ការដឹកជញ្ជូនទំនិញខុសច្បាប់ ការរត់ពន្ធ ឬសកម្មភាពខុសច្បាប់ផ្សេងៗទៀតដែលកើតឡើងក្នុងអំឡុងពេលជួលនេះ ភាគី (ខ) ត្រូវទទួលខុសត្រូវទាំងស្រុងចំពោះមុខច្បាប់ទាំងផ្នែកព្រហ្មទណ្ឌ និងរដ្ឋប្បវេណី។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 11៖ ការរំលាយកិច្ចសន្យា
                  </h5>
                  <p className="pl-4">
                    ករណីភាគី (ខ) មិនអនុវត្តកាតព្វកិច្ចបង់ប្រាក់ឈ្នួល ឬបង់ប្រាក់យឺតយ៉ាវលើសពី 7 (ប្រាំពីរ) ថ្ងៃ ឬរំលោភលើខសន្យាណាមួយ ភាគី (ក) មានសិទ្ធិរំលាយកិច្ចសន្យានេះភ្លាមៗ ព្រមទាំងមានសិទ្ធិដកហូតយករថយន្តមកវិញនៅគ្រប់ពេលវេលា ដោយមិនបាច់ជូនដំណឹងជាមុន និងមិនបង្វិលប្រាក់កក់
                  </p>
                </div>
              </div>

              {/* Page Number footer */}
              <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-xs text-stone-400 font-bold">
                Page 2 of 3
              </div>
            </div>


            {/* PAGE 3 */}
            <div 
              ref={page3Ref}
              className="pdf-page bg-white text-stone-900 shadow-xl border border-stone-200 p-8 sm:p-14 w-full text-left relative overflow-hidden select-text tracking-wide font-khmer transition-all duration-150"
              style={{ minHeight: "1123px" }}
            >
              <div className="flex flex-col gap-5 text-xs sm:text-[13px] leading-relaxed text-stone-800 pt-4">
                
                <p className="mb-4">ឡើយ។</p>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 12៖ ដែនកំណត់នៃការប្រើប្រាស់
                  </h5>
                  <p className="pl-4 leading-8">
                    រថយន្តជួលក្នុងកិច្ចសន្យានេះ អនុញ្ញាតឱ្យភាគី (ខ) ប្រើប្រាស់ក្នុងតំបន់/បរិវេណ៖ <span className="font-mono text-stone-400">.....................................................</span> ។ ករណីភាគី (ខ) ចង់ប្រើប្រាស់ក្រៅតំបន់ ឬឆ្លងទៅបណ្តាខេត្តផ្សេងៗ ត្រូវជូនដំណឹងសុំការអនុញ្ញាតពីភាគី (ក) ជាមុន ហើយភាគី (ខ) ត្រូវទទួលខុសត្រូវរាល់ការចំណាយ និងហានិភ័យទាំងស្រុង។
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 13៖ ភាពស្មោះត្រង់ និងការកែប្រែកិច្ចសន្យា
                  </h5>
                  <div className="pl-4 flex flex-col gap-2.5">
                    <p>
                      <span className="font-bold text-stone-900">13.1៖</span> កិច្ចសន្យានេះធ្វើឡើងដោយការព្រមព្រៀងពិតប្រាកដ និងដោយស្ម័គ្រចិត្តពីគូភាគីទាំងសងខាងលើគ្រប់លក្ខខណ្ឌទាំងអស់។
                    </p>
                    <p>
                      <span className="font-bold text-stone-900">13.2៖</span> រាល់ការកែប្រែកិច្ចសន្យា មិនអាចធ្វើឡើងដោយឯកតោភាគីបានឡើយ ពោលគឺត្រូវតែមានការព្រមព្រៀងជាលាយលក្ខណ៍អក្សរពីភាគីទាំងពីរ។
                    </p>
                    <p>
                      <span className="font-bold text-stone-900">13.3៖</span> គូភាគីត្រូវអនុវត្តកាតព្វកិច្ចរៀងៗខ្លួនដោយសុចរិតភាព និងសមភាព។ ភាគីណាដែលបំពានខសន្យា ត្រូវទទួលខុសត្រូវចំពោះមុខច្បាប់ជាធរមាន។
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-[#4C0027] font-khmer-moul text-xs sm:text-sm mb-1.5">
                    ប្រការ 14៖ ច្បាប់គ្រប់គ្រង និងប្រសិទ្ធភាព
                  </h5>
                  <div className="pl-4 flex flex-col gap-2.5">
                    <p>
                      <span className="font-bold text-stone-900">14.1៖</span> កិច្ចសន្យានេះត្រូវគ្រប់គ្រង និងបកស្រាយស្របតាមច្បាប់ និងបទប្បញ្ញត្តិនានានៃព្រះរាជាណាកម្ពុជា។
                    </p>
                    <p>
                      <span className="font-bold text-stone-900">14.2៖</span> កិច្ចសន្យានេះមានប្រសិទ្ធភាពអនុវត្តចាប់ពីពេលដែលគូភាគីទាំងពីរបានចុះហត្ថលេខា ឬផ្តិតមេដៃទទួលយក។
                    </p>
                  </div>
                </div>

                {/* Signing Date block right-aligned */}
                <div className="text-right font-semibold text-stone-900 mt-8 mb-4 pr-10">
                  ធ្វើនៅថ្ងៃទី <span className="font-mono text-stone-400">..../..../....</span>
                </div>

                {/* SIGNATURE COLUMNS - Three clean columns exactly like the PDF */}
                <div className="grid grid-cols-3 gap-6 text-center mt-6 pt-4 border-t border-stone-200">
                  
                  {/* Column 1: Party A */}
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-stone-900 text-[11px] sm:text-[13px] leading-relaxed block">
                      ភាគី (ក) / ម្ចាស់រថយន្ត
                    </span>
                    <span className="text-[10px] text-stone-400 italic block mt-1">
                      (ហត្ថលេខា ឬ ស្នាមមេដៃ)
                    </span>
                    <div className="h-16" />
                    <span className="text-[11px] text-stone-700 block font-mono">
                      ឈ្មោះ ៖ ...................................
                    </span>
                  </div>

                  {/* Column 2: Witness */}
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-stone-900 text-[11px] sm:text-[13px] leading-relaxed block">
                      សាក្សី
                    </span>
                    <span className="text-[10px] text-stone-400 italic block mt-1">
                      (ហត្ថលេខា ឬ ស្នាមមេដៃ)
                    </span>
                    <div className="h-16" />
                    <span className="text-[11px] text-stone-700 block font-mono">
                      ឈ្មោះ ៖ ...................................
                    </span>
                  </div>

                  {/* Column 3: Party B */}
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-stone-900 text-[11px] sm:text-[13px] leading-relaxed block">
                      ភាគី (ខ) / អ្នកជួលរថយន្ត
                    </span>
                    <span className="text-[10px] text-stone-400 italic block mt-1">
                      (ហត្ថលេខា ឬ ស្នាមមេដៃ)
                    </span>
                    <div className="h-16" />
                    <span className="text-[11px] text-stone-700 block font-mono">
                      ឈ្មោះ ៖ ...................................
                    </span>
                  </div>

                </div>
              </div>

              {/* Page Number footer */}
              <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-xs text-stone-400 font-bold">
                Page 3 of 3
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
