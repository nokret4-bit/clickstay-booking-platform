"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface BookingQRCodeProps {
  bookingId: string;
  bookingCode: string;
}

export function BookingQRCode({ bookingId, bookingCode }: BookingQRCodeProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQRCode() {
      try {
        setLoading(true);
        // Include booking code for public access authorization
        const response = await fetch(`/api/bookings/${bookingId}/qrcode?code=${encodeURIComponent(bookingCode)}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          console.error("QR code API error:", errorData);
          throw new Error(errorData.details || errorData.error || "Failed to generate QR code");
        }

        const data = await response.json();
        setQrCode(data.qrCode);
      } catch (err) {
        console.error("Error fetching QR code:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load QR code";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchQRCode();
  }, [bookingId, bookingCode]);

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `booking-${bookingCode}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-in QR Code</CardTitle>
        <CardDescription>
          Show this QR code at the facility entrance for quick check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center text-destructive">
            <p>{error}</p>
          </div>
        )}

        {qrCode && !loading && (
          <>
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <img
                src={qrCode}
                alt="Booking QR Code"
                className="w-64 h-64"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Booking Code</p>
              <p className="text-2xl font-bold tracking-wider">{bookingCode}</p>
            </div>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Present this QR code to the cashier upon arrival for verification and check-in
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
