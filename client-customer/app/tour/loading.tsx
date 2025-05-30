import { Loader2, Package, Play } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function TourLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="text-center mb-8">
                    <Skeleton className="h-10 w-80 mx-auto mb-4" />
                    <Skeleton className="h-6 w-96 mx-auto" />
                </div>

                {/* Progress Bar Skeleton */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="w-full h-2 rounded-full" />
                </div>

                {/* Loading Content */}
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Đang tải hướng dẫn...</span>
                </div>

                {/* Main Content Skeleton */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Step Navigation Skeleton */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Package className="h-5 w-5 text-gray-400" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Step Card Skeleton */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-white/20 rounded-full">
                                            <Play className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <Skeleton className="h-6 w-48 bg-white/20" />
                                            <Skeleton className="h-4 w-24 bg-white/20 mt-1" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-12 bg-white/20" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-full mb-2" />
                                <Skeleton className="h-6 w-3/4 mb-6" />

                                {/* Features Skeleton */}
                                <div className="mb-6">
                                    <Skeleton className="h-5 w-32 mb-3" />
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2"
                                            >
                                                <Skeleton className="h-4 w-4 rounded-full" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tips Skeleton */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <Skeleton className="h-5 w-24 mb-2" />
                                    <Skeleton className="h-4 w-full mb-1" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Controls Skeleton */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-8 w-20" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                    <Skeleton className="h-8 w-28" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Skeleton */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="h-20 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center space-y-2"
                                        >
                                            <Skeleton className="h-6 w-6" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
