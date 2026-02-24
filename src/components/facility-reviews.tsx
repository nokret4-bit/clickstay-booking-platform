"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  status: string;
  createdAt: string;
  booking: {
    customerName: string;
    startDate: string;
    endDate: string;
  };
  reviewer?: {
    name: string;
  };
}

interface FacilityReviewsProps {
  facilityId: string;
  canReview?: boolean;
  bookingId?: string;
}

export function FacilityReviews({ facilityId, canReview = false, bookingId }: FacilityReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [distribution, setDistribution] = useState<Array<{ rating: number; count: number }>>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [facilityId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?facilityId=${facilityId}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setDistribution(data.distribution);
        
        // Calculate average rating from distribution
        const total = data.distribution.reduce((sum: number, item: any) => sum + (item.rating * item.count), 0);
        const count = data.distribution.reduce((sum: number, item: any) => sum + item.count, 0);
        setAverageRating(count > 0 ? total / count : 0);
        setTotalReviews(count);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!bookingId) {
      toast({
        title: "Error",
        description: "No booking found for review",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          bookingId,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Review Submitted",
          description: data.message,
        });
        setShowReviewForm(false);
        setNewReview({ rating: 5, comment: "" });
        fetchReviews(); // Refresh reviews
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size = "sm") => {
    const sizeClass = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Guest Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(averageRating), "lg")}
              <div className="text-sm text-muted-foreground mt-2">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = distribution.find(d => d.rating === rating)?.count || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Button */}
      {canReview && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full"
              variant={showReviewForm ? "outline" : "default"}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {showReviewForm ? "Cancel Review" : "Write a Review"}
            </Button>

            {showReviewForm && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label>Rating</Label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          className="w-8 h-8"
                          fill={star <= newReview.rating ? "currentColor" : "none"}
                          className={`w-8 h-8 ${
                            star <= newReview.rating
                              ? "text-yellow-400"
                              : "text-gray-300 hover:text-yellow-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="comment">Your Review (Optional)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Share your experience with this facility..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          {reviews.length > 0 && (
            <CardDescription>
              Showing {Math.min(reviews.length, 5)} of {totalReviews} reviews
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          Anonymous Guest
                        </span>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Guest
                          </Badge>
                        )}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-muted-foreground mb-2">
                      {review.comment}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Stayed {formatDistanceToNow(new Date(review.booking.startDate), { addSuffix: true })}
                  </div>
                </div>
              ))}

              {totalReviews > 5 && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full"
                >
                  {showAllReviews ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show All {totalReviews} Reviews
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
