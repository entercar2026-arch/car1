import React, { useState, useMemo, useEffect, startTransition } from "react";
import { createPortal } from "react-dom";
import { Car, Review, Booking } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { BrandIcon } from "./BrandIcon";
import {
  Users,
  Fuel,
  Settings2,
  ShieldCheck,
  Check,
  Calendar,
  ArrowRight,
  Star,
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  User,
  Mail,
  Receipt,
  Upload,
  Camera,
  MapPin,
  MessageCircle,
  FileWarning,
  X,
  Heart,
  Share2,
  Play,
  Cpu,
  Gauge,
  HelpCircle,
  Loader2,
  Car as CarIcon,
  Palette,
  Images,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const getOptimizedImageUrl = (url: string, windowWidth: number, type: 'cover' | 'thumbnail' = 'cover') => {
  if (!url) return url;
  
  // Decide target width based on viewport and usage type
  let targetWidth = 800;
  if (type === 'thumbnail') {
    targetWidth = windowWidth <= 768 ? 200 : 300;
  } else {
    // main cover
    targetWidth = windowWidth <= 640 ? 400 : windowWidth <= 1024 ? 600 : 800;
  }

  if (url.includes('unsplash.com')) {
    if (url.includes('w=')) {
      return url.replace(/w=\d+/, `w=${targetWidth}`).replace(/q=\d+/, 'q=70');
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${targetWidth}&q=70&auto=format&fit=crop`;
  }
  
  if (url.includes('/upload/') && !url.includes('wikimedia.org')) {
    // f_auto will serve webp/avif for images, and wepm/mp4 for videos automatically based on browser
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${targetWidth},c_scale/`);
  }
  
  return url;
};

const getFallbackCarThumbnail = (carName: string, category: string): string => {
  const name = carName.toLowerCase();
  if (name.includes("porsche") || name.includes("911")) {
    return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600";
  }
  if (name.includes("tesla") || name.includes("model s") || name.includes("plaid")) {
    return "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600";
  }
  if (name.includes("lexus") || name.includes("rx")) {
    return "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=600";
  }
  if (name.includes("prius") || name.includes("toyota")) {
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";
  }
  if (name.includes("ford") || name.includes("mustang")) {
    return "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600";
  }
  // Generic fallback by category
  if (category.toLowerCase() === "suv") {
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";
  }
  return "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
};

import { translations } from "../translations";

export interface CarCardProps {
  car: Car;
  isAdminMode?: boolean;
  onEdit?: (car: Car) => void;
  onDelete?: (carId: string) => void;
  onBookSuccess?: (carName: string) => void;
  reviews?: Review[];
  onAddReview?: (
    carId: string,
    rating: number,
    comment: string,
    customerName: string,
  ) => void;
  onConfirmBook?: (carId: string, bookingData: {
    customerName: string;
    pickupDate: string;
    pickupTime: string;
    location: string;
    contactMethod: "whatsapp" | "telegram" | "none";
    message: string;
    totalCost: number;
  }) => Booking;
  isLiked?: boolean;
  onToggleLike?: (carId: string) => void;
  onFilterSelect?: (filterType: "category" | "transmission" | "fuelType" | "seats", value: string | number) => void;
  lang?: "en" | "kh";
}

const CarCardComponent: React.FC<CarCardProps> = ({
  car,
  isAdminMode = false,
  onEdit,
  onDelete,
  onBookSuccess,
  reviews = [],
  onAddReview,
  onConfirmBook,
  isLiked = false,
  onToggleLike,
  onFilterSelect,
  lang = "en",
}) => {
  const t = translations[lang];

  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const [imageError, setImageError] = useState(false);
  const isMobile = windowWidth <= 768;

  const effectiveVideoUrl = useMemo(() => {
    return car.videoUrl || "";
  }, [car.videoUrl]);

  const allPhotos = useMemo(() => {
    return car.photos?.length ? car.photos : [car.image, car.altImage].filter(Boolean) as string[];
  }, [car.photos, car.image, car.altImage]);

  const primaryImage = car.image || getFallbackCarThumbnail(car.name, car.category);
  const primaryImageSrc = useMemo(() => getOptimizedImageUrl(primaryImage, windowWidth, 'cover'), [primaryImage, windowWidth]);
  const currentImage = allPhotos.length > 0 ? allPhotos[currentPhotoIndex] : primaryImage;

  const targetImageSrc = useMemo(() => getOptimizedImageUrl(currentImage, windowWidth, 'cover'), [currentImage, windowWidth]);
  const [renderedImageSrc, setRenderedImageSrc] = useState(targetImageSrc);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    if (targetImageSrc !== renderedImageSrc) {
      let isCancelled = false;
      setIsPreloading(true);
      const img = new Image();
      img.onload = () => {
        if (!isCancelled) {
          setRenderedImageSrc(targetImageSrc);
          setIsPreloading(false);
        }
      };
      img.onerror = () => {
        if (!isCancelled) {
          setRenderedImageSrc(targetImageSrc);
          setIsPreloading(false);
        }
      };
      img.src = targetImageSrc;
      return () => {
        isCancelled = true;
      };
    }
  }, [targetImageSrc, renderedImageSrc]);

  const isVideoMedia = (url?: string) => {
    if (!url) return false;
    return !!(url.match(/\.(mp4|webm|ogg|quicktime)(\?.*)?$/i) || url.toLowerCase().includes("video") || url.startsWith("data:video/"));
  };

  const hasVideo = useMemo(() => {
    if (currentPhotoIndex === 0 && effectiveVideoUrl) return true;
    return isVideoMedia(currentImage);
  }, [currentImage, effectiveVideoUrl, currentPhotoIndex]);

  const videoSource = useMemo(() => {
    if (currentPhotoIndex === 0 && effectiveVideoUrl) return effectiveVideoUrl;
    return primaryImage;
  }, [primaryImage, effectiveVideoUrl, currentPhotoIndex]);

  const optimizedVideoSource = useMemo(() => {
    return getOptimizedImageUrl(videoSource, windowWidth, 'cover');
  }, [videoSource, windowWidth]);

  const isGoogleDrive = currentImage.includes("drive.google.com/uc");
  const driveId = isGoogleDrive ? currentImage.match(/id=([^&]+)/)?.[1] : null;

  const videoPoster = useMemo(() => {
    if (currentImage.includes("upload/") && currentImage.match(/\.(mp4|webm|ogg)$/i)) {
      return getOptimizedImageUrl(currentImage.replace(/\.(mp4|webm|ogg)$/i, ".jpg"), windowWidth, 'cover');
    }
    return undefined;
  }, [currentImage, windowWidth]);

  const youtubeThumbnail = useMemo(() => {
    const getYoutubeId = (url?: string): string | null => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };
    const ytId = getYoutubeId(currentImage) || getYoutubeId(car.videoUrl);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    }
    return undefined;
  }, [currentImage, car.videoUrl]);

  const [generatedPoster, setGeneratedPoster] = useState<string | undefined>();
  
  useEffect(() => {
    if (videoPoster || youtubeThumbnail) return;
    if (!hasVideo) return;
    
    let isMounted = true;
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.style.display = "none";
    document.body.appendChild(video);
    
    const cleanup = () => {
      isMounted = false;
      video.removeAttribute("src");
      video.load();
      if (document.body.contains(video)) {
        document.body.removeChild(video);
      }
    };
    
    video.addEventListener("loadeddata", () => {
      if (!isMounted) return;
      video.currentTime = 0.5;
    });
    
    video.addEventListener("seeked", () => {
      if (!isMounted) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setGeneratedPoster(dataUrl);
        }
      } catch (err) {
        console.warn("Could not generate video thumbnail due to CORS");
      }
      cleanup();
    });
    
    const sourceToUse = optimizedVideoSource;
    let videoUrlForCapture = sourceToUse;
    if (videoUrlForCapture && !videoUrlForCapture.startsWith("data:") && !videoUrlForCapture.includes("drive.google.com")) {
        videoUrlForCapture += (videoUrlForCapture.includes("?") ? "&" : "?") + "cors_bypass=" + Date.now();
    }
    video.src = videoUrlForCapture;
    
    return cleanup;
  }, [hasVideo, videoPoster, youtubeThumbnail, optimizedVideoSource]);
  
  const finalVideoPoster = car.thumbnail || videoPoster || youtubeThumbnail || generatedPoster || currentImage;

  const hasRealPoster = useMemo(() => {
    return !!(car.thumbnail || videoPoster || youtubeThumbnail || generatedPoster);
  }, [car.thumbnail, videoPoster, youtubeThumbnail, generatedPoster]);

  // Booking flow states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<"enquire" | "book">("enquire");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [location, setLocation] = useState("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "telegram" | "none">(
    "none",
  );
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tel, setTel] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );

  // Reviews flow states
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

  // Keyboard navigation for photo gallery
  useEffect(() => {
    if (!isPhotosOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && allPhotos.length > 1) {
        setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
      } else if (e.key === "ArrowRight" && allPhotos.length > 1) {
        setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
      } else if (e.key === "Escape") {
        setIsPhotosOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPhotosOpen, allPhotos.length]);

  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const brandPlum = "#4C0027";

  // Category Colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Sedan":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "SUV":
        return "bg-blue-100 text-blue-900 border-blue-200";
      case "MPV":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      case "Pickup":
        return "bg-purple-100 text-purple-900 border-purple-200";
      case "Truck":
        return "bg-rose-100 text-rose-900 border-rose-200";
      default:
        return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  // Review statistics calculation
  const approvedReviews = useMemo(() => {
    return reviews.filter((r) => r.carId === car.id && r.isApproved);
  }, [reviews, car.id]);

  const avgRatingDisplay = useMemo(() => {
    if (approvedReviews.length === 0) return "4.9"; // high baseline standard
    const total = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / approvedReviews.length).toFixed(1);
  }, [approvedReviews]);

  const totalBookingCost = useMemo(() => {
    return Math.round(car.price);
  }, [car.price]);

  const shareText = useMemo(() => {
    const videoLink = effectiveVideoUrl;
    return `Check out this ${car.name}!
Price: $${car.price.toLocaleString()} / month
Description: ${car.description || 'A great car for you.'}
${videoLink ? `Video Link: ${videoLink}` : ''}`;
  }, [car.name, car.price, car.description, effectiveVideoUrl]);

  const telegramShareLink = useMemo(() => {
    const shareUrl = effectiveVideoUrl || car.image || window.location.href;
    const cleanDescription = (car.description || "A great car for you.").trim();
    const formattedDesc = cleanDescription.endsWith(".") ? cleanDescription : `${cleanDescription}.`;

    const cleanText = `Check out this ${car.name}!
Price: $${car.price.toLocaleString()} / month
Description: ${formattedDesc}`;

    return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(cleanText)}`;
  }, [car.name, car.price, car.description, car.image, effectiveVideoUrl]);

  const whatsAppShareLink = useMemo(() => {
    const shareUrl = effectiveVideoUrl || car.image || window.location.href;
    const cleanDescription = (car.description || "A great car for you.").trim();
    const formattedDesc = cleanDescription.endsWith(".") ? cleanDescription : `${cleanDescription}.`;

    const cleanText = `Check out this ${car.name}!
Price: $${car.price.toLocaleString()} / month
Description: ${formattedDesc}`;

    return `https://wa.me/?text=${encodeURIComponent(`${shareUrl}\n\n${cleanText}`)}`;
  }, [car.name, car.price, car.description, car.image, effectiveVideoUrl]);

  const targetUrl = useMemo(() => {
    const carDetails = `*${bookingMode === "book" ? "Booking" : "Enquiry"} for: ${car.name}*`;
    const customerDetails = `Name: ${customerName}${tel ? `\nTel: ${tel}` : ""}`;
    const bookingDetails = bookingMode === "book" ? `\nLocation: ${location}\nDate: ${pickupDate}\nTime: ${pickupTime}` : "";
    const userMessage = bookingMode === "enquire" && message ? `\nMessage: ${message}` : "";
    const fullText = `${carDetails}\n\n${customerDetails}${bookingDetails}${userMessage}`;

    const adminPhone = "855966714442";
    const adminTelegram = "+855966714442";

    if (contactMethod === "whatsapp") {
      return `https://wa.me/${adminPhone}?text=${encodeURIComponent(fullText)}`;
    } else if (contactMethod === "telegram") {
      return `https://t.me/${adminTelegram}?text=${encodeURIComponent(fullText)}`;
    }
    return "#";
  }, [car, customerName, tel, location, pickupDate, pickupTime, message, contactMethod, bookingMode]);

  const isFormComplete = bookingMode === "book" 
    ? !!(customerName && location && pickupDate && pickupTime && (contactMethod !== "none" || tel))
    : !!(customerName && (contactMethod !== "none" || tel));

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
       if (contactMethod === "none" && !tel) {
           alert("Please provide a phone number when selecting None as Contact Method.");
       }
       return;
    }

    setRedirectUrl(targetUrl);
    
    // Attempt automatic popup
    if (targetUrl !== "#" && contactMethod !== "none") {
      const newWin = window.open(targetUrl, "_blank");
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        console.warn("Popup blocked, user needs to click link manually.");
      }
    }

    if (onConfirmBook) {
      const resultObj = onConfirmBook(car.id, {
        customerName,
        pickupDate,
        pickupTime,
        location,
        contactMethod: contactMethod,
        message,
        totalCost: totalBookingCost,
      });
      setConfirmedBooking(resultObj);
    }
    setIsSuccess(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewComment) return;

    if (onAddReview) {
      onAddReview(car.id, reviewRating, reviewComment, reviewAuthor);
    }

    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewAuthor("");
      setReviewComment("");
      setReviewRating(5);
    }, 2800);
  };

  const specsDetails = useMemo(() => {
    const name = car.name.toLowerCase();
    if (name.includes("porsche") || name.includes("911")) {
      return {
        engine: "3.0L Twin-Turbo H6",
        power: "450 HP",
        accel: "3.2s",
        topSpeed: "308 km/h",
        driveType: "Rear-Wheel Drive",
        efficiency: "9.6 L/100km",
        co2: "220 g/km"
      };
    }
    if (name.includes("tesla") || name.includes("model s") || name.includes("plaid")) {
      return {
        engine: "Tri-Motor Electric",
        power: "1020 HP",
        accel: "2.1s",
        topSpeed: "322 km/h",
        driveType: "All-Wheel Drive",
        efficiency: "18.7 kWh/100",
        co2: "Zero Co2"
      };
    }
    if (name.includes("lexus") || name.includes("rx")) {
      return {
        engine: "2.5L Hybrid 4-Cyl",
        power: "246 HP",
        accel: "7.1s",
        topSpeed: "200 km/h",
        driveType: "All-Wheel Drive",
        efficiency: "6.7 L/100km",
        co2: "151 g/km"
      };
    }
    if (name.includes("prius") || name.includes("toyota")) {
      return {
        engine: "2.0L Hybrid 4-Cyl",
        power: "194 HP",
        accel: "7.2s",
        topSpeed: "180 km/h",
        driveType: "Front-Wheel Drive",
        efficiency: "4.1 L/100km",
        co2: "94 g/km"
      };
    }
    if (name.includes("mustang") || name.includes("ford")) {
      return {
        engine: "5.0L Ti-VCT V8",
        power: "480 HP",
        accel: "4.3s",
        topSpeed: "250 km/h",
        driveType: "Rear-Wheel Drive",
        efficiency: "12.4 L/100km",
        co2: "284 g/km"
      };
    }
    // Default based on category
    const isSUV = car.category === "SUV";
    return {
      engine: isSUV ? "2.0L Turbocharged I4" : "1.8L Clean Hybrid I4",
      power: isSUV ? "250 HP" : "160 HP",
      accel: isSUV ? "6.8s" : "8.4s",
      topSpeed: "210 km/h",
      driveType: isSUV ? "All-Wheel Drive" : "Front-Wheel Drive",
      efficiency: isSUV ? "7.8 L/100km" : "4.8 L/100km",
      co2: isSUV ? "180 g/km" : "110 g/km"
    };
  }, [car.name, car.category]);

  const handleCloseBookingModal = () => {
    setIsBookingOpen(false);
    setIsSuccess(false);
    setConfirmedBooking(null);
    setCustomerName("");
    setTel("");
    setLocation("");
    setPickupDate("");
    setPickupTime("");
    setMessage("");
    setContactMethod("whatsapp");
    setBookingMode("enquire");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseBookingModal();
        setIsReviewsOpen(false);
        setIsPhotosOpen(false);
      }
    };

    if (isBookingOpen || isReviewsOpen || isPhotosOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isBookingOpen, isReviewsOpen, isPhotosOpen]);

  return (
    <>
      <motion.div
        id={`car-card-perspective-wrapper-${car.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-[530px] group"
        style={{ perspective: 1200 }}
      >
        <motion.div
          id={`car-card-inner-${car.id}`}
          transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full h-full"
        >
          {/* FRONT FACE of the card */}
          <div
            style={{ 
              backfaceVisibility: "hidden", 
              WebkitBackfaceVisibility: "hidden" 
            }}
            className="w-full h-full bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-300 flex flex-col justify-between absolute inset-0"
          >
            {/* Visual Header & Image */}
            <div
              id={`car-image-container-${car.id}`}
              className="relative h-48 bg-stone-50 overflow-hidden cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(0); startTransition(() => setIsPhotosOpen(true)); }}
            >
              {/* Zooming, Tilting & Rolling Scroll-linked Cover Media */}
              {hasVideo ? (
                <>
                  {isVideoLoading && (!hasRealPoster || isPlaying) && (
                    <div className="absolute inset-0 z-[15] flex items-center justify-center bg-stone-100/30 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
                      <Loader2 className="w-6 h-6 text-stone-600 animate-spin opacity-70" />
                    </div>
                  )}
                  {isPreloading && (
                    <div className="absolute inset-0 z-[16] flex items-center justify-center bg-stone-100/30 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
                      <Loader2 className="w-6 h-6 text-stone-600 animate-spin opacity-70" />
                    </div>
                  )}
                  {isPlaying ? (
                    <motion.video
                      id={`car-photo-${car.id}`}
                      ref={videoRef as any}
                      src={optimizedVideoSource}
                      poster={hasRealPoster ? finalVideoPoster : undefined}
                      preload="auto"
                      loop
                      muted
                      playsInline
                      autoPlay
                      initial={{ opacity: 0 }}
                      whileInView={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        y: 0,
                        rotate: 0,
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full object-cover bg-stone-100 select-none cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(false);
                      }}
                      onLoadStart={() => setIsVideoLoading(true)}
                      onWaiting={() => setIsVideoLoading(true)}
                      onPlaying={() => setIsVideoLoading(false)}
                      onCanPlay={() => setIsVideoLoading(false)}
                    />
                  ) : hasRealPoster ? (
                    <motion.img
                      id={`car-photo-${car.id}`}
                      src={finalVideoPoster}
                      alt={car.name}
                      loading="lazy"
                      decoding="async"
                      initial={{ scale: 0.94, y: 15 }}
                      animate={{
                        scale: isHovered ? 1.15 : 1.01,
                        x: isHovered ? 8 : 0,
                        y: isHovered ? -4 : 0,
                        rotate: isHovered ? -0.8 : 0,
                      }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="w-full h-full object-cover select-none bg-stone-100 cursor-pointer animate-fade-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(true);
                      }}
                    />
                  ) : (
                    <motion.video
                      id={`car-photo-${car.id}`}
                      src={optimizedVideoSource ? (optimizedVideoSource.includes("#") ? optimizedVideoSource : `${optimizedVideoSource}#t=0.1`) : ""}
                      preload="metadata"
                      muted
                      playsInline
                      initial={{ scale: 0.94, y: 15 }}
                      animate={{
                        scale: isHovered ? 1.15 : 1.01,
                        x: isHovered ? 8 : 0,
                        y: isHovered ? -4 : 0,
                        rotate: isHovered ? -0.8 : 0,
                      }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="w-full h-full object-cover select-none bg-stone-100 cursor-pointer animate-fade-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(true);
                      }}
                      onLoadStart={() => setIsVideoLoading(true)}
                      onWaiting={() => setIsVideoLoading(true)}
                      onLoadedData={() => setIsVideoLoading(false)}
                      onCanPlay={() => setIsVideoLoading(false)}
                    />
                  )}
                </>
              ) : imageError && isGoogleDrive && driveId ? (
                <motion.iframe
                  id={`car-photo-${car.id}`}
                  src={`https://drive.google.com/file/d/${driveId}/preview`}
                  className="w-full h-full object-cover select-none"
                  allow="autoplay"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false }}
                  title={car.name}
                  style={{ border: "none" }}
                />
              ) : (
                <motion.img
                  id={`car-photo-${car.id}`}
                  src={primaryImageSrc}
                  alt={car.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (isGoogleDrive) {
                      setImageError(true);
                    } else {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
                    }
                  }}
                  initial={{ scale: 0.94, y: 15 }}
                  animate={{
                    scale: isHovered ? 1.15 : 1.01,
                    x: isHovered ? 8 : 0,
                    y: isHovered ? -4 : 0,
                    rotate: isHovered ? -0.8 : 0,
                  }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none bg-stone-100"
                />
              )}

              {/* Beautiful linear cover shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/15 to-transparent pointer-events-none" />

              {/* Photo Gallery Badge */}
              {allPhotos.length > 1 && (
                <div 
                  id={`car-image-gallery-badge-${car.id}`}
                  className="absolute top-3 left-3 bg-stone-900/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-stone-200 flex items-center gap-1 font-sans font-semibold z-10 pointer-events-none select-none shadow-sm transition-opacity duration-300 group-hover:bg-stone-950/80"
                >
                  <Images className="w-3 h-3 text-stone-300" />
                  <span>{allPhotos.length} Photos</span>
                </div>
              )}

              {/* Sample Photo Disclaimer Overlay */}
              {!isPlaying && (
                <div 
                  id={`car-image-disclaimer-${car.id}`}
                  className="absolute bottom-2 left-2 right-2 bg-stone-900/80 backdrop-blur-xs text-[9px] text-stone-200 px-2.5 py-1.5 rounded-lg select-none leading-normal z-10 font-sans pointer-events-none"
                >
                  {t.samplePhotoNotice}
                </div>
              )}

              {/* Video Actions overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                {hasVideo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(prev => !prev);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-white/80 backdrop-blur-sm text-stone-700 border border-stone-200 hover:bg-white shadow-sm"
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? (
                      <span className="text-[10px] font-extrabold select-none tracking-tighter">⏸</span>
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current text-stone-700 ml-0.5" />
                    )}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike && onToggleLike(car.id);
                  }}
                  title={(t as any).liked || "Wishlist"}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors border border-stone-200 hover:bg-white cursor-pointer shadow-sm"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isLiked
                        ? "fill-rose-500 text-rose-500"
                        : "text-stone-500"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Narrative & Info */}
            <div
              id={`car-body-${car.id}`}
              className="p-5 flex-1 flex flex-col justify-between pt-2"
            >
              <div>
                <div className="flex justify-between items-baseline mb-1 w-full gap-2 flex-wrap">
                  <h3
                    id={`car-title-${car.id}`}
                    className="font-sans font-extrabold text-stone-900 text-lg tracking-tight hover:text-[#4C0027] transition-colors leading-snug flex items-center gap-2"
                  >
                    <BrandIcon brand={car.name} className="w-5 h-5 fill-current shrink-0" />
                    {car.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const shareUrl = new URL(window.location.href);
                      shareUrl.searchParams.set('model', car.name);
                      const finalUrl = shareUrl.toString();

                      if (navigator.share) {
                        navigator.share({
                          title: `Check out this ${car.name}`,
                          text: shareText,
                          url: finalUrl,
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(`${shareText}\n\n${finalUrl}`);
                        alert("Link & details copied to clipboard!");
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-200 cursor-pointer shadow-sm -mt-1"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5 text-stone-500 hover:text-stone-700 transition-colors" />
                  </button>
                </div>
                  <div className="mb-4">
                    {car.description && (
                      <p className="text-xs text-stone-500 mb-1 line-clamp-2" title={car.description}>
                        {car.description}
                      </p>
                    )}
                  </div>

                  {/* Highlights Info Grid (Technical) */}
                <div
                  id={`car-specs-${car.id}`}
                  className="grid grid-cols-4 gap-1 py-3 border-y border-stone-200 mb-3 bg-stone-100/50 rounded-xl px-1"
                >
                  <div className="flex flex-col items-center justify-center p-1 border-r border-stone-200 cursor-pointer hover:bg-stone-200/50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onFilterSelect?.('category', car.category); }}>
                    <CarIcon className="w-4 h-4 text-stone-700 mb-1" />
                    <span className="text-[10px] font-mono text-stone-900 font-extrabold truncate max-w-full text-center">
                      {car.category === 'Sedan' ? t.sedan : car.category === 'SUV' ? t.suv : car.category === 'MPV' ? t.mpv : car.category === 'Pickup' ? t.pickup : car.category === 'Truck' ? t.truck : car.category}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1 border-r border-stone-200 cursor-pointer hover:bg-stone-200/50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onFilterSelect?.('seats', car.seats); }}>
                    <Users className="w-4 h-4 text-stone-700 mb-1" />
                    <span className="text-[10px] font-mono text-stone-900 font-extrabold">
                       {t.formatSeats(car.seats.toString())}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1 border-r border-stone-200 cursor-pointer hover:bg-stone-200/50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onFilterSelect?.('transmission', car.transmission); }}>
                    <Settings2 className="w-4 h-4 text-stone-700 mb-1" />
                    <span className="text-[10px] font-mono text-stone-900 font-extrabold truncate max-w-full text-center">
                      {car.transmission === 'Automatic' ? t.automatic : car.transmission === 'Manual' ? t.manual : car.transmission}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-stone-200/50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onFilterSelect?.('fuelType', car.fuelType); }}>
                    <Fuel className="w-4 h-4 text-stone-700 mb-1" />
                    <span className="text-[10px] font-mono text-stone-900 font-extrabold truncate max-w-full text-center">
                      {car.fuelType === 'Gasoline' ? t.gasoline : car.fuelType === 'Electric' ? t.electric : car.fuelType === 'Hybrid' ? t.hybrid : car.fuelType === 'Diesel' ? t.diesel : car.fuelType}
                    </span>
                  </div>
                </div>

                {/* Additional Technical Specifications Grid */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-stone-50 border border-stone-100 p-2 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">{t.engine}</span>
                    <span className="text-[11px] leading-tight font-black text-stone-800 text-center w-full break-words">{specsDetails.engine}</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-100 p-2 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">{t.horsepower}</span>
                    <span className="text-[11px] leading-tight font-black text-stone-800 text-center w-full break-words">{specsDetails.power}</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-100 p-2 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">0-100 km/h</span>
                    <span className="text-[11px] leading-tight font-black text-stone-800 text-center w-full break-words">{specsDetails.accel}</span>
                  </div>
                </div>
              </div>

              {/* Booking or Editing CTA Foot */}
              <div
                id={`car-footer-${car.id}`}
                className="flex items-center justify-between mt-2 pt-2 gap-2"
              >
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span
                      id={`car-price-${car.id}`}
                      className="text-2xl font-black text-red-600"
                    >
                      ${car.price.toLocaleString()}
                    </span>
                    <span className="text-stone-400 text-xs font-semibold flex items-center gap-1">
                      /{t.perMonth}
                    </span>
                  </div>
                  <span className="text-[9px] text-stone-400 mt-0.5 font-sans leading-none">
                    {(t as any).standardPriceNotice}
                  </span>
                </div>

                {isAdminMode ? (
                  <div className="flex gap-1.5 items-center flex-wrap">
                    <button
                      id={`car-btn-edit-${car.id}`}
                      onClick={() => onEdit && onEdit(car)}
                      className="px-3 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      id={`car-btn-book-${car.id}`}
                      onClick={() => {
                        setBookingMode("book");
                        startTransition(() => setIsBookingOpen(true));
                      }}
                      className="flex items-center justify-center flex-1 gap-1.5 px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer bg-stone-800"
                    >
                      {t.bookNow}
                    </button>
                    <button
                      id={`car-btn-rent-${car.id}`}
                      onClick={() => {
                        setBookingMode("enquire");
                        startTransition(() => setIsBookingOpen(true));
                      }}
                      className="flex items-center justify-center flex-1 gap-1.5 px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                      style={{ backgroundColor: brandPlum }}
                    >
                      {t.enquire}
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BACK FACE (Vehicle Specifications Panel) */}
          <div
            style={{ 
              backfaceVisibility: "hidden", 
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
            className="w-full h-full bg-[#1C1917] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] transition-all duration-300 p-5 flex flex-col justify-between absolute inset-0 select-none text-stone-100"
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-3.5 border-b border-stone-800">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse text-rose-400" />
                  {t.vehicleSpecs}
                </span>
                <h4 className="font-sans font-black text-white text-base tracking-tight flex items-center gap-2">
                  <BrandIcon brand={car.name} className="w-4 h-4 fill-current text-stone-300 shrink-0" />
                  {car.name}
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(car.category)}`}>
                {car.category === 'Sedan' ? t.sedan : car.category === 'SUV' ? t.suv : car.category === 'MPV' ? t.mpv : car.category === 'Pickup' ? t.pickup : car.category === 'Truck' ? t.truck : car.category}
              </span>
            </div>

            {/* Spec Attributes Grid */}
            <div className="flex-1 py-4 flex flex-col justify-center gap-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-stone-900/65 p-3 rounded-2xl border border-stone-800/80 flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">{t.engineAssembly}</p>
                    <p className="text-xs font-black text-white mt-0.5 truncate">{specsDetails.engine}</p>
                    <p className="text-[10px] font-bold text-rose-400 font-mono mt-0.5">{specsDetails.power}</p>
                  </div>
                </div>

                <div className="bg-stone-900/65 p-3 rounded-2xl border border-stone-800/80 flex items-start gap-2.5">
                  <Gauge className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">{t.velocityHub}</p>
                    <p className="text-xs font-black text-white mt-0.5">0-100: <span className="text-amber-400 font-extrabold">{specsDetails.accel}</span></p>
                    <p className="text-[10px] font-bold text-stone-400 font-mono mt-0.5">Max {specsDetails.topSpeed}</p>
                  </div>
                </div>

                <div className="bg-stone-900/65 p-3 rounded-2xl border border-stone-800/80 flex items-start gap-2.5">
                  <Settings2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">{t.transmissionBack}</p>
                    <p className="text-xs font-black text-white mt-0.5 truncate">{car.transmission === 'Automatic' ? t.automatic : car.transmission === 'Manual' ? t.manual : car.transmission}</p>
                    <p className="text-[10px] font-bold text-stone-400 font-mono mt-0.5">{specsDetails.driveType}</p>
                  </div>
                </div>

                <div className="bg-stone-900/65 p-3 rounded-2xl border border-stone-800/80 flex items-start gap-2.5">
                  <Fuel className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">{t.fuelSystem}</p>
                    <p className="text-xs font-black text-white mt-0.5 truncate">{car.fuelType === 'Gasoline' ? t.gasoline : car.fuelType === 'Electric' ? t.electric : car.fuelType === 'Hybrid' ? t.hybrid : car.fuelType === 'Diesel' ? t.diesel : car.fuelType}</p>
                    <p className="text-[10px] font-bold text-sky-400 font-mono mt-0.5 truncate">{specsDetails.efficiency}</p>
                  </div>
                </div>
              </div>

              {/* Passenger row */}
              <div className="bg-stone-900/40 px-3 py-2 rounded-xl border border-stone-800/60 flex items-center justify-between text-xs">
                <span className="text-stone-400 flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest font-mono">
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  {t.cabinCapacity}
                </span>
                <span className="font-sans font-black text-stone-200">
                  {car.seats} {t.premiumSeats}
                </span>
              </div>

              {/* CO2 dynamic row */}
              <div className="bg-stone-900/40 px-3 py-2 rounded-xl border border-stone-800/60 flex items-center justify-between text-xs">
                <span className="text-stone-400 flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  {t.sustainability}
                </span>
                <span className="font-mono font-extrabold text-rose-300">
                  {specsDetails.co2}
                </span>
              </div>
            </div>

            {/* Backside Footer / CTA */}
            <div className="border-t border-stone-800 pt-3 flex items-center justify-between gap-1">
              <div className="flex flex-col">
                <span className="text-[8px] text-stone-500 uppercase font-mono font-bold tracking-widest">
                  {t.ratePlan}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-black text-rose-500">
                    ${car.price.toLocaleString()}
                  </span>
                  <span className="text-stone-500 text-[10px] font-semibold flex items-center gap-1">
                    /{t.perMonth}
                  </span>
                </div>
                <span className="text-[8px] text-stone-400 mt-0.5 font-sans leading-none">
                  {(t as any).standardPriceNotice}
                </span>
              </div>

              {isAdminMode ? (
                <div className="flex gap-1.5 items-center flex-wrap">
                  <button
                    id={`car-back-btn-edit-${car.id}`}
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(car); }}
                    className="px-3 py-1.5 text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-all cursor-pointer border border-stone-700"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  id={`car-back-btn-rent-${car.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBookingMode("book");
                    startTransition(() => setIsBookingOpen(true));
                  }}
                  className="flex items-center gap-1 px-4 py-2 text-[10px] font-bold bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-500 transition-all cursor-pointer"
                >
                  {t.bookService}
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Advanced Booking Reservation Modal */}
      {createPortal(
        <AnimatePresence>
          {isBookingOpen && (
            <div
              id={`booking-modal-${car.id}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id={`booking-close-${car.id}`}
                onClick={handleCloseBookingModal}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 font-extrabold cursor-pointer transition-all text-sm"
              >
                &times;
              </button>

              {isSuccess && confirmedBooking ? (
                <div
                  id={`booking-success-box-${car.id}`}
                  className="flex flex-col py-2"
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 mx-auto"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    >
                      <Check className="w-6 h-6 stroke-[3]" />
                    </motion.div>
                  </motion.div>

                  <div className="text-center">
                    <h3 className="font-extrabold text-stone-900 text-xl tracking-tight mb-1">
                      {bookingMode === "book" ? t.bookingRequestSent : t.enquirySent}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto mb-5 leading-normal">
                      {bookingMode === "book" ? t.bookingThankYou : t.enquiryThankYou}
                    </p>
                  </div>

                  {/* Booking Receipt Plate */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-3 font-sans text-stone-800 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-stone-400" />
                        <span className="font-mono font-bold uppercase tracking-wider text-stone-400 text-[10px]">
                          {t.dateTime}
                        </span>
                      </div>
                      <span className="font-mono font-black text-stone-900 tracking-wider text-sm">
                        {new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                          {t.selectedVehicle}
                        </p>
                        <p className="font-bold text-stone-800 truncate mt-0.5">
                          {car.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                          {t.clientName}
                        </p>
                        <p className="font-bold text-stone-800 truncate mt-0.5">
                          {confirmedBooking.customerName}
                        </p>
                      </div>
                    </div>

                    {bookingMode === "book" && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100 mt-2">
                        <div>
                          <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                            {t.location}
                          </p>
                          <p className="font-bold text-stone-800 truncate mt-0.5">
                            {confirmedBooking.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                            {t.pickupLabel}
                          </p>
                          <p className="font-bold text-stone-800 truncate mt-0.5">
                            {confirmedBooking.pickupDate} {confirmedBooking.pickupTime}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#4C0027]/5 border border-[#4C0027]/10 p-3 rounded-xl flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-stone-500 font-semibold font-sans">
                          Payment: 6 Months Contract
                        </span>
                        <span className="text-[9.5px] italic text-[#4C0027] font-semibold mt-1">
                          1-Month Deposit (${confirmedBooking.totalCost.toLocaleString()})
                        </span>
                        <span className="text-[9.5px] italic text-[#4C0027] font-semibold mt-0.5">
                          1-Month Rent (${confirmedBooking.totalCost.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-stone-500 font-semibold font-sans">
                          Total
                        </span>
                        <span className="font-mono text-base font-black text-[#4C0027] mt-0.5">
                          ${(confirmedBooking.totalCost * 2).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 mt-3 border-t border-stone-200">
                      <p className="text-[9.5px] text-stone-500 font-semibold italic">
                        <span className="text-stone-700 not-italic uppercase tracking-widest font-mono text-[9px]">Remark: </span> 
                        A passport photo required.
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-400 mt-4 text-center leading-relaxed font-sans">
                    {confirmedBooking.contactMethod === "none" ? (
                      <>We will reach out to you via SMS or phone call using the provided details. Feel free to contact dispatchers.</>
                    ) : (
                      <>
                        A copy of the booking voucher and checklist rules will be replied via your <span className="font-semibold uppercase">{confirmedBooking.contactMethod}</span> account. Feel free to contact dispatchers.
                      </>
                    )}
                  </p>


                  <button
                    id={`btn-close-receipt-${car.id}`}
                    onClick={handleCloseBookingModal}
                    className="w-full mt-3 py-3 text-xs font-bold text-white rounded-xl shadow-md transition-all text-center uppercase tracking-wider cursor-pointer"
                    style={{ backgroundColor: brandPlum }}
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                    <img
                      src={
                         finalVideoPoster 
                           ? finalVideoPoster 
                           : getOptimizedImageUrl(currentImage, windowWidth, 'thumbnail')
                      }
                      alt={car.name}
                      loading="lazy"
                      className="w-32 h-20 sm:w-40 sm:h-24 object-cover rounded-xl border border-stone-100 shadow-sm"
                    />
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-lg sm:text-xl leading-tight flex items-center gap-2">
                        <BrandIcon brand={car.name} className="w-5 h-5 fill-current shrink-0" />
                        {car.name}
                      </h4>
                      <p className="text-sm sm:text-base text-stone-600 font-mono font-bold mt-0.5 drop-shadow-sm">
                        <span className="text-stone-400 text-[10px] sm:text-xs uppercase">
                          {car.category === 'Sedan' ? t.sedan : car.category === 'SUV' ? t.suv : car.category === 'MPV' ? t.mpv : car.category === 'Pickup' ? t.pickup : car.category === 'Truck' ? t.truck : car.category}
                        </span>
                        <span className="text-stone-400 text-[10px] sm:text-xs uppercase ml-1">{t.fleetCollection}</span>
                      </p>
                    </div>
                  </div>

                  <h3 className="font-sans font-black text-stone-900 text-lg tracking-tight">
                    {bookingMode === "book" ? t.enterpriseBookingSystem : t.enterpriseEnquirySystem}
                  </h3>

                  {/* Active reservation form inputs */}
                  <div className="space-y-3">
                    {/* Customer Details info block */}
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                          {t.nameLabel}
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                            <User className="w-3.5 h-3.5" />
                          </span>
                          <input
                            id={`book-name-${car.id}`}
                            type="text"
                            required
                            placeholder="e.g. Douglas Vance"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-black focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                          />
                        </div>
                      </div>

                      {(bookingMode === "book" || contactMethod === "none") && (
                        <div>
                          <label className={`text-[9px] font-bold uppercase tracking-widest block mb-1 ${contactMethod === 'none' ? 'text-rose-500' : 'text-stone-400'}`}>
                            {contactMethod === 'none' ? t.telRequired : t.telOptional}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                              <span className="text-xs font-mono">📱</span>
                            </span>
                            <input
                              id={`book-tel-${car.id}`}
                              type="tel"
                              required={contactMethod === "none"}
                              placeholder="e.g. +855..."
                              value={tel}
                              onChange={(e) => setTel(e.target.value)}
                              className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-black focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                          {t.iHave} <span className="normal-case tracking-normal font-sans text-stone-400 font-normal ml-1">{t.ifYouDontHave}</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setContactMethod("whatsapp")}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border ${contactMethod === "whatsapp" ? "bg-[#25D366]/10 border-[#25D366] text-[#25D366]" : "bg-stone-50 border-stone-200 text-stone-500"}`}
                          >
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactMethod("telegram")}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border ${contactMethod === "telegram" ? "bg-[#0088cc]/10 border-[#0088cc] text-[#0088cc]" : "bg-stone-50 border-stone-200 text-stone-500"}`}
                          >
                            Telegram
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactMethod("none")}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border ${contactMethod === "none" ? "bg-stone-200 border-stone-300 text-stone-700" : "bg-stone-50 border-stone-200 text-stone-500"}`}
                          >
                            None
                          </button>
                        </div>
                      </div>
                    </div>

                    {bookingMode === "book" ? (
                      <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100 space-y-2.5 mt-2">
                        <label className="text-[10px] font-semibold text-stone-800 block mb-1.5 font-sans">
                          {t.readyToRent}
                        </label>
                        <div>
                          <label className="text-[9px] font-semibold text-stone-500 uppercase block mb-1.5 font-mono">
                            {t.location}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                              <MapPin className="w-3.5 h-3.5" />
                            </span>
                            <input
                              id={`book-location-${car.id}`}
                              type="text"
                              required
                              placeholder="City, Airport..."
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-black focus:outline-none focus:border-[#4C0027] transition-all"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-semibold text-stone-500 uppercase block mb-1.5 font-mono">
                              {t.pickupDate}
                            </label>
                            <input
                              id={`book-pickup-${car.id}`}
                              type="date"
                              required
                              min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
                              value={pickupDate}
                              onChange={(e) => setPickupDate(e.target.value)}
                              className="w-full text-xs py-1.5 px-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#4C0027] text-stone-800 font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-semibold text-stone-500 uppercase block mb-1.5 font-mono">
                              {t.pickupTime}
                            </label>
                            <select
                              id={`book-pickup-time-${car.id}`}
                              required
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              className="w-full text-xs py-1.5 px-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#4C0027] text-stone-800 font-mono select-none"
                            >
                              <option value="" disabled>{t.selectTime}</option>
                              {Array.from({ length: 24 * 4 }).map((_, i) => {
                                const totalMinutes = i * 15;
                                const hours = Math.floor(totalMinutes / 60);
                                const minutes = totalMinutes % 60;
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                const displayHours = hours % 12 === 0 ? 12 : hours % 12;
                                const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                const displayTime = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                                return <option key={timeValue} value={timeValue}>{displayTime}</option>;
                              })}
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5">
                          Message
                        </label>
                        <div className="relative mb-2">
                          <span className="absolute top-2 left-0 pl-3 flex text-stone-400 pointer-events-none">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </span>
                          <textarea
                            id={`book-message-${car.id}`}
                            placeholder="Your message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={2}
                            className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-black focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all resize-none"
                          />
                        </div>
                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => setMessage("I want to know more about this car.")}
                            className="px-2.5 py-1 text-[10px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all border border-stone-200 cursor-pointer"
                          >
                            "I want to know more about this car."
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    id={`btn-confirm-reserve-${car.id}`}
                    type="submit"
                    className="w-full py-3.5 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center uppercase tracking-wider mt-2.5 opacity-90"
                    style={{ backgroundColor: brandPlum }}
                  >
                    {bookingMode === "book" ? "Send Booking Now" : "Send Enquiry Now"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Elegant Reviews & Specifications Modal Drawer */}
      {createPortal(
        <AnimatePresence>
          {isReviewsOpen && (
          <div
            id={`reviews-modal-${car.id}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[85vh] flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id={`reviews-close-${car.id}`}
                onClick={() => setIsReviewsOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 font-extrabold cursor-pointer transition-all text-sm"
              >
                &times;
              </button>

              {/* Title Header with info */}
              <div className="border-b border-stone-200 pb-4 mb-4 select-none">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="font-sans font-black text-stone-900 text-xl tracking-tight flex items-center gap-2">
                    <BrandIcon brand={car.name} className="w-5 h-5 fill-current shrink-0" />
                    {car.name} Experience Reviews
                  </h3>
                </div>
                <p className="text-xs text-stone-400 mt-1 leading-normal font-sans">
                  Read authentic feedback or share your verified experience
                  about this category sports luxury model.
                </p>
              </div>

              {/* Two Column Grid for Reviews and form feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                {/* Column One: Displaying approved reviews */}
                <div className="space-y-3.5 h-full">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                    APPROVED CUSTOMER LOG ({approvedReviews.length})
                  </h4>

                  {approvedReviews.length === 0 ? (
                    <div className="text-center py-10 bg-stone-50/50 rounded-2xl p-4 border border-dashed border-stone-200">
                      <Star className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-stone-700">
                        No Reviews Yet
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1 max-w-[150px] mx-auto leading-normal">
                        Be the first to submit a review after completing your
                        experience booking!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {approvedReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="bg-stone-50 rounded-2xl p-3 border border-stone-100 space-y-1.5 text-stone-800 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800 truncate max-w-28">
                              {rev.customerName}
                            </span>
                            <div className="flex gap-0.5 shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-2.5 h-2.5 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-stone-500 text-[11px] leading-normal italic text-left">
                            "{rev.comment}"
                          </p>
                          <div className="text-right">
                            <span className="text-[9px] text-stone-400 font-mono font-medium">
                              {rev.createdAt}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column Two: Leave review form */}
                <div className="border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-2">
                    SUBMIT VERIFIED STORY
                  </h4>

                  {reviewSubmitted ? (
                    <div className="text-center py-12 bg-emerald-50/55 rounded-2xl border border-emerald-100 p-4 flex flex-col items-center justify-center h-full">
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-emerald-950">
                        Review Saved!
                      </p>
                      <p className="text-[10px] text-emerald-800/80 mt-1 max-w-[150px] text-center leading-normal">
                        Thanks for reviewing! Your feedback remains queued under
                        administrator moderation.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                          Your Name
                        </label>
                        <input
                          id={`input-rev-author-${car.id}`}
                          type="text"
                          required
                          placeholder="e.g. Timothy Vance"
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-black focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                          Rating Stars
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              id={`input-rev-star-${car.id}-${star}`}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none cursor-pointer p-0.5 hover:scale-110 active:scale-95 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${star <= reviewRating ? "text-amber-500 fill-amber-500" : "text-stone-200"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                          Review Comments
                        </label>
                        <textarea
                          id={`input-rev-comment-${car.id}`}
                          required
                          rows={3}
                          placeholder="Share the details of your driving pleasure..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-black focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all resize-none"
                        />
                      </div>

                      <button
                        id={`btn-submit-review-${car.id}`}
                        type="submit"
                        className="w-full py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all hover:brightness-110 cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide"
                        style={{ backgroundColor: brandPlum }}
                      >
                        <Send className="w-3 h-3 text-white" />
                        <span>Publish Review</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Close Button at bottom in drawer context */}
              <div className="border-t border-stone-100 pt-4 mt-4 text-center">
                <button
                  id={`btn-close-reviews-modal-${car.id}`}
                  onClick={() => setIsReviewsOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                >
                  Dismiss Views
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Photos Viewer Modal */}
      {createPortal(
        <AnimatePresence>
          {isPhotosOpen && (
            <div
              className="fixed inset-0 z-[60] flex flex-col items-center justify-between p-4 pb-6 bg-black/90 backdrop-blur-md select-none"
              onClick={() => startTransition(() => setIsPhotosOpen(false))}
            >
              {/* Header inside modal */}
              <div className="w-full max-w-5xl flex items-center justify-between px-4 pt-2 mb-2 z-10" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col">
                  <span className="text-white font-sans font-bold text-lg">{car.name}</span>
                  <span className="text-white/60 font-mono text-xs">Full Media Gallery</span>
                </div>
                <button
                  onClick={() => startTransition(() => setIsPhotosOpen(false))}
                  className="text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer border border-white/10 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content View with Left/Right Arrows */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-5xl w-full flex-1 flex flex-col items-center justify-center gap-4 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full group flex items-center justify-center min-h-[40vh]">
                  {/* Left Arrow Button */}
                  {allPhotos.length > 1 && (
                    <button
                      id={`gallery-prev-${car.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
                      }}
                      className="absolute left-2 sm:left-4 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
                      title="Previous Photo"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}

                  {/* Media Rendering */}
                  {hasVideo ? (
                    <motion.video
                      key={`video-${renderedImageSrc}-${currentPhotoIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={videoSource}
                      controls
                      autoPlay
                      loop
                      className="w-auto max-w-full max-h-[60vh] sm:max-h-[65vh] object-contain rounded-2xl shadow-2xl border border-white/5 bg-black/40"
                    />
                  ) : imageError && isGoogleDrive && driveId ? (
                    <motion.iframe
                      key={`iframe-${renderedImageSrc}-${currentPhotoIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={`https://drive.google.com/file/d/${driveId}/preview`}
                      className="w-full max-w-4xl h-[60vh] sm:h-[65vh] object-contain rounded-2xl shadow-2xl border border-white/5 bg-black/40"
                      allow="autoplay"
                    />
                  ) : (
                    <motion.img
                      key={`img-${renderedImageSrc}-${currentPhotoIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={renderedImageSrc}
                      alt={`${car.name} photo`}
                      onError={(e) => {
                        if (isGoogleDrive) {
                          setImageError(true);
                        } else {
                          (e.target as HTMLImageElement).src = getFallbackCarThumbnail(car.name, car.category);
                        }
                      }}
                      className="w-auto max-w-full max-h-[60vh] sm:max-h-[65vh] object-contain rounded-2xl shadow-2xl border border-white/5 bg-black/40"
                    />
                  )}

                  {/* Right Arrow Button */}
                  {allPhotos.length > 1 && (
                    <button
                      id={`gallery-next-${car.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
                      }}
                      className="absolute right-2 sm:right-4 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
                      title="Next Photo"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Gallery Footer: Counter & Thumbnails */}
              <div className="w-full max-w-5xl flex flex-col items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
                {/* Counter indicator */}
                {allPhotos.length > 1 && (
                  <div className="text-stone-300 font-sans text-xs bg-black/45 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md select-none tracking-wide">
                    {currentPhotoIndex + 1} / {allPhotos.length}
                  </div>
                )}

                {/* Thumbnails strip */}
                {allPhotos.length > 1 && (
                  <div className="flex gap-2 max-w-full overflow-x-auto px-4 py-2 scrollbar-none items-center justify-center">
                    {allPhotos.map((photo, index) => {
                      const isSelected = currentPhotoIndex === index;
                      const thumbUrl = getOptimizedImageUrl(photo, windowWidth, 'thumbnail');
                      return (
                        <button
                          key={index}
                          id={`gallery-thumb-${car.id}-${index}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhotoIndex(index);
                          }}
                          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden cursor-pointer shrink-0 transition-all duration-300 ${
                            isSelected
                              ? "ring-2 ring-amber-400 scale-105 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
                              : "ring-1 ring-white/10 opacity-55 hover:opacity-100 hover:scale-[1.03]"
                          }`}
                        >
                          <img
                            src={thumbUrl}
                            alt={`${car.name} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getFallbackCarThumbnail(car.name, car.category);
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export const CarCard = React.memo(CarCardComponent, (prev, next) => {
  return (
    JSON.stringify(prev.car) === JSON.stringify(next.car) &&
    prev.isAdminMode === next.isAdminMode &&
    prev.isLiked === next.isLiked &&
    prev.lang === next.lang &&
    prev.reviews === next.reviews
  );
});
