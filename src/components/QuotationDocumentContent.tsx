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

interface QuotationPage {
  cars: Car[];
  showIntro: boolean;
  showTermsAndSignatures: boolean;
  pageType: "first" | "middle" | "last" | "single";
}

function getQuotationPages(allCars: Car[]): QuotationPage[] {
  const N = allCars.length;
  if (N === 0) {
    return [{ cars: [], showIntro: true, showTermsAndSignatures: true, pageType: "single" }];
  }

  // If <= 12 cars, they can easily fit on a single page with all intros, terms, and signatures
  if (N <= 12) {
    return [{ cars: allCars, showIntro: true, showTermsAndSignatures: true, pageType: "single" }];
  }

  // Determine number of pages first.
  // Page 1 (First) can hold up to 16.
  // Page last can hold up to 13.
  // Each middle page can hold up to 22.
  let numPages = 2;
  if (N > 29) {
    let m = 1;
    while (16 + m * 22 + 13 < N) {
      m++;
    }
    numPages = 2 + m;
  }

  // Set up the capacities for each page
  const capacities: number[] = [];
  if (numPages === 2) {
    capacities.push(16);
    capacities.push(13);
  } else {
    capacities.push(16);
    for (let i = 0; i < numPages - 2; i++) {
      capacities.push(22);
    }
    capacities.push(13);
  }

  // Fill greedily from first page to last page, ensuring at least 1 car is left for each subsequent page.
  const counts = new Array(numPages).fill(0);
  let remainingCarsCount = N;
  for (let i = 0; i < numPages; i++) {
    const minRequiredForSubsequentPages = numPages - 1 - i;
    const maxPossibleOnThisPage = Math.min(capacities[i], remainingCarsCount - minRequiredForSubsequentPages);
    counts[i] = maxPossibleOnThisPage;
    remainingCarsCount -= maxPossibleOnThisPage;
  }

  // Create the pages from `counts`
  const pages: QuotationPage[] = [];
  let currentIndex = 0;
  for (let i = 0; i < numPages; i++) {
    const carsOnPage = allCars.slice(currentIndex, currentIndex + counts[i]);
    currentIndex += counts[i];

    const isFirst = i === 0;
    const isLast = i === numPages - 1;

    pages.push({
      cars: carsOnPage,
      showIntro: isFirst,
      showTermsAndSignatures: isLast,
      pageType: isFirst ? "first" : isLast ? "last" : "middle"
    });
  }

  return pages;
}

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

  const pages = getQuotationPages(printedCars);

  return (
    <>
      {pages.map((page, pageIndex) => {
        // Offset is the sum of car items rendered in all preceding pages
        const offset = pages.slice(0, pageIndex).reduce((acc, p) => acc + p.cars.length, 0);

        return (
          <div
            key={pageIndex}
            className="pdf-page-print bg-white text-stone-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-stone-250 rounded-sm w-[210mm] min-w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] p-5 md:p-6 relative flex flex-col justify-between overflow-hidden shrink-0 print:shadow-none print:border-none print:m-0 print:p-5 break-after-page page-break-after"
            style={{
              backgroundImage: "linear-gradient(to right, rgba(76, 0, 39, 0.012) 1px, transparent 1px), linear-gradient(to bottom, rgba(76, 0, 39, 0.012) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              backgroundColor: "#ffffff",
              boxSizing: "border-box"
            }}
          >
            {/* Elegant Double Border Frame for Polished Stationery */}
            <div className="absolute inset-2 border-2 border-[#4C0027]/12 pointer-events-none" />
            <div className="absolute inset-[11px] border border-[#4C0027]/5 pointer-events-none" />

            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#4C0027]/40 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#4C0027]/40 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#4C0027]/40 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#4C0027]/40 pointer-events-none" />

            {/* Paper Watermark Ornament for Premium Presentation */}
            <div className="absolute right-8 top-8 opacity-[0.03] select-none pointer-events-none">
              <span className="font-black text-6xl text-stone-950 tracking-widest uppercase">ENTER</span>
            </div>

            {/* Content Body Container */}
            <div className="z-10 flex flex-col flex-1 justify-start">
              {page.showIntro && (
                <>
                  {/* Header Ribbon / Enterprise Meta */}
                  <div className="flex justify-between items-start border-b-2 border-[#4C0027] pb-4 mb-4 text-stone-900 font-sans">
                    <div>
                      <h1 className="text-3xl font-black text-[#4C0027] tracking-wider uppercase">ENTER CAR RENTAL</h1>
                      <p className="text-xs font-mono font-bold tracking-wider text-stone-500 mt-1 uppercase">Premium Fleet Sourcing & Long-Term Leases</p>
                      <div className="mt-3 text-xs space-y-0.5 text-stone-600 font-sans">
                        <p>Tel/Telegram: <span className="font-semibold text-[#4C0027]">096 671 4442</span></p>
                        <p>Email: <span className="font-semibold text-[#4C0027]">entercar2026@gmail.com</span></p>
                        <p>Web Inquiry Portal: <span className="font-semibold text-stone-800">enter.v1</span></p>
                        <p>Phnom Penh, Kingdom of Cambodia</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="bg-[#4C0027]/10 text-[#4C0027] px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded">Official Quotation for 6 Months</span>
                      <p className="text-xs font-mono font-bold text-stone-700 mt-2.5">Ref No: <span className="text-[#4C0027] font-extrabold">QT-2787-8ef4-31fc</span></p>
                      <p className="text-xs text-stone-500 mt-0.5">Date Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-xs text-stone-500">Validity Period: 30 Calendar Days</p>
                    </div>
                  </div>

                  {/* Professional Cover Letter Intro */}
                  <div className="mb-4 text-xs text-stone-700 space-y-2 leading-relaxed font-sans">
                    <p className="font-bold text-stone-950">
                      Dear Valued Customer,
                    </p>
                    <p>
                      In reference to your recent catalog inquiry and rental preferences, we are pleased to submit our official vehicle leasing terms and pricing proposal. We cooperate directly with specialized car owners to ensure you receive the pristine quality vehicles requested under the most flexible conditions.
                    </p>
                  </div>
                </>
              )}

              {!page.showIntro && (
                /* Sleek minimal running header on pages 2+ to indicate document context */
                <div className="flex justify-between items-center border-b border-[#4C0027]/30 pb-2 mb-4 text-stone-900 font-sans z-10">
                  <div>
                    <h2 className="text-sm font-black text-[#4C0027] tracking-wider uppercase">ENTER CAR RENTAL</h2>
                    <p className="text-[8px] font-mono font-bold tracking-wider text-stone-500 uppercase leading-none mt-0.5">Official Sourcing Proposal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono font-bold text-stone-700">Ref No: QT-2787-8ef4-31fc</p>
                  </div>
                </div>
              )}

              {/* Table of quotation cars */}
              {page.cars.length > 0 && (
                <div className="mb-4 overflow-hidden border border-stone-300 rounded-lg font-sans z-10">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#4C0027] text-white">
                        <th className="px-3 py-2 font-bold uppercase tracking-wider text-center border-b border-stone-300 w-12 text-[10px]">No.</th>
                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-left border-b border-stone-300 text-[10px]">Vehicle Model Description</th>
                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-center border-b border-stone-300 text-[10px]">Fuel Type</th>
                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-center border-b border-stone-300 text-[10px]">Monthly Rent (USD)</th>
                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-center border-b border-stone-300 text-[10px]">Refundable Deposit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {page.cars.map((car: Car, index: number) => (
                        <tr key={car.id} className="bg-white hover:bg-stone-50/50 transition-colors">
                          <td className="px-3 py-2 text-center text-stone-500 font-mono font-bold border-r border-stone-200 w-12 bg-stone-50/20">{offset + index + 1}</td>
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
                                className={`w-11 h-7 rounded border border-stone-200 overflow-hidden bg-stone-50 shrink-0 ${setLightboxCar ? 'cursor-zoom-in' : ''} hover:border-[#4C0027] hover:scale-105 transition-all`}
                                title="Click to zoom gallery lightbox"
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
                          <td className="px-4 py-2 text-center text-stone-600 uppercase font-semibold text-[10px] tracking-wide">{car.fuelType || "Gasoline"}</td>
                          <td className="px-4 py-2 text-center text-stone-900 font-extrabold font-mono">${car.price.toLocaleString()}/mo</td>
                          <td className="px-4 py-2 text-center text-[#4C0027] font-bold font-mono bg-stone-50">${(car.price * 1).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {page.showTermsAndSignatures && (
                <>
                  {/* Terms and Conditions Callout */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 font-sans z-10 mb-4">
                    <h3 className="text-[11px] font-black text-[#4C0027] uppercase tracking-widest border-b border-stone-300 pb-1.5 mb-2">
                      Corporate Rental Guidelines & General Terms
                    </h3>
                    <ol className="list-decimal list-inside text-[10px] text-stone-700 space-y-1 leading-relaxed">
                      <li><strong className="text-stone-900">Minimum Term:</strong> All vehicles listed are subject to a standard minimum contract period of six (6) months.</li>
                      <li><strong className="text-stone-900">Security Deposit:</strong> A security deposit equivalent to one (1) month of standard rental fee is due upon signing, fully refundable.</li>
                      <li><strong className="text-stone-900">Advanced Billing:</strong> Standard rental billing cycles are processed in advance at the start of each operating month.</li>
                      <li><strong className="text-stone-900">Comprehensive Care:</strong> Monthly leasing fee includes routine maintenance checks, replacement of wear parts, and standard liability protection.</li>
                      <li><strong className="text-stone-900">Non-Binding Quotation:</strong> Sourcing is formally secured only upon signing the binding Contract Agreement.</li>
                    </ol>
                  </div>

                  {/* Sign-off Blocks */}
                  <div className="z-10 mt-2">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-stone-500 mb-6 uppercase tracking-wider">Authorized Officer – ENTER Car Rental</p>
                        <div className="border-b border-stone-400 w-56 mb-1.5"></div>
                        <p className="text-xs font-black text-[#4C0027]">Sourcing & Leasing Department</p>
                        <p className="text-[10px] text-stone-400 font-mono font-bold uppercase leading-none mt-0.5">ENTER CAR RENTAL Co., Ltd.</p>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <p className="text-xs font-bold text-stone-500 mb-6 uppercase tracking-wider">Accepted & Acknowledged – Client</p>
                        <div className="border-b border-stone-400 w-56 mb-1.5"></div>
                        <p className="text-xs font-black text-stone-900">Authorized Client Signature</p>
                        <p className="text-[10px] text-stone-400 font-mono tracking-wide leading-none mt-0.5">Date signed: ______ / ______ / 2026</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Real-time Document Status Bar & Footers */}
            <div className="z-10 w-full mt-auto pt-4 border-t border-stone-100 flex items-center justify-between text-[9px] text-stone-400 font-mono tracking-wider">
              {page.showTermsAndSignatures ? (
                /* Standard QR status footer on last page */
                <div className="w-full flex flex-col gap-3">
                  <div className="w-full flex items-center justify-between">
                    {/* Column 1: Scan to View Fleet interactive block */}
                    <div className="flex items-center gap-4 text-left">
                      <div className="flex flex-col items-center gap-1 shrink-0 text-center">
                        <div className="p-1.5 bg-white border border-stone-200 rounded shadow-sm flex items-center justify-center">
                          <QRCodeSVG 
                            value={catalogUrl} 
                            size={48} 
                            level="M" 
                            includeMargin={false} 
                            fgColor="#4C0027"
                          />
                        </div>
                        <span className="text-[7.5px] font-black uppercase text-[#4C0027] tracking-wider leading-none">Scan Fleet</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#4C0027] tracking-wider leading-none">Online Catalog</p>
                        <p className="text-[9px] text-stone-600 font-medium leading-tight max-w-[280px] mt-1">
                          Access interactive fleet, explore high-res galleries, virtual views, and core availability.
                        </p>
                        <p className="text-[8px] text-stone-400 font-mono mt-1 select-all">{catalogUrl}</p>
                      </div>
                    </div>

                    {/* Divider line between Column 1 and 2 */}
                    <div className="h-12 w-[1px] bg-stone-250 mx-4 shrink-0"></div>

                    {/* Column 2: Document Metadata & Page Number */}
                    <div className="flex flex-col items-center justify-center text-center py-1">
                      <span className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-widest leading-none">Document Registry</span>
                      <span className="text-[10px] font-black text-[#4C0027] font-mono tracking-wider mt-1">QT-2787-8EF4-31FC</span>
                      <div className="mt-1.5 px-2 py-0.5 bg-stone-50 border border-stone-200 rounded-full flex items-center gap-1.5 shadow-sm leading-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[8.5px] font-black text-stone-600 font-sans tracking-wide uppercase">Page {pageIndex + 1} of {pages.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Corporate disclaimer text */}
                  <div className="w-full text-center pt-2.5 border-t border-stone-150 mt-1">
                    <p className="text-[9px] text-stone-500 font-mono tracking-wider leading-snug">
                      Thank you for choosing ENTER. We value your business and look forward to safe, premier journeys.
                    </p>
                  </div>
                </div>
              ) : (
                /* Standard page-number footer on pages prior to the last */
                <div className="w-full flex items-center justify-between text-[9px] text-stone-400 font-mono tracking-wider">
                  <span>Ref: QT-2787-8ef4-31fc</span>
                  <div className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-full flex items-center gap-1 shadow-sm font-sans text-[7.5px] font-bold text-[#4C0027] tracking-wide uppercase">
                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                    <span>Page {pageIndex + 1} of {pages.length}</span>
                  </div>
                  <span>Printed via ENTER VIP Client Services</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
