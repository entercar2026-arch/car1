import React, { useState, useMemo, useEffect } from "react";
import { Car, Booking, Review } from "../types";
import { BrandLogo } from "./BrandLogo";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  Edit3,
  LogOut,
  CarFront,
  TrendingUp,
  DollarSign,
  Eye,
  Sparkles,
  Upload,
  Link2,
  X,
  AlertOctagon,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  MessageSquare,
  ClipboardList,
  Star,
  Users,
  Calendar,
  Camera,
  FileWarning,
} from "lucide-react";

interface AdminDashboardProps {
  cars: Car[];
  onAddCar: (car: Omit<Car, "id">) => void;
  onUpdateCar: (car: Car) => void;
  onDeleteCar: (carId: string) => void;
  onLogout: () => void;
  onNavigateToCustomer: () => void;

  // Advanced features state passing
  bookings?: Booking[];
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking["status"],
  ) => void;
  onDeleteBooking?: (bookingId: string) => void;
  reviews?: Review[];
  onApproveReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cars,
  onAddCar,
  onUpdateCar,
  onDeleteCar,
  onLogout,
  onNavigateToCustomer,
  bookings = [],
  onUpdateBookingStatus,
  onDeleteBooking,
  reviews = [],
  onApproveReview,
  onDeleteReview,
}) => {
  // Tabs management
  const [activeTab, setActiveTab] = useState<"fleet" | "bookings" | "reviews">(
    "fleet",
  );

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);
  const [activePassportUrl, setActivePassportUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFormOpen(false);
        setCarToDelete(null);
        setActivePassportUrl(null);
      }
    };

    if (isFormOpen || carToDelete || activePassportUrl) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isFormOpen, carToDelete, activePassportUrl]);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<Car["category"]>("Sedan");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formImage, setFormImage] = useState("");
  const [formTransmission, setFormTransmission] =
    useState<Car["transmission"]>("Automatic");
  const [formSeats, setFormSeats] = useState(5);
  const [formFuel, setFormFuel] = useState<Car["fuelType"]>("Gasoline");
  const [formDescription, setFormDescription] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [captureError, setCaptureError] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit. Please provide a URL instead of uploading large media directly.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const brandPlum = "#4C0027";

  // Open the add product form and clear outputs
  const handleOpenAdd = () => {
    setEditingCar(null);
    setFormName("");
    setFormCategory("Sedan");
    setFormPrice(""); // clean monthly starting point
    setFormImage("");
    setFormTransmission("Automatic");
    setFormSeats(5);
    setFormFuel("Gasoline");
    setFormDescription("");
    setFormVideoUrl("");
    setFormThumbnail("");
    setIsFormOpen(true);
  };

  // Open edit product form preloaded with details
  const handleOpenEdit = (car: Car) => {
    setEditingCar(car);
    setFormName(car.name);
    setFormCategory(car.category);
    setFormPrice(car.price);
    setFormImage(car.image);
    setFormTransmission(car.transmission);
    setFormSeats(car.seats);
    setFormFuel(car.fuelType);
    setFormDescription(car.description || "");
    setFormVideoUrl(car.videoUrl || "");
    setFormThumbnail(car.thumbnail || "");
    setIsFormOpen(true);
  };

  // Submit processing
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let processedImage = formImage.trim();

    // Check for Google Drive links and convert them to direct image links
    const driveMatch = processedImage.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      processedImage = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    // Ensure empty image stays empty, avoiding hardcoded Range Rover fallback
    const targetImageUrl = processedImage;

    if (editingCar) {
      onUpdateCar({
        ...editingCar,
        name: formName,
        category: formCategory,
        price: Number(formPrice),
        image: targetImageUrl,
        transmission: formTransmission,
        seats: Number(formSeats),
        fuelType: formFuel,
        description: formDescription,
        videoUrl: formVideoUrl,
        thumbnail: formThumbnail || undefined,
      });
    } else {
      onAddCar({
        name: formName,
        category: formCategory,
        price: Number(formPrice),
        image: targetImageUrl,
        transmission: formTransmission,
        seats: Number(formSeats),
        fuelType: formFuel,
        description: formDescription,
        videoUrl: formVideoUrl,
        thumbnail: formThumbnail || undefined,
      });
    }
    setIsFormOpen(false);
  };

  // Safe delete execution
  const handleDeleteConfirm = () => {
    if (carToDelete) {
      onDeleteCar(carToDelete);
      setCarToDelete(null);
    }
  };

  // Fleet Statistics Computed on current state
  const totalAssets = cars.length;
  const avgRate =
    totalAssets > 0
      ? Math.round(cars.reduce((sum, c) => sum + c.price, 0) / totalAssets)
      : 0;
  const activeBookingsCount = bookings.filter(
    (b) => b.status === "Approved",
  ).length;

  return (
    <div
      id="admin-dashboard-root"
      className="min-h-screen bg-[#FAFAF9]"
      style={{ color: "#1C1917" }}
    >
      {/* Top Professional Admin Bar */}
      <header
        id="admin-top-bar"
        className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm col-span-3"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <BrandLogo size="md" variant="light" />

          {/* Quick Stats banner bar in desktop */}
          <div className="hidden lg:flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl border border-stone-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4C0027] animate-pulse" />
            <span className="text-[10px] font-mono text-[#4C0027] font-bold uppercase tracking-wide">
              ADMINISTRATIVE MODE (Authenticated)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-btn-view-customer"
              onClick={onNavigateToCustomer}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#4C0027] bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Customer View</span>
            </button>

            <button
              id="admin-btn-logout"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100/70 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Tab Selection Row */}
        <div className="flex gap-2.5 mb-6 border-b border-stone-200 pb-px">
          <button
            id="tab-btn-fleet"
            onClick={() => setActiveTab("fleet")}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 tracking-wide cursor-pointer ${activeTab === "fleet" ? "border-[#4C0027] text-[#4C0027]" : "border-transparent text-stone-500 hover:text-stone-800"}`}
          >
            <span className="flex items-center gap-2">
              <CarFront className="w-4 h-4" />
              Fleet Inventory ({cars.length})
            </span>
          </button>

          <button
            id="tab-btn-bookings"
            onClick={() => setActiveTab("bookings")}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 tracking-wide cursor-pointer ${activeTab === "bookings" ? "border-[#4C0027] text-[#4C0027]" : "border-transparent text-stone-500 hover:text-stone-800"}`}
          >
            <span className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Bookings Registry ({bookings.length})
            </span>
          </button>

          <button
            id="tab-btn-reviews"
            onClick={() => setActiveTab("reviews")}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 tracking-wide cursor-pointer ${activeTab === "reviews" ? "border-[#4C0027] text-[#4C0027]" : "border-transparent text-stone-500 hover:text-stone-800"}`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reviews Moderation ({reviews.length})
            </span>
          </button>
        </div>

        {/* Dynamic Content Switching Panels */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden mb-12">
          {activeTab === "fleet" && (
            <div id="fleet-inventory-panel">
              {/* Header row within card */}
              <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-sans font-black text-xl text-stone-900 tracking-tight">
                    Active Inventory Manager
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 leading-normal">
                    Directly handle additions, revisions, and description
                    updates. Updates broadcast instantly.
                  </p>
                </div>

                <button
                  id="admin-btn-add-vehicle"
                  onClick={handleOpenAdd}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs hover:shadow-md hover:scale-101 hover:brightness-110 transition-all cursor-pointer self-start sm:self-center"
                  style={{ backgroundColor: brandPlum }}
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add New Vehicle</span>
                </button>
              </div>

              {/* Table Container */}
              {cars.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <CarFront className="w-12 h-12 text-stone-300 mb-3" />
                  <p className="font-semibold text-stone-800 text-sm">
                    No cars available
                  </p>
                  <p className="text-xs text-stone-400 max-w-sm mt-1 mb-4 leading-normal">
                    Your database is empty. Click "Add New Vehicle" to seed
                    listings.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-[10px] font-bold tracking-wider text-stone-400 uppercase border-b border-stone-200 select-none">
                        <th className="p-4 pl-6 w-24">Thumbnail</th>
                        <th className="p-4">Car Model Name</th>
                        <th className="p-4 w-28">Category</th>
                        <th className="p-4 w-32">Monthly Fee</th>
                        <th className="p-4">Specifications</th>
                        <th className="p-4 text-right pr-6 w-28">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {cars.map((car) => (
                        <tr
                          id={`admin-row-${car.id}`}
                          key={car.id}
                          className="hover:bg-stone-50/40 transition-colors"
                        >
                          <td className="p-4 pl-6 text-center">
                            {car.thumbnail ? (
                              <img
                                id={`admin-thumb-${car.id}`}
                                src={car.thumbnail}
                                alt={car.name}
                                className="w-16 h-12 object-cover rounded-xl border border-stone-100 shadow-2xs select-none"
                              />
                            ) : car.image.match(/\.(mp4|webm|ogg|quicktime|mov|avi|mkv)(\?.*)?$/i) || car.image.includes("video") ? (
                              <video
                                id={`admin-thumb-${car.id}`}
                                src={car.image.includes("#") ? car.image : `${car.image}#t=0.1`}
                                preload="metadata"
                                muted
                                playsInline
                                className="w-16 h-12 object-cover rounded-xl border border-stone-100 shadow-2xs select-none bg-stone-100"
                              />
                            ) : (
                              <img
                                id={`admin-thumb-${car.id}`}
                                src={car.image}
                                alt={car.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600";
                                }}
                                referrerPolicy="no-referrer"
                                className="w-16 h-12 object-cover rounded-xl border border-stone-100 shadow-2xs select-none"
                              />
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              id={`admin-name-${car.id}`}
                              className="font-bold text-stone-900 block text-sm"
                            >
                              {car.name}
                            </span>
                            <span className="text-[10px] text-stone-400 line-clamp-1 max-w-xs leading-none mt-1">
                              {car.description ||
                                "Premium curated vehicle asset"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-stone-100/50 text-stone-600 uppercase border border-stone-200">
                              {car.category}
                            </span>
                          </td>
                          <td className="p-4 font-mono">
                            <span
                              id={`admin-fee-${car.id}`}
                              className="font-extrabold text-stone-900 text-sm"
                            >
                              ${car.price}
                            </span>
                            <span className="text-stone-400 text-xs font-semibold">
                              {" "}
                              / month
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 text-[10px] font-mono text-stone-500 font-semibold uppercase">
                              <span>{car.seats} Seats</span>
                              <span>•</span>
                              <span>{car.transmission}</span>
                              <span>•</span>
                              <span>{car.fuelType}</span>
                              {car.yearModel && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-700 font-bold">
                                    {car.yearModel}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                id={`admin-row-edit-${car.id}`}
                                onClick={() => handleOpenEdit(car)}
                                title="Edit Vehicle Specs"
                                className="p-2 hover:bg-stone-100 text-stone-700 hover:text-stone-900 rounded-lg transition-all cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                id={`admin-row-delete-${car.id}`}
                                onClick={() => setCarToDelete(car.id)}
                                title="Delete Vehicle Asset"
                                className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div id="bookings-registry-panel">
              <div className="p-6 border-b border-stone-100">
                <h2 className="font-sans font-black text-xl text-stone-900 tracking-tight">
                  Active Bookings Registry
                </h2>
                <p className="text-xs text-stone-500 mt-1 leading-normal animate-fade-in">
                  Authenticate pickup vouchers, track current dispatch states,
                  and cancel unconfirmed requests.
                </p>
              </div>

              {bookings.length === 0 ? (
                <div className="p-16 text-center select-none">
                  <ClipboardList className="w-14 h-14 text-stone-250 mx-auto mb-3" />
                  <p className="font-bold text-stone-700 text-sm">
                    No Active Booking Records
                  </p>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto leading-normal">
                    When customers submit bookings in the catalog section,
                    details of pickup dates, and totals materialize here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-[10px] font-bold tracking-wider text-stone-400 uppercase border-b border-stone-200 select-none">
                        <th className="p-4 pl-6">ID</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Vehicle Model</th>
                        <th className="p-4">Pickup Setup</th>
                        <th className="p-4">Total Cost</th>
                        <th className="p-4">State</th>
                        <th className="p-4 text-right pr-6">
                          Administrative Controls
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs">
                      {bookings.map((book) => (
                        <tr
                          key={book.id}
                          className="hover:bg-stone-50/40 transition-colors"
                        >
                          <td className="p-4 pl-6 font-mono font-black text-stone-950">
                            {book.id}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-stone-950">
                              {book.customerName}
                            </p>
                            <div className="flex flex-col gap-1.5 mt-1">
                              <span className="text-[10px] text-stone-405 font-mono font-medium">
                                Via {book.contactMethod}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono mt-1 break-words">
                                {book.message}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-black">
                            {book.carName}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col font-mono text-stone-700 font-semibold gap-1">
                              <span>Loc: {book.location}</span>
                              <span className="text-stone-400">
                                Date: {book.pickupDate}
                              </span>
                              <span className="text-stone-400">
                                Time: {book.pickupTime}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-extrabold text-[#4C0027] text-sm">
                            ${book.totalCost}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-normal uppercase ${
                                book.status === "Approved"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : book.status === "Cancelled"
                                    ? "bg-rose-50 text-rose-800 border border-rose-100"
                                    : "bg-stone-100/70 text-stone-700 border border-stone-200 animate-pulse"
                              }`}
                            >
                              {book.status}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              {book.status === "Pending" &&
                                onUpdateBookingStatus && (
                                  <button
                                    id={`btn-approve-book-${book.id}`}
                                    onClick={() =>
                                      onUpdateBookingStatus(book.id, "Approved")
                                    }
                                    title="Approve Booking"
                                    className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-150 shadow-2xs transition-all cursor-pointer"
                                  >
                                    Approve Vouc.
                                  </button>
                                )}

                              {book.status !== "Cancelled" &&
                                onUpdateBookingStatus && (
                                  <button
                                    id={`btn-cancel-book-${book.id}`}
                                    onClick={() =>
                                      onUpdateBookingStatus(
                                        book.id,
                                        "Cancelled",
                                      )
                                    }
                                    title="Cancel Booking"
                                    className="p-1 px-2 text-stone-100 bg-stone-500 hover:bg-stone-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}

                              {onDeleteBooking && (
                                <button
                                  id={`btn-delete-book-${book.id}`}
                                  onClick={() => onDeleteBooking(book.id)}
                                  title="Purge Record"
                                  className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div id="reviews-moderation-panel">
              <div className="p-6 border-b border-stone-100">
                <h2 className="font-sans font-black text-xl text-stone-900 tracking-tight">
                  Reviews Moderation Center
                </h2>
                <p className="text-xs text-stone-500 mt-1 leading-normal animate-fade-in">
                  Approve and publish customer feedback stories to display
                  dynamically inside the product catalog card lists.
                </p>
              </div>

              {reviews.length === 0 ? (
                <div className="p-16 text-center select-none">
                  <MessageSquare className="w-14 h-14 text-stone-250 mx-auto mb-3" />
                  <p className="font-bold text-stone-700 text-sm">
                    No Customer Reviews Logged
                  </p>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto leading-normal">
                    Whenever catalog visitors write thoughts and input ratings,
                    they undergo review cycles and list under this dashboard.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto animate-fade-in">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-[10px] font-bold tracking-wider text-stone-400 uppercase border-b border-stone-200 select-none">
                        <th className="p-4 pl-6 w-32">Client Author</th>
                        <th className="p-4">Review Star Value</th>
                        <th className="p-4">Comment Narrative</th>
                        <th className="p-4 w-28">Submitted At</th>
                        <th className="p-4 w-28">Public State</th>
                        <th className="p-4 text-right pr-6 w-52">
                          Moderator Action Controls
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs">
                      {reviews.map((rev) => {
                        const targetCar = cars.find((c) => c.id === rev.carId);
                        return (
                          <tr
                            key={rev.id}
                            className="hover:bg-stone-50/40 transition-colors"
                          >
                            <td className="p-4 pl-6">
                              <p className="font-bold text-stone-900">
                                {rev.customerName}
                              </p>
                              {targetCar && (
                                <span className="text-[10px] text-[#4C0027] font-semibold block mt-0.5">
                                  {targetCar.name}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"}`}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-stone-600 italic max-w-md break-words font-sans">
                                "{rev.comment}"
                              </p>
                            </td>
                            <td className="p-4 font-mono font-medium text-stone-505">
                              {rev.createdAt}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-widest uppercase ${
                                  rev.isApproved
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-900"
                                }`}
                              >
                                {rev.isApproved ? "PUBLISHED" : "PENDING"}
                              </span>
                            </td>
                            <td className="p-4 text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                {!rev.isApproved && onApproveReview && (
                                  <button
                                    id={`btn-approve-rev-moderator-${rev.id}`}
                                    onClick={() => onApproveReview(rev.id)}
                                    className="p-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm"
                                  >
                                    Approve & Publish
                                  </button>
                                )}

                                {onDeleteReview && (
                                  <button
                                    id={`btn-delete-rev-moderator-${rev.id}`}
                                    onClick={() => onDeleteReview(rev.id)}
                                    title="Discard Review Feedback"
                                    className="p-1 px-2 bg-[#FAFAF9] hover:bg-rose-50 text-rose-600 border border-stone-205 hover:border-rose-200 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                  >
                                    Purge
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal - Add or Edit Car item */}
      <AnimatePresence>
        {isFormOpen && (
          <div
            id="modal-upsert"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative border border-stone-100 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Banner */}
              <div className="bg-[#4C0027] text-white p-5 flex items-center justify-between border-b border-[#5E0030]/50">
                <div>
                  <h3 className="font-sans font-extrabold text-base">
                    {editingCar
                      ? "Update Fleet Record"
                      : "Register New Vehicle"}
                  </h3>
                  <p className="text-[10px] text-stone-200 uppercase tracking-widest font-mono mt-0.5">
                    {editingCar ? "System Modification" : "Database Insertion"}
                  </p>
                </div>

                <button
                  id="btn-close-form"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content body (scrollable if viewport low) */}
              <form
                onSubmit={handleFormSubmit}
                className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Car Name / Model Name *
                    </label>
                    <input
                      id="input-car-name"
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Ford Mustang Mach-E"
                      className="w-full px-3.5 py-2 border border-stone-200 bg-stone-50 rounded-xl text-black text-xs focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                    />
                  </div>

                  {/* Pricing field */}
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Monthly Rental Rate (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 text-xs font-mono">
                        $
                      </span>
                      <input
                        id="input-car-price"
                        type="number"
                        required
                        min="1"
                        max="10000"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : "")}
                        className="w-full pl-7 pr-3 py-2 border border-stone-200 bg-stone-50 rounded-xl text-black text-xs font-mono focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                      />
                    </div>
                  </div>

                  {/* Category Field */}
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Category *
                    </label>
                    <select
                      id="select-car-category"
                      value={formCategory}
                      onChange={(e) =>
                        setFormCategory(e.target.value as Car["category"])
                      }
                      className="w-full px-3.5 py-2 border border-stone-200 bg-stone-50 rounded-xl text-black text-xs focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="MPV">MPV</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>

                  {/* Transmission Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Transmission
                    </label>
                    <div className="flex gap-2">
                      <button
                        id="btn-transmission-auto"
                        type="button"
                        onClick={() => setFormTransmission("Automatic")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${formTransmission === "Automatic" ? "bg-[#4C0027] text-white border-[#4C0027]" : "bg-stone-50 border-stone-200 text-stone-600"}`}
                      >
                        Auto
                      </button>
                      <button
                        id="btn-transmission-manual"
                        type="button"
                        onClick={() => setFormTransmission("Manual")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${formTransmission === "Manual" ? "bg-[#4C0027] text-white border-[#4C0027]" : "bg-stone-50 border-stone-200 text-stone-600"}`}
                      >
                        Manual
                      </button>
                    </div>
                  </div>

                  {/* Fuel Choice selection */}
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Fuel System
                    </label>
                    <select
                      id="select-car-fuel"
                      value={formFuel}
                      onChange={(e) =>
                        setFormFuel(e.target.value as Car["fuelType"])
                      }
                      className="w-full px-3.5 py-2 border border-stone-200 bg-stone-50 rounded-xl text-black text-xs focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                    >
                      <option value="Gasoline">Gasoline</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Diesel">Diesel</option>
                      <option value="LPG">LPG</option>
                    </select>
                  </div>

                  {/* Seat count field range input */}
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Seats Count
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="input-car-seats"
                        type="range"
                        min="2"
                        max="8"
                        value={formSeats}
                        onChange={(e) => setFormSeats(Number(e.target.value))}
                        className="w-full accent-[#4C0027]"
                      />
                      <span className="font-mono text-stone-855 font-extrabold text-sm border border-stone-200 px-2 py-0.5 rounded-lg bg-stone-100">
                        {formSeats}
                      </span>
                    </div>
                  </div>

                  {/* Visual Image link */}
                  <div className="sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Car Image or Video URL
                      </label>
                      <label className="text-[10px] font-bold text-[#4C0027] bg-[#4C0027]/10 px-2 py-0.5 rounded cursor-pointer hover:bg-[#4C0027]/20 transition-colors flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Upload
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                        <Link2 className="h-4 w-4" />
                      </span>
                      {formImage.length > 200 && formImage.startsWith("data:") ? (
                        <div className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-stone-100 rounded-xl text-stone-600 text-xs flex justify-between items-center">
                          <span className="truncate">Local media uploaded</span>
                          <button type="button" onClick={() => setFormImage("")} className="text-rose-500 hover:text-rose-700 font-bold ml-2 shrink-0">&times;</button>
                        </div>
                      ) : (
                        <input
                          id="input-car-image"
                          type="text"
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          placeholder="https://... or Google Drive link"
                          className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-stone-50 rounded-xl text-black text-xs focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                        />
                      )}
                    </div>
                  </div>

                  {/* Video URL Field */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Car Video URL (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-450 text-stone-400/80">
                        <Link2 className="h-4 w-4 text-stone-400" />
                      </span>
                      <input
                        id="input-car-video"
                        type="text"
                        value={formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        placeholder="e.g. https://files.catbox.moe/2zvvj8.mp4 or YouTube link"
                        className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-stone-50 rounded-xl text-black text-xs focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="input-car-thumbnail"
                      className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1"
                    >
                      Custom Thumbnail URL (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Link2 className="h-4 w-4 text-stone-400" />
                      </span>
                      <input
                        id="input-car-thumbnail"
                        type="text"
                        value={formThumbnail}
                        onChange={(e) => setFormThumbnail(e.target.value)}
                        placeholder="Paste a direct image URL to use as thumbnail if video capture fails"
                        className="w-full pl-10 pr-4 py-2 border border-stone-200 bg-stone-50 rounded-xl text-black text-xs focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all"
                      />
                    </div>
                  </div>

                  {/* Video Thumbnail Studio */}
                  {(() => {
                    const isVideoMedia = (url: string) => 
                      !!(url.match(/\.(mp4|webm|ogg|avi|mov|mkv)(\?.*)?$/i) || url.toLowerCase().includes("video") || url.startsWith("data:video/"));
                    
                    let videoSource = isVideoMedia(formImage) ? formImage : (isVideoMedia(formVideoUrl) ? formVideoUrl : "");
                    if (videoSource && !videoSource.startsWith("data:") && !videoSource.includes("drive.google.com")) {
                        videoSource += (videoSource.includes("?") ? "&" : "?") + "cors_bypass=" + Date.now();
                    }
                    if (!videoSource) return null;
                    
                    return (
                      <div className="sm:col-span-2 bg-stone-50 border border-stone-200/80 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-[#4C0027]" />
                            Video Thumbnail Capture Studio
                          </label>
                          {formThumbnail && (
                            <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">
                              Active Thumbnail
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Video Player */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                              1. Seek Video to Desired Frame
                            </span>
                            <video
                              id="form-video-preview"
                              src={videoSource}
                              controls
                              muted
                              playsInline
                              crossOrigin="anonymous"
                              className="w-full h-36 object-cover rounded-xl border border-stone-200 bg-stone-950"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const video = document.getElementById("form-video-preview") as HTMLVideoElement;
                                  if (video) {
                                    try {
                                      const canvas = document.createElement("canvas");
                                      canvas.width = video.videoWidth || 640;
                                      canvas.height = video.videoHeight || 360;
                                      const ctx = canvas.getContext("2d");
                                      if (ctx) {
                                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                                        setFormThumbnail(dataUrl);
                                        setCaptureError("");
                                      }
                                    } catch (err) {
                                      setCaptureError("This external video server blocked frame capture (CORS header missing). The app will cleanly fallback to native video loading instead.");
                                    }
                                  }
                                }}
                                className="flex-1 py-1.5 px-3 text-[10px] font-extrabold text-white bg-[#4C0027] hover:bg-[#36001a] transition-all rounded-lg select-none cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                Capture Active Frame
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const video = document.getElementById("form-video-preview") as HTMLVideoElement;
                                  if (video) {
                                    video.currentTime = 0.5;
                                    const autoCapture = () => {
                                      try {
                                        const canvas = document.createElement("canvas");
                                        canvas.width = video.videoWidth || 640;
                                        canvas.height = video.videoHeight || 360;
                                        const ctx = canvas.getContext("2d");
                                        if (ctx) {
                                          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                                          setFormThumbnail(dataUrl);
                                          setCaptureError("");
                                        }
                                      } catch (err) {
                                        setCaptureError("This external video server blocked frame capture (CORS header missing). The app will cleanly fallback to native video loading instead.");
                                      }
                                      video.removeEventListener("seeked", autoCapture);
                                    };
                                    video.addEventListener("seeked", autoCapture);
                                  }
                                }}
                                className="py-1.5 px-3 text-[10px] font-bold text-stone-700 bg-stone-200 hover:bg-stone-300 transition-all rounded-lg select-none cursor-pointer shadow-sm"
                                title="Seek to start and auto-capture"
                              >
                                Auto 0.5s Frame
                              </button>
                            </div>
                          </div>

                          {/* Thumbnail Preview container */}
                          <div className="flex flex-col gap-1.5 justify-between">
                            <div>
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                                2. Thumbnail Output Preview
                              </span>
                              {formThumbnail ? (
                                <div className="relative border border-stone-200 rounded-xl overflow-hidden bg-stone-100 h-36">
                                  <img
                                    src={formThumbnail}
                                    alt="Captured active thumbnail"
                                    className="w-full h-full object-cover animate-fade-in"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setFormThumbnail("")}
                                    className="absolute top-2 right-2 bg-stone-900/80 hover:bg-black text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all shadow-md cursor-pointer select-none"
                                    title="Remove captured thumbnail"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="border border-dashed border-stone-300 rounded-xl bg-stone-100/50 h-36 flex flex-col items-center justify-center text-center p-4">
                                  <FileWarning className="w-8 h-8 text-stone-300 mb-2 stroke-[1.5]" />
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide leading-tight">No Custom Thumbnail Captured</p>
                                  <p className="text-[9px] text-stone-400 mt-1 max-w-[200px]">The video's first loaded frame or fallback will be used.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {captureError && (
                          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-[10px] leading-tight flex items-start gap-2 mt-1">
                            <FileWarning className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                              <strong>Capture failed:</strong> {captureError}
                            </span>
                          </div>
                        )}

                        <p className="text-[8px] text-stone-400 leading-tight">
                          * <strong>Note on CORS limits:</strong> Browser security prohibits capturing frames from videos hosted on cross-origin domains that lack CORS headers. For perfect results, upload video files directly as a local media file.
                        </p>
                      </div>
                    );
                  })()}

                  {/* Description textarea */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                      Description & Narrative Details
                    </label>
                    <textarea
                      id="input-car-desc"
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Share what makes this vehicle magnificent..."
                      className="w-full px-3.5 py-2 border border-stone-200 bg-stone-50 rounded-xl text-black text-xs focus:bg-white focus:outline-none focus:border-[#4C0027] transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Confirm banner */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    id="btn-cancel-modal"
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    id="btn-save-car"
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all hover:brightness-110 cursor-pointer"
                    style={{ backgroundColor: brandPlum }}
                  >
                    {editingCar ? "Update Specifications" : "Save Vehicle"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation delete modal */}
      <AnimatePresence>
        {carToDelete !== null && (
          <div
            id="modal-delete-confirm"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border border-stone-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-3">
                  <AlertOctagon className="w-6 h-6 stroke-[2]" />
                </div>

                <h3 className="font-bold text-stone-900 text-base">
                  Confirm Fleet Removal
                </h3>

                <p className="text-xs text-stone-500 mt-2 px-1 leading-relaxed">
                  Are you absolutely sure you want to delete this vehicle
                  listing? This action cannot be undone, and the deletion
                  immediately purges client screens.
                </p>

                <div className="flex items-center gap-2 mt-5 w-full">
                  <button
                    id="btn-delete-cancel"
                    onClick={() => setCarToDelete(null)}
                    className="flex-1 py-2.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all cursor-pointer"
                  >
                    No, Cancel
                  </button>
                  <button
                    id="btn-delete-execute"
                    onClick={handleDeleteConfirm}
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Yes, Confirm Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Driver Passport preview modal */}
      <AnimatePresence>
        {activePassportUrl !== null && (
          <div
            id="modal-passport-preview"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
            onClick={() => setActivePassportUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 13 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 13 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative border border-stone-100 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="btn-close-passport-preview"
                onClick={() => setActivePassportUrl(null)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 font-extrabold cursor-pointer transition-all text-sm"
              >
                &times;
              </button>

              <div className="w-full text-center mb-4">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-2 mx-auto">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-stone-900 text-sm">
                  Driver Verification Document
                </h3>
                <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                  Scanned passport verification proof submitted during online
                  vehicle rental booking
                </p>
              </div>

              <div
                className="w-full bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden flex items-center justify-center p-2 relative"
                style={{ minHeight: "200px" }}
              >
                <img
                  src={activePassportUrl}
                  className="max-h-[350px] max-w-full rounded-lg object-contain shadow-sm"
                  alt="Driver Passport View"
                />
              </div>

              <button
                id="btn-confirm-close-passport-preview"
                onClick={() => setActivePassportUrl(null)}
                className="mt-5 w-full py-2.5 text-xs font-bold text-white rounded-xl transition-all cursor-pointer text-center uppercase tracking-wider"
                style={{ backgroundColor: brandPlum }}
              >
                Close Document View
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
