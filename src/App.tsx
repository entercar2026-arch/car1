import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from "react";
import { Car, ViewMode, CatalogFilters, Booking, Review } from "./types";
import { INITIAL_CARS } from "./data";
import { BrandLogo } from "./components/BrandLogo";
import { CarCard } from "./components/CarCard";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { motion, AnimatePresence } from "motion/react";
import { db } from "./lib/db";
import { supabase } from "./lib/supabase";
import {
  Search,
  MapPin,
  Lock,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  BadgePercent,
  CheckCircle2,
  PhoneCall,
  Menu,
  X,
  Plus,
  HelpCircle,
  CarFront,
  Users,
  Settings2,
  Fuel,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Building,
  Camera,
  FileText,
  Send,
  MessageCircle,
  Heart,
} from "lucide-react";

const SECURE_TOKEN_KEY = "enter_admin_session_token";

const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

// Verification helper checking token integrity and session time window
const isSessionTokenValid = (): boolean => {
  try {
    const token = safeStorage.getItem(SECURE_TOKEN_KEY);
    if (!token) return false;
    const decoded = atob(token);
    const session = JSON.parse(decoded);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (
      session &&
      session.root_auth === true &&
      session.user === "chan" &&
      session.role === "admin" &&
      now - session.verified_at < oneDay
    ) {
      return true;
    }
  } catch (e) {
    // Decrypting or validation failed
  }
  return false;
};

// Generation helper for state metadata
const generateSessionToken = (): string => {
  const session = {
    root_auth: true,
    user: "chan",
    role: "admin",
    verified_at: Date.now(),
  };
  return btoa(JSON.stringify(session));
};

