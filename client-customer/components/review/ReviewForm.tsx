'use client';

import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Image from 'next/image';
import { mediaService } from '@/lib/services/api/mediaService';
import reviewService, { CreateReviewRequest } from '@/lib/services/api/reviewService';

interface ReviewFormProps {
    orderId: string;
    sku: {
        sku_id: string;
        product_name: string;
        thumb: string;
        sku_variations?: Array<{
            key: string;
            value: string;
        }>;
    };
    onReviewSubmitted: () => void;
    onCancel: () => void;
}

export default function ReviewForm({ orderId, sku, onReviewSubmitted, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        if (content.trim().length < 10) {
            toast.error('Nội dung đánh giá phải có ít nhất 10 ký tự');
            return;
        }

        try {
            setIsSubmitting(true);

            const reviewData: CreateReviewRequest = {
                order_id: orderId,
                sku_id: sku.sku_id,
                review_content: content.trim(),
                review_rating: rating,
                review_images: [] // TODO: Add image upload functionality
            };

            await reviewService.createReview(reviewData);

            toast.success('Đánh giá của bạn đã được gửi thành công!');
            onReviewSubmitted();
        } catch (error: any) {
            console.error('Error submitting review:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const isActive = starValue <= (hoveredRating || rating);

            return (
                <button
                    key={index}
                    type="button"
                    className={`transition-colors ${
                        isActive ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                >
                    <Star className="w-8 h-8 fill-current" />
                </button>
            );
        });
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
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Đánh giá sản phẩm</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Product Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                            src={mediaService.getMediaUrl(sku.thumb)}
                            alt={sku.product_name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">{sku.product_name}</h4>
                        {sku.sku_variations && sku.sku_variations.length > 0 && (
                            <div className="flex gap-2 mt-1">
                                {sku.sku_variations.map((variation, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {variation.key}: {variation.value}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Đánh giá của bạn
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">{renderStars()}</div>
                            <span className="text-sm text-gray-600 ml-2">
                                {getRatingText(hoveredRating || rating)}
                            </span>
                        </div>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-3">
                        <label
                            htmlFor="review-content"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Chia sẻ trải nghiệm của bạn
                        </label>
                        <Textarea
                            id="review-content"
                            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="resize-none"
                            maxLength={1000}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Tối thiểu 10 ký tự</span>
                            <span>{content.length}/1000</span>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !content.trim() || content.trim().length < 10}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Gửi đánh giá
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
