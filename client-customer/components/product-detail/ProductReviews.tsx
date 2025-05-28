'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { MessageSquare, Star, ThumbsUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaService } from '@/lib/services/api/mediaService';

// Review interface
interface Review {
  _id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count?: number;
  images?: string[];
}

// Rating breakdown interface
interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  total: number;
  average: number;
}

interface ProductReviewsProps {
  reviews: Review[];
  ratingBreakdown?: RatingBreakdown | null;
  loading?: boolean;
  onSubmitReview?: (review: { rating: number; comment: string }) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ProductReviews({ 
  reviews, 
  ratingBreakdown, 
  loading,
  onSubmitReview 
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const handleSubmitReview = () => {
    if (newReview.comment.trim() && onSubmitReview) {
      onSubmitReview(newReview);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    }
  };

  return (
    <div className="mt-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <MessageSquare className="mr-3 h-6 w-6 text-blue-600" />
          Customer Reviews
        </h2>
        {ratingBreakdown && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{ratingBreakdown.average.toFixed(1)} out of 5 stars</span>
            <span>•</span>
            <span>{ratingBreakdown.total} reviews</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Rating Breakdown */}
          {ratingBreakdown && (
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${(ratingBreakdown[rating as keyof typeof ratingBreakdown] / ratingBreakdown.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{ratingBreakdown[rating as keyof typeof ratingBreakdown]}</span>
                    </div>
                  ))}
                </div>

                {/* Write Review Button */}
                {onSubmitReview && (
                  <Button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Write a Review
                  </Button>
                )}

                {/* Review Form */}
                {showReviewForm && onSubmitReview && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 cursor-pointer transition-colors ${
                              star <= newReview.rating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Your Review</label>
                      <textarea
                        className="w-full p-3 border rounded-md resize-none"
                        rows={4}
                        placeholder="Share your experience with this product..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitReview} size="sm">
                        Submit Review
                      </Button>
                      <Button 
                        onClick={() => setShowReviewForm(false)} 
                        variant="outline" 
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="bg-white border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{review.user_name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {review.comment}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.images.map((img, index) => (
                          <div key={index} className="w-16 h-16 rounded border overflow-hidden">
                            <NextImage
                              src={mediaService.getMediaUrl(img)}
                              alt={`Review image ${index + 1}`}
                              width={64}
                              height={64}
                              objectFit="cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful_count || 0})
                      </button>
                      <span>•</span>
                      <span>Verified Purchase</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h3>
                  <p>Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}