import React, { useState, useMemo } from "react";
import { Car, Review, Booking } from "../types";
import { motion, AnimatePresence } from "motion/react";
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
} from "lucide-react";

interface CarCardProps {
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
    contactMethod: "whatsapp" | "telegram";
    message: string;
    totalCost: number;
  }) => Booking;
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
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Booking flow states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState("2026-06-04");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "telegram">(
    "whatsapp",
  );
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
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

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !pickupDate || !pickupTime || !location) return;

    if (onConfirmBook) {
      const resultObj = onConfirmBook({
        customerName,
        pickupDate,
        pickupTime,
        location,
        contactMethod,
        message,
        totalCost: totalBookingCost,
      });
      setConfirmedBooking(resultObj);
    }

    // Format message for WhatsApp or Telegram
    const carDetails = `*Enquiry for: ${car.name}*`;
    const customerDetails = `Name: ${customerName}`;
    const bookingDetails = `Pickup Location: ${location}\nDate: ${pickupDate}\nTime: ${pickupTime}`;
    const userMessage = message ? `\nMessage: ${message}` : "";
    const fullText = `${carDetails}\n\n${customerDetails}\n\n${bookingDetails}${userMessage}`;

    const adminPhone = "855966714442";
    const adminTelegram = "+855966714442";

    if (contactMethod === "whatsapp") {
      window.open(
        `https://wa.me/${adminPhone}?text=${encodeURIComponent(fullText)}`,
        "_blank",
      );
    } else {
      window.open(
        `https://t.me/${adminTelegram}?text=${encodeURIComponent(fullText)}`,
        "_blank",
      );
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
        id={`car-card-${car.id}`}
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
      >
        {/* Visual Header & Image */}
        <div
          id={`car-image-container-${car.id}`}
          className="relative h-48 bg-stone-50 overflow-hidden"
        >
          <span
            id={`car-category-${car.id}`}
            className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${getCategoryColor(car.category)}`}
          >
            {car.category}
          </span>

          {/* Rating badge removed by user request */}

          {/* Zooming, Tilting & Rolling Scroll-linked Cover Image */}
          <motion.img
            id={`car-photo-${car.id}`}
            src={car.image}
            alt={car.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
            }}
            initial={{ scale: 0.94, rotate: -2, y: 15 }}
            whileInView={{
              scale: isHovered ? 1.15 : 1.01,
              x: isHovered ? 8 : 0,
              y: isHovered ? -4 : 0,
              rotate: isHovered ? -0.8 : 0,
            }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none"
          />

          {/* Beautiful linear cover shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/15 to-transparent pointer-events-none" />
        </div>

        {/* Narrative & Info */}
        <div
          id={`car-body-${car.id}`}
          className="p-5 flex-1 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4 w-full gap-2 flex-wrap">
              <h3
                id={`car-title-${car.id}`}
                className="font-sans font-extrabold text-stone-900 text-lg tracking-tight hover:text-[#4C0027] transition-[#4C0027] leading-snug"
              >
                {car.name}
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-mono font-black bg-[#4C0027] text-white tracking-widest shadow-sm">
                {car.yearModel || "2024"}
              </span>
            </div>

            {/* Highlights Info Grid (Technical) */}
            <div
              id={`car-specs-${car.id}`}
              className="grid grid-cols-3 gap-1 py-3 border-y border-stone-200 mb-4 bg-stone-100/50 rounded-xl px-1"
            >
              <div className="flex flex-col items-center justify-center p-1">
                <Users className="w-4 h-4 text-stone-700 mb-1" />
                <span className="text-[10px] font-mono text-stone-900 font-extrabold">
                  {car.seats} Seats
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-1 border-x border-stone-200">
                <Settings2 className="w-4 h-4 text-stone-700 mb-1" />
                <span className="text-[10px] font-mono text-stone-900 font-extrabold truncate max-w-full text-center">
                  {car.transmission}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-1">
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
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none">
                Monthly Fee
              </span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span
                  id={`car-price-${car.id}`}
                  className="text-2xl font-black text-stone-900"
                >
                  ${car.price.toLocaleString()}
                </span>
                <span className="text-stone-400 text-xs font-semibold">
                  /month
                </span>
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
      </motion.div>

      {/* Advanced Booking Reservation Modal */}
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
                      We will get back to you ..........
                    </p>
                  </div>

                  {/* Booking Receipt Plate */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-3 font-sans text-stone-800 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-stone-400" />
                        <span className="font-mono font-bold uppercase tracking-wider text-stone-400 text-[10px]">
                          ENQUIRY NO.
                        </span>
                      </div>
                      <span className="font-mono font-black text-stone-900 tracking-wider text-sm">
                        {confirmedBooking.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold font-mono">
                          SELECTED VEHICLE
                        </p>
                        <p className="font-bold text-stone-800 truncate mt-0.5">
                          {car.yearModel} {car.name}
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

                    <div className="pt-2.5 mt-3 border-t border-stone-150">
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
                    className="w-full mt-5 py-3 text-xs font-bold text-white rounded-xl shadow-md transition-all text-center uppercase tracking-wider cursor-pointer"
                    style={{ backgroundColor: brandPlum }}
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                    <img
                      src={car.image}
                      alt={car.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
                      }}
                      referrerPolicy="no-referrer"
                      className="w-16 h-12 object-cover rounded-xl border border-stone-100"
                    />
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm leading-tight">
                        {car.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-mono font-bold mt-0.5">
                        {car.yearModel} {car.category} FLEET COLLECTION
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
                            className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
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
                    <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-105 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-semibold text-stone-500 uppercase block mb-1.5 font-mono">
                            PICKUP DATE
                          </label>
                          <input
                            id={`book-pickup-${car.id}`}
                            type="date"
                            required
                            min="2026-06-04"
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
                            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-850 focus:outline-none focus:border-[#4C0027] transition-all"
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
                          className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id={`btn-confirm-reserve-${car.id}`}
                    type="submit"
                    className="w-full py-3.5 text-xs font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-center uppercase tracking-wider mt-2.5"
                    style={{ backgroundColor: brandPlum }}
                  >
                    Send Enquiry Now
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Reviews & Specifications Modal Drawer */}
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
              <div className="border-b border-stone-150 pb-4 mb-4 select-none">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="font-sans font-black text-stone-900 text-xl tracking-tight">
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
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
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
                          className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all resize-none"
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
      </AnimatePresence>
    </>
  );
};
