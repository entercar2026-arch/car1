import React from 'react';

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

  // SVG representation of the tilted 3D "Enter" key
  const renderEnterKey = () => {
    const isPlumOrDark = variant === 'plum' || variant === 'dark';
    const primaryColor = isPlumOrDark ? '#FAFAF9' : brandPrimary; // main key body color
    const textColor = isPlumOrDark ? brandPrimary : '#FAFAF9'; // "Enter" text color inside key
    const edgeColor = isPlumOrDark ? '#D6D3D1' : '#2D0017'; // 3D side edge color

    return (
      <svg
        id="enter-key-svg"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${selectedSize.svg} transition-transform duration-300 hover:scale-105 active:scale-95`}
      >
        {/* Shadow/Base depth underneath */}
        <path
          d="M25 40 C25 34 32 30 40 30 H75 C83 30 88 34 85 43 L77 78 C75 84 68 88 60 88 H25 C17 88 15 82 17 73 Z"
          fill={variant === 'light' ? 'rgba(76, 0, 39, 0.15)' : 'rgba(0, 0, 0, 0.25)'}
        />
        
        {/* 3D Side/Bottom edge of the key */}
        <path
          d="M20 37 C20 31 27 27 35 27 H70 C78 27 83 31 82 39 L74 74 C72 80 65 84 57 84 H22 C14 84 12 78 14 69 Z"
          fill={edgeColor}
        />

        {/* Top Keycap Face */}
        <path
          d="M21 34 C21 28 28 24 36 24 H69 C77 24 81 28 80 35 L73 68 C71 74 64 78 56 78 H23 C15 78 14 72 15 65 Z"
          fill={primaryColor}
          stroke={edgeColor}
          strokeWidth="1.5"
        />

        {/* Dynamic glossy highlight on keycap */}
        <path
          d="M36 26 H65 C72 26 75 28 75 32 L72 45 C72 41 68 38 60 38 H32 C26 38 23 34 24 30 L25 28 C26 26 31 26 36 26 Z"
          fill="rgba(255,255,255,0.4)"
        />

        {/* "Enter" Label String */}
        <text
          x="44"
          y="56"
          fill={textColor}
          fontSize="17"
          fontWeight="bold"
          fontStyle="italic"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
          transform="skewX(-10)"
          className="select-none font-sans"
        >
          Enter
        </text>
      </svg>
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
