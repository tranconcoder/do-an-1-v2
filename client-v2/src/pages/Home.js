import React from 'react';
import HeroImageSlider from '../components/HeroImageSlider';
import FlashSale from '../components/FlashSale';
import PopularSearches from '../components/PopularSearches';
import RecommendedProducts from '../components/RecommendedProducts';
import Categories from '../components/Categories';

function Home() {
    return (
        <div>
            <HeroImageSlider />
            <Categories />
            <FlashSale />
            <PopularSearches />
            <RecommendedProducts />
        </div>
    );
}

export default Home;
