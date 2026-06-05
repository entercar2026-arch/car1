export interface Car {
  id: string;
  name: string;
  category: 'Sedan' | 'SUV' | 'MPV' | 'Pickup' | 'Truck';
  price: number; // in USD per month
  image: string; // URL
  transmission: 'Automatic' | 'Manual';
  seats: number;
  fuelType: 'Electric' | 'Gasoline' | 'Hybrid' | 'Diesel' | 'LPG';
  description?: string;
  isAvailable?: boolean;
  yearModel: number; // e.g. 2024, 2025
}

export type ViewMode = 'customer' | 'admin' | 'login';

export interface CatalogFilters {
  searchTerm: string;
  category: string;
  maxPrice: number;
  transmission: string;
  fuelType: string;
  brand: string;
}

export interface Booking {
  id: string; // ENTR-XXXX
  carId: string;
  carName: string;
  carImage: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  returnDate: string;
  monthsCount: number;
  totalCost: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  createdAt: string;
  passportPhoto?: string; // Base64 or mock image url of the uploaded passport
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
