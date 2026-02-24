import { z } from "zod";

// Enhanced review validation with mandatory comment for low ratings
export const CreateReviewSchema = z.object({
  facilityId: z.string().min(1, "Facility ID is required"),
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
  photos: z.array(z.string().url()).max(5, "Maximum 5 photos allowed").optional(),
}).refine(
  (data) => {
    // Mandatory comment for ratings <= 2 stars
    if (data.rating <= 2 && (!data.comment || data.comment.trim().length < 10)) {
      return false;
    }
    return true;
  },
  {
    message: "Please provide a detailed comment (at least 10 characters) for ratings of 2 stars or below",
    path: ["comment"],
  }
);

// Review helpfulness vote schema
export const ReviewHelpfulVoteSchema = z.object({
  reviewId: z.string(),
  helpful: z.boolean(),
  sessionId: z.string().optional(),
});

// Management response schema
export const ManagementResponseSchema = z.object({
  reviewId: z.string(),
  responseText: z.string().min(10, "Response must be at least 10 characters"),
});

// Spam detection
export function isSpamContent(text: string): boolean {
  if (!text) return false;
  
  const SPAM_INDICATORS = {
    maxConsecutiveChars: 5,
    maxCapitalRatio: 0.7,
    minWordLength: 3,
    bannedWords: ['spam', 'fake', 'bot', 'scam', 'click here', 'buy now'],
    maxLinks: 0,
  };
  
  // Check for excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > SPAM_INDICATORS.maxCapitalRatio && text.length > 10) {
    return true;
  }
  
  // Check for links
  if (/(http|www\.|\.com|\.net|\.org)/i.test(text)) {
    return true;
  }
  
  // Check for banned words
  const lowerText = text.toLowerCase();
  if (SPAM_INDICATORS.bannedWords.some(word => lowerText.includes(word))) {
    return true;
  }
  
  // Check for excessive repeated characters
  const repeatedChars = /(.)\1{5,}/g;
  if (repeatedChars.test(text)) {
    return true;
  }
  
  return false;
}

// Calculate sentiment score (-1 to 1)
export function calculateSentimentScore(rating: number, comment?: string): number {
  // Basic sentiment based on rating
  let score = (rating - 3) / 2; // Maps 1-5 to -1 to 1
  
  if (comment) {
    const positiveWords = ['excellent', 'amazing', 'wonderful', 'great', 'fantastic', 'beautiful', 'clean', 'friendly', 'helpful', 'recommend'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'dirty', 'rude', 'bad', 'worst', 'disappointing', 'poor', 'unacceptable'];
    
    const lowerComment = comment.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerComment.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerComment.includes(word)).length;
    
    // Adjust score based on word sentiment
    const wordSentiment = (positiveCount - negativeCount) * 0.1;
    score = Math.max(-1, Math.min(1, score + wordSentiment));
  }
  
  return score;
}

// Calculate review quality score (0-1)
export function calculateQualityScore(review: {
  comment?: string | null;
  photos?: string[];
  helpfulCount?: number;
}): number {
  let score = 0;
  
  // Has comment (30 points)
  if (review.comment && review.comment.length > 0) {
    score += 30;
    
    // Word count bonus (up to 20 points)
    const wordCount = review.comment.split(/\s+/).length;
    score += Math.min(20, wordCount);
  }
  
  // Has photos (25 points)
  if (review.photos && review.photos.length > 0) {
    score += 25;
  }
  
  // Helpful votes (up to 25 points)
  if (review.helpfulCount && review.helpfulCount > 0) {
    score += Math.min(25, review.helpfulCount * 5);
  }
  
  return score / 100; // Normalize to 0-1
}

// Rate limiting check
export interface RateLimitConfig {
  maxReviewsPerDay: number;
  maxReviewsPerIP: number;
  cooldownPeriod: number; // milliseconds
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxReviewsPerDay: 5,
  maxReviewsPerIP: 3,
  cooldownPeriod: 3600000, // 1 hour
};

// Validate review eligibility
export interface ReviewEligibility {
  canReview: boolean;
  reason?: string;
  daysRemaining?: number;
}

export function checkReviewEligibility(booking: {
  status: string;
  checkedOutAt: Date | null;
  reviews: any[];
}): ReviewEligibility {
  // Must be completed
  if (booking.status !== 'COMPLETED') {
    return {
      canReview: false,
      reason: 'Booking must be completed before leaving a review',
    };
  }
  
  // Must have checked out
  if (!booking.checkedOutAt) {
    return {
      canReview: false,
      reason: 'You must check out before leaving a review',
    };
  }
  
  // Already reviewed
  if (booking.reviews.length > 0) {
    return {
      canReview: false,
      reason: 'You have already reviewed this booking',
    };
  }
  
  // Must be within 90 days of checkout
  const daysSinceCheckout = Math.floor(
    (Date.now() - booking.checkedOutAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceCheckout > 90) {
    return {
      canReview: false,
      reason: 'Review period has expired (90 days after checkout)',
    };
  }
  
  return {
    canReview: true,
    daysRemaining: 90 - daysSinceCheckout,
  };
}

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type ReviewHelpfulVoteInput = z.infer<typeof ReviewHelpfulVoteSchema>;
export type ManagementResponseInput = z.infer<typeof ManagementResponseSchema>;
