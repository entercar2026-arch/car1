import { Car } from '../types';

export const getFallbackCarThumbnail = (carName: string, category: string): string => {
  const name = (carName || "").toLowerCase().trim();
  const cat = (category || "").toLowerCase().trim();
  
  // 1. Heavy Trucks / Commercial Cargo / Trucks
  if (cat === "truck" || name.includes("heavy truck") || (name.includes("truck") && !name.includes("pickup") && !name.includes("f-150") && !name.includes("raptor") && !name.includes("hilux") && !name.includes("tundra"))) {
    return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600";
  }
  
  // 2. Pickup Trucks (Raptor, F-150, Tundra, Hilux, Pickup, etc.)
  if (cat === "pickup" || name.includes("pickup") || name.includes("raptor") || name.includes("hilux") || name.includes("tundra") || name.includes("f-150") || name.includes("f150") || name.includes("truck")) {
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";
  }
  
  // 3. MPV / Vans (Alphard, Starex, MPV, Van, etc.)
  if (cat === "mpv" || cat === "van" || name.includes("alphard") || name.includes("starex") || name.includes("van") || name.includes("mpv")) {
    return "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600";
  }
  
  // 4. SUVs
  if (cat === "suv" || name.includes("suv") || name.includes("range rover") || name.includes("discovery") || name.includes("land cruiser") || name.includes("jeep") || name.includes("lexus rx") || name.includes("rx")) {
    return "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=600";
  }
  
  // 5. Sports Cars / Exotic
  if (name.includes("porsche") || name.includes("911") || name.includes("ferrari") || name.includes("mustang")) {
    return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600";
  }
  
  // 6. Tesla/Electric
  if (name.includes("tesla") || name.includes("model s") || name.includes("plaid") || name.includes("model 3") || name.includes("model y") || name.includes("model x")) {
    return "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600";
  }
  
  // 7. Toyota Camry and Daily/Family Sedans (dedicated gray Toyota Camry image!)
  if (name.includes("camry") || name.includes("toyota") || name.includes("corolla") || name.includes("vios") || name.includes("prius") || name.includes("honda") || name.includes("civic") || name.includes("accord") || name.includes("mazda")) {
    return "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=600";
  }
  
  // 8. Lexus and executive brand luxury sedans (classy high-end black luxury executive sedan!)
  if (name.includes("lexus") || name.includes("gs 300") || name.includes("gs300") || name.includes("mercedes") || name.includes("benz") || name.includes("audi") || name.includes("bmw") || name.includes("sedan") || cat === "sedan") {
    return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600";
  }
  
  // 9. General fallback
  return "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
};

export const getCarImageSrc = (car: Car): string => {
  if (!car) {
    return "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
  }

  let url = car.thumbnail || "";
  
  if (!url) {
    const isUnsplash = car.image && (car.image.includes("unsplash.com") || car.image.includes("images.unsplash.com"));
    if (isUnsplash && car.photos && car.photos.length > 0) {
      url = car.photos[0];
    } else {
      url = car.image || "";
    }
  }

  // If we have an empty, invalid, or generic white sedan placeholder, trigger fallback based on name/category
  const isDefaultPlaceholder = !url || 
    url.trim() === "" || 
    url.includes("photo-1555215695") || 
    url.includes("photo-1525609004556-c46c7d6cf0a3") ||
    url.includes("placeholder") ||
    url.includes("default");

  if (isDefaultPlaceholder) {
    url = getFallbackCarThumbnail(car.name, car.category);
  }
  
  // Handle Google Drive links
  let driveId = "";
  if (url.includes("drive.google.com")) {
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      driveId = fileDMatch[1];
    } else {
      const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParamMatch && idParamMatch[1]) {
        driveId = idParamMatch[1];
      }
    }
  }
  
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  
  return url;
};
