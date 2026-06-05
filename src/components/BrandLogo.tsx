import React from 'react';
// @ts-ignore
import enterlogo from './enterlogo.png';

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
      svg: 'h-11 w-11',
      text: 'text-lg font-bold tracking-widest',
      subText: 'text-[10px] tracking-widest',
      container: 'gap-3',
    },
    lg: {
      svg: 'h-16 w-16',
      text: 'text-2xl font-black tracking-widest',
      subText: 'text-xs tracking-widest',
      container: 'gap-4',
    },
    xl: {
      svg: 'h-24 w-24',
      text: 'text-3xl font-black tracking-wider',
      subText: 'text-sm tracking-widest font-medium uppercase',
      container: 'gap-5',
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
            className={`font-sans font-extrabold uppercase leading-none tracking-widest`}
            style={{ color: variant === 'light' ? brandPrimary : '#FAFAF9' }}
          >
            ENTER
          </span>
          <span 
            className={`font-mono font-medium tracking-[0.25em] leading-none mt-1 uppercase text-[9px]`}
            style={{ color: variant === 'light' ? brandSecondary : 'rgba(250, 250, 249, 0.7)' }}
          >
            CAR RENTAL
          </span>
        </div>
      )}
    </div>
  );

};
