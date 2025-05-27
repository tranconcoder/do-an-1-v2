import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ImageSlider } from '@/components/ui/ImageSlider';

export function HeroSection() {
    const heroImages = ['/hero-1.jpg', '/hero-2.jpg', '/hero-3.jpg', '/hero-4.jpg', '/hero-5.jpg'];
    const heroImageAlts = [
        'Hero image 1',
        'Hero image 2',
        'Hero image 3',
        'Hero image 4',
        'Hero image 5'
    ];

    return (
        <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-400/20 -z-10" />
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        Khám phá{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                            Xu hướng
                        </span>{' '}
                        mới nhất
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md">
                        Mua sắm những phong cách và bộ sưu tập mới nhất với giao hàng miễn phí cho
                        đơn hàng trên $50.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                            Mua ngay
                        </Button>
                        <Button
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                            Khám phá bộ sưu tập
                        </Button>
                    </div>
                </div>
                <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-xl">
                    <ImageSlider
                        images={heroImages}
                        imageAltText={heroImageAlts}
                        imageHeightClass="h-[300px] md:h-[400px]"
                        roundedClass="rounded-xl"
                    />
                </div>
            </div>
        </section>
    );
}
