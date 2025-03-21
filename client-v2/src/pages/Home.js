import React from 'react';
import HeroImageSlider from '../components/HeroImageSlider';
import HomeCategory from '../components/HomeCategory';
import FlashSale from '../components/FlashSale';
import PopularSearches from '../components/PopularSearches';
import RecommendedProducts from '../components/RecommendedProducts';

function Home() {
    return (
        <div>
            <HeroImageSlider />
            <HomeCategory />
            <FlashSale />
            <PopularSearches />
            <RecommendedProducts />
        </div>
    );
}

export default Home;
