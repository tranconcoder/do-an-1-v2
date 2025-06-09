'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Gift, Percent, Tag, Clock, Users, X } from 'lucide-react';
import { Discount } from '@/lib/services/api/discountService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DiscountDialogProps {
    discount: Discount | null;
    isOpen: boolean;
    onClose: () => void;
}

export const DiscountDialog = ({ discount, isOpen, onClose }: DiscountDialogProps) => {
    const { toast } = useToast();

    if (!discount) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Chi tiết khuyến mãi</span>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div
                    className={cn(
                        'border-l-4 p-4 rounded-lg',
                        discount.is_admin_voucher
                            ? 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-white'
                            : 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white'
                    )}
                >
                    {/* Header with badges and discount value */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-wrap items-center gap-2">
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
                        <div className="text-right">
                            <div className="flex items-center text-2xl font-bold text-orange-600">
                                <Percent className="w-5 h-5 mr-1" />
                                {getDiscountText()}
                            </div>
                            {discount.discount_max_value &&
                                discount.discount_type === 'percentage' && (
                                    <p className="text-xs text-gray-500">
                                        Tối đa {formatCurrency(discount.discount_max_value)}
                                    </p>
                                )}
                        </div>
                    </div>

                    {/* Discount name and description */}
                    <div className="mb-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {discount.discount_name}
                        </h3>
                        {discount.discount_description && (
                            <p className="text-sm text-gray-700">{discount.discount_description}</p>
                        )}
                    </div>

                    {/* Discount details */}
                    <div className="space-y-3 mb-4">
                        {discount.discount_min_order_cost && (
                            <div className="flex items-center text-sm text-gray-700">
                                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="font-medium">Đơn hàng tối thiểu:</span>
                                <span className="ml-2">
                                    {formatCurrency(discount.discount_min_order_cost)}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <div>
                                <div className="font-medium">Thời gian áp dụng:</div>
                                <div className="text-xs">
                                    {formatDate(discount.discount_start_at)} -{' '}
                                    {formatDate(discount.discount_end_at)}
                                </div>
                            </div>
                        </div>

                        {discount.discount_count && (
                            <div className="flex items-center text-sm text-gray-700">
                                <Users className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="font-medium">Lượt sử dụng:</span>
                                <span className="ml-2">
                                    {discount.discount_used_count}/{discount.discount_count}
                                </span>
                            </div>
                        )}

                        {discount.is_apply_all_product && (
                            <div className="flex items-center text-sm text-green-700">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="font-medium">
                                    Áp dụng cho tất cả sản phẩm của shop
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Copy code section */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                    Mã giảm giá:
                                </div>
                                <code className="px-3 py-2 bg-gray-100 rounded text-sm font-mono text-gray-900 w-full block text-center">
                                    {discount.discount_code}
                                </code>
                            </div>
                        </div>
                        <Button
                            onClick={handleCopyCode}
                            disabled={isExpired || isNotStarted}
                            className="w-full mt-3"
                            size="sm"
                        >
                            {isExpired
                                ? 'Mã đã hết hạn'
                                : isNotStarted
                                ? 'Chưa thể sử dụng'
                                : 'Sao chép mã'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
