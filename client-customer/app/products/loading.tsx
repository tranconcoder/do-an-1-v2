import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function ProductsLoading() {
    const ProductSkeleton = () => (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb Skeleton */}
                <div className="flex items-center space-x-2 mb-6">
                    <Skeleton className="h-4 w-12" />
                    <span>/</span>
                    <Skeleton className="h-4 w-16" />
                </div>

                {/* Header Skeleton */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filters Skeleton */}
                    <div className="hidden lg:block w-64 space-y-6">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-4">
                            {/* Search skeleton */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Categories skeleton with hierarchical indentation */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton
                                        className="h-4 w-5/6"
                                        style={{ marginLeft: '16px' }}
                                    />
                                    <Skeleton
                                        className="h-4 w-4/5"
                                        style={{ marginLeft: '16px' }}
                                    />
                                    <Skeleton
                                        className="h-4 w-4/6"
                                        style={{ marginLeft: '32px' }}
                                    />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton
                                        className="h-4 w-5/6"
                                        style={{ marginLeft: '16px' }}
                                    />
                                    <Skeleton
                                        className="h-4 w-2/3"
                                        style={{ marginLeft: '16px' }}
                                    />
                                </div>
                            </div>

                            {/* Other filter sections */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/5" />
                            </div>

                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>

                    {/* Products Grid Skeleton */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
