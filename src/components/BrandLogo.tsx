import React from 'react';
// @ts-ignore
import enterlogo from './Enter-Car-Rental-White1.png';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'plum'; // 'light' is burgundy on light, 'dark' is white on burgundy, 'plum' is the complete banner representation
  showSubText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'plum',
  showSubText = true,
  size = 'md',
}) => {
  // Brand color constant (Corporate Plum)
  const brandPrimary = '#4C0027';
  const brandSecondary = '#B00051';

  // Sizing styles
  const sizeClasses = {
    sm: {
      svg: 'h-8 w-8',
      text: 'text-sm font-semibold tracking-wider',
      subText: 'text-[9px] tracking-widest',
      container: 'gap-2',
    },
    md: {
      svg: 'h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16',
      text: 'text-base sm:text-lg md:text-xl lg:text-2xl font-black tracking-widest',
      subText: 'text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] tracking-widest',
      container: 'gap-2 sm:gap-3',
    },
    lg: {
      svg: 'h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20',
      text: 'text-xl sm:text-2xl md:text-3xl font-black tracking-widest',
      subText: 'text-[10px] sm:text-xs md:text-sm tracking-widest',
      container: 'gap-3 sm:gap-4',
    },
    xl: {
      svg: 'h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28',
      text: 'text-2xl sm:text-3xl md:text-4xl font-black tracking-wider',
      subText: 'text-xs sm:text-sm md:text-base tracking-widest font-medium uppercase',
      container: 'gap-4 sm:gap-5',
    }
  };

  const selectedSize = sizeClasses[size];

  // Render imported enterlogo.png image
  const renderEnterKey = () => {
    return (
      <img
        src={enterlogo}
        alt="Enter Logo"
        className={`${selectedSize.svg} object-contain transition-transform duration-300 hover:scale-105 active:scale-95`}
        referrerPolicy="no-referrer"
      />
    );
  };

  if (variant === 'plum') {
    return (
      <div id="brand-compiled-plum" className={`flex flex-col items-center justify-center p-8 bg-[#4C0027] text-white rounded-3xl ${selectedSize.container} shadow-xl border border-[#5E0030]/50 ${className}`}>
        {renderEnterKey()}
        {showSubText && (
          <div className="text-center">
            <h1 className={`font-sans font-black uppercase text-white tracking-widest ${selectedSize.text}`}>
              ENTER
            </h1>
            <p className={`font-mono text-stone-200 tracking-[0.3em] font-semibold uppercase mt-1 ${selectedSize.subText}`}>
              CAR RENTAL
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="brand-compiled-inline" className={`flex items-center ${selectedSize.container} ${className}`}>
      {renderEnterKey()}
      {showSubText && (
        <div className="flex flex-col select-none">
          <span 
            className={`font-sans font-extrabold uppercase leading-none tracking-widest ${selectedSize.text}`}
            style={{ color: variant === 'light' ? brandPrimary : '#FAFAF9' }}
          >
            ENTER
          </span>
          <span 
            className={`font-mono font-medium tracking-[0.25em] leading-none mt-1 uppercase ${selectedSize.subText}`}
            style={{ color: variant === 'light' ? brandSecondary : 'rgba(250, 250, 249, 0.7)' }}
          >
            CAR RENTAL
          </span>
        </div>
      )}
    </div>
  );

};
