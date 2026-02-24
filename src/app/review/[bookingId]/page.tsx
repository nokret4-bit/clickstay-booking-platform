"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Star, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface BookingDetails {
  id: string;
  code: string;
  facilityId: string;
  facilityName: string;
  customerName: string;
  startDate: string;
  endDate: string;
  checkedOutAt: string | null;
  canReview: boolean;
  alreadyReviewed: boolean;
  hoursRemaining: number;
  isExpired: boolean;
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookingId = params.bookingId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/review-eligibility`);
      
      if (!response.ok) {
        throw new Error("Booking not found");
      }

      const data = await response.json();
      setBookingDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    if (rating <= 2 && !comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a comment for ratings of 2 stars or below",
        variant: "destructive",
      });
      return;
    }

    if (!bookingDetails?.facilityId) {
      toast({
        title: "Error",
        description: "Facility information is missing",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: bookingDetails.facilityId,
          bookingId: bookingId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit review");
      }

      toast({
        title: "✅ Review Submitted!",
        description: "Thank you for your feedback. Your review has been published!",
      });

      // Redirect to success page or back to bookings
      setTimeout(() => {
        router.push("/my-bookings");
      }, 2000);
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-tropical-green" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                Booking Not Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {error || "We couldn't find this booking. Please check your booking ID and try again."}
              </p>
              <Button onClick={() => router.push("/account/bookings")} className="w-full">
                Go to My Bookings
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (bookingDetails.alreadyReviewed) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Already Reviewed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You have already submitted a review for this booking. Thank you for your feedback!
              </p>
              <Button onClick={() => router.push("/account/bookings")} className="w-full">
                Go to My Bookings
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!bookingDetails.canReview) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                Review Window Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The review period for this booking has expired. Reviews must be submitted within 24 hours after checkout.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Booking:</strong> {bookingDetails.code}
                  <br />
                  <strong>Facility:</strong> {bookingDetails.facilityName}
                  <br />
                  <strong>Checked Out:</strong>{" "}
                  {bookingDetails.checkedOutAt
                    ? new Date(bookingDetails.checkedOutAt).toLocaleString()
                    : "Not yet"}
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                If you have feedback about your stay, please contact our customer service team directly.
              </p>
              <Button onClick={() => router.push("/my-bookings")} className="w-full">
                Go to My Bookings
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Rate Your Stay</CardTitle>
              <CardDescription>
                Share your experience at {bookingDetails.facilityName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Booking ID:</strong> {bookingDetails.code}
                  <br />
                  <strong>Facility:</strong> {bookingDetails.facilityName}
                  <br />
                  <strong>Stay Dates:</strong>{" "}
                  {new Date(bookingDetails.startDate).toLocaleDateString()} -{" "}
                  {new Date(bookingDetails.endDate).toLocaleDateString()}
                </p>
              </div>

              {/* Star Rating */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  How would you rate your experience? *
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-lg font-semibold">
                      {rating} {rating === 1 ? "Star" : "Stars"}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="comment" className="text-base font-semibold mb-3 block">
                  Your Review {rating <= 2 && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Tell us about your experience... (optional for ratings above 2 stars)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {rating <= 2
                    ? "A comment is required for ratings of 2 stars or below."
                    : "Your feedback helps other guests make informed decisions."}
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/account/bookings")}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || rating === 0}
                  className="flex-1 bg-tropical-green hover:bg-tropical-green/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>

              {/* Time Remaining Notice */}
              {bookingDetails.hoursRemaining > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⏰ Time Remaining:</strong> You have approximately{" "}
                    <strong>{Math.ceil(bookingDetails.hoursRemaining)} hours</strong> left to submit your review.
                    Reviews must be submitted within 24 hours after checkout.
                  </p>
                </div>
              )}

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your review will be published immediately after submission.
                  All reviews are verified from actual bookings to maintain authenticity.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
