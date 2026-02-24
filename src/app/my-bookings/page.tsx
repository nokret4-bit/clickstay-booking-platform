"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, Phone, MapPin, AlertCircle, CheckCircle, XCircle, Star } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  startDate: string;
  endDate: string;
  guests: number;
  totalAmount: string;
  status: string;
  facility: {
    name: string;
    kind: string;
  };
  createdAt: string;
  checkedOutAt: string | null;
  hasReview: boolean;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
    status: string;
  };
}

export default function MyBookingsPage() {
  const [searchType, setSearchType] = useState<"code" | "email">("code");
  const [searchValue, setSearchValue] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError("Please enter a booking code or email");
      return;
    }

    setIsLoading(true);
    setError("");
    setBooking(null);

    try {
      // First, trigger auto-checkout for any past bookings
      await fetch("/api/bookings/auto-checkout", { method: "POST" }).catch(() => {
        // Silently fail if auto-checkout fails, don't block the search
      });

      const params = new URLSearchParams();
      if (searchType === "code") {
        params.append("code", searchValue);
      } else {
        params.append("email", searchValue);
      }

      const response = await fetch(`/api/bookings/search?${params}`);
      
      if (!response.ok) {
        throw new Error("Booking not found");
      }

      const data = await response.json();
      setBooking(data);
    } catch {
      setError("Booking not found. Please check your booking code or email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfCheckIn = async () => {
    if (!booking) return;

    if (!confirm("Are you ready to check in? This will mark your arrival at the facility.")) {
      return;
    }

    setCheckingIn(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/self-checkin`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Successfully checked in! Enjoy your stay!");
        setBooking({ ...booking, status: "CHECKED_IN" });
      } else {
        throw new Error(data.error || "Failed to check in");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to check in. Please contact support.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Booking cancelled successfully!");
        setBooking({ ...booking, status: "CANCELLED" });
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch {
      alert("Failed to cancel booking. Please contact support.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "PENDING":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600 bg-green-50";
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            Check your booking status, cancel, or rebook your reservation
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Your Booking</CardTitle>
            <CardDescription>
              Search by booking code or email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={searchType === "code" ? "default" : "outline"}
                  onClick={() => setSearchType("code")}
                >
                  Booking Code
                </Button>
                <Button
                  type="button"
                  variant={searchType === "email" ? "default" : "outline"}
                  onClick={() => setSearchType("email")}
                >
                  Email Address
                </Button>
              </div>

              <div>
                <Label htmlFor="search">
                  {searchType === "code" ? "Booking Code" : "Email Address"}
                </Label>
                <Input
                  id="search"
                  type={searchType === "email" ? "email" : "text"}
                  placeholder={
                    searchType === "code"
                      ? "e.g., BK-ABC123"
                      : "your-email@example.com"
                  }
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Searching..." : "Search Booking"}
              </Button>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {booking && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{booking.facility.name}</CardTitle>
                  <CardDescription className="text-lg">
                    Booking Code: <span className="font-mono font-bold">{booking.code}</span>
                  </CardDescription>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  <span className="font-semibold">{booking.status}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Guest Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Guest Information</h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{booking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{booking.customerEmail}</span>
                  </div>
                  {booking.customerPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{booking.customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Booking Details</h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Check-in: {new Date(booking.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>
                      Check-out: {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="font-semibold">{booking.guests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">
                      ₱{parseFloat(booking.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {booking.status === "CONFIRMED" && (
                <div className="space-y-3 pt-4 border-t">
                  <Button
                    onClick={handleSelfCheckIn}
                    disabled={checkingIn}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {checkingIn ? "Checking In..." : "Check In Now"}
                  </Button>
                  <div className="flex gap-3">
                    <Link href="/browse" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Rebook
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleCancelBooking}
                    >
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              )}

              {/* Review Section for Checked Out Bookings */}
              {(booking.status === "CHECKED_OUT" || booking.status === "COMPLETED") && (
                <div className="pt-4 border-t">
                  {!booking.hasReview ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>⏰ Share Your Experience!</strong>
                        </p>
                        <p className="text-sm text-blue-700">
                          You have 24 hours after checkout to write a review. Your feedback helps other guests make informed decisions.
                        </p>
                      </div>
                      <Link href={`/review/${booking.id}`} className="block">
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          <Star className="h-4 w-4 mr-2 fill-white" />
                          Write a Review Now
                        </Button>
                      </Link>
                    </div>
                  ) : booking.review ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="font-semibold text-green-800">Your Review</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= booking.review!.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 font-bold text-gray-700">
                              {booking.review.rating}/5
                            </span>
                          </div>
                        </div>
                        
                        {booking.review.comment && (
                          <div className="mt-3 p-3 bg-white rounded-md border border-green-100">
                            <p className="text-sm text-gray-700 italic">
                              &quot;{booking.review.comment}&quot;
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            Submitted on {new Date(booking.review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            booking.review.status === "APPROVED" 
                              ? "bg-green-100 text-green-700"
                              : booking.review.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {booking.review.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <p className="font-semibold">Thank you for your review!</p>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Your feedback has been submitted and is pending moderation.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {booking.status === "PENDING" && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                  <p className="font-semibold">Payment Pending</p>
                  <p className="text-sm">
                    Please complete your payment to confirm this booking.
                  </p>
                </div>
              )}

              {booking.status === "CANCELLED" && (
                <div className="p-4 bg-red-50 text-red-800 rounded-md">
                  <p className="font-semibold">Booking Cancelled</p>
                  <p className="text-sm">
                    This booking has been cancelled. You can make a new booking anytime.
                  </p>
                  <Link href="/browse">
                    <Button variant="outline" className="mt-3">
                      Book Again
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
