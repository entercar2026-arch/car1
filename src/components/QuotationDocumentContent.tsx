import React, { useState, useEffect } from "react";
import { Car } from "../types";
import { getCarImageSrc, getFallbackCarThumbnail } from "../utils/carImage";
import { QRCodeCanvas } from "qrcode.react";

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
              urls[car.id] = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><rect width="100%" height="100%" fill="%23f5f5f4"/><text x="50%" y="50%" font-family="sans-serif" font-size="8" fill="%234C0027" font-weight="bold" text-anchor="middle" dominant-baseline="middle">ENTER CAR RENTAL</text></svg>`;
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

  return (
    <>
      {/* Header Ribbon / Enterprise Meta */}
      <div className="flex justify-between items-start border-b-2 border-[#4C0027] pb-6 mb-8 text-stone-900 font-sans">
        <div>
          <h1 className="text-3xl font-black text-[#4C0027] tracking-wider uppercase">ENTER CAR RENTAL</h1>
          <p className="text-xs font-mono font-bold tracking-wider text-stone-500 mt-1 uppercase">Premium Fleet Sourcing & Long-Term Leases</p>
          <div className="mt-4 text-xs space-y-1 text-stone-600 font-sans">
            <p>Email: <span className="font-semibold text-[#4C0027]">entercar2026@gmail.com</span></p>
            <p>Web Inquiry Portal: <span className="font-semibold text-stone-800">enter.v1</span></p>
            <p>Phnom Penh, Kingdom of Cambodia</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="bg-[#4C0027]/10 text-[#4C0027] px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded">Official Quotation for 6 Months</span>
          <p className="text-xs font-mono font-bold text-stone-700 mt-3">Ref No: <span className="text-[#4C0027] font-extrabold">QT-2787-8ef4-31fc</span></p>
          <p className="text-xs text-stone-500 mt-1">Date Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-stone-500">Validity Period: 30 Calendar Days</p>
          <p className="text-xs text-stone-700 mt-1 font-semibold">Min. Commitment: <span className="text-[#4C0027] font-bold">6 Months</span></p>
        </div>
      </div>

      {/* Professional Cover Letter Intro */}
      <div className="mb-8 text-xs text-stone-700 space-y-3 leading-relaxed font-sans">
        <p className="font-bold">
          Dear Valued Customer,
        </p>
        <p>
          In reference to your recent catalog inquiry and rental preferences, we are pleased to submit our official vehicle leasing terms and pricing proposal. We cooperate directly with specialized car owners to ensure you receive the pristine quality vehicles requested under the most flexible conditions.
        </p>
      </div>

      {/* Print specific pricing table */}
      <div className="mb-8 overflow-hidden border border-stone-300 rounded-lg font-sans">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#4C0027] text-white">
              <th className="px-4 py-3 font-bold uppercase tracking-wider text-center border-b border-stone-300 w-12">No.</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-left border-b border-stone-300">Vehicle Model Description</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-center border-b border-stone-300">Fuel Type</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-center border-b border-stone-300">Monthly Rent (USD)</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-center border-b border-stone-300">Refundable Deposit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {printedCars.map((car: Car, index: number) => (
              <tr key={car.id} className="bg-white hover:bg-stone-50/50 transition-colors">
                <td className="px-4 py-3 text-center text-stone-500 font-mono font-bold border-r border-stone-200 w-12 bg-stone-50/20">{index + 1}</td>
                <td className="px-5 py-3 font-bold text-stone-900">
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
                      className={`w-12 h-8 rounded border border-stone-200 overflow-hidden bg-stone-50 shrink-0 ${setLightboxCar ? 'cursor-zoom-in' : ''} hover:border-[#4C0027] hover:scale-105 transition-all`}
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
                <td className="px-5 py-3 text-center text-stone-600 uppercase font-semibold text-[10px] tracking-wide">{car.fuelType || "Gasoline"}</td>
                <td className="px-5 py-3 text-center text-stone-900 font-extrabold font-mono">${car.price.toLocaleString()}/mo</td>
                <td className="px-5 py-3 text-center text-[#4C0027] font-bold font-mono bg-stone-50">${(car.price * 1).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Terms and Conditions Callout */}
      <div className="mb-10 p-6 bg-stone-50 rounded-xl border border-stone-200 no-break font-sans">
        <h3 className="text-xs font-black text-[#4C0027] uppercase tracking-widest border-b-2 border-stone-300 pb-2 mb-3">
          Corporate Rental Guidelines & General Terms
        </h3>
        <ol className="list-decimal list-inside text-[11px] text-stone-700 space-y-2 leading-relaxed">
          <li><strong className="text-stone-900">Minimum Rental Term:</strong> All active vehicles listed in this quotation are subject to a standard minimum contract period of six (6) months.</li>
          <li><strong className="text-stone-900">Refundable Deposit Clause:</strong> A security deposit equivalent to exactly one (1) month of the specified rental rate is due immediately upon execution of the final lease agreement. This sum is held in escrow and is fully refundable at contract termination, subject to satisfactory vehicle inspection.</li>
          <li><strong className="text-stone-900">Advanced Billing:</strong> Standard rental billing cycles are processed in advance at the start of each operating month.</li>
          <li><strong className="text-stone-900">Premium Comprehensive Care:</strong> The monthly leasing fee includes standard recurring maintenance checks, parts wear replacements, and premium vehicle liability protection.</li>
          <li><strong className="text-stone-900">Official Non-Binding nature:</strong> This quotation is structured solely for informative and budgeting purposes. Vehicle availability is confirmed only upon signing the binding Contract Agreement.</li>
        </ol>
      </div>

      {/* Sign-off & Footer Container (Guaranteed to stay cohesive on print) */}
      <div className="no-break mt-8 pt-6 border-t border-stone-200 font-sans">
        {/* Corporate Sign-off blocks */}
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col">
            <p className="text-xs font-bold text-stone-500 mb-8 uppercase tracking-wider">Authorized Officer – ENTER Car Rental</p>
            <div className="border-b border-stone-400 w-56 mb-2"></div>
            <p className="text-xs font-black text-[#4C0027]">Sourcing & Leasing Department</p>
            <p className="text-[10px] text-stone-400 font-mono">ENTER CAR RENTAL Co., Ltd.</p>
          </div>
          <div className="flex flex-col items-end text-right">
            <p className="text-xs font-bold text-stone-500 mb-8 uppercase tracking-wider">Accepted & Acknowledged – Client</p>
            <div className="border-b border-stone-400 w-56 mb-2"></div>
            <p className="text-xs font-black text-stone-900">Authorized Client Signature</p>
            <p className="text-[10px] text-stone-400 font-mono">Date signed: ______ / ______ / 2026</p>
          </div>
        </div>

        {/* Professional Footer & Catalog Access QR Code Row */}
        <div className="mt-8 pt-4 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Column 1: Scan to View Fleet interactive block */}
          <div className="flex items-center gap-4 text-left">
            <div className="flex flex-col items-center gap-1 shrink-0 text-center">
              <div className="p-1.5 bg-white border border-stone-200 rounded shadow-sm flex items-center justify-center">
                <QRCodeCanvas 
                  value={catalogUrl} 
                  size={52} 
                  level="M" 
                  includeMargin={false} 
                  fgColor="#4C0027"
                />
              </div>
              <span className="text-[7.5px] font-black uppercase text-[#4C0027] tracking-wider leading-none">Scan to View Fleet</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-[#4C0027] tracking-wider leading-none">Scan to View Online Catalog</p>
              <p className="text-[9px] text-stone-500 font-medium leading-relaxed max-w-[180px] mt-1">
                Access our real-time interactive fleet page, explore high-resolution image galleries, 360° panoramas, and check dynamic availability.
              </p>
              <p className="text-[8px] text-stone-400 font-mono mt-0.5 select-all">{catalogUrl}</p>
            </div>
          </div>

          {/* Column 2: Document Metadata & Printed Page Number (Prevents any overlap) */}
          <div className="flex flex-col items-center justify-center text-center py-2 px-4 border-y md:border-y-0 md:border-x border-stone-150">
            <span className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-widest">Document Registry</span>
            <span className="text-[9px] font-black text-[#4C0027] font-mono tracking-wider mt-0.5">QT-2787-8EF4-31FC</span>
            <div className="mt-2 px-3 py-1 bg-stone-50 border border-stone-200 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[8.5px] font-black text-stone-600 font-sans tracking-wide uppercase">Page 1 of 1</span>
            </div>
          </div>

          {/* Column 3: Corporate disclaimer text */}
          <div className="text-center md:text-right max-w-xs md:ml-auto">
            <p className="text-[9px] text-stone-450 font-mono tracking-wider leading-relaxed">
              Thank you for choosing ENTER Car Rental. We value your business and look forward to safe, premier journeys together.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
