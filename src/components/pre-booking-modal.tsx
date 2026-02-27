"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, MapPin, Users, ArrowRight, ArrowLeft, Ticket, Palmtree, Building2 } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";

interface PreBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
}

export function PreBookingModal({ isOpen, onClose }: PreBookingModalProps) {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Select facility type, Step 2: Select dates
  const [categoryType, setCategoryType] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const isRoom = categoryType === "room";
  const isCottage = categoryType === "cottage";
  const isHall = categoryType === "function";

  const handleCategorySelect = (category: string) => {
    setCategoryType(category);
    setErrors({});

    if (category === "tickets") {
      // Tickets -> go directly to tickets page
      router.push("/tickets");
      onClose();
      resetForm();
      return;
    }

    // For rooms, cottages, and function halls, proceed to step 2 (date selection)
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const resetForm = () => {
    setStep(1);
    setCategoryType("");
    setCheckInDate("");
    setCheckOutDate("");
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const validateAndSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!checkInDate) {
      newErrors.checkIn = "Date is required";
    } else if (isBefore(startOfDay(new Date(checkInDate)), startOfDay(new Date()))) {
      newErrors.checkIn = "Date cannot be in the past";
    }

    // Only rooms need check-out date
    if (isRoom) {
      if (!checkOutDate) {
        newErrors.checkOut = "Check-out date is required";
      } else if (checkInDate && isBefore(new Date(checkOutDate), new Date(checkInDate))) {
        newErrors.checkOut = "Check-out must be after check-in";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Map category to facility types
    const types = isRoom ? "ROOM" : isCottage ? "COTTAGE" : "HALL";

    // For cottages and halls (day use), set checkout to next day
    const from = checkInDate;
    const to = isRoom ? checkOutDate : format(addDays(new Date(checkInDate), 1), "yyyy-MM-dd");

    const params = new URLSearchParams({ from, to, types });
    router.push(`/browse/availability?${params.toString()}`);
    handleClose();
  };

  const handleDateChange = (field: "checkIn" | "checkOut", value: string) => {
    setErrors(prev => ({ ...prev, [field]: "" }));
    if (field === "checkIn") {
      setCheckInDate(value);
      if (checkOutDate && isBefore(new Date(checkOutDate), new Date(value))) {
        setCheckOutDate("");
      }
    } else {
      setCheckOutDate(value);
    }
  };

  const isFormValid = isRoom
    ? checkInDate && checkOutDate
    : checkInDate; // Cottages and halls only need one date (day use)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] bg-white/95 backdrop-blur-sm p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b bg-white/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {step === 1 ? (
              <>
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-tropical-green" />
                What are you looking for?
              </>
            ) : (
              <>
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-tropical-green" />
                {isRoom ? "Select Your Stay Dates" : "Select Your Visit Date"}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-tropical-green/30 scrollbar-track-transparent" style={{ maxHeight: 'calc(90vh - 180px)' }}>

          {/* STEP 1: Select Facility Type */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select a facility type to get started</p>

              <button
                onClick={() => handleCategorySelect("room")}
                className="w-full flex items-center gap-4 rounded-xl border-2 border-tropical-tan/20 p-4 hover:border-tropical-blue hover:bg-tropical-blue/5 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-base">Room</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Comfortable rooms for overnight stays</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => handleCategorySelect("cottage")}
                className="w-full flex items-center gap-4 rounded-xl border-2 border-tropical-tan/20 p-4 hover:border-tropical-green hover:bg-tropical-green/5 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
                  <Palmtree className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-base">Cottage</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Day-use cottages for a relaxing getaway</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => handleCategorySelect("function")}
                className="w-full flex items-center gap-4 rounded-xl border-2 border-tropical-tan/20 p-4 hover:border-tropical-red hover:bg-tropical-red/5 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-base">Function Hall</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Book a function hall for your event</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => handleCategorySelect("tickets")}
                className="w-full flex items-center gap-4 rounded-xl border-2 border-tropical-tan/20 p-4 hover:border-tropical-yellow hover:bg-tropical-yellow/5 transition-all active:scale-[0.98] text-left"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center shrink-0">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-base">Tickets</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Buy resort admission & event tickets</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* STEP 2: Select Dates */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button onClick={handleBack} className="flex items-center gap-1 text-tropical-green hover:underline font-medium">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <span>•</span>
                <span className="font-medium">{isRoom ? "Room Booking" : isHall ? "Function Hall Booking" : "Cottage Booking"}</span>

              </div>

              {isRoom ? (
                // Room: Check-in and Check-out dates
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn" className="flex items-center gap-2 text-sm sm:text-base">
                      <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                      Check-in Date
                    </Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={checkInDate}
                      min={today}
                      onChange={(e) => handleDateChange("checkIn", e.target.value)}
                      className={`border-2 text-sm sm:text-base h-10 sm:h-11 ${errors.checkIn ? "border-red-500" : "border-tropical-green/30"}`}
                    />
                    {errors.checkIn && <p className="text-xs text-red-500">{errors.checkIn}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOut" className="flex items-center gap-2 text-sm sm:text-base">
                      <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                      Check-out Date
                    </Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={checkOutDate}
                      min={checkInDate || tomorrow}
                      disabled={!checkInDate}
                      onChange={(e) => handleDateChange("checkOut", e.target.value)}
                      className={`border-2 text-sm sm:text-base h-10 sm:h-11 ${errors.checkOut ? "border-red-500" : "border-tropical-green/30"}`}
                    />
                    {errors.checkOut && <p className="text-xs text-red-500">{errors.checkOut}</p>}
                  </div>
                </div>
              ) : (
                // Cottage / Hall: Just a single date (day use)
                <div className="space-y-2">
                  <Label htmlFor="visitDate" className="flex items-center gap-2 text-sm sm:text-base">
                    <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                    Visit Date
                  </Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={checkInDate}
                    min={today}
                    onChange={(e) => handleDateChange("checkIn", e.target.value)}
                    className={`border-2 text-sm sm:text-base h-10 sm:h-11 ${errors.checkIn ? "border-red-500" : "border-tropical-green/30"}`}
                  />
                  {errors.checkIn && <p className="text-xs text-red-500">{errors.checkIn}</p>}
                  <p className="text-xs text-muted-foreground">{isHall ? "Function halls are for day use only" : "Cottages are for day use only"}</p>
                </div>
              )}

              {/* Summary */}
              {isFormValid && (
                <div className="bg-tropical-green/10 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-sm mb-1.5">Your Selection:</h4>
                  <div className="text-xs sm:text-sm space-y-1">
                    {isRoom ? (
                      <p>📅 {format(new Date(checkInDate), "MMM dd, yyyy")} - {format(new Date(checkOutDate), "MMM dd, yyyy")}</p>
                    ) : (
                      <p>📅 {format(new Date(checkInDate), "MMM dd, yyyy")} (Day Use)</p>
                    )}
                    <p>🏠 {isRoom ? "Room" : isHall ? "Function Hall" : "Cottage"}</p>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
        
        {/* Action Buttons - Fixed Footer */}
        <div className="bg-white/95 backdrop-blur-sm border-t px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl">
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={step === 2 ? handleBack : handleClose}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
            >
              {step === 2 ? "Back" : "Cancel"}
            </Button>
            {step === 2 && (
              <Button
                onClick={validateAndSubmit}
                disabled={!isFormValid}
                className="flex-1 h-10 sm:h-11 text-sm sm:text-base bg-gradient-to-r from-tropical-green to-tropical-blue hover:from-tropical-green/90 hover:to-tropical-blue/90 disabled:opacity-50"
              >
                <span className="hidden sm:inline">Check Availability</span>
                <span className="sm:hidden">Check</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
