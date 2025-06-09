'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Percent, Tag, Clock, Heart, HeartOff } from 'lucide-react';
import { Discount } from '@/lib/services/api/discountService';
import { cn } from '@/lib/utils';

interface DiscountCardCompactProps {
    discount: Discount;
    onClick?: () => void;
    className?: string;
    isSaved?: boolean;
    onSaveToggle?: (discountId: string, isSaved: boolean) => Promise<void>;
    isAuthenticated?: boolean;
}

export const DiscountCardCompact = ({
    discount,
    onClick,
    className,
    isSaved = false,
    onSaveToggle,
    isAuthenticated = false
}: DiscountCardCompactProps) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getDiscountText = () => {
        if (discount.discount_type === 'percentage') {
            return `${discount.discount_value}%`;
        } else {
            return formatCurrency(discount.discount_value);
        }
    };

    const isExpired = new Date(discount.discount_end_at) < new Date();
    const isNotStarted = new Date(discount.discount_start_at) > new Date();

    const handleSaveClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (onSaveToggle) {
            await onSaveToggle(discount._id, isSaved);
        }
    };

    return (
        <Card
            className={cn(
                'relative overflow-hidden border-l-4 transition-all duration-200 hover:shadow-lg cursor-pointer flex-shrink-0 w-64',
                discount.is_admin_voucher
                    ? 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-white hover:from-purple-100'
                    : 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white hover:from-blue-100',
                isExpired && 'opacity-60 grayscale',
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {discount.is_admin_voucher ? (
                            <Badge
                                variant="default"
                                className="bg-purple-100 text-purple-800 border-purple-300 text-xs"
                            >
                                <Gift className="w-3 h-3 mr-1" />
                                Admin
                            </Badge>
                        ) : (
                            <Badge
                                variant="default"
                                className="bg-blue-100 text-blue-800 border-blue-300 text-xs"
                            >
                                <Tag className="w-3 h-3 mr-1" />
                                Shop
                            </Badge>
                        )}
                        {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                                Hết hạn
                            </Badge>
                        )}
                        {isNotStarted && (
                            <Badge variant="secondary" className="text-xs">
                                Chưa bắt đầu
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <div className="flex items-center text-lg font-bold text-orange-600">
                                <Percent className="w-4 h-4 mr-1" />
                                {getDiscountText()}
                            </div>
                        </div>
                        {/* Save button */}
                        {isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveClick}
                                className={cn(
                                    'h-8 w-8 p-0 hover:bg-gray-100',
                                    isSaved && 'text-red-500 hover:text-red-600'
                                )}
                                disabled={isExpired || isNotStarted}
                            >
                                {isSaved ? (
                                    <Heart className="h-4 w-4 fill-current" />
                                ) : (
                                    <HeartOff className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">
                        {discount.discount_name}
                    </h3>

                    <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-900 flex-1 text-center">
                            {discount.discount_code}
                        </code>
                    </div>

                    {discount.discount_min_order_cost && (
                        <div className="flex items-center text-xs text-gray-600">
                            <Tag className="w-3 h-3 mr-1 text-gray-400" />
                            Tối thiểu: {formatCurrency(discount.discount_min_order_cost)}
                        </div>
                    )}

                    {discount.is_apply_all_product && (
                        <div className="flex items-center text-xs text-green-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Tất cả sản phẩm
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export const DiscountCardCompactSkeleton = ({ className }: { className?: string }) => {
    return (
        <Card
            className={cn(
                'overflow-hidden border-l-4 border-l-gray-300 flex-shrink-0 w-64',
                className
            )}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
            </CardContent>
        </Card>
    );
};
