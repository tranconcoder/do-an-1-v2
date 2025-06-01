import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderDetailLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status & Actions */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shop Information */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-36" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div>
                                        <Skeleton className="h-5 w-32 mb-1" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Warehouse Information */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[1, 2].map((index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border"
                                        >
                                            <div className="flex-1">
                                                <Skeleton className="h-5 w-36 mb-2" />
                                                <Skeleton className="h-4 w-48" />
                                            </div>
                                            <div className="text-right">
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map((index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <Skeleton className="h-16 w-16 rounded-md" />
                                        <div className="flex-grow">
                                            <Skeleton className="h-5 w-48 mb-2" />
                                            <div className="flex gap-2">
                                                <Skeleton className="h-6 w-16" />
                                                <Skeleton className="h-6 w-20" />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Skeleton className="h-4 w-16 mb-1" />
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Delivery Address */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-4 w-44" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[1, 2, 3, 4].map((index) => (
                                    <div key={index} className="flex justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-24" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Discounts */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <div className="p-3 bg-blue-50 rounded border">
                                    <Skeleton className="h-5 w-36 mb-2" />
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
