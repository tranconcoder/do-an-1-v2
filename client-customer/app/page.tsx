'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { PopulateProductsSection } from '@/components/home/PopulateProductsSection';
import { SpecialOfferSection } from '@/components/home/SpecialOfferSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { FooterSection } from '@/components/home/FooterSection';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <main>
                <HeroSection />

                <CategoriesSection />

                <PopulateProductsSection />

                <SpecialOfferSection />

                <NewArrivalsSection />

                <NewsletterSection />
            </main>
            <FooterSection />
        </div>
    );
}
