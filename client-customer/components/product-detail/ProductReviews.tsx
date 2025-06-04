'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { MessageSquare, Star, ThumbsUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaService } from '@/lib/services/api/mediaService';
import reviewService, { Review, ReviewStatistics } from '@/lib/services/api/reviewService';

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
    skuId: string;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getUserName = (user: any): string => {
    if (typeof user === 'string') return 'Người dùng ẩn danh';
    return user?.user_fullName || 'Người dùng ẩn danh';
};

const getUserAvatar = (user: any): string | undefined => {
    if (typeof user === 'string') return undefined;
    return user?.user_avatar;
};

export default function ProductReviews({ skuId }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Convert ReviewStatistics to RatingBreakdown format
    const ratingBreakdown: RatingBreakdown | null = statistics
        ? {
              5: statistics.ratingBreakdown[5],
              4: statistics.ratingBreakdown[4],
              3: statistics.ratingBreakdown[3],
              2: statistics.ratingBreakdown[2],
              1: statistics.ratingBreakdown[1],
              total: statistics.totalReviews,
              average: statistics.averageRating
          }
        : null;

    useEffect(() => {
        const fetchReviews = async () => {
            if (!skuId) return;

            try {
                setLoading(true);
                setError(null);
                const response = await reviewService.getReviewsBySkuId(skuId);
                setReviews(response.metadata.reviews);
                setStatistics(response.metadata.statistics);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError('Không thể tải đánh giá');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [skuId]);

    if (error) {
        return (
            <div className="mt-16">
                <div className="text-center py-8 text-red-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-16">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <MessageSquare className="mr-3 h-6 w-6 text-blue-600" />
                    Đánh giá của khách hàng
                </h2>
                {ratingBreakdown && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{ratingBreakdown.average.toFixed(1)} trên 5 sao</span>
                        <span>•</span>
                        <span>{ratingBreakdown.total} đánh giá</span>
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
                    {ratingBreakdown && ratingBreakdown.total > 0 && (
                        <div className="lg:col-span-1">
                            <div className="bg-white border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Phân tích đánh giá</h3>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <div key={rating} className="flex items-center gap-2">
                                            <span className="text-sm w-3">{rating}</span>
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full"
                                                    style={{
                                                        width: `${
                                                            ratingBreakdown.total > 0
                                                                ? (ratingBreakdown[
                                                                      rating as keyof typeof ratingBreakdown
                                                                  ] /
                                                                      ratingBreakdown.total) *
                                                                  100
                                                                : 0
                                                        }%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 w-8">
                                                {
                                                    ratingBreakdown[
                                                        rating as keyof typeof ratingBreakdown
                                                    ]
                                                }
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div
                        className={
                            ratingBreakdown && ratingBreakdown.total > 0
                                ? 'lg:col-span-2'
                                : 'lg:col-span-3'
                        }
                    >
                        <div className="space-y-6">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className="bg-white border rounded-lg p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {getUserAvatar(review.user_id) ? (
                                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                                        <NextImage
                                                            src={mediaService.getMediaUrl(
                                                                getUserAvatar(review.user_id)!
                                                            )}
                                                            alt="User avatar"
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-medium text-gray-800">
                                                        {getUserName(review.user_id)}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-4 h-4 ${
                                                                        i < review.review_rating
                                                                            ? 'text-yellow-400 fill-yellow-400'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {formatDate(review.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {review.review_content}
                                        </p>

                                        {review.review_images &&
                                            review.review_images.length > 0 && (
                                                <div className="flex gap-2 mb-4">
                                                    {review.review_images.map((img, index) => (
                                                        <div
                                                            key={index}
                                                            className="w-16 h-16 rounded border overflow-hidden"
                                                        >
                                                            <NextImage
                                                                src={mediaService.getMediaUrl(img)}
                                                                alt={`Review image ${index + 1}`}
                                                                width={64}
                                                                height={64}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>Đánh giá đã được xác minh</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Chưa có đánh giá nào
                                    </h3>
                                    <p>Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
