'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Gift, Percent, Tag, Clock, Users } from 'lucide-react';
import { Discount } from '@/lib/services/api/discountService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DiscountCardProps {
    discount: Discount;
    onCopy?: (code: string) => void;
    className?: string;
}

export const DiscountCard = ({ discount, onCopy, className }: DiscountCardProps) => {
    const { toast } = useToast();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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

    const handleCopyCode = () => {
        navigator.clipboard.writeText(discount.discount_code);
        toast({
            title: 'Đã sao chép mã giảm giá!',
            description: `Mã "${discount.discount_code}" đã được sao chép vào clipboard.`
        });
        onCopy?.(discount.discount_code);
    };

    return (
        <Card
            className={cn(
                'relative overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md',
                discount.is_admin_voucher
                    ? 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-white'
                    : 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white',
                isExpired && 'opacity-60 grayscale',
                className
            )}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {discount.is_admin_voucher ? (
                                <Badge
                                    variant="default"
                                    className="bg-purple-100 text-purple-800 border-purple-300"
                                >
                                    <Gift className="w-3 h-3 mr-1" />
                                    Admin Voucher
                                </Badge>
                            ) : (
                                <Badge
                                    variant="default"
                                    className="bg-blue-100 text-blue-800 border-blue-300"
                                >
                                    <Tag className="w-3 h-3 mr-1" />
                                    Shop Voucher
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
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {discount.discount_name}
                        </h3>
                        {discount.discount_description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {discount.discount_description}
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="flex items-center text-lg font-bold text-orange-600">
                            <Percent className="w-4 h-4 mr-1" />
                            {getDiscountText()}
                        </div>
                        {discount.discount_max_value && discount.discount_type === 'percentage' && (
                            <p className="text-xs text-gray-500">
                                Tối đa {formatCurrency(discount.discount_max_value)}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    {discount.discount_min_order_cost && (
                        <div className="flex items-center text-sm text-gray-600">
                            <Tag className="w-4 h-4 mr-2 text-gray-400" />
                            Đơn hàng tối thiểu: {formatCurrency(discount.discount_min_order_cost)}
                        </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(discount.discount_start_at)} -{' '}
                        {formatDate(discount.discount_end_at)}
                    </div>

                    {discount.discount_count && (
                        <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            Đã dùng: {discount.discount_used_count}/{discount.discount_count}
                        </div>
                    )}

                    {discount.is_apply_all_product && (
                        <div className="flex items-center text-sm text-green-600">
                            <Clock className="w-4 h-4 mr-2" />
                            Áp dụng cho tất cả sản phẩm
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Mã:</span>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-900">
                            {discount.discount_code}
                        </code>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyCode}
                        disabled={isExpired || isNotStarted}
                        className="text-xs"
                    >
                        Sao chép
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export const DiscountCardSkeleton = ({ className }: { className?: string }) => {
    return (
        <Card className={cn('overflow-hidden border-l-4 border-l-gray-300', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="text-right">
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
            </CardContent>
        </Card>
    );
};
