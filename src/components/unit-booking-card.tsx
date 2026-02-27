"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Users, Calendar, Loader2 } from "lucide-react";
import { differenceInDays } from "date-fns";
import Link from "next/link";

interface UnitBookingCardProps {
  facilityId: string;
  facilityName: string;
  price: number;
  capacity: number;
  pricingType?: string;
  kind?: string;
  searchParams?: {
    from?: string;
    to?: string;
    types?: string;
  };
}

export function UnitBookingCard({
  facilityId,
  facilityName,
  price,
  capacity,
  pricingType,
  kind,
  searchParams,
}: UnitBookingCardProps) {
  const [isLocking, setIsLocking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const hasSearchDates = searchParams?.from && searchParams?.to;

  // Calculate total price and nights
  let totalPrice = 0;
  let nights = 0;
  const isPerHead = pricingType === 'PER_HEAD' || kind === 'HALL';
  const isPerUse = pricingType === 'PER_USE' || kind === 'COTTAGE';
  
  if (hasSearchDates) {
    const fromDate = new Date(searchParams.from!);
    const toDate = new Date(searchParams.to!);
    nights = differenceInDays(toDate, fromDate);
    const actualNights = nights < 1 ? 1 : nights;
    
    if (isPerHead) {
      // For per-head pricing, price is per person (use capacity as default guest count)
      totalPrice = price * capacity;
    } else if (isPerUse) {
      // For per-use pricing (cottages), flat rate
      totalPrice = price;
    } else {
      // For per-night pricing
      totalPrice = price * actualNights;
    }
    nights = actualNights;
  }

  const handleSelectAndContinue = async () => {
    if (!hasSearchDates) {
      toast({
        title: "Dates Required",
        description: "Please select check-in and check-out dates first.",
        variant: "destructive",
      });
      return;
    }

    setIsLocking(true);

    try {
      // Lock the facility temporarily
      const response = await fetch("/api/bookings/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: facilityId,
          startDate: searchParams.from,
          endDate: searchParams.to,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lock facility");
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Facility Reserved",
          description: "This facility is temporarily reserved for you. You have 15 minutes to complete your booking.",
        });

        // Proceed to checkout after a short delay
        setTimeout(() => {
          const params = new URLSearchParams({
            unitId: facilityId,
            from: searchParams.from!,
            to: searchParams.to!,
            locked: "true",
          });
          router.push(`/checkout?${params.toString()}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Lock error:", error);

      // Check if it's a "facility already locked" error
      const errorMessage = error instanceof Error ? error.message : "Failed to reserve facility. Please try again.";
      const isAlreadyLocked =
        errorMessage.toLowerCase().includes("temporarily reserved") ||
        errorMessage.toLowerCase().includes("already booked");

      toast({
        title: isAlreadyLocked ? "⏰ Facility Unavailable" : "Unable to Reserve",
        description: isAlreadyLocked
          ? "This facility is temporarily reserved by another customer. Please select a different facility or try again in a few minutes."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Book This Facility</CardTitle>
        <CardDescription>
          <span className="text-2xl font-bold text-foreground">
            ₱{Number(price).toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">
              {isPerHead ? " / head" : isPerUse ? " / use" : " / night"}
            </span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span>Up to {capacity} guests</span>
        </div>

        {hasSearchDates && (
          <>
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(searchParams.from!).toLocaleDateString()} -{" "}
                  {new Date(searchParams.to!).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {(isPerUse || isPerHead) ? "Day use" : `${nights} night${nights !== 1 ? "s" : ""}`}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                {isPerHead ? (
                  <span className="text-sm">₱{price.toLocaleString()} × {capacity} guests</span>
                ) : isPerUse ? (
                  <span className="text-sm">₱{price.toLocaleString()} (day use)</span>
                ) : (
                  <span className="text-sm">₱{price.toLocaleString()} × {nights} night{nights !== 1 ? "s" : ""}</span>
                )}
                <span className="text-sm">₱{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>₱{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSelectAndContinue}
              disabled={isLocking}
            >
              {isLocking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reserving...
                </>
              ) : (
                "Select & Continue"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You won&apos;t be charged yet. This facility will be reserved for 15 minutes.
            </p>
          </>
        )}

        {!hasSearchDates && (
          <>
            <Link href={`/browse?unitId=${facilityId}`}>
              <Button className="w-full" size="lg">
                Check Availability
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground text-center">
              Select dates to see pricing and book
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
