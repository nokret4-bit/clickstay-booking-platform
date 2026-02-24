"use client";

import { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ScanLine,
  Calendar,
  User,
  Home,
  CreditCard,
  Clock,
  AlertCircle,
  Camera,
  X
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface BookingInfo {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  facilityUnit: string;
  facilityType: string;
  startDate: string;
  endDate: string;
  status: string;
  checkedInAt?: string;
  totalAmount: number;
  totalPaid: number;
  currency: string;
  canCheckIn: boolean;
  isPaid: boolean;
  hasIncompletePayment: boolean;
  paymentType: string;
}

export function CashierScanner() {
  const [bookingCode, setBookingCode] = useState("");
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkOutSuccess, setCheckOutSuccess] = useState(false);
  const [checkInMode, setCheckInMode] = useState<"manual" | "qr">("manual");
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [startingCamera, setStartingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleVerifyBooking = async () => {
    if (!bookingCode.trim()) {
      setError("Please enter a booking code");
      return;
    }

    setLoading(true);
    setError(null);
    setBookingInfo(null);
    setCheckInSuccess(false);

    try {
      const response = await fetch(`/api/cashier/verify?code=${encodeURIComponent(bookingCode)}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to verify booking");
      }

      const data = await response.json();
      setBookingInfo(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify booking");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!bookingInfo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cashier/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          bookingCode: bookingInfo.code,
          bookingId: bookingInfo.id 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check in");
      }

      const data = await response.json();
      setCheckInSuccess(true);
      
      // Update booking info with check-in time
      setBookingInfo({
        ...bookingInfo,
        checkedInAt: data.booking.checkedInAt,
        status: data.booking.status,
        canCheckIn: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in guest");
    } finally {
      setLoading(false);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data) {
      // QR code detected!
      stopScanner();
      
      // Try to parse QR code data (could be JSON or plain text)
      let bookingCode = code.data;
      try {
        const qrData = JSON.parse(code.data);
        // If it's JSON, extract the booking code
        if (qrData.code) {
          bookingCode = qrData.code;
          console.log("Parsed QR code JSON:", qrData);
        }
      } catch {
        // Not JSON, use as-is (plain booking code)
        console.log("QR code is plain text:", code.data);
      }
      
      setBookingCode(bookingCode);
      // Automatically verify the booking
      verifyBookingByCode(bookingCode);
    }
  };

  const verifyBookingByCode = async (code: string) => {
    setLoading(true);
    setError(null);
    setBookingInfo(null);
    setCheckInSuccess(false);

    try {
      const response = await fetch(`/api/cashier/verify?code=${encodeURIComponent(code)}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to verify booking");
      }

      const data = await response.json();
      setBookingInfo(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify booking");
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    console.log("Starting scanner...");
    setStartingCamera(true);
    setCameraError(null);
    
    // Set scanner active first so video element renders
    setScannerActive(true);
  };

  // Initialize camera when scanner becomes active
  useEffect(() => {
    if (!scannerActive || !startingCamera) return;

    const initCamera = async () => {
      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera not supported in this browser");
        }
        
        console.log("Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        
        console.log("Camera access granted", stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          console.log("Scanner activated");
          
          // Start scanning for QR codes
          scanIntervalRef.current = setInterval(scanQRCode, 100);
        } else {
          console.error("Video ref is null");
          throw new Error("Video element not ready");
        }
      } catch (err) {
        console.error("Camera error:", err);
        const errorMessage = err instanceof Error ? err.message : "Unable to access camera";
        setCameraError(`Camera Error: ${errorMessage}. Please check permissions and try again.`);
        setScannerActive(false);
      } finally {
        setStartingCamera(false);
      }
    };

    initCamera();
  }, [scannerActive, startingCamera]);

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScannerActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleScanQR = async () => {
    if (!qrData.trim()) {
      setError("Please paste QR code data");
      return;
    }

    setLoading(true);
    setError(null);
    setBookingInfo(null);
    setCheckInSuccess(false);

    try {
      const response = await fetch("/api/cashier/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process QR code");
      }

      const data = await response.json();
      setCheckInSuccess(true);
      
      // Set booking info from response
      setBookingInfo({
        id: data.booking.id,
        code: data.booking.code,
        customerName: data.booking.customerName,
        customerEmail: data.booking.customerEmail,
        customerPhone: data.booking.customerPhone,
        facilityUnit: data.booking.facilityUnit,
        facilityType: data.booking.facilityType,
        startDate: data.booking.startDate,
        endDate: data.booking.endDate,
        status: data.booking.status,
        checkedInAt: data.booking.checkedInAt,
        totalAmount: data.booking.totalAmount || 0,
        totalPaid: data.booking.totalPaid || 0,
        currency: "PHP",
        canCheckIn: false,
        isPaid: data.booking.isPaid || true,
        hasIncompletePayment: data.booking.hasIncompletePayment || false,
        paymentType: data.booking.paymentType || "FULL",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!bookingInfo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cashier/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingCode: bookingInfo.code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check out");
      }

      const data = await response.json();
      setCheckOutSuccess(true);
      
      // Update booking info with checkout time
      setBookingInfo({
        ...bookingInfo,
        status: data.booking.status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check out guest");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBookingCode("");
    setQrData("");
    setBookingInfo(null);
    setError(null);
    setCheckInSuccess(false);
    setCheckOutSuccess(false);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Method</CardTitle>
          <CardDescription>Choose how to verify the guest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={checkInMode === "manual" ? "default" : "outline"}
              onClick={() => {
                setCheckInMode("manual");
                handleReset();
              }}
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Manual Code Entry
            </Button>
            <Button
              variant={checkInMode === "qr" ? "default" : "outline"}
              onClick={() => {
                setCheckInMode("qr");
                handleReset();
              }}
              className="flex-1"
            >
              <ScanLine className="mr-2 h-4 w-4" />
              QR Code Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Code Entry */}
      {checkInMode === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Booking Code</CardTitle>
            <CardDescription>
              Type the booking code to verify the guest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingCode">Booking Code</Label>
              <div className="flex gap-2">
                <Input
                  id="bookingCode"
                  placeholder="e.g., BK-ABC123"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyBooking()}
                  disabled={loading}
                />
                <Button
                  onClick={handleVerifyBooking}
                  disabled={loading || !bookingCode.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Scan */}
      {checkInMode === "qr" && (
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Use your device camera to scan the booking QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <canvas ref={canvasRef} className="hidden" />

            {!scannerActive ? (
              <div className="space-y-4">
                <Button
                  onClick={startScanner}
                  disabled={startingCamera}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg disabled:opacity-50"
                  size="lg"
                >
                  {startingCamera ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-5 w-5" />
                      Start Camera Scanner
                    </>
                  )}
                </Button>
                
                {cameraError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Camera Error</AlertTitle>
                    <AlertDescription>{cameraError}</AlertDescription>
                  </Alert>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Or paste QR code data manually:</p>
                  <div className="flex gap-2">
                    <Input
                      id="qrData"
                      placeholder="Paste QR code data here..."
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleScanQR()}
                      disabled={loading}
                    />
                    <Button
                      onClick={handleScanQR}
                      disabled={loading || !qrData.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ScanLine className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
                  {/* Video preview - shown when active */}
                  <div className="w-full h-[500px] bg-black relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Dark overlay with transparent center */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-72 h-72 bg-transparent" style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)' }}></div>
                    </div>
                  </div>

                  {/* Scanning frame with corners */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-72 h-72">
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                      
                      {/* Animated scanning line */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan shadow-lg shadow-green-400/50"></div>
                      </div>

                      {/* Pulsing border effect */}
                      <div className="absolute inset-0 border-2 border-green-400/30 rounded-lg animate-pulse"></div>
                    </div>
                  </div>

                  {/* Top instruction banner */}
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 pointer-events-none">
                    <div className="flex items-center justify-center gap-2 text-white">
                      <ScanLine className="h-5 w-5 animate-pulse" />
                      <p className="text-lg font-semibold">Scanning for QR Code...</p>
                    </div>
                  </div>

                  {/* Bottom instruction */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
                    <p className="text-center text-white text-sm font-medium">
                      Position the QR code within the frame
                    </p>
                  </div>

                  {/* Close button */}
                  <Button
                    onClick={stopScanner}
                    variant="destructive"
                    size="sm"
                    className="absolute top-4 right-4 z-10 shadow-lg"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>
                <Alert className="bg-blue-50 border-blue-200">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-900">Scanner Active</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    The scanner is actively looking for QR codes. Hold the booking QR code steady within the green frame for automatic detection.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {checkInSuccess && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Check-in Successful!</AlertTitle>
          <AlertDescription>
            Guest has been successfully checked in.
          </AlertDescription>
        </Alert>
      )}

      {checkOutSuccess && (
        <Alert className="border-blue-500 bg-blue-50 text-blue-900">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertTitle>Check-out Successful!</AlertTitle>
          <AlertDescription>
            Guest has been successfully checked out.
          </AlertDescription>
        </Alert>
      )}

      {/* Booking Information */}
      {bookingInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Booking Information</CardTitle>
                <CardDescription>Code: {bookingInfo.code}</CardDescription>
              </div>
              <div className="flex gap-2">
                {bookingInfo.checkedInAt ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Checked In
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {bookingInfo.status}
                  </Badge>
                )}
                {bookingInfo.isPaid && (
                  <Badge variant="outline" className="border-green-600 text-green-600">
                    <CreditCard className="mr-1 h-3 w-3" />
                    Paid
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Guest Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center">
                <User className="mr-2 h-4 w-4" />
                Guest Information
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{bookingInfo.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{bookingInfo.customerEmail}</p>
                </div>
                {bookingInfo.customerPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{bookingInfo.customerPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Facility Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Facility Information
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Facility</p>
                  <p className="font-medium">{bookingInfo.facilityUnit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{bookingInfo.facilityType}</p>
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Booking Dates
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">{new Date(bookingInfo.startDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">{new Date(bookingInfo.endDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <p className="font-medium">
                    {bookingInfo.paymentType === "PARTIAL" ? (
                      <span className="text-orange-600">Deposit (50%)</span>
                    ) : bookingInfo.paymentType === "FULL" ? (
                      <span className="text-green-600">Full Payment</span>
                    ) : (
                      <span className="text-gray-600">Unknown</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium">₱{(bookingInfo.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="font-medium text-green-600">₱{(bookingInfo.totalPaid || 0).toLocaleString()}</p>
                </div>
                {bookingInfo.hasIncompletePayment && (
                  <div>
                    <p className="text-sm text-muted-foreground">Balance Due</p>
                    <p className="font-medium text-red-600">₱{((bookingInfo.totalAmount || 0) - (bookingInfo.totalPaid || 0)).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {bookingInfo.hasIncompletePayment && (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Incomplete Payment</AlertTitle>
                  <AlertDescription>
                    Guest has only paid ₱{(bookingInfo.totalPaid || 0).toLocaleString()} of ₱{(bookingInfo.totalAmount || 0).toLocaleString()}. 
                    Remaining balance: ₱{((bookingInfo.totalAmount || 0) - (bookingInfo.totalPaid || 0)).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Check-in Status */}
            {bookingInfo.checkedInAt && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Check-in Time
                </h3>
                <div className="pl-6">
                  <p className="font-medium text-green-600">
                    {formatDateTime(new Date(bookingInfo.checkedInAt))}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {/* Check-In Button */}
              <Button
                onClick={handleCheckIn}
                disabled={loading || !bookingInfo.canCheckIn || checkInSuccess || bookingInfo.status === "CHECKED_IN" || bookingInfo.status === "CHECKED_OUT"}
                className="flex-1"
                size="lg"
                variant={bookingInfo.canCheckIn && !checkInSuccess ? "default" : "secondary"}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Check-In Guest
                  </>
                )}
              </Button>

              {/* Check-Out Button */}
              <Button
                onClick={handleCheckOut}
                disabled={loading || bookingInfo.status !== "CHECKED_IN" || checkOutSuccess}
                className="flex-1"
                size="lg"
                variant={bookingInfo.status === "CHECKED_IN" && !checkOutSuccess ? "default" : "secondary"}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Check-Out Guest
                  </>
                )}
              </Button>
            </div>

            {/* Reset Button */}
            <div className="pt-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                Scan Next Guest
              </Button>
            </div>

            {!bookingInfo.canCheckIn && !bookingInfo.checkedInAt && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Cannot Check In</AlertTitle>
                <AlertDescription>
                  This booking cannot be checked in. Status: {bookingInfo.status}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
