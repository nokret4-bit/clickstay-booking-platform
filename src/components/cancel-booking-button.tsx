"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface CancelBookingButtonProps {
  bookingId: string;
  bookingCode: string;
  status: string;
}

export function CancelBookingButton({ bookingId, bookingCode, status }: CancelBookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Don't show cancel button for already cancelled or completed bookings
  if (status === "CANCELLED" || status === "COMPLETED") {
    return null;
  }

  const handleCancel = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Cancelled by customer via booking checker",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Booking Cancelled",
          description: `Booking ${bookingCode} has been successfully cancelled.`,
        });
        router.refresh();
      } else {
        toast({
          title: "Cancellation Failed",
          description: data.error || "Failed to cancel booking. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant="destructive"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Cancel Booking
      </Button>
    );
  }

  return (
    <div className="space-y-3 p-4 border border-destructive rounded-lg bg-destructive/10">
      <p className="text-sm font-medium">Are you sure you want to cancel this booking?</p>
      <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={loading}
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cancelling...
            </>
          ) : (
            "Yes, Cancel Booking"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          size="sm"
        >
          No, Keep Booking
        </Button>
      </div>
    </div>
  );
}
