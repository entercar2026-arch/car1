import React, { useState, useEffect } from "react";
import { Car } from "../types";
import { getCarImageSrc, getFallbackCarThumbnail } from "../utils/carImage";
import { QRCodeSVG } from "qrcode.react";

interface QuotationDocumentContentProps {
  printedCars: Car[];
  lang: string;
  t: any;
  setLightboxCar?: (car: Car) => void;
  setLightboxIndex?: (idx: number) => void;
}

const convertUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert blob to base64 string"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
};

export const QuotationDocumentContent: React.FC<QuotationDocumentContentProps> = ({
  printedCars,
  lang,
  t,
  setLightboxCar,
  setLightboxIndex,
}) => {
  const catalogUrl = typeof window !== "undefined" ? window.location.origin : "https://enter.v1";
  const [resolvedImages, setResolvedImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    
    const loadImages = async () => {
      const urls: Record<string, string> = {};
      
      await Promise.all(
        printedCars.map(async (car) => {
          const primarySrc = getCarImageSrc(car);
          try {
            const base64 = await convertUrlToBase64(primarySrc);
            urls[car.id] = base64;
          } catch {
            const fallbackSrc = getFallbackCarThumbnail(car.name, car.category);
            try {
              const base64Fallback = await convertUrlToBase64(fallbackSrc);
              urls[car.id] = base64Fallback;
            } catch {
              urls[car.id] = "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><rect width="100%" height="100%" fill="#f5f5f4"/><text x="50%" y="50%" font-family="sans-serif" font-size="8" fill="#4C0027" font-weight="bold" text-anchor="middle" dominant-baseline="middle">ENTER CAR RENTAL</text></svg>`);
            }
          }
        })
      );
      
      if (isMounted) {
        setResolvedImages(urls);
      }
    };
    
    loadImages();
    return () => {
      isMounted = false;
    };
  }, [printedCars]);

  // Dynamic Page Partitioning Algorithm for Premium Stationery Paginated Layout
  const pages: {
    cars: Car[];
    isFirst: boolean;
    isLast: boolean;
    pageNumber: number;
  }[] = [];

  if (printedCars.length === 0) {
    // Empty fallback
  } else if (printedCars.length <= 2) {
    pages.push({
      cars: printedCars,
      isFirst: true,
      isLast: true,
      pageNumber: 1,
    });
  } else {
    // First page always takes first 2 cars
    pages.push({
      cars: printedCars.slice(0, 2),
      isFirst: true,
      isLast: false,
      pageNumber: 1,
    });

    let currentIndex = 2;
    let pageNum = 2;
    while (currentIndex < printedCars.length) {
      const remainingCount = printedCars.length - currentIndex;
      if (remainingCount <= 2) {
        pages.push({
          cars: printedCars.slice(currentIndex),
          isFirst: false,
          isLast: true,
          pageNumber: pageNum,
        });
        break;
      } else {
        const takeCount = Math.min(4, remainingCount <= 4 ? 2 : 3);
        pages.push({
          cars: printedCars.slice(currentIndex, currentIndex + takeCount),
          isFirst: false,
          isLast: false,
          pageNumber: pageNum,
        });
        currentIndex += takeCount;
        pageNum++;
      }
    }
  }

  const totalPagesCount = pages.length;

  return (
    <div className="flex flex-col gap-8 w-full items-center no-print-gap">
      {pages.map((page) => (
        <div
          key={page.pageNumber}
          className="pdf-page-container bg-white text-stone-900 border border-stone-250 rounded-sm w-[210mm] max-w-full p-12 relative flex flex-col justify-between min-h-[297mm] h-[297mm] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] print:shadow-none print:border-none print:rounded-none no-break"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(76, 0, 39, 0.012) 1px, transparent 1px), linear-gradient(to bottom, rgba(76, 0, 39, 0.012) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundColor: "#ffffff",
            boxSizing: "border-box"
          }}
        >
          {/* Elegant Double Border Frame */}
          <div className="absolute inset-3.5 border-2 border-[#4C0027]/12 pointer-events-none" />
          <div className="absolute inset-[17px] border border-[#4C0027]/5 pointer-events-none" />

          {/* Corner Ornaments */}
          <div className="absolute top-3.5 left-3.5 w-4 h-4 border-t border-l border-[#4C0027]/40 pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 w-4 h-4 border-t border-r border-[#4C0027]/40 pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-4 h-4 border-b border-l border-[#4C0027]/40 pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b border-r border-[#4C0027]/40 pointer-events-none" />

          {/* Paper Watermark Ornament */}
          <div className="absolute right-12 top-12 opacity-[0.03] select-none pointer-events-none">
            <span className="font-black text-6xl text-stone-950 tracking-widest uppercase">ENTER</span>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Header section */}
            {page.isFirst ? (
              /* Full Corporate Header */
              <div className="flex justify-between items-start border-b-2 border-[#4C0027] pb-4 mb-4 text-stone-900 font-sans">
                <div>
                  <h1 className="text-2xl font-black text-[#4C0027] tracking-wider uppercase leading-none">ENTER CAR RENTAL</h1>
                  <p className="text-[10px] font-mono font-bold tracking-wider text-stone-500 mt-1 uppercase">Premium Fleet Sourcing & Long-Term Leases</p>
                  <div className="mt-2 text-[11px] space-y-0.5 text-stone-600 font-sans">
                    <p>Tel/Telegram: <span className="font-semibold text-[#4C0027]">096 671 4442</span></p>
                    <p>Email: <span className="font-semibold text-[#4C0027]">entercar2026@gmail.com</span></p>
                    <p>Web Inquiry Portal: <span className="font-semibold text-stone-800">enter.v1</span></p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="bg-[#4C0027]/10 text-[#4C0027] px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded">Official Quotation</span>
                  <p className="text-[11px] font-mono font-bold text-stone-750 mt-2">Ref No: <span className="text-[#4C0027] font-extrabold">QT-2787-8ef4-31fc</span></p>
                  <p className="text-[10px] text-stone-500">Date Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            ) : (
              /* Compact Header for Subsequent Pages */
              <div className="flex justify-between items-center border-b border-[#4C0027]/30 pb-2 mb-4 text-stone-900 font-sans">
                <div>
                  <h1 className="text-lg font-black text-[#4C0027] tracking-widest uppercase leading-none">ENTER CAR RENTAL</h1>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono font-bold text-stone-500">
                    Ref No: <span className="text-[#4C0027] font-extrabold">QT-2787-8ef4-31fc</span> (Page {page.pageNumber} of {totalPagesCount})
                  </p>
                </div>
              </div>
            )}

            {/* Intro letter on first page only */}
            {page.isFirst && (
              <div className="mb-4 text-[11px] text-stone-700 space-y-2 leading-relaxed font-sans">
                <p className="font-bold">Dear Valued Customer,</p>
                <p>
                  In reference to your recent catalog inquiry and rental preferences, we are pleased to submit our official vehicle leasing terms and pricing proposal. We cooperate directly with specialized car owners to ensure you receive the pristine quality vehicles requested under the most flexible conditions.
                </p>
              </div>
            )}

            {/* Pricing table sliced for the current page */}
            <div className="overflow-hidden border border-stone-300 rounded-lg font-sans mb-4">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#4C0027] text-white">
                    <th className="px-3 py-2 font-bold uppercase tracking-wider text-center border-b border-stone-300 w-10">No.</th>
                    <th className="px-4 py-2 font-bold uppercase tracking-wider text-left border-b border-stone-300">Vehicle Model Description</th>
                    <th className="px-4 py-2 font-bold uppercase tracking-wider text-center border-b border-stone-300 w-24">Fuel Type</th>
                    <th className="px-4 py-2 font-bold uppercase tracking-wider text-center border-b border-stone-300 w-32">Monthly Rent (USD)</th>
                    <th className="px-4 py-2 font-bold uppercase tracking-wider text-center border-b border-stone-300 w-32">Refundable Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {page.cars.map((car: Car) => {
                    const realIndex = printedCars.findIndex(c => c.id === car.id) + 1;
                    return (
                      <tr key={car.id} className="bg-white hover:bg-stone-50/50 transition-colors">
                        <td className="px-3 py-2 text-center text-stone-500 font-mono font-bold border-r border-stone-200 bg-stone-50/20">{realIndex}</td>
                        <td className="px-4 py-2 font-bold text-stone-900">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => {
                                if (setLightboxCar) {
                                  setLightboxCar(car);
                                  if (setLightboxIndex) {
                                    setLightboxIndex(0);
                                  }
                                }
                              }}
                              className={`w-10 h-6.5 rounded border border-stone-200 overflow-hidden bg-stone-50 shrink-0 ${setLightboxCar ? 'cursor-zoom-in' : ''} hover:border-[#4C0027] hover:scale-105 transition-all`}
                            >
                              <img
                                src={resolvedImages[car.id] || getCarImageSrc(car)}
                                alt={car.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                crossOrigin={(resolvedImages[car.id] || getCarImageSrc(car)).startsWith("data:") ? undefined : "anonymous"}
                                onError={(e) => {
                                  e.currentTarget.src = getFallbackCarThumbnail(car.name, car.category);
                                }}
                              />
                            </div>
                            <span className="block font-bold text-stone-900 leading-tight">{car.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center text-stone-600 uppercase font-semibold text-[9px] tracking-wide w-24">{car.fuelType || "Gasoline"}</td>
                        <td className="px-4 py-2 text-center text-stone-900 font-extrabold font-mono w-32">${car.price.toLocaleString()}/mo</td>
                        <td className="px-4 py-2 text-center text-[#4C0027] font-bold font-mono bg-stone-50 w-32">${(car.price * 1).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Terms and conditions and signatures on the final page only */}
            {page.isLast && (
              <>
                {/* Terms Box */}
                <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 font-sans mb-4">
                  <h3 className="text-[10px] font-black text-[#4C0027] uppercase tracking-widest border-b border-stone-300 pb-1 mb-2">
                    Corporate Rental Guidelines & General Terms
                  </h3>
                  <ol className="list-decimal list-inside text-[9.5px] text-stone-700 space-y-1 leading-relaxed">
                    <li><strong className="text-stone-900">Minimum Rental Term:</strong> Standard minimum contract period of six (6) months.</li>
                    <li><strong className="text-stone-900">Refundable Deposit:</strong> A security deposit equivalent to one (1) month of rent is due upon contract execution. Fully refundable at termination.</li>
                    <li><strong className="text-stone-900">Advanced Billing:</strong> Standard rental billing cycles are processed in advance at the start of each month.</li>
                    <li><strong className="text-stone-900">Premium Comprehensive Care:</strong> Fee includes standard recurring maintenance checks and full liability protection.</li>
                    <li><strong className="text-stone-900">Non-Binding Proposal:</strong> This quotation is structured solely for informative and budgeting purposes.</li>
                  </ol>
                </div>

                {/* Signatures Row */}
                <div className="grid grid-cols-2 gap-6 pt-2 font-sans">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-stone-500 mb-6 uppercase tracking-wider">Authorized Officer – ENTER Car Rental</p>
                    <div className="border-b border-stone-400 w-44 mb-1"></div>
                    <p className="text-[10px] font-black text-[#4C0027]">Sourcing & Leasing Department</p>
                    <p className="text-[9px] text-[#4C0027]/60 font-mono">ENTER CAR RENTAL Co., Ltd.</p>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <p className="text-[10px] font-bold text-stone-500 mb-6 uppercase tracking-wider">Accepted & Acknowledged – Client</p>
                    <div className="border-b border-stone-400 w-44 mb-1"></div>
                    <p className="text-[10px] font-black text-stone-900">Authorized Client Signature</p>
                    <p className="text-[9px] text-stone-400 font-mono">Date: ______ / ______ / 2026</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Unified dynamic page number and corporate stamps */}
          <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-3 gap-4 items-center font-sans shrink-0">
            {/* Left Column: QR code only on the last page or minimal info */}
            {page.isLast ? (
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white border border-stone-200 rounded flex items-center justify-center shrink-0">
                  <QRCodeSVG 
                    value={catalogUrl} 
                    size={40} 
                    level="M" 
                    includeMargin={false} 
                    fgColor="#4C0027"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase text-[#4C0027] tracking-wider leading-none">Online Catalog</p>
                  <p className="text-[8px] text-stone-500 leading-tight mt-0.5 truncate">{catalogUrl}</p>
                </div>
              </div>
            ) : (
              <div className="text-[8px] text-stone-450 font-mono tracking-wide leading-relaxed">
                Thank you for choosing ENTER Car Rental.
              </div>
            )}

            {/* Middle Column: Dynamic Page Indicator requested by the user */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[7.5px] font-mono font-bold text-stone-400 uppercase tracking-widest">Document Registry</span>
              <div className="mt-1 px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-full flex items-center gap-1 shadow-sm">
                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                <span className="text-[8px] font-black text-stone-600 tracking-wide uppercase">
                  Page {page.pageNumber} of {totalPagesCount}
                </span>
              </div>
            </div>

            {/* Right Column: Corporate Registry Stamp */}
            <div className="text-right max-w-xs ml-auto">
              <p className="text-[8px] text-stone-400 font-mono tracking-wider">
                Ref ID: QT-2787-8EF4
              </p>
              <p className="text-[7.5px] font-black text-stone-450 uppercase tracking-wider mt-0.5">
                Official Document Stamp
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
