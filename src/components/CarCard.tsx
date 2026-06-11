import React, { useState, useMemo, useEffect } from "react";
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
  Car,
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
  
  if (url.includes('upload/')) {
    // f_auto will serve webp/avif for images, and wepm/mp4 for videos automatically based on browser
    return url.replace('upload/', `upload/f_auto,q_auto,w_${targetWidth},c_scale/`);
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
  onConfirmBook?: (bookingData: {
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
}

export const CarCard: React.FC<CarCardProps> = ({
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (car.name?.toLowerCase().includes("prius")) {
      return car.videoUrl || "https://files.catbox.moe/2zvvj8.mp4";
    }
    if (car.name?.toLowerCase().includes("lexus")) {
      return car.videoUrl || "https://files.catbox.moe/icbp1v.mp4";
    }
    return car.videoUrl || "";
  }, [car.name, car.videoUrl]);

  const isVideoMedia = (url?: string) => {
    if (!url) return false;
    return !!(url.match(/\.(mp4|webm|ogg|quicktime)(\?.*)?$/i) || url.toLowerCase().includes("video") || url.startsWith("data:video/"));
  };

  const hasVideo = useMemo(() => {
    return isVideoMedia(car.image) || isVideoMedia(effectiveVideoUrl);
  }, [car.image, effectiveVideoUrl]);

  const videoSource = useMemo(() => {
    return isVideoMedia(car.image) ? car.image : effectiveVideoUrl;
  }, [car.image, effectiveVideoUrl]);

  const optimizedVideoSource = useMemo(() => {
    return getOptimizedImageUrl(videoSource, windowWidth, 'cover');
  }, [videoSource, windowWidth]);

  const isGoogleDrive = car.image.includes("drive.google.com/uc");
  const driveId = isGoogleDrive ? car.image.match(/id=([^&]+)/)?.[1] : null;

  const videoPoster = useMemo(() => {
    if (car.image.includes("upload/") && car.image.match(/\.(mp4|webm|ogg)$/i)) {
      return getOptimizedImageUrl(car.image.replace(/\.(mp4|webm|ogg)$/i, ".jpg"), windowWidth, 'cover');
    }
    return undefined;
  }, [car.image, windowWidth]);

  const youtubeThumbnail = useMemo(() => {
    const getYoutubeId = (url?: string): string | null => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };
    const ytId = getYoutubeId(car.image) || getYoutubeId(car.videoUrl);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    }
    return undefined;
  }, [car.image, car.videoUrl]);

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
  
  const finalVideoPoster = car.thumbnail || videoPoster || youtubeThumbnail || generatedPoster || car.image;

  const hasRealPoster = useMemo(() => {
    return !!(car.thumbnail || videoPoster || youtubeThumbnail || generatedPoster);
  }, [car.thumbnail, videoPoster, youtubeThumbnail, generatedPoster]);

  // Booking flow states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split("T")[0];
  });
  const [pickupTime, setPickupTime] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split("T")[1].substring(0, 5);
  });
  const [location, setLocation] = useState("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "telegram" | "none">(
    "none",
  );
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(
    null,
  );

  // Reviews flow states
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
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
    const carDetails = `*Enquiry for: ${car.name}*`;
    const customerDetails = `Name: ${customerName}`;
    const bookingDetails = `Pickup Location: ${location}\nDate: ${pickupDate}\nTime: ${pickupTime}`;
    const userMessage = message ? `\nMessage: ${message}` : "";
    const fullText = `${carDetails}\n\n${customerDetails}\n\n${bookingDetails}${userMessage}`;

    const adminPhone = "855966714442";
    const adminTelegram = "+855966714442";

    if (contactMethod === "whatsapp") {
      return `https://wa.me/${adminPhone}?text=${encodeURIComponent(fullText)}`;
    } else if (contactMethod === "telegram") {
      return `https://t.me/${adminTelegram}?text=${encodeURIComponent(fullText)}`;
    }
    return "#";
  }, [car, customerName, location, pickupDate, pickupTime, message, contactMethod]);

  const isFormComplete = !!(customerName && pickupDate && pickupTime && location && contactMethod !== "none");

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !pickupDate || !pickupTime || !location) return;
    if (contactMethod === "none") {
      alert("Please select either WhatsApp or Telegram to send your enquiry.");
      return;
    }

    setRedirectUrl(targetUrl);
    
    // Attempt automatic popup
    if (targetUrl !== "#") {
      const newWin = window.open(targetUrl, "_blank");
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        console.warn("Popup blocked, user needs to click link manually.");
      }
    }

    if (onConfirmBook) {
      const resultObj = onConfirmBook({
        customerName,
        pickupDate,
        pickupTime,
        location,
        contactMethod: contactMethod as "whatsapp" | "telegram",
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
    setLocation("");
    setMessage("");
    setContactMethod("whatsapp");
  };

  return (
    <>
      <motion.div
        id={`car-card-perspective-wrapper-${car.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-[530px]"
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
            className="w-full h-full bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between absolute inset-0"
          >
            {/* Visual Header & Image */}
            <div
              id={`car-image-container-${car.id}`}
              className="relative h-48 bg-stone-50 overflow-hidden"
            >
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {hasVideo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(prev => !prev);
                    }}
                    className="w-8 h-8 rounded-full border flex items-center justify-center backdrop-blur-sm shadow-sm transition-colors cursor-pointer bg-white/80 text-stone-600 border-stone-100 hover:text-black hover:bg-stone-100"
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? (
                      <span className="text-[10px] font-extrabold select-none tracking-tighter">⏸</span>
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current text-current ml-0.5" />
                    )}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (navigator.share) {
                      navigator.share({
                        title: `Check out this ${car.name}`,
                        text: shareText,
                        url: effectiveVideoUrl || car.image || window.location.href,
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(`${shareText}\n\n${effectiveVideoUrl || car.image || window.location.href}`);
                      // Since we are in an iframe, alert might not work perfectly, but it's okay.
                      // It provides a fallback.
                      alert("Link & details copied to clipboard!");
                    }
                  }}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-stone-100 transition-colors border border-stone-100 cursor-pointer"
                  title="Share"
                >
                  <Share2 className="w-4 h-4 text-stone-500 hover:text-stone-700 transition-colors" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike && onToggleLike(car.id);
                  }}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-rose-50 transition-colors border border-stone-100 cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isLiked
                        ? "fill-rose-500 text-rose-500"
                        : "text-stone-500 hover:text-rose-500"
                    }`}
                  />
                </button>
              </div>

              {/* Zooming, Tilting & Rolling Scroll-linked Cover Media */}
              {hasVideo ? (
                <>
                  {isVideoLoading && (!hasRealPoster || isPlaying) && (
                    <div className="absolute inset-0 z-[15] flex items-center justify-center bg-stone-100/30 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
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
                  src={getOptimizedImageUrl(car.image, windowWidth, 'cover')}
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
            </div>

            {/* Narrative & Info */}
            <div
              id={`car-body-${car.id}`}
              className="p-5 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-1 w-full gap-2 flex-wrap">
                  <h3
                    id={`car-title-${car.id}`}
                    className="font-sans font-extrabold text-stone-900 text-lg tracking-tight hover:text-[#4C0027] transition-colors leading-snug flex items-center gap-2"
                  >
                    <BrandIcon brand={car.name} className="w-5 h-5 fill-current shrink-0" />
                    {car.name}
                  </h3>
                </div>
                <div className="mb-4">
                  {car.description && (
                    <p className="text-xs text-stone-500 mb-1 line-clamp-2" title={car.description}>
                      {car.description}
                    </p>
                  )}
                  <p className="text-[10px] text-stone-400 italic line-clamp-2 mt-1">
                    This is a sample car photo/video. Please click Enquire to request the actual available car photos/videos.
                  </p>
                </div>

                {/* Highlights Info Grid (Technical) */}
                <div
                  id={`car-specs-${car.id}`}
                  className="grid grid-cols-4 gap-1 py-3 border-y border-stone-200 mb-4 bg-stone-100/50 rounded-xl px-1"
                >
                  <div className="flex flex-col items-center justify-center p-1 border-r border-stone-200 cursor-pointer hover:bg-stone-200/50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onFilterSelect?.('category', car.category); }}>
                    <Car className="w-4 h-4 text-stone-700 mb-1" />
                    <span className="text-[10px] font-mono text-stone-900 font-extrabold truncate max-w-full text-center">
                      {car.category}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1 border-r border-stone-200 cursor-pointer hover:bg-stone-200/50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onFilterSelect?.('seats', car.seats); }}>
                    <Users className="w-4 h-4 text-stone-700 mb-1" />
                    <span className="text-[10px] font-mono text-stone-900 font-extrabold">
                      {car.seats} Seats
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1 border-r border-stone-200 cursor-pointer hover:bg-stone-200/50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onFilterSelect?.('transmission', car.transmission); }}>
                    <Settings2 className="w-4 h-4 text-stone-700 mb-1" />
                    <span className="text-[10px] font-mono text-stone-900 font-extrabold truncate max-w-full text-center">
                      {car.transmission}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-stone-200/50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onFilterSelect?.('fuelType', car.fuelType); }}>
                    <Fuel className="w-4 h-4 text-stone-700 mb-1" />
                    <span className="text-[10px] font-mono text-stone-900 font-extrabold truncate max-w-full text-center">
                      {car.fuelType}
                    </span>
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
                      /month
                      <div className="relative group flex items-center">
                        <HelpCircle className="w-4 h-4 text-stone-400 cursor-help hover:text-stone-600 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-900 border border-stone-800 text-stone-100 text-[10px] leading-tight sm:text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] text-center shadow-xl pointer-events-none">
                          Monthly rental breakdown (Deposit + Monthly Rent)
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-stone-900"></div>
                        </div>
                      </div>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest leading-none">Share:</span>
                    <a href={telegramShareLink} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-[#0088cc] transition-colors"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></a>
                    <a href={whatsAppShareLink} target="_blank" rel="noreferrer" className="text-stone-400 hover:text-[#25D366] transition-colors"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M11.42 21.815a10.024 10.024 0 0 1-5.11-1.402l-.367-.217-3.8.995 1.015-3.7-.24-.38a9.986 9.986 0 0 1-1.535-5.356c0-5.523 4.54-10.038 10.039-10.038 2.68 0 5.192 1.036 7.085 2.92 1.892 1.884 2.932 4.382 2.932 7.042C21.439 17.2 16.924 21.8 11.42 21.8v.015zm0-18.368c-4.57 0-8.315 3.738-8.319 8.35-.002 1.488.384 2.946 1.121 4.225l.135.234-.595 2.169 2.227-.584.251.15c1.248.742 2.673 1.135 4.148 1.136 4.607 0 8.322-3.725 8.327-8.318.002-2.232-.862-4.327-2.433-5.908A8.258 8.258 0 0 0 11.42 3.447v-.001zm4.654 11.758c-.255-.128-1.507-.745-1.74-.83-.233-.086-.403-.128-.573.127-.171.255-.658.831-.806 1.002-.15.17-.298.192-.553.064-.255-.128-1.077-.397-2.052-1.266-.758-.676-1.269-1.51-1.42-1.765-.15-.255-.015-.392.112-.52.114-.114.255-.297.382-.447.128-.15.17-.255.255-.425.085-.17.043-.319-.021-.447-.064-.128-.574-1.383-.787-1.894-.207-.497-.418-.43-.574-.438-.15-.008-.32-.008-.49-.008-.17 0-.447.064-.68.32-.234.255-.893.872-.893 2.128s.915 2.468 1.042 2.638c.128.171 1.796 2.744 4.348 3.844.607.262 1.08.418 1.448.535.608.194 1.162.166 1.597.1.488-.074 1.507-.617 1.72-1.213.213-.596.213-1.106.15-1.213-.064-.106-.235-.17-.49-.297h-.002z"/></svg></a>
                  </div>
                </div>

                {isAdminMode ? (
                  <div className="flex gap-1.5">
                    <button
                      id={`car-btn-edit-${car.id}`}
                      onClick={() => onEdit && onEdit(car)}
                      className="px-3 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      id={`car-btn-delete-${car.id}`}
                      onClick={() => onDelete && onDelete(car.id)}
                      className="px-3 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-100 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    id={`car-btn-rent-${car.id}`}
                    onClick={() => setIsBookingOpen(true)}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                    style={{ backgroundColor: brandPlum }}
                  >
                    Enquire
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
            className="w-full h-full bg-[#1C1917] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl p-5 flex flex-col justify-between absolute inset-0 select-none text-stone-100"
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-3.5 border-b border-stone-800">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse text-rose-400" />
                  Vehicle Specs
                </span>
                <h4 className="font-sans font-black text-white text-base tracking-tight flex items-center gap-2">
                  <BrandIcon brand={car.name} className="w-4 h-4 fill-current text-stone-300 shrink-0" />
                  {car.name}
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(car.category)}`}>
                {car.category}
              </span>
            </div>

            {/* Spec Attributes Grid */}
            <div className="flex-1 py-4 flex flex-col justify-center gap-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-stone-900/65 p-3 rounded-2xl border border-stone-800/80 flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">Engine Assembly</p>
                    <p className="text-xs font-black text-white mt-0.5 truncate">{specsDetails.engine}</p>
                    <p className="text-[10px] font-bold text-rose-400 font-mono mt-0.5">{specsDetails.power}</p>
                  </div>
                </div>

                <div className="bg-stone-900/65 p-3 rounded-2xl border border-stone-800/80 flex items-start gap-2.5">
                  <Gauge className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">Velocity Hub</p>
                    <p className="text-xs font-black text-white mt-0.5">0-100: <span className="text-amber-400 font-extrabold">{specsDetails.accel}</span></p>
                    <p className="text-[10px] font-bold text-stone-400 font-mono mt-0.5">Max {specsDetails.topSpeed}</p>
                  </div>
                </div>

                <div className="bg-stone-900/65 p-3 rounded-2xl border border-stone-800/80 flex items-start gap-2.5">
                  <Settings2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">Transmission</p>
                    <p className="text-xs font-black text-white mt-0.5 truncate">{car.transmission}</p>
                    <p className="text-[10px] font-bold text-stone-400 font-mono mt-0.5">{specsDetails.driveType}</p>
                  </div>
                </div>

                <div className="bg-stone-900/65 p-3 rounded-2xl border border-stone-800/80 flex items-start gap-2.5">
                  <Fuel className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-stone-500 uppercase font-mono font-bold tracking-wider">Fuel System</p>
                    <p className="text-xs font-black text-white mt-0.5 truncate">{car.fuelType}</p>
                    <p className="text-[10px] font-bold text-sky-400 font-mono mt-0.5 truncate">{specsDetails.efficiency}</p>
                  </div>
                </div>
              </div>

              {/* Passenger row */}
              <div className="bg-stone-900/40 px-3 py-2 rounded-xl border border-stone-800/60 flex items-center justify-between text-xs">
                <span className="text-stone-400 flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest font-mono">
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  Cabin Capacity
                </span>
                <span className="font-sans font-black text-stone-200">
                  {car.seats} Premium Seats
                </span>
              </div>

              {/* CO2 dynamic row */}
              <div className="bg-stone-900/40 px-3 py-2 rounded-xl border border-stone-800/60 flex items-center justify-between text-xs">
                <span className="text-stone-400 flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  Sustainability
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
                  RATE PLAN
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-black text-rose-500">
                    ${car.price.toLocaleString()}
                  </span>
                  <span className="text-stone-500 text-[10px] font-semibold flex items-center gap-1">
                    /mo
                    <div className="relative group flex items-center">
                      <HelpCircle className="w-3.5 h-3.5 text-stone-500 cursor-help hover:text-stone-400 transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-900 border border-stone-800 text-stone-100 text-[10px] leading-tight sm:text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] text-center shadow-xl pointer-events-none">
                        Monthly rental breakdown (Deposit + Monthly Rent)
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-stone-900"></div>
                      </div>
                    </div>
                  </span>
                </div>
              </div>

              {isAdminMode ? (
                <div className="flex gap-1.5">
                  <button
                    id={`car-back-btn-edit-${car.id}`}
                    onClick={(e) => { e.stopPropagation(); onEdit && onEdit(car); }}
                    className="px-3 py-1.5 text-[10px] font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-all cursor-pointer border border-stone-700"
                  >
                    Edit
                  </button>
                  <button
                    id={`car-back-btn-delete-${car.id}`}
                    onClick={(e) => { e.stopPropagation(); onDelete && onDelete(car.id); }}
                    className="px-3 py-1.5 text-[10px] font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-all border border-rose-900/30 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <button
                  id={`car-back-btn-rent-${car.id}`}
                  onClick={(e) => { e.stopPropagation(); setIsBookingOpen(true); }}
                  className="flex items-center gap-1 px-4 py-2 text-[10px] font-bold bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-500 transition-all cursor-pointer"
                >
                  Book Service
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
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>

                  <div className="text-center">
                    <h3 className="font-extrabold text-stone-900 text-xl tracking-tight mb-1">
                      Your Enquiry Sent!
                    </h3>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto mb-5 leading-normal">
                      Thank you for your inquiry. We will check availability and follow up shortly with specific car photos and details.
                    </p>
                  </div>

                  {/* Booking Receipt Plate */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-3 font-sans text-stone-800 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-stone-400" />
                        <span className="font-mono font-bold uppercase tracking-wider text-stone-400 text-[10px]">
                          DATE-TIME
                        </span>
                      </div>
                      <span className="font-mono font-black text-stone-900 tracking-wider text-sm">
                        {new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                          SELECTED VEHICLE
                        </p>
                        <p className="font-bold text-stone-800 truncate mt-0.5">
                          {car.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                          CLIENT NAME
                        </p>
                        <p className="font-bold text-stone-800 truncate mt-0.5">
                          {confirmedBooking.customerName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-100">
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                          LOCATION
                        </p>
                        <p className="font-semibold text-stone-800 font-mono mt-0.5">
                          {confirmedBooking.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                          PICKUP DATE & TIME
                        </p>
                        <p className="font-semibold text-stone-800 font-mono mt-0.5">
                          {confirmedBooking.pickupDate} at{" "}
                          {confirmedBooking.pickupTime}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#4C0027]/5 border border-[#4C0027]/10 p-3 rounded-xl flex items-center justify-between mt-2">
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
                    A copy of the booking voucher and checklist rules will be
                    replied via your{" "}
                    <span className="font-semibold">
                      {confirmedBooking.contactMethod}
                    </span>{" "}
                    account. Feel free to contact dispatchers.
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
                           : getOptimizedImageUrl(car.image, windowWidth, 'thumbnail')
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
                        <span className="text-stone-400 text-[10px] sm:text-xs uppercase">{car.category} FLEET COLLECTION</span>
                      </p>
                    </div>
                  </div>

                  <h3 className="font-sans font-black text-stone-900 text-lg tracking-tight">
                    Enterprise Enquiry System
                  </h3>

                  {/* Active reservation form inputs */}
                  <div className="space-y-3">
                    {/* Customer Details info block */}
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                          NAME
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

                      <div>
                        <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                          I HAVE
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
                        </div>
                      </div>
                    </div>

                    {/* Location, Date & Time Panel grouped together */}
                    <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-semibold text-stone-500 uppercase block mb-1.5 font-mono">
                            PICKUP DATE
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
                            PICKUP TIME
                          </label>
                          <input
                            id={`book-pickup-time-${car.id}`}
                            type="time"
                            required
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="w-full text-xs py-1.5 px-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#4C0027] text-stone-800 font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-stone-500 uppercase block mb-1.5 font-mono">
                          LOCATION
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
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5">
                        Message
                      </label>
                      <div className="relative">
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
                    </div>
                  </div>

                  <button
                    id={`btn-confirm-reserve-${car.id}`}
                    type="submit"
                    className="w-full py-3.5 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center uppercase tracking-wider mt-2.5 opacity-90"
                    style={{ backgroundColor: brandPlum }}
                    onClick={() => {
                      if (contactMethod === "none") {
                        alert("Please select either WhatsApp or Telegram to send your enquiry.");
                      }
                    }}
                  >
                    Send Enquiry Now
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
    </>
  );
};