export default function App() {
  // Cars Fleet State
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = safeStorage.getItem("enter_cars");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved cars", e);
      }
    }
    return INITIAL_CARS;
  });

  useEffect(() => {
    if (supabase) {
      db.cars.getAll().then(async (data) => {
        if (data) {
          if (data.length === 0) {
            // Seed initial data to Supabase
            console.log("Database is empty. Seeding initial cars...");
            for (const car of INITIAL_CARS) {
              try {
                await db.cars.create(car);
              } catch (e) {
                console.error("Failed to seed car", e);
              }
            }
            // Fetch again after seeding
            const refreshedData = await db.cars.getAll();
            if (refreshedData) setCars(refreshedData);
          } else {
            setCars(data);
          }
        }
      }).catch(err => console.error("Failed to fetch initial cars from Supabase", err));
    }
  }, []);

  // Liked cars state
  const [likedCars, setLikedCars] = useState<string[]>(() => {
    const saved = safeStorage.getItem("enter_liked_cars");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved liked cars", e);
      }
    }
    return [];
  });

  // Track session authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => {
      return isSessionTokenValid();
    },
  );

  // Current Screen / Node View
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const isAuth = isSessionTokenValid();
    return isAuth ? "admin" : "customer";
  });

  // Filter criteria state
  const [filters, setFilters] = useState<CatalogFilters>({
    searchTerm: "",
    category: "All",
    maxPrice: 10000,
    transmission: "All",
    fuelType: "All",
    brand: "All",
    likedOnly: false,
  });

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Booking details toast state
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  // Persistence containers for bookings and reviews
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = safeStorage.getItem("enter_bookings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved bookings", e);
      }
    }
    return [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = safeStorage.getItem("enter_reviews");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved reviews", e);
      }
    }
    // High-quality sample initial reviews
    return [
      {
        id: "rev-init-1",
        carId: "car-1",
        customerName: "Alistair Sterling",
        rating: 5,
        comment:
          "Outstanding pickup service at the airport hub. The cabin was clean and smelled of fine leather.",
        createdAt: "2026-06-02",
        isApproved: true,
      },
      {
        id: "rev-init-2",
        carId: "car-2",
        customerName: "Charlotte Vance",
        rating: 5,
        comment:
          "Pure luxury. Cruising on zero emissions in the Mach-E was the highlight of our weekend trip.",
        createdAt: "2026-06-03",
        isApproved: true,
      },
      {
        id: "rev-init-3",
        carId: "car-3",
        customerName: "Nathaniel West",
        rating: 5,
        comment:
          "Absolute monster of a machine. Power delivery is linear, gearbox response is lightning fast.",
        createdAt: "2026-06-03",
        isApproved: false, // awaits moderator approval
      },
    ];
  });

  // Synchronize state changes directly to Local Storage
  useEffect(() => {
    safeStorage.setItem("enter_cars", JSON.stringify(cars));
  }, [cars]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      safeStorage.setItem("enter_admin_auth", "true");
      safeStorage.setItem(SECURE_TOKEN_KEY, generateSessionToken());
    } else {
      safeStorage.removeItem("enter_admin_auth");
      safeStorage.removeItem(SECURE_TOKEN_KEY);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    safeStorage.setItem("enter_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    safeStorage.setItem("enter_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    safeStorage.setItem("enter_liked_cars", JSON.stringify(likedCars));
  }, [likedCars]);

  // Handle addition of a new vehicle catalog item
  const handleAddCar = async (newCarFields: Omit<Car, "id">) => {
    const freshCar: Car = {
      ...newCarFields,
      id: `car-${Date.now()}`,
    };
    setCars((prev) => [freshCar, ...prev]);

    if (supabase) {
      try {
        const dbCar = await db.cars.create(newCarFields);
        if (dbCar) {
          setCars((prev) => prev.map(c => c.id === freshCar.id ? dbCar : c));
        }
      } catch (err: any) {
        console.error("Failed to add car to Supabase", err);
        alert(`Failed to sync with Supabase: ${err.message || "Unknown error"}. Please make sure your database schema is up-to-date.`);
      }
    }
  };

  // Handle updating an existing vehicle listing
  const handleUpdateCar = async (updatedCar: Car) => {
    setCars((prev) =>
      prev.map((car) => (car.id === updatedCar.id ? updatedCar : car)),
    );
    if (supabase) {
      try {
        await db.cars.update(updatedCar.id, updatedCar);
      } catch (err: any) {
        console.error("Failed to update car in Supabase", err);
        alert(`Failed to sync with Supabase: ${err.message || "Unknown error"}`);
      }
    }
  };

  // Handle removing a vehicle catalog item
  const handleDeleteCar = async (carId: string) => {
    setCars((prev) => prev.filter((car) => car.id !== carId));
    if (supabase) {
      try {
        await db.cars.delete(carId);
      } catch (err: any) {
        console.error("Failed to delete car from Supabase", err);
        alert(`Failed to delete from Supabase: ${err.message || "Unknown error"}`);
      }
    }
  };

  // Handle addition of reviews with moderation pending state
  const handleAddReview = (
    carId: string,
    rating: number,
    comment: string,
    customerName: string,
  ) => {
    const freshReview: Review = {
      id: `rev-${Date.now()}`,
      carId,
      customerName,
      rating,
      comment,
      createdAt: new Date().toISOString().split("T")[0],
      isApproved: false, // Awaits admin approval!
    };
    setReviews((prev) => [freshReview, ...prev]);

    // Quick advisory toast
    setBookingToast(
      `Review saved! An administrator will review your comment for approval.`,
    );
    setTimeout(() => setBookingToast(null), 4000);
  };

  // Handle booking reservations from customer catalog
  const handleConfirmBook = (
    carId: string,
    bookingFields: {
      customerName: string;
      pickupDate: string;
      pickupTime: string;
      location: string;
      contactMethod: "whatsapp" | "telegram" | "none";
      message: string;
      totalCost: number;
    },
  ): Booking => {
    const targetCar = cars.find((c) => c.id === carId);

    const freshBooking: Booking = {
      id: `ENTR-${Math.floor(1000 + Math.random() * 9000)}`,
      carId,
      carName: targetCar ? targetCar.name : "Exclusive Enterprise Model",
      carImage: targetCar ? targetCar.image : "",
      customerName: bookingFields.customerName,
      pickupDate: bookingFields.pickupDate,
      pickupTime: bookingFields.pickupTime,
      location: bookingFields.location,
      contactMethod: bookingFields.contactMethod,
      message: bookingFields.message,
      totalCost: bookingFields.totalCost,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      setBookings((prev) => [freshBooking, ...prev]);
    }, 0);
    return freshBooking;
  };

  // Admin Bookings & Reviews controls
  const handleUpdateBookingStatus = (
    bookingId: string,
    status: Booking["status"],
  ) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
    );
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleApproveReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isApproved: true } : r)),
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  // Handle login completion
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setViewMode("admin");
  };

  // Logout routine
  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setViewMode("customer");
  };

  // Safe reset routine for filtering
  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      category: "All",
      maxPrice: 10000,
      transmission: "All",
      fuelType: "All",
      brand: "All",
      likedOnly: false,
    });
  };

  const handleToggleLike = (carId: string) => {
    setLikedCars((prev) => {
      if (prev.includes(carId)) {
        return prev.filter((id) => id !== carId);
      }
      return [...prev, carId];
    });
  };

  const handleClearLikes = () => {
    setLikedCars([]);
    if (filters.likedOnly) {
      setFilters(prev => ({ ...prev, likedOnly: false }));
    }
  };

  const getBrandFromName = (name: string) => {
    const multiWordBrands = [
      "Range Rover", "Land Rover", "Aston Martin", "Alfa Romeo", "Ssang Yong", 
      "Rolls Royce", "Mercedes Benz", "Great Wall"
    ];
    for (const brand of multiWordBrands) {
      if (name.toLowerCase().startsWith(brand.toLowerCase())) {
        return brand;
      }
    }
    return name.split(" ")[0];
  };

  // Dynamically extract unique brands from current fleet state
  const dynamicBrands = useMemo(() => {
    const list = cars.map((car) => getBrandFromName(car.name));
    return ["All", ...Array.from(new Set(list))];
  }, [cars]);

  // Category statistics counting dynamically based on current fleet state
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: cars.length };
    cars.forEach((car) => {
      counts[car.category] = (counts[car.category] || 0) + 1;
    });
    return counts;
  }, [cars]);

  // Filter computation logic
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CatalogFilters>(filters);
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsFiltering(true);
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => {
      setActiveFilters(filters);
      setIsFiltering(false);
    }, 300);
    return () => {
      if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    };
  }, [filters]);

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchSearch =
        car.name.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()) ||
        (car.description &&
          car.description
            .toLowerCase()
            .includes(activeFilters.searchTerm.toLowerCase()));
      const matchCategory =
        activeFilters.category === "All" || car.category === activeFilters.category;
      const matchPrice = car.price <= activeFilters.maxPrice;
      const matchTrans =
        activeFilters.transmission === "All" ||
        car.transmission === activeFilters.transmission;
      const matchFuel =
        activeFilters.fuelType === "All" || car.fuelType === activeFilters.fuelType;

      const carBrand = getBrandFromName(car.name);
      const matchBrand =
        activeFilters.brand === "All" ||
        carBrand.toLowerCase() === activeFilters.brand.toLowerCase();

      const matchLiked = !activeFilters.likedOnly || likedCars.includes(car.id);

      return (
        matchSearch &&
        matchCategory &&
        matchPrice &&
        matchTrans &&
        matchFuel &&
        matchBrand &&
        matchLiked
      );
    });
  }, [cars, activeFilters, likedCars]);

  // Smooth scroll helper matching IDs
  const scrollToAnchor = (elementId: string) => {
    setIsMobileMenuOpen(false);
    const target = document.getElementById(elementId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Hero Search execution and viewport scroll
  const handleHeroSearch = () => {
    scrollToAnchor("catalog-section");
  };

  // Trigger booking success toast from CarCard notifications
  const handleBookingToast = (carName: string) => {
    setBookingToast(
      `Successfully requested booking for ${carName}! Access code generated.`,
    );
    setTimeout(() => {
      setBookingToast(null);
    }, 4500);
  };

  // Brand color constant
  const brandPlum = "#4C0027";

  // Master router render
  if (viewMode === "login") {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToCustomer={() => setViewMode("customer")}
      />
    );
  }

  if (viewMode === "admin" && isAdminAuthenticated) {
    return (
      <AdminDashboard
        cars={cars}
        onAddCar={handleAddCar}
        onUpdateCar={handleUpdateCar}
        onDeleteCar={handleDeleteCar}
        onLogout={handleLogout}
        onNavigateToCustomer={() => setViewMode("customer")}
        // Stateful administration parameters linked
        bookings={bookings}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onDeleteBooking={handleDeleteBooking}
        reviews={reviews}
        onApproveReview={handleApproveReview}
        onDeleteReview={handleDeleteReview}
      />
    );
  }

  return (
    <div
      id="customer-application-root"
      className="min-h-screen bg-[#4C0027] text-stone-900 flex flex-col justify-between"
    >
      {/* 1. Responsive & Sticky Navigation Header */}
      <header
        id="main-public-header"
        className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto py-2.5 lg:py-0 lg:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => scrollToAnchor("home-panel")}
          >
            <BrandLogo size="md" variant="light" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-sans">
            <button
              id="nav-link-home"
              onClick={() => scrollToAnchor("home-panel")}
              className="text-stone-600 text-xs font-extrabold uppercase tracking-widest hover:text-[#4C0027] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              id="nav-link-catalog"
              onClick={() => scrollToAnchor("catalog-section")}
              className="text-stone-600 text-xs font-extrabold uppercase tracking-widest hover:text-[#4C0027] transition-colors cursor-pointer"
            >
              Car Catalog
            </button>

            {/* Desktop Global Search Bar */}
            <div className="relative w-64 xl:w-80 ml-4 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400 group-focus-within:text-[#4C0027] transition-colors" />
              </div>
              <input
                id="global-input-search-desktop"
                type="text"
                placeholder="Search models, brands..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
                onFocus={() => scrollToAnchor("catalog-section")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    scrollToAnchor("catalog-section");
                  }
                }}
                className="w-full pl-[38px] pr-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-stone-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-2 focus:ring-[#4C0027]/20 transition-all font-sans font-medium placeholder:text-stone-400"
              />
            </div>
          </nav>

          {/* Desktop Right Actions Container (visible only on lg screens & up) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Favorites Icon */}
            <div className="flex items-center relative gap-0.5 mr-2">
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, likedOnly: true }));
                  scrollToAnchor("category-filter-container");
                }}
                className={`p-2 lg:p-2.5 rounded-full transition-all border ${filters.likedOnly ? "bg-rose-50 text-rose-600 border-rose-200 shadow-sm scale-105" : "bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-rose-500 border-stone-200 hover:scale-105 active:scale-95"}`}
                title="Favorite Cars"
              >
                <Heart className={`w-4 h-4 lg:w-4.5 lg:h-4.5 ${filters.likedOnly ? "fill-current" : ""}`} />
              </button>
              {likedCars.length > 0 && (
                <span className="absolute -top-1.5 -right-0.5 lg:-top-1.5 lg:right-4 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {likedCars.length}
                </span>
              )}
              {likedCars.length > 0 && (
                  <button
                    onClick={handleClearLikes}
                    className="ml-1 text-stone-400 hover:text-rose-600 p-1 rounded-full hover:bg-rose-50 transition-colors"
                    title="Clear favorites"
                  >
                    <X className="w-4 h-4" />
                  </button>
              )}
            </div>

            {/* Quick Station info with Telegram & WhatsApp */}
            <div className="flex items-center select-none animate-fade-in pr-1">
              <div className="flex flex-row flex-nowrap items-center gap-1.5 sm:gap-4">
                <a
                  href="tel:0966714442"
                  className="text-xs sm:text-lg font-black text-[#4C0027] hover:underline whitespace-nowrap flex items-center gap-1 sm:gap-1.5 font-mono"
                  style={{ color: brandPlum }}
                >
                  <PhoneCall
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4C0027]"
                    style={{ color: brandPlum }}
                  />
                  <span>096 671 4442</span>
                </a>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <a
                    href="https://t.me/+855966714442"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Telegram"
                    className="p-1.5 sm:p-2 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:scale-110 active:scale-90 rounded-full transition-all border border-sky-100/60 shadow-3xs flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 -rotate-12 -translate-x-0.5" />
                  </a>
                  <a
                    href="https://wa.me/855966714442"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                    className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-110 active:scale-90 rounded-full transition-all border border-emerald-100/60 shadow-3xs flex items-center justify-center cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Right Actions Container (Stacked into 2 rows, visible only on mobile/tablet) */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Elegant 2-Row Stack */}
            <div className="flex flex-col items-end justify-center py-1 select-none">
              {/* Row 1: Phone Button */}
              <a
                href="tel:0966714442"
                className="text-xs sm:text-sm font-bold text-[#4C0027] hover:underline whitespace-nowrap flex items-center gap-1 font-mono hover:scale-[1.02] transition-transform"
                style={{ color: brandPlum }}
              >
                <PhoneCall className="w-3 h-3 text-[#4C0027]" style={{ color: brandPlum }} />
                <span>096 671 4442</span>
              </a>

              {/* Row 2: Social Buttons & Favorites Icon */}
              <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                {/* Telegram */}
                <a
                  href="https://t.me/+855966714442"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Telegram"
                  className="p-1 sm:p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 hover:scale-105 active:scale-95 rounded-full transition-all border border-sky-100/60 flex items-center justify-center cursor-pointer shadow-3xs"
                >
                  <Send className="w-3 h-3 -rotate-12 -translate-x-0.25" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/855966714442"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  className="p-1 sm:p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 active:scale-95 rounded-full transition-all border border-emerald-100/60 flex items-center justify-center cursor-pointer shadow-3xs"
                >
                  <MessageCircle className="w-3 h-3" />
                </a>

                {/* Favorites button with heart + clear */}
                <div id="mobile-header-fav-wrapper" className="relative flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, likedOnly: true }));
                      setIsMobileMenuOpen(false);
                      scrollToAnchor("category-filter-container");
                    }}
                    className={`p-1 sm:p-1.5 rounded-full transition-all border ${filters.likedOnly ? "bg-rose-50 text-rose-600 border-rose-200 shadow-xs scale-105" : "bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-rose-500 border-stone-200 hover:scale-105 active:scale-95"}`}
                    title="Favorite Cars"
                  >
                    <Heart className={`w-3 h-3 ${filters.likedOnly ? "fill-current" : ""}`} />
                  </button>
                  {likedCars.length > 0 && (
                    <span className="absolute -top-1 -right-0.5 bg-rose-500 text-white text-[8px] font-semibold px-1 rounded-full shadow-xs z-10 scale-90">
                      {likedCars.length}
                    </span>
                  )}
                  {likedCars.length > 0 && (
                    <button
                      onClick={handleClearLikes}
                      className="ml-0.5 text-stone-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 transition-colors"
                      title="Clear favorites"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Hamburger toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 text-stone-700 hover:bg-stone-50 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-stone-100 ml-0.5 sm:ml-1"
            >
              {isMobileMenuOpen ? (
                <X className="w-4.5 h-4.5" />
              ) : (
                <Menu className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-drawer-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-stone-200 overflow-hidden font-sans shadow-lg select-none"
            >
              <div className="px-4 py-5 space-y-4">
                {/* Mobile Global Search Bar */}
                <div className="relative w-full mb-2 group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-stone-400 group-focus-within:text-[#4C0027] transition-colors" />
                  </div>
                  <input
                    id="global-input-search-mobile"
                    type="text"
                    placeholder="Search models, brands..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    onFocus={() => {
                        scrollToAnchor("catalog-section");
                        setIsMobileMenuOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        scrollToAnchor("catalog-section");
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="w-full pl-[38px] pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium placeholder:text-stone-400"
                  />
                </div>

                <button
                  id="mobile-link-home"
                  onClick={() => {
                    scrollToAnchor("home-panel");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-xs font-black text-stone-800 uppercase tracking-widest hover:text-[#4C0027]"
                >
                  Home
                </button>
                <button
                  id="mobile-link-catalog"
                  onClick={() => {
                    scrollToAnchor("catalog-section");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-xs font-black text-stone-800 uppercase tracking-widest hover:text-[#4C0027]"
                >
                  Car Catalog
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Public Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Home Anchor panel wrapper */}
        <section id="home-panel" className="scroll-mt-24 select-none pb-2">
          {/* Hero Welcome Banner */}
          <div className="bg-stone-50 rounded-3xl p-8 sm:p-12 border border-stone-200 flex flex-col items-center text-center justify-center mb-10 overflow-hidden select-none relative max-w-5xl mx-auto shadow-xs">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#4C0027]/3 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4C0027]/2 rounded-tr-full pointer-events-none" />

            <div className="space-y-4 max-w-3xl flex flex-col items-center">
              <span className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black bg-yellow-400 text-black border border-yellow-500/20 uppercase tracking-widest shadow-xs">
                24/7 Nationwide Delivery
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight max-w-2xl">
                Car Rental Service Over 25 Cities/Provinces.
              </h1>
              <p className="text-stone-500 font-medium text-xs sm:text-sm leading-relaxed max-w-xl font-sans text-center">
                Browse for your favorite car and we will bring the car to you.
                All cars are guaranteed in high quality and under well
                maintenance, fully detailed and mechanically inspected for your
                absolute peace of mind.
              </p>

              <div className="pt-2 flex flex-col items-center gap-4 w-full">
                {/* Interactive Buttons Group: Find and Explore Catalog side-by-side */}
                <div className="flex sm:flex-row flex-col items-stretch sm:items-center justify-center gap-3 mt-4 select-none w-full max-w-md">
                  <button
                    id="hero-btn-search-trigger"
                    type="button"
                    onClick={() => scrollToAnchor("search-filters-container")}
                    className="flex-1 px-8 py-3.5 bg-[#4C0027] hover:bg-[#5E0030] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: brandPlum }}
                  >
                    <Search className="w-4 h-4" />
                    <span>Find</span>
                  </button>

                  <button
                    id="hero-btn-catalog"
                    type="button"
                    onClick={() => scrollToAnchor("category-filter-container")}
                    className="flex-1 px-8 py-3.5 border border-[#4C0027]/20 hover:bg-[#4C0027]/5 text-[#4C0027] text-xs sm:text-sm font-extrabold rounded-xl shadow-2xs transition-all duration-150 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer whitespace-nowrap bg-white"
                  >
                    <span>Explore Catalog</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Requirement Visual Highlight Board */}
          <div className="max-w-5xl mx-auto mt-8 mb-8 animate-fade-in">
            <div className="bg-[#4C0027] text-white rounded-3xl p-6 sm:p-8 border border-[#4C0027]/20 shadow-lg relative overflow-hidden flex flex-col justify-center items-center text-center select-none">
              {/* Subtle background abstract decorations */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <span className="text-[10px] sm:text-xs font-bold text-stone-300 uppercase tracking-[0.2em] font-mono mb-2 drop-shadow-xs">
                Contract Requirement
              </span>

              <h2 className="text-3xl sm:text-4.5xl font-black text-amber-400 tracking-wider uppercase mb-3 drop-shadow-md">
                6-Month Term
              </h2>

              <p className="text-xs sm:text-sm font-mono text-stone-200 tracking-wider">
                1 Mo. Deposit + 1 Mo. Rent
              </p>
            </div>
          </div>
        </section>

        {/* Catalog Anchor Target */}
        <section id="catalog-section" className="scroll-mt-24 select-none">
          {/* 3. Search parameters panel */}
          <section
            id="search-filters-container"
            className="scroll-mt-24 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm mb-8 space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-sans font-black text-stone-900 text-lg sm:text-xl tracking-tight flex items-center gap-2">
                  <SlidersHorizontal
                    className="w-5 h-5 text-[#4C0027]"
                    style={{ color: brandPlum }}
                  />
                  Find your favorite car
                </h2>
                <p className="text-xs text-stone-500 mt-1 leading-normal">
                  Refine our roster of high-end sedans, SUVs, and pristine
                  high-performance electric categories.
                </p>
              </div>

              {/* Clear filters button */}
              <button
                id="btn-reset-filters"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition-all cursor-pointer bg-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Row 1: Search & Price */}
              <div className="col-span-1 lg:col-span-7">
                <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                  Search Model / Keywords
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-stone-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    id="filter-input-search"
                    type="text"
                    placeholder="e.g. Porsche, Tesla, SUV..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium placeholder:text-stone-400"
                  />
                </div>
              </div>

              <div className="col-span-1 lg:col-span-5 flex flex-col justify-center bg-stone-50 rounded-xl px-5 py-4 border border-stone-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider font-mono">
                    Max Monthly Fee
                  </label>
                  <span
                    id="price-slider-display"
                    className="text-xs font-mono font-bold text-[#4C0027] bg-white px-2.5 py-1 rounded-md border border-stone-200 shadow-sm"
                    style={{ color: brandPlum }}
                  >
                    up to ${filters.maxPrice}/month
                  </span>
                </div>
                <input
                  id="filter-slider-price"
                  type="range"
                  min="300"
                  max="10000"
                  step="100"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrice: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[#4C0027] cursor-pointer"
                  style={{ accentColor: brandPlum }}
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-2 font-mono">
                  <span>$300/mo</span>
                  <span>$10,000/mo</span>
                </div>
              </div>

              {/* Row 2: Dropdowns */}
              <div className="col-span-1 lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    Car Brand
                  </label>
                  <div className="relative">
                    <select
                      value={filters.brand}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          brand: e.target.value,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {dynamicBrands.map((b) => (
                        <option value={b} key={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    Type of Car
                  </label>
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          category: e.target.value as any,
                          likedOnly: false,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {["All", "Sedan", "SUV", "MPV", "Pickup", "Truck"].map(
                        (cat) => (
                          <option value={cat} key={cat}>
                            {cat}
                          </option>
                        ),
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    Fuel System Type
                  </label>
                  <div className="relative">
                    <select
                      value={filters.fuelType}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          fuelType: e.target.value as any,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {[
                        "All",
                        "Gasoline",
                        "Diesel",
                        "LPG",
                        "Hybrid",
                        "Electric",
                      ].map((fuel) => (
                        <option value={fuel} key={fuel}>
                          {fuel}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2 font-mono">
                    Gearbox
                  </label>
                  <div className="relative">
                    <select
                      value={filters.transmission}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          transmission: e.target.value as any,
                        }))
                      }
                      className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium cursor-pointer hover:border-stone-300"
                    >
                      {["All", "Automatic", "Manual"].map((mode) => (
                        <option value={mode} key={mode}>
                          {mode === "All"
                            ? "All"
                            : mode === "Automatic"
                              ? "Auto"
                              : "Manual"}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Horizontal Category Tab Selector Bar */}
          <section
            id="category-filter-container"
            className="scroll-mt-24 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm mb-8"
          >
            <h2 className="font-sans font-black text-stone-900 text-lg sm:text-xl tracking-tight flex items-center gap-2 mb-4">
              <CarFront
                className="w-5 h-5 text-[#4C0027]"
                style={{ color: brandPlum }}
              />
              Explore our catalog
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Liked Filter Button */}
              <button
                id="filter-liked-cars"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, likedOnly: !prev.likedOnly }))
                }
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${filters.likedOnly ? "bg-rose-100/50 text-rose-600 border-rose-200 shadow-sm" : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"}`}
              >
                <span>Liked</span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${filters.likedOnly ? "bg-rose-200/50 text-rose-700" : "bg-stone-100 text-stone-400"}`}>
                  {likedCars.length}
                </span>
              </button>

              <div className="w-[1px] h-6 bg-stone-200 mx-2 hidden sm:block"></div>

              {["All", "Sedan", "SUV", "MPV", "Pickup", "Truck"].map((cat) => {
                const isSelected = filters.category === cat;
                const count = categoryCounts[cat] || 0;

                return (
                  <button
                    key={cat}
                    id={`filter-cat-tab-${cat}`}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, category: cat, likedOnly: false }))
                    }
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${isSelected ? "bg-[#4C0027] text-white border-[#4C0027] shadow-sm" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-black"}`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-stone-200 text-stone-500"}`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. Car catalog grid block */}
          <div id="collection-grid-view">
            {isFiltering ? (
              <div
                id="cars-grid-loading"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-3 border border-stone-100 shadow-sm animate-pulse flex flex-col justify-between" style={{ minHeight: '380px' }}>
                    <div className="w-full h-40 sm:h-52 bg-stone-100 rounded-2xl mb-4" />
                    <div className="px-3">
                      <div className="w-3/4 h-6 bg-stone-200 rounded-lg mb-2" />
                      <div className="flex gap-2 mb-4">
                        <div className="w-1/3 h-8 bg-stone-100 rounded-xl" />
                        <div className="w-1/3 h-8 bg-stone-100 rounded-xl" />
                        <div className="w-1/3 h-8 bg-stone-100 rounded-xl" />
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="w-20 h-8 bg-stone-200 rounded-md" />
                        <div className="w-24 h-10 bg-stone-200 rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-xs flex flex-col items-center justify-center select-none">
                <div className="w-16 h-16 bg-stone-50 text-stone-300 rounded-2xl flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-black text-lg">
                  No vehicles match filters
                </h3>
                <p className="text-xs text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed font-sans">
                  Adjust your searching keywords, price limit settings, or
                  category selection to retrieve archived vehicle records.
                </p>
                <button
                  id="btn-empty-state-reset"
                  onClick={handleResetFilters}
                  className="mt-5 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                  style={{ backgroundColor: brandPlum }}
                >
                  Restore Full Inventory
                </button>
              </div>
            ) : (
              <div
                id="cars-grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout animate-fade-in">
                  {filteredCars.map((car) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      onBookSuccess={handleBookingToast}
                      reviews={reviews}
                      onAddReview={handleAddReview}
                      onConfirmBook={(bookingFields) =>
                        handleConfirmBook(car.id, bookingFields)
                      }
                      isLiked={likedCars.includes(car.id)}
                      onToggleLike={handleToggleLike}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 7. Toast Alerts container absolutely positioned */}
      <AnimatePresence>
        {bookingToast !== null && (
          <motion.div
            id="global-toast-alert"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 flex items-center gap-3 max-w-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed text-stone-200 font-sans">
                {bookingToast}
              </p>
            </div>
            <button
              id="btn-close-toast"
              onClick={() => setBookingToast(null)}
              className="text-stone-400 hover:text-white font-black leading-none cursor-pointer text-sm"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Modern Aesthetic Footer */}
      <footer
        id="global-theme-footer"
        className="bg-stone-900 text-stone-200 mt-20 border-t border-stone-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 select-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-4">
              <BrandLogo size="md" variant="dark" />
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed font-sans">
                Redefining premium vehicle mobilization. Enter car rental
                connects high-grade dispatcher administration with pristine
                security frameworks.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-extrabold text-stone-300 uppercase tracking-widest mb-4">
                Quick Navigation
              </h4>
              <ul className="space-y-2.5 text-xs text-stone-400">
                <li>
                  <button
                    onClick={() =>
                      setViewMode(isAdminAuthenticated ? "admin" : "login")
                    }
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left font-semibold font-bold"
                  >
                    Administrative Security Portal
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-extrabold text-stone-300 uppercase tracking-widest mb-4 font-mono">
                AUTHORIZED STATION
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed font-sans">
                Enter Car Rental Inc.
                <br />
                Hub 1, Domestic Arrivals Gate B<br />
                International Airport Road
                <br />
                Houston Terminal Hub
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500 font-sans">
            <p>
              © 2026 Enter Car Rental Inc. All rights reserved. Managed with
              strict mechanics parameters.
            </p>
            <div className="flex gap-4">
              <span className="hover:text-stone-300 cursor-pointer">
                Privacy Policy
              </span>
              <span>•</span>
              <span className="hover:text-stone-300 cursor-pointer">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
