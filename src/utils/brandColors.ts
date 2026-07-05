export const getBrandColor = (brand: string): string => {
  return ''; // Return empty string to use parent's default color (text-stone-900)
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
