"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function BookingChecker() {
  const [bookingCode, setBookingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingCode.trim()) {
      setError("Please enter a booking ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/lookup?code=${encodeURIComponent(bookingCode.trim())}`);
      const data = await response.json();

      if (response.ok && data.booking) {
        // Redirect to booking details page
        router.push(`/booking/${bookingCode.trim()}`);
      } else {
        setError(data.error || "Booking not found. Please check your booking ID.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Booking Checker
        </CardTitle>
        <CardDescription>
          Enter your Booking ID to view details or cancel your reservation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter your Booking ID (e.g., BK-ABC123)"
              value={bookingCode}
              onChange={(e) => {
                setBookingCode(e.target.value);
                setError("");
              }}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check
                </>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Your Booking ID was sent to your email after completing your reservation.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
