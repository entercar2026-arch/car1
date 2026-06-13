export interface Car {
  id: string;
  name: string;
  category: "Sedan" | "SUV" | "MPV" | "Pickup" | "Truck";
  price: number; // in USD per month
  image: string; // URL
  altImage?: string; // photo of car in different color
  photos?: string[]; // Array of image URLs for the carousel
  transmission: "Automatic" | "Manual";
  seats: number;
  fuelType: "Electric" | "Gasoline" | "Hybrid" | "Diesel" | "LPG";
  description?: string;
  isAvailable?: boolean;
  videoUrl?: string;
  thumbnail?: string;
  extendedSpecs?: {
    engine?: string;
    horsepower?: string;
    topSpeed?: string;
    acceleration?: string;
    driveType?: string;
    fuelEfficiency?: string;
    co2Emissions?: string;
    ownerNotes?: string;
  };
}

export type ViewMode = "customer" | "admin" | "login";

export interface CatalogFilters {
  searchTerm: string;
  category: string;
  maxPrice: number;
  transmission: string;
  fuelType: string;
  seats: string | number;
  brand: string;
  likedOnly?: boolean;
}

export interface Booking {
  id: string; // ENTR-XXXX
  carId: string;
  carName: string;
  carImage: string;
  customerName: string;
  pickupDate: string;
  pickupTime: string;
  location: string;
  contactMethod: "whatsapp" | "telegram" | "none";
  message: string;
  totalCost: number;
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
  createdAt: string;
}

export interface Review {
  id: string;
  carId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  isApproved: boolean; // must be approved by admin to be shown publicly
}
