"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface DeleteBookingButtonProps {
  bookingId: string;
  bookingCode: string;
}

export function DeleteBookingButton({ bookingId, bookingCode }: DeleteBookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Booking Deleted",
          description: `Booking ${bookingCode} has been voided/deleted successfully.`,
        });
        router.push("/admin/reservations");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete booking.",
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
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Void/Delete
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background p-6 rounded-lg max-w-md w-full space-y-4">
        <h3 className="text-lg font-semibold text-destructive">Void/Delete Booking</h3>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to void/delete booking <strong>{bookingCode}</strong>? 
          This action cannot be undone and will permanently remove the booking record.
        </p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
