'use client';

import { Star, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { mediaService } from '@/lib/services/api/mediaService';
import { Review } from '@/lib/services/api/reviewService';

interface ReviewDisplayProps {
    review: Review;
    showProductInfo?: boolean;
    productName?: string;
    productThumb?: string;
    productVariations?: Array<{
        key: string;
        value: string;
    }>;
}

export default function ReviewDisplay({
    review,
    showProductInfo = false,
    productName,
    productThumb,
    productVariations
}: ReviewDisplayProps) {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => {
            const isActive = index < rating;
            return (
                <Star
                    key={index}
                    className={`w-4 h-4 ${
                        isActive ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                />
            );
        });
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Ngày không hợp lệ';
        }
    };

    const getRatingText = (rating: number) => {
        switch (rating) {
            case 1:
                return 'Rất không hài lòng';
            case 2:
                return 'Không hài lòng';
            case 3:
                return 'Bình thường';
            case 4:
                return 'Hài lòng';
            case 5:
                return 'Rất hài lòng';
            default:
                return '';
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-4 space-y-4">
                {/* Product Info (if shown) */}
                {showProductInfo && productName && productThumb && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                                src={mediaService.getMediaUrl(productThumb)}
                                alt={productName}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-medium text-sm text-gray-900">{productName}</h4>
                            {productVariations && productVariations.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                    {productVariations.map((variation, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {variation.key}: {variation.value}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Review Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Khách hàng đã mua</p>
                            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">{renderStars(review.review_rating)}</div>
                    <span className="text-sm font-medium text-gray-700">
                        {getRatingText(review.review_rating)}
                    </span>
                    <Badge variant="outline" className="ml-2">
                        {review.review_rating}/5
                    </Badge>
                </div>

                {/* Review Content */}
                <div className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">{review.review_content}</p>

                    {/* Review Images */}
                    {review.review_images && review.review_images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {review.review_images.map((imageId, index) => (
                                <div
                                    key={index}
                                    className="relative aspect-square rounded-md overflow-hidden"
                                >
                                    <Image
                                        src={mediaService.getMediaUrl(imageId)}
                                        alt={`Review image ${index + 1}`}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Review Footer */}
                <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Đánh giá được xác minh từ đơn hàng đã hoàn thành
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
