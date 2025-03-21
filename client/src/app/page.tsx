'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.scss';
import HomeHeader from '@/components/HomeHeader';
import HomeFooter from '@/components/HomeFooter';
import HomeBoxChat from '@/components/HomeBoxChat';
import HomeFeaturedPhones from '@/components/HomeFeaturedPhones';
import HomeAccessory from '@/components/HomeAccessory';
import HomeNewsSection from '@/components/HomeNewsSection';
import HomeSlider from '@/components/HomeSlider';
import HomeHotsale from '@/components/HomeHotsale';

// Constants
const SCROLL_THRESHOLD = 20;

export default function Home() {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [showSupportOptions, setShowSupportOptions] = useState(false);

    const handleScroll = useCallback(() => {
        const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
        const shouldShow = currentScrollPosition > SCROLL_THRESHOLD;

        setShowBackToTop(shouldShow);
        setShowSupport(shouldShow);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const backToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const toggleSupportOptions = useCallback(() => {
        setShowSupportOptions((prev) => !prev);
    }, []);

    return (
        <>
            <HomeHeader />
            <main>
                <HomeBoxChat />
                <HomeSlider />
                <HomeHotsale />
                <HomeFeaturedPhones />
                <HomeAccessory />
                <HomeNewsSection />
            </main>
            <HomeFooter />

            {showBackToTop && (
                <button
                    className={styles.backToTopButton}
                    onClick={backToTop}
                    aria-label="Back to top"
                >
                    Back to Top
                </button>
            )}

            {showSupport && (
                <div className={styles.supportContainer}>
                    <button
                        className={styles.supportButton}
                        onClick={toggleSupportOptions}
                        aria-expanded={showSupportOptions}
                        aria-label="Support options"
                    >
                        Support
                    </button>
                    {showSupportOptions && (
                        <div className={styles.supportOptions} role="menu">
                            <a href="#" role="menuitem">
                                Chat
                            </a>
                            <a href="#" role="menuitem">
                                Call
                            </a>
                            <a href="#" role="menuitem">
                                Email
                            </a>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
