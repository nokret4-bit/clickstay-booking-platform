"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, XCircle, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface CancelRebookDialogProps {
  bookingId: string;
  bookingCode: string;
  customerEmail: string;
  facilityId: string;
  facilityName: string;
  status: string;
}

export function CancelRebookDialog({
  bookingCode,
  customerEmail,
  facilityId,
  facilityName,
  status,
}: CancelRebookDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<"cancel" | "rebook" | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Don't show for already cancelled or completed bookings
  if (status === "CANCELLED" || status === "COMPLETED") {
    return null;
  }

  const handleCancel = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/bookings/cancel-public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingCode,
          customerEmail,
          reason: reason || "Cancelled by customer",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Booking Cancelled",
          description: `Booking ${bookingCode} has been successfully cancelled.`,
        });
        setOpen(false);
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
    }
  };

  const handleRebook = async () => {
    setLoading(true);

    try {
      // First cancel the current booking
      const response = await fetch("/api/bookings/cancel-public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingCode,
          customerEmail,
          reason: reason || "Cancelled for rebooking",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Redirecting to Rebooking",
          description: "Your booking has been cancelled. Redirecting to select new dates...",
        });
        setOpen(false);
        // Redirect to checkout with the same facility
        setTimeout(() => {
          router.push(`/checkout?unitId=${facilityId}`);
        }, 1000);
      } else {
        toast({
          title: "Rebooking Failed",
          description: data.error || "Failed to process rebooking. Please try again.",
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
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setAction("rebook");
            setOpen(true);
          }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Rebook
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            setAction("cancel");
            setOpen(true);
          }}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Booking
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {action === "rebook" ? "Rebook Facility" : "Cancel Booking"}
          </DialogTitle>
          <DialogDescription>
            {action === "rebook"
              ? `You're about to cancel your current booking for ${facilityName} and select new dates. This action cannot be undone.`
              : `Are you sure you want to cancel your booking for ${facilityName}? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for {action === "rebook" ? "rebooking" : "cancellation"} (Optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Let us know why..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Due to our no-cancellation policy, refunds may not be
              available. Please contact support if you have questions.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Keep Booking
          </Button>
          <Button
            variant={action === "rebook" ? "default" : "destructive"}
            onClick={action === "rebook" ? handleRebook : handleCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : action === "rebook" ? (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Proceed to Rebook
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Confirm Cancellation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}
