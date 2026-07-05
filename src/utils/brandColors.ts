export const getBrandColor = (brand: string): string => {
  const b = brand.toLowerCase();
  if (b === 'ram') return 'text-red-600';
  if (b.includes('hyundai')) return 'text-blue-700';
  if (b.includes('porsche')) return 'text-amber-600';
  if (b.includes('toyota')) return 'text-red-600';
  if (b.includes('ford')) return 'text-blue-600';
  if (b.includes('lexus')) return 'text-slate-800';
  if (b.includes('honda')) return 'text-red-600';
  if (b.includes('mazda')) return 'text-slate-800';
  if (b.includes('nissan')) return 'text-gray-600';
  if (b.includes('jeep')) return 'text-green-800';
  if (b.includes('kia')) return 'text-red-600';
  if (b.includes('bmw')) return 'text-blue-600';
  if (b.includes('mercedes')) return 'text-gray-500';
  if (b.includes('audi')) return 'text-gray-800';
  if (b.includes('tesla')) return 'text-red-500';
  if (b.includes('mg')) return 'text-red-600';
  return 'text-[#4C0027]'; // default brand color
};

export const splitCarName = (fullName: string) => {
  const knownMultiWordBrands = ['Land Rover', 'Aston Martin', 'Alfa Romeo', 'Mercedes Benz', 'Mercedes-Benz'];
  
  for (const brand of knownMultiWordBrands) {
    if (fullName.toLowerCase().startsWith(brand.toLowerCase())) {
      return {
        brand: fullName.substring(0, brand.length),
        model: fullName.substring(brand.length).trim()
      };
    }
  }

  const parts = fullName.split(' ');
  return {
    brand: parts[0] || '',
    model: parts.slice(1).join(' ')
  };
};
