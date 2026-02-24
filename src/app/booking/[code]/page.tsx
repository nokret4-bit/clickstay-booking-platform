import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CancelRebookDialog } from "@/components/cancel-rebook-dialog";
import { BookingQRCode } from "@/components/booking-qrcode";
import { BookingStatusChecker } from "@/components/booking-status-checker";
import Link from "next/link";
import { Star, CheckCircle } from "lucide-react";

interface BookingPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { code } = await params;
  const booking = await prisma.booking.findUnique({
    where: { code },
    include: {
      facility: true,
      payment: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const hasReview = booking.reviews && booking.reviews.length > 0;
  const review = hasReview ? booking.reviews[0] : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Auto-check payment status when user returns from payment */}
      <BookingStatusChecker 
        bookingId={booking.id}
        bookingStatus={booking.status}
        paymentStatus={booking.payment?.status || null}
      />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold">Booking Details</h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-muted-foreground">Booking Code: {booking.code}</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Facility Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Facility:</span>
                  <span className="font-semibold">{booking.facility.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{booking.facility.kind}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span>{formatDateTime(booking.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span>{formatDateTime(booking.endDate)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{booking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{booking.customerEmail}</span>
                </div>
                {booking.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{booking.customerPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(Number(booking.totalAmount))}</span>
                </div>
              </CardContent>
            </Card>

            {/* QR Code for Check-in */}
            {booking.status === "CONFIRMED" && (
              <BookingQRCode bookingId={booking.id} bookingCode={booking.code} />
            )}

            {booking.status === "PENDING" && (
              <Card className="border-amber-500 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-900">⏳ Waiting for Payment Confirmation</CardTitle>
                  <CardDescription className="text-amber-800">
                    Please wait for your QR code to be generated. Once your payment is confirmed, your booking will be updated and a confirmation email with your QR code will be sent to <strong>{booking.customerEmail}</strong>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>What happens next:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Your payment is being processed</li>
                      <li>You'll receive an email confirmation</li>
                      <li>Your QR code will be available on this page</li>
                      <li>Refresh this page to check for updates</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancel or Rebook Section */}
            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle>Manage Your Booking</CardTitle>
                  <CardDescription>
                    Need to change your dates or cancel? You can rebook or cancel your reservation here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CancelRebookDialog
                    bookingId={booking.id}
                    bookingCode={booking.code}
                    customerEmail={booking.customerEmail}
                    facilityId={booking.facilityId}
                    facilityName={booking.facility.name}
                    status={booking.status}
                  />
                </CardContent>
              </Card>
            )}

            {/* Review Section for Checked Out Bookings */}
            {(booking.status === "CHECKED_OUT" || booking.status === "COMPLETED") && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasReview ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>⏰ Share Your Experience!</strong>
                        </p>
                        <p className="text-sm text-blue-700">
                          You have 24 hours after checkout to write a review. Your feedback helps other guests make informed decisions.
                        </p>
                      </div>
                      <Link href={`/review/${booking.id}`}>
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          <Star className="h-4 w-4 mr-2 fill-white" />
                          Write a Review Now
                        </Button>
                      </Link>
                    </div>
                  ) : review ? (
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
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 font-bold text-gray-700">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <div className="mt-3 p-3 bg-white rounded-md border border-green-100">
                            <p className="text-sm text-gray-700 italic">
                              &quot;{review.comment}&quot;
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            Submitted on {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            review.status === "APPROVED" 
                              ? "bg-green-100 text-green-700"
                              : review.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {review.status}
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
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Link href="/browse" className="flex-1">
                <Button variant="outline" className="w-full">
                  Browse More Facilities
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
