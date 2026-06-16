import React from "react";
import { Car } from "../types";
import { getCarImageSrc, getFallbackCarThumbnail } from "../utils/carImage";
import { PrintContractDoc } from "./PrintContractDoc";

interface QuotationDocumentContentProps {
  printedCars: Car[];
  includeContract: boolean;
  lang: string;
  t: any;
  setLightboxCar?: (car: Car) => void;
  setLightboxIndex?: (idx: number) => void;
  showWatermark?: boolean;
}

export const QuotationDocumentContent: React.FC<QuotationDocumentContentProps> = ({
  printedCars,
  includeContract,
  lang,
  t,
  setLightboxCar,
  setLightboxIndex,
  showWatermark = false,
}) => {
  return (
    <>
      {/* Confidential Watermark Overlay */}
      {showWatermark && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0 select-none">
          <div className="text-[#4C0027]/7 print:text-[#4C0027]/7 text-7xl md:text-8xl font-sans font-black uppercase tracking-[0.2em] -rotate-35 border-8 border-[#4C0027]/7 p-6 md:p-8 rounded-[2rem] whitespace-nowrap">
            CONFIDENTIAL
          </div>
        </div>
      )}

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
          <span className="bg-[#4C0027]/10 text-[#4C0027] px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded">Official Quotation</span>
          <p className="text-xs font-mono font-bold text-stone-700 mt-3">Ref No: <span className="text-[#4C0027] font-extrabold">QT-2787-8ef4-31fc</span></p>
          <p className="text-xs text-stone-500 mt-1">Date Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-stone-500">Validity Period: 30 Calendar Days</p>
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
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-left border-b border-stone-300">Vehicle Model Description</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-center border-b border-stone-300">Fuel Type</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-center border-b border-stone-300">Monthly Rent (USD)</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-center border-b border-stone-300">Refundable Deposit</th>
              <th className="px-5 py-3 font-bold uppercase tracking-wider text-center border-b border-stone-300">Min. Commitment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {printedCars.map((car: Car) => (
              <tr key={car.id} className="bg-white hover:bg-stone-50/50 transition-colors">
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
                        src={getCarImageSrc(car)}
                        alt={car.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackCarThumbnail(car.name, car.category);
                        }}
                      />
                    </div>
                    <span>{car.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center text-stone-600 uppercase font-semibold text-[10px] tracking-wide">{car.fuelType || "Gasoline"}</td>
                <td className="px-5 py-3 text-center text-stone-900 font-extrabold font-mono">${car.price.toLocaleString()}/mo</td>
                <td className="px-5 py-3 text-center text-[#4C0027] font-bold font-mono bg-stone-50">${(car.price * 1).toLocaleString()}</td>
                <td className="px-5 py-3 text-center text-stone-600 font-bold">6 Months</td>
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

        {/* Footer disclaimer */}
        <div className="mt-8 text-center border-t border-stone-100 pt-4">
          <p className="text-[9px] text-stone-400 font-mono tracking-wider">
            Thank you for choosing ENTER Car Rental. We value your business and look forward to safe journeys together.
          </p>
        </div>
      </div>

      {/* Localized Car Rental Lease Contract Appended */}
      {includeContract && (
        <div className="print-contract-append mt-12 pt-8" style={{ pageBreakBefore: "always", breakBefore: "page" }}>
          <PrintContractDoc lang={lang as any} />
        </div>
      )}
    </>
  );
};
