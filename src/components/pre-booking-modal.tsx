"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";

interface PreBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
}

export function PreBookingModal({ isOpen, onClose }: PreBookingModalProps) {
  const router = useRouter();
  
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [categoryType, setCategoryType] = useState("all");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!checkInDate) {
      newErrors.checkIn = "Check-in date is required";
    } else if (isBefore(startOfDay(new Date(checkInDate)), startOfDay(new Date()))) {
      newErrors.checkIn = "Check-in date cannot be in the past";
    }

    if (!checkOutDate) {
      newErrors.checkOut = "Check-out date is required";
    } else if (checkInDate && isBefore(new Date(checkOutDate), new Date(checkInDate))) {
      newErrors.checkOut = "Check-out date must be after check-in date";
    }

    if (!categoryType) {
      newErrors.category = "Please select a category type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckAvailability = () => {
    if (!validateForm()) {
      return;
    }

    // Map category to facility types
    let types = '';
    if (categoryType === 'room') {
      types = 'ROOM';
    } else if (categoryType === 'cottage') {
      types = 'COTTAGE';
    } else if (categoryType === 'function') {
      types = 'HALL';
    } else {
      types = 'ROOM,COTTAGE,HALL';
    }

    // Build search parameters matching availability page expectations
    const params = new URLSearchParams({
      from: checkInDate,
      to: checkOutDate,
      types: types,
    });

    // Redirect to availability page
    router.push(`/browse/availability?${params.toString()}`);
    onClose();
  };

  const handleDateChange = (field: "checkIn" | "checkOut", value: string) => {
    // Clear errors
    setErrors(prev => ({ ...prev, [field]: "" }));

    if (field === "checkIn") {
      setCheckInDate(value);
      // Auto-adjust checkout if it's before new check-in
      if (checkOutDate && isBefore(new Date(checkOutDate), new Date(value))) {
        setCheckOutDate("");
      }
    } else {
      setCheckOutDate(value);
    }
  };

  // Button is enabled when all required fields are filled
  const isFormValid = checkInDate && checkOutDate && categoryType;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] bg-white/95 backdrop-blur-sm p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b bg-white/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-tropical-green" />
            Select Your Stay Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-tropical-green/30 scrollbar-track-transparent" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Date Selection */}
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
              {errors.checkIn && (
                <p className="text-xs sm:text-sm text-red-500">{errors.checkIn}</p>
              )}
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
              {errors.checkOut && (
                <p className="text-xs sm:text-sm text-red-500">{errors.checkOut}</p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="flex items-center gap-2 text-sm sm:text-base font-medium">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              What type of facility are you looking for?
            </Label>
            <RadioGroup
              value={categoryType}
              onValueChange={(value) => {
                setCategoryType(value);
                setErrors(prev => ({ ...prev, category: "" }));
              }}
              className="flex flex-col space-y-1.5 sm:space-y-2"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-tropical-green/10 transition-colors active:scale-[0.98]">
                <RadioGroupItem value="room" id="room" className="shrink-0" />
                <Label htmlFor="room" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tropical-blue shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Room</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Comfortable rooms for couples and families</p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-tropical-green/10 transition-colors active:scale-[0.98]">
                <RadioGroupItem value="cottage" id="cottage" className="shrink-0" />
                <Label htmlFor="cottage" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tropical-yellow shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Cottage</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Cozy cottages for a private getaway</p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-tropical-green/10 transition-colors active:scale-[0.98]">
                <RadioGroupItem value="function" id="function" className="shrink-0" />
                <Label htmlFor="function" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tropical-red shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Function Hall</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Spacious halls for events and gatherings</p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-tropical-green/10 transition-colors active:scale-[0.98]">
                <RadioGroupItem value="all" id="all" className="shrink-0" />
                <Label htmlFor="all" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tropical-green shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Show All</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Browse all available facilities</p>
                </Label>
              </div>
            </RadioGroup>
            {errors.category && (
              <p className="text-xs sm:text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Selection Summary */}
          {checkInDate && checkOutDate && categoryType && (
            <div className="bg-tropical-green/10 rounded-lg p-3 sm:p-4">
              <h4 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2">Your Selection:</h4>
              <div className="text-xs sm:text-sm space-y-1">
                <p className="break-words">📅 {format(new Date(checkInDate), "MMM dd, yyyy")} - {format(new Date(checkOutDate), "MMM dd, yyyy")}</p>
                <p>🏠 {categoryType === "room" ? "Rooms only" : categoryType === "cottage" ? "Cottages only" : categoryType === "function" ? "Function halls only" : "All facilities"}</p>
              </div>
            </div>
          )}

        </div>
        
        {/* Action Buttons - Fixed Footer */}
        <div className="bg-white/95 backdrop-blur-sm border-t px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl">
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckAvailability}
              disabled={!isFormValid}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base bg-gradient-to-r from-tropical-green to-tropical-blue hover:from-tropical-green/90 hover:to-tropical-blue/90 disabled:opacity-50"
            >
              <span className="hidden sm:inline">Check Availability</span>
              <span className="sm:hidden">Check</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
