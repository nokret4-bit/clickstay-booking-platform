"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Calendar } from "lucide-react";

interface DatePickerWithAvailabilityProps {
  facilityId: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onAvailabilityChange?: (isAvailable: boolean) => void;
}

export function DatePickerWithAvailability({
  facilityId,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onAvailabilityChange,
}: DatePickerWithAvailabilityProps) {
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  // Fetch unavailable dates
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/facilities/${facilityId}/unavailable-dates`
        );
        
        if (response.ok) {
          const data = await response.json();
          setUnavailableDates(data.unavailableDates || []);
        }
      } catch (error) {
        console.error("Failed to fetch unavailable dates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      fetchUnavailableDates();
    }
  }, [facilityId]);

  // Check if selected dates conflict with unavailable dates
  useEffect(() => {
    if (!startDate || !endDate || unavailableDates.length === 0) {
      setConflictMessage(null);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate all dates in the selected range
    const selectedDates: string[] = [];
    const currentDate = new Date(start);
    
    while (currentDate < end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (dateStr) {
        selectedDates.push(dateStr);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check for conflicts
    const conflicts = selectedDates.filter((date) =>
      unavailableDates.includes(date)
    );

    if (conflicts.length > 0) {
      setConflictMessage(
        `The following dates are already booked: ${conflicts
          .slice(0, 3)
          .map((d) => new Date(d + "T00:00:00").toLocaleDateString())
          .join(", ")}${conflicts.length > 3 ? ` and ${conflicts.length - 3} more` : ""}`
      );
      onAvailabilityChange?.(false);
    } else {
      setConflictMessage(null);
      onAvailabilityChange?.(true);
    }
  }, [startDate, endDate, unavailableDates, onAvailabilityChange]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Check-in Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            required
            min={today}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Check-out Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            required
            min={startDate || today}
          />
        </div>
      </div>

      {/* Availability Information */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 animate-pulse" />
          <span>Checking availability...</span>
        </div>
      )}

      {/* Conflict Warning */}
      {conflictMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Dates Not Available
            </p>
            <p className="text-xs text-red-700 mt-1">{conflictMessage}</p>
            <p className="text-xs text-red-600 mt-2">
              Please select different dates to continue with your booking.
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {!loading && startDate && endDate && !conflictMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
          <Calendar className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">
              ✓ Dates Available
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your selected dates are available for booking!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
