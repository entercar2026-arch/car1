import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from "react";
import { Car, ViewMode, CatalogFilters, Booking, Review } from "./types";
import { INITIAL_CARS } from "./data";
import { BrandLogo } from "./components/BrandLogo";
import { CarCard } from "./components/CarCard";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { motion, AnimatePresence, useScroll, useSpring } from "motion/react";
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
  ArrowDown,
  HelpCircle,
  CarFront,
  Users,
  Settings2,
  Fuel,
  TrendingUp,
  Award,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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

  // Track if clear favorites confirmation modal is open
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Track session authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => {
      return isSessionTokenValid();
    },
  );

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Back to Top State
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past roughly the hero section (e.g., 600px)
      if (window.scrollY > 600) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Current Screen / Node View
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const isAuth = isSessionTokenValid();
    return isAuth ? "admin" : "customer";
  });

  // Filter criteria state
  const [filters, setFilters] = useState<CatalogFilters>({
    searchTerm: "",
    category: "All",
    maxPrice: 5000,
    transmission: "All",
    fuelType: "All",
    brand: "All",
    likedOnly: false,
  });

  // Sorting state
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "alphabetical">("default");

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
      maxPrice: 5000,
      transmission: "All",
      fuelType: "All",
      brand: "All",
      likedOnly: false,
    });
  };

  const handleToggleLike = (carId: string) => {
    setLikedCars((prev) => {
      if (prev.includes(carId)) {
        const newLikes = prev.filter((id) => id !== carId);
        if (newLikes.length === 0 && filters.likedOnly) {
          setFilters(f => ({ ...f, likedOnly: false, category: "All" }));
        }
        return newLikes;
      }
      return [...prev, carId];
    });
  };

  const handleClearLikes = () => {
    setShowClearConfirm(true);
  };

  const confirmClearLikes = () => {
    setLikedCars([]);
    if (filters.likedOnly) {
      setFilters(prev => ({ ...prev, likedOnly: false, category: "All" }));
    }
    setShowClearConfirm(false);
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
    const results = cars.filter((car) => {
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

    if (sortBy === "price-asc") {
      return [...results].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...results].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "alphabetical") {
      return [...results].sort((a, b) => a.name.localeCompare(b.name));
    }
    return results;
  }, [cars, activeFilters, likedCars, sortBy]);

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

  // Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
      className="min-h-screen bg-[#4C0027] text-stone-900 flex flex-col justify-between relative"
    >
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-amber-400 z-[100] origin-left"
      />
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
            <button
              id="nav-link-about"
              onClick={() => scrollToAnchor("about-section")}
              className="text-stone-600 text-xs font-extrabold uppercase tracking-widest hover:text-[#4C0027] transition-colors cursor-pointer"
            >
              About Us
            </button>

            {/* Desktop Global Search Bar */}
            <div className="relative w-36 focus-within:w-72 xl:focus-within:w-80 ml-4 group transition-all duration-300 ease-in-out">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-stone-400 group-focus-within:text-[#4C0027] transition-colors" />
              </div>
              <input
                id="global-input-search-desktop"
                type="text"
                placeholder="Find car..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    scrollToAnchor("catalog-section");
                  }
                }}
                className="w-full pl-[38px] pr-10 py-2 bg-stone-50 border border-stone-200 rounded-full text-stone-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-2 focus:ring-[#4C0027]/20 transition-all font-sans font-medium placeholder:text-stone-400"
              />
              {filters.searchTerm && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, searchTerm: "" }))}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-[#4C0027] transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </nav>

          {/* Desktop Right Actions Container (visible only on lg screens & up) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Favorites Icon */}
            <div className="flex items-center relative gap-0.5 mr-2">
              <button
                onClick={() => {
                  if (likedCars.length > 0) {
                    setFilters((prev) => ({ ...prev, likedOnly: true, category: "All" }));
                  } else {
                    setFilters((prev) => ({ ...prev, likedOnly: false, category: "All" }));
                  }
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
                      if (likedCars.length > 0) {
                        setFilters((prev) => ({ ...prev, likedOnly: true, category: "All" }));
                      } else {
                        setFilters((prev) => ({ ...prev, likedOnly: false, category: "All" }));
                      }
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
              className="lg:hidden bg-white border-t border-stone-200 overflow-hidden font-sans shadow-lg"
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
                    placeholder="Find car..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        scrollToAnchor("catalog-section");
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className="w-full pl-[38px] pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium placeholder:text-stone-400"
                  />
                  {filters.searchTerm && (
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, searchTerm: "" }))}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-[#4C0027] transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
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
                <button
                  id="mobile-link-about"
                  onClick={() => {
                    scrollToAnchor("about-section");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-xs font-black text-stone-800 uppercase tracking-widest hover:text-[#4C0027]"
                >
                  About Us
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
        <section id="catalog-section" className="scroll-mt-24">
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
                  Find your car
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
                    className="w-full pl-11 pr-10 py-3.5 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans font-medium placeholder:text-stone-400"
                  />
                  {filters.searchTerm && (
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, searchTerm: "" }))}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-[#4C0027] transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
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
                  max="5000"
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
                  <span>$5,000/mo</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="font-sans font-black text-stone-900 text-lg sm:text-xl tracking-tight flex items-center gap-2">
                <CarFront
                  className="w-5 h-5 text-[#4C0027]"
                  style={{ color: brandPlum }}
                />
                Explore our catalog
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Sort By:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 text-xs font-bold focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all font-sans cursor-pointer hover:border-stone-300"
                  >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="alphabetical">Alphabetical (A-Z)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-stone-400">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Liked Filter Button */}
              <button
                id="filter-liked-cars"
                onClick={() => {
                  if (likedCars.length === 0) {
                    setFilters((prev) => ({ ...prev, likedOnly: false, category: "All" }));
                  } else {
                    setFilters((prev) => ({
                      ...prev,
                      likedOnly: !prev.likedOnly,
                      ...(!prev.likedOnly ? { category: "All" } : {})
                    }));
                  }
                }}
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
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-stone-900 font-extrabold text-lg sm:text-xl tracking-tight">
              Vehicle Catalog
            </h2>
            <div className="text-xs sm:text-sm font-medium text-stone-500 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
              Showing <span className="font-bold text-[#4C0027]" style={{ color: brandPlum }}>{filteredCars.length}</span> of <span className="font-bold text-stone-800">{cars.length}</span> vehicles
            </div>
          </div>
          <div id="collection-grid-view">
            {isFiltering ? (
              <div
                id="cars-grid-loading"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                 {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-3 border border-stone-100 shadow-sm flex flex-col justify-between" style={{ minHeight: '380px' }}>
                    <div className="w-full h-40 sm:h-52 shimmer rounded-2xl mb-4" />
                    <div className="px-3">
                      <div className="w-3/4 h-6 shimmer-dark rounded-lg mb-2" />
                      <div className="flex gap-2 mb-4">
                        <div className="w-1/3 h-8 shimmer rounded-xl" />
                        <div className="w-1/3 h-8 shimmer rounded-xl" />
                        <div className="w-1/3 h-8 shimmer rounded-xl" />
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="w-20 h-8 shimmer-dark rounded-md" />
                        <div className="w-24 h-10 shimmer-dark rounded-xl" />
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

        {/* About Us Section */}
        <section
          id="about-section"
          className="scroll-mt-24 mt-16 select-none bg-stone-50 border border-stone-200/60 rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden shadow-xs animate-fade-in mx-auto max-w-5xl font-sans"
        >
          {/* Ambient background accent decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#4C0027]/2 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#4C0027]/2 rounded-full blur-xl pointer-events-none" />

          <div className="relative text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4C0027]/5 rounded-full text-[10px] font-black uppercase text-[#4C0027] tracking-widest mb-4">
              <Award className="w-3.5 h-3.5" style={{ color: brandPlum }} />
              <span>Established 2021</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-4">
              Providing Seamless Connections Between Discerning Clients & Trusted Car Owners
            </h2>
            <div className="w-12 h-1 bg-[#4C0027] mx-auto rounded-full mb-4" style={{ backgroundColor: brandPlum }} />
            <p className="text-stone-600 text-sm leading-relaxed max-w-2xl mx-auto">
              For several years, Enter Car Rental has served as your elite concierge brokerage, curating custom relationships between clients and our network of private vehicle owners.
            </p>
          </div>

          {/* Visual Narrative & Philosophy */}
          <div className="max-w-3xl mx-auto space-y-10 relative mb-16">
            <div className="space-y-6 text-center bg-white border border-stone-150 rounded-2xl p-8 sm:p-10 shadow-3xs">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-[#4C0027]/5 text-[#4C0027] mb-2" style={{ color: brandPlum }}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                Trust Built on Relationships
              </h3>
              <div className="space-y-4 text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                <p>
                  Founded in <strong>2021</strong>, our agency was established to solve a vital market need: providing complete safety and direct, uninflated pricing in the car leasing market.
                </p>
                <p>
                  As your dedicated agent, I work intimately with both our clientele and a trusted network of verified car owners. Over the years, we have nurtured personal connections with car owners who treat their vehicles with utmost care, allowing us to source and verify the absolute best rides at competitive price structures.
                </p>
                <div className="pt-4 pb-2">
                  <div className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Direct Verification: All vehicles personally inspected before dispatch
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Philosophy Quote */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute -top-3 -left-3 text-[#4C0027]/20">
                <Sparkles className="w-8 h-8 pointer-events-none" />
              </div>
              <div className="bg-stone-50 border border-[#4C0027]/10 rounded-xl p-6 sm:p-8 text-center shadow-xs relative z-10">
                <div className="text-[10px] text-[#4C0027] font-extrabold uppercase tracking-widest mb-3" style={{ color: brandPlum }}>
                  Agent Philosophy
                </div>
                <blockquote className="text-stone-800 font-medium italic text-sm sm:text-base leading-relaxed">
                  "Your journey is our reputation. Leveraging years of trust with vehicle owners is how we win your peace of mind."
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Our Process Workflow Section */}
        <section
          id="workflow-section"
          className="scroll-mt-24 select-none bg-stone-50 border border-stone-200/60 rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden shadow-xs animate-fade-in mx-auto max-w-5xl font-sans"
        >
          {/* Unified 5-Step Work Flow Highlight */}
          <div className="pt-2">
            <h3 className="text-stone-900 font-extrabold text-2xl sm:text-3xl text-center mb-8 tracking-tight font-sans">
              Our Process Workflow
            </h3>
            <div className="relative max-w-2xl mx-auto px-4 sm:px-8">
              {/* Vertical connecting line */}
              <div className="absolute top-10 bottom-10 left-[43px] sm:left-[59px] w-[2px] bg-stone-200"></div>

              <div className="space-y-0 relative z-10">
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <Search className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">1</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      Select & Specify
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      Tell us the car you want or browse our comprehensive car catalog to identify your preference.
                    </p>
                  </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <Users className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">2</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      Owner Sourcing
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      We work with cooperative car owners to find your preferred car (or similar substitute) and send you the exact available vehicle details and photos.
                    </p>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <MapPin className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">3</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      Direct Delivery
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      We coordinate with vehicle owners to bring the car straight to your location for a smooth, stress-free handover.
                    </p>
                  </div>
                </motion.div>

                {/* Step 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <FileText className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">4</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      Agreement Execution
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      Sign the clear lease contract securely on-site with zero complex barriers or dynamic fees.
                    </p>
                  </div>
                </motion.div>

                {/* Step 5 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                  className="relative flex items-start gap-6 sm:gap-8 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white border-4 border-stone-50 shadow-sm flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 relative mt-1">
                    <ShieldCheck className="w-6 h-6 text-[#4C0027]" style={{ color: brandPlum }} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shadow-sm border-2 border-white">5</div>
                  </div>
                  <div className="pt-3 pb-10 flex-1 border-b border-stone-100 group-last:border-0 group-last:pb-2">
                    <h4 className="text-stone-900 font-bold text-base sm:text-lg tracking-tight mb-2">
                      Active Aftercare
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                      Remain fully supported throughout your drive with continuous agent updates and technical troubleshooting.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq-section"
          className="scroll-mt-24 select-none bg-stone-50 border border-stone-200/60 rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden shadow-xs animate-fade-in mx-auto max-w-5xl font-sans"
        >
          <div className="pt-2 w-full mx-auto px-0 sm:px-8">
            <h3 className="text-stone-900 font-extrabold text-2xl sm:text-3xl text-center mb-8 tracking-tight font-sans">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {[
                {
                  question: "What is the term and condition to rent a car?",
                  answer: "The standard term of rental is 6-Month with 1-month deposit and 1-month rent. A photo of passport is required."
                },
                {
                  question: "Can I extend my rental?",
                  answer: "Yes, rental extensions are certainly possible. You can let us know in 15 days in advance."
                },
                {
                  question: "Can I return the car back earlier?",
                  answer: "Yes, you can."
                },
                {
                  question: "When do I get my deposit back?",
                  answer: "You can get back your deposit at the end of contract. After hand over the vehicle back."
                },
                {
                  question: "Who covers the maintenance?",
                  answer: "Basic maintenance and spare parts replace by its aged is the responsibility of the car owner."
                }
              ].map((faq, index) => (
                <div 
                  key={index} 
                  className={`border border-stone-200 rounded-2xl overflow-hidden shadow-xs transition-all duration-300 hover:shadow-sm ${
                    openFaq === index ? "bg-amber-50/50" : "bg-white"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left transition duration-300 focus:outline-none"
                  >
                    <span className="font-bold text-stone-900 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#4C0027] shrink-0 transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                      style={{ color: brandPlum }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="p-5 pt-0 border-t border-stone-100 text-stone-500 text-sm leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 7. Toast Alerts container absolutely positioned */}
      <AnimatePresence>
        {bookingToast !== null && (
          <motion.div
            id="global-toast-alert"
            initial={{ opacity: 0, y: 70, scale: 0.85, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 25, scale: 0.9, filter: "blur(2px)", transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ type: "spring", damping: 18, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-50 p-4 bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm overflow-hidden"
          >
            {/* Visual accent backdrop shine */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#4C0027]/15 rounded-full blur-xl pointer-events-none" />

            {/* Micro-particle Burst & Animating Icon Container */}
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              {/* Pulsing Backlight Halo */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-emerald-500/20"
              />
              
              {/* Micro-Particles Confetti Burst on Mount */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 360) / 12;
                const distance = 24 + Math.random() * 24;
                const radian = (angle * Math.PI) / 180;
                const targetX = Math.cos(radian) * distance;
                const targetY = Math.sin(radian) * distance;
                const particleColors = ["#10B981", "#34D399", "#A7F3D0", "#F43F5E", "#FBBF24"];
                const color = particleColors[i % particleColors.length];
                
                return (
                  <motion.span
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: color,
                      left: "13px",
                      top: "13px",
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: targetX,
                      y: targetY,
                      scale: [0, 1.3, 0],
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      duration: 0.9,
                      ease: "easeOut",
                      delay: 0.05 + Math.random() * 0.1
                    }}
                  />
                );
              })}

              {/* Success Checkmark Icon with Spring Entrance */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 11, stiffness: 220, delay: 0.1 }}
                className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
              </motion.div>
            </div>

            {/* Success Details Text */}
            <div className="flex-1 min-w-0 pr-2">
              <motion.p
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xs font-semibold leading-relaxed text-stone-200 font-sans"
              >
                {bookingToast}
              </motion.p>
            </div>

            {/* Precise Interaction Dismiss Button */}
            <motion.button
              id="btn-close-toast"
              onClick={() => setBookingToast(null)}
              whileHover={{ rotate: 90, scale: 1.15 }}
              whileActive={{ scale: 0.9 }}
              className="text-stone-400 hover:text-white font-black leading-none cursor-pointer text-base shrink-0 p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              &times;
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Favorites Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop slide-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs"
            />

            {/* Dialog Content Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 text-center font-sans z-10"
            >
              {/* Alert icon with subtle glow */}
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 text-rose-500 shadow-3xs">
                <HelpCircle className="w-6 h-6 animate-pulse" />
              </div>

              {/* Title & Warning description */}
              <h3 className="text-stone-900 font-extrabold text-base mb-2 font-sans tracking-tight">
                Clear Favorites?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-[270px] mx-auto mb-6 font-sans">
                Are you sure you want to remove all cars from your liked list? This action cannot be undone.
              </p>

              {/* Modulated Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold font-sans hover:bg-stone-50 transition-all cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmClearLikes}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-sans transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Yes, Clear
                </button>
              </div>
            </motion.div>
          </div>
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
                Since 2021, Enter Car Rental has served as your dedicated agent, bridging the gap between clients and trusted vehicle owners. We leverage deep, long-term owner relationships to secure competitive rates and worry-free driving experiences.
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

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 p-3.5 bg-white text-stone-900 rounded-full shadow-lg border border-stone-200 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
            aria-label="Back to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
