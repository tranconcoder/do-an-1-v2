'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, Copy, Calendar, Store, Tag, Percent, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { discountService, Discount } from '@/lib/services/api/discountService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SavedDiscount {
    discount_id: Discount;
    saved_at: string;
}

export default function SavedDiscountsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { accessToken } = useSelector((state: RootState) => state.user);

    const [savedDiscounts, setSavedDiscounts] = useState<SavedDiscount[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) {
            router.push('/auth/login');
            return;
        }
        fetchSavedDiscounts();
    }, [accessToken, router]);

    const fetchSavedDiscounts = async () => {
        try {
            setLoading(true);
            const data = await discountService.getSavedDiscounts();
            setSavedDiscounts(data.discounts || []);
        } catch (error) {
            console.error('Error fetching saved discounts:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải danh sách mã giảm giá đã lưu',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: 'Đã sao chép!',
            description: `Mã giảm giá "${code}" đã được sao chép`
        });
    };

    const handleUnsaveDiscount = async (discountId: string) => {
        try {
            setRemovingId(discountId);
            await discountService.unsaveDiscount(discountId);

            setSavedDiscounts((prev) => prev.filter((item) => item.discount_id._id !== discountId));

            toast({
                title: 'Đã xóa',
                description: 'Mã giảm giá đã được xóa khỏi danh sách yêu thích'
            });
        } catch (error) {
            console.error('Error unsaving discount:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa mã giảm giá',
                variant: 'destructive'
            });
        } finally {
            setRemovingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const isExpired = (endDate: string) => {
        return new Date(endDate) < new Date();
    };

    const isExpiringSoon = (endDate: string) => {
        const daysLeft = Math.ceil(
            (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
        );
        return daysLeft <= 3 && daysLeft > 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <Skeleton className="h-8 w-64 mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, index) => (
                                <Card key={index} className="h-64">
                                    <CardContent className="p-6">
                                        <Skeleton className="h-6 w-full mb-4" />
                                        <Skeleton className="h-4 w-24 mb-2" />
                                        <Skeleton className="h-4 w-32 mb-4" />
                                        <Skeleton className="h-10 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-4 mb-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Quay lại
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Heart className="h-6 w-6 text-red-500" />
                                    Mã giảm giá đã lưu
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Quản lý các mã giảm giá yêu thích của bạn
                                </p>
                            </div>
                            <Badge variant="secondary" className="px-3 py-1">
                                {savedDiscounts.length} mã giảm giá
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {savedDiscounts.length === 0 ? (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                    Chưa có mã giảm giá nào được lưu
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Khám phá các cửa hàng và lưu những mã giảm giá hấp dẫn
                                </p>
                                <Button asChild>
                                    <Link href="/products">Khám phá ngay</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedDiscounts.map((item) => {
                                const discount = item.discount_id;
                                const expired = isExpired(discount.discount_end_at);
                                const expiringSoon = isExpiringSoon(discount.discount_end_at);

                                return (
                                    <Card
                                        key={discount._id}
                                        className={`relative transition-all duration-200 hover:shadow-lg ${
                                            expired ? 'opacity-60 grayscale' : ''
                                        }`}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                                        {discount.discount_name}
                                                    </CardTitle>
                                                    {discount.discount_description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {discount.discount_description}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleUnsaveDiscount(discount._id)
                                                    }
                                                    disabled={removingId === discount._id}
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            {/* Status Badges */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {expired && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Đã hết hạn
                                                    </Badge>
                                                )}
                                                {!expired && expiringSoon && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-orange-600 border-orange-200 text-xs"
                                                    >
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Sắp hết hạn
                                                    </Badge>
                                                )}
                                                {discount.is_admin_voucher && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        Admin
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Discount Info */}
                                            <div className="space-y-3 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        Giảm giá:
                                                    </span>
                                                    <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                                        <Percent className="h-3 w-3" />
                                                        {discount.discount_type === 'percentage'
                                                            ? `${discount.discount_value}%`
                                                            : `${discount.discount_value.toLocaleString()}đ`}
                                                    </div>
                                                </div>

                                                {discount.discount_min_order_cost && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">
                                                            Đơn tối thiểu:
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {discount.discount_min_order_cost.toLocaleString()}
                                                            đ
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        Hết hạn:
                                                    </span>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(discount.discount_end_at)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">
                                                        Đã lưu:
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(item.saved_at)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Copy Code Button */}
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                    handleCopyCode(discount.discount_code)
                                                }
                                                disabled={expired}
                                            >
                                                <Copy className="h-4 w-4 mr-2" />
                                                {discount.discount_code}
                                            </Button>
                                        </CardContent>

                                        {/* Saved indicator */}
                                        <div className="absolute top-4 right-4">
                                            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
