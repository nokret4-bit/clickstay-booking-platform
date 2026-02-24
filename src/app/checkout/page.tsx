"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NavbarClient } from "@/components/navbar-client";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Calendar, Users, MapPin, Clock, Shield, CheckCircle } from "lucide-react";
import { DatePickerWithAvailability } from "@/components/date-picker-with-availability";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const unitId = searchParams.get("unitId");
  const startDate = searchParams.get("from") || "";
  const endDate = searchParams.get("to") || "";
  const isLocked = searchParams.get("locked") === "true";
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentType, setPaymentType] = useState<"FULL" | "PARTIAL">("FULL");
  const [quote, setQuote] = useState<{ totalAmount: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [datesAvailable, setDatesAvailable] = useState(true);
  const [facility, setFacility] = useState<any>(null);
  const [lockInfo, setLockInfo] = useState<any>(null);

  // Calculate deposit amount (50% of total)
  const depositAmount = quote ? quote.totalAmount * 0.5 : 0;
  const nightsCount = startDate && endDate ? 
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Fetch facility details
  useEffect(() => {
    const fetchFacility = async () => {
      if (!unitId) return;
      
      try {
        const response = await fetch(`/api/facilities/${unitId}`);
        if (response.ok) {
          const data = await response.json();
          setFacility(data);
        }
      } catch (error) {
        console.error('Failed to fetch facility:', error);
      }
    };

    fetchFacility();
  }, [unitId]);

  // Check lock status
  useEffect(() => {
    const checkLockStatus = async () => {
      if (!isLocked || !unitId || !startDate || !endDate) return;
      
      try {
        const response = await fetch(`/api/bookings/lock/status?facilityId=${unitId}&startDate=${startDate}&endDate=${endDate}`);
        if (response.ok) {
          const data = await response.json();
          setLockInfo(data);
        }
      } catch (error) {
        console.error('Failed to check lock status:', error);
      }
    };

    checkLockStatus();
    
    // Check lock status every 30 seconds
    const interval = setInterval(checkLockStatus, 30000);
    return () => clearInterval(interval);
  }, [isLocked, unitId, startDate, endDate]);

  const handleGetQuote = async () => {
    if (!unitId || !startDate || !endDate) {
      toast({
        title: "Missing information",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    // Don't fetch quote if dates are unavailable
    if (!datesAvailable) {
      setQuote(null);
      return;
    }

    setQuoteLoading(true);
    try {
      const response = await fetch("/api/bookings/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get quote");
      }

      const data = await response.json();
      setQuote(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get quote",
        variant: "destructive",
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) {
      toast({
        title: "Get a quote first",
        description: "Please check availability and pricing before booking",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create booking
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          customerName,
          customerEmail,
          customerPhone,
          specialRequests,
          paymentType,
          depositAmount: paymentType === "PARTIAL" ? depositAmount : null,
        }),
      });

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const booking = await bookingResponse.json();

      // Create payment
      const paymentResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          returnUrl: `${window.location.origin}/booking/${booking.code}`,
        }),
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.error || error.message || "Failed to create payment");
        } catch (parseError) {
          throw new Error(`Payment failed: ${errorText || paymentResponse.statusText}`);
        }
      }

      const payment = await paymentResponse.json();

      // Redirect to payment
      if (payment.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
      } else {
        router.push(`/booking/${booking.code}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      handleGetQuote();
    }
  }, [startDate, endDate, datesAvailable]);

  if (!unitId) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavbarClient />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Request</CardTitle>
              <CardDescription>No facility selected for booking</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavbarClient />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold text-white">Complete Your Booking</h1>
            
            {isLocked && (
              <div className="ml-auto flex items-center gap-2 text-green-600">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Facility Reserved</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Guest Information</CardTitle>
                    <CardDescription>
                      Please provide your details for the booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email *</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          required
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+63 912 345 6789"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                      <Input
                        id="specialRequests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requirements or preferences"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>
                      Choose your payment preference
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quoteLoading && (
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <div className="flex justify-center items-center">
                          <span className="text-muted-foreground">Calculating pricing...</span>
                        </div>
                      </div>
                    )}

                    {!quoteLoading && quote && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Payment Type</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setPaymentType("FULL")}
                              className={`p-4 border-2 rounded-lg text-left transition-all ${
                                paymentType === "FULL"
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="font-semibold mb-1">Full Payment</div>
                              <div className="text-2xl font-bold text-primary">
                                {formatCurrency(quote.totalAmount, quote.currency)}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Pay the entire amount now
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentType("PARTIAL")}
                              className={`p-4 border-2 rounded-lg text-left transition-all ${
                                paymentType === "PARTIAL"
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="font-semibold mb-1">Deposit (50%)</div>
                              <div className="text-2xl font-bold text-primary">
                                {formatCurrency(depositAmount, quote.currency)}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Reserve now, pay rest later
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                          <div className="flex gap-2">
                            <span className="text-amber-600 font-semibold flex-shrink-0">⚠️</span>
                            <div className="text-sm text-amber-800">
                              <p className="font-semibold mb-1">No Cancellation Policy</p>
                              <p>All bookings are final. No refunds will be issued for cancellations or no-shows. Please ensure your booking details are correct before proceeding.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Facility Summary */}
                {facility && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Booking Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{facility.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{facility.kind}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Check-in</div>
                            <div className="text-muted-foreground">{formatDate(startDate)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Check-out</div>
                            <div className="text-muted-foreground">{formatDate(endDate)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Duration</div>
                            <div className="text-muted-foreground">{nightsCount} {nightsCount === 1 ? 'night' : 'nights'}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Capacity</div>
                            <div className="text-muted-foreground">Up to {facility.capacity} guests</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Location</div>
                            <div className="text-muted-foreground">Manuel Resort</div>
                          </div>
                        </div>
                      </div>

                      {quote && (
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Total Amount:</span>
                            <span className="text-2xl font-bold text-primary">
                              {formatCurrency(quote.totalAmount, quote.currency)}
                            </span>
                          </div>
                          {paymentType === "PARTIAL" && (
                            <div className="text-sm text-muted-foreground">
                              Due now: {formatCurrency(depositAmount, quote.currency)}
                            </div>
                          )}
                        </div>
                      )}

                      {isLocked && lockInfo && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700 text-sm">
                            <Shield className="h-4 w-4" />
                            <span className="font-medium">Facility Reserved</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Lock expires: {new Date(lockInfo.lockedUntil).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Security Notice */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Secure Booking Process</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Your facility is temporarily reserved</li>
                          <li>• Secure payment via PayMongo</li>
                          <li>• Instant confirmation via email</li>
                          <li>• 24/7 customer support</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Proceed to Payment Button */}
                <Button 
                  type="submit"
                  form="checkout-form"
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold" 
                  disabled={loading || !quote || !customerName || !customerEmail}
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <NavbarClient />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Loading...</h1>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
