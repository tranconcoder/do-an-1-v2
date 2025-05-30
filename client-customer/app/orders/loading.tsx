import { Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                {/* Tabs Skeleton */}
                <div className="mb-6">
                    <div className="grid w-full grid-cols-7 gap-2">
                        {Array.from({ length: 7 }).map((_, index) => (
                            <Skeleton key={index} className="h-10" />
                        ))}
                    </div>
                </div>

                {/* Loading Content */}
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Đang tải đơn hàng...</span>
                </div>

                {/* Order Cards Skeleton */}
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="mb-4">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <Skeleton className="h-6 w-32 mb-1" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-32 mb-1" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="border rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <Skeleton className="h-12 w-12 rounded" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-32 mb-1" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <div>
                                        <Skeleton className="h-4 w-32 mb-1" />
                                        <Skeleton className="h-5 w-24 mb-1" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                    <div className="text-right">
                                        <Skeleton className="h-4 w-16 mb-1" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
