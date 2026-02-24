"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Star, MessageSquare, Trash2, Search, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  status: string;
  createdAt: string;
  moderatedAt?: string;
  moderatedBy?: string;
  facility: {
    id: string;
    name: string;
    kind: string;
  };
  booking: {
    id: string;
    code: string;
    customerName: string;
    customerEmail: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    status: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: "20",
      });

      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.pagination.pages);
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerateReview = async (reviewId: string, action: "DELETE") => {
    setModerating(reviewId);
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
        });
        fetchReviews(); // Refresh the list
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to moderate review');
      }
    } catch (error) {
      console.error('Moderate review error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to moderate review",
        variant: "destructive",
      });
    } finally {
      setModerating(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "PENDING":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "HIDDEN":
        return <Badge className="bg-gray-100 text-gray-800">Hidden</Badge>;
      case "DELETED":
        return <Badge className="bg-red-100 text-red-800">Deleted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.facility.name.toLowerCase().includes(query) ||
      review.booking.customerName.toLowerCase().includes(query) ||
      review.booking.customerEmail.toLowerCase().includes(query) ||
      (review.comment && review.comment.toLowerCase().includes(query))
    );
  });

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Review Moderation</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/6" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Management</h1>
          <p className="text-muted-foreground">
            View and manage customer reviews
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="APPROVED">Published</SelectItem>
                  <SelectItem value="DELETED">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchReviews} variant="outline">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No reviews match your search criteria" : "No reviews found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{review.facility.name}</span>
                        <Badge variant="outline" className="capitalize">
                          {review.facility.kind}
                        </Badge>
                        {getStatusBadge(review.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>By {review.reviewer?.name || review.booking.customerName}</span>
                        <span>•</span>
                        <span>{review.booking.customerEmail}</span>
                        <span>•</span>
                        <span>Booking: {review.booking.code}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  {review.comment && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Stay:</span>
                      <div className="text-muted-foreground">
                        {new Date(review.booking.startDate).toLocaleDateString()} - {new Date(review.booking.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>
                      <div className="text-muted-foreground">
                        ₱{review.booking.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Verified:</span>
                      <div className="text-muted-foreground">
                        {review.isVerified ? "Yes" : "No"}
                      </div>
                    </div>
                    {review.moderatedAt && (
                      <div>
                        <span className="font-medium">Moderated:</span>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(review.moderatedAt), { addSuffix: true })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {review.status !== "DELETED" && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleModerateReview(review.id, "DELETE")}
                        disabled={moderating === review.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {moderating === review.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
