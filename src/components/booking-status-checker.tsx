"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookingStatus, PaymentStatus } from "@prisma/client";

interface BookingStatusCheckerProps {
  bookingId: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus | null;
}

/**
 * Client component that checks payment status when user returns from payment
 * This serves as a fallback in case webhooks are delayed or fail
 */
export function BookingStatusChecker({ 
  bookingId, 
  bookingStatus, 
  paymentStatus 
}: BookingStatusCheckerProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Only check if booking is pending and payment exists
    if (bookingStatus === "PENDING" && paymentStatus === "PENDING") {
      checkPaymentStatus();
    }
  }, [bookingId, bookingStatus, paymentStatus]);

  const checkPaymentStatus = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    console.log("[STATUS-CHECKER] Checking payment status for booking:", bookingId);

    try {
      const response = await fetch("/api/payments/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[STATUS-CHECKER] Payment status:", data);

        // If status changed, refresh the page to show updated data
        if (data.status === "confirmed") {
          console.log("[STATUS-CHECKER] ✅ Payment confirmed! Refreshing page...");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("[STATUS-CHECKER] Error checking payment status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // This component doesn't render anything visible
  return null;
}
