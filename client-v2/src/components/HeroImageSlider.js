import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import additional modules for more features
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade'; // Import effect-fade CSS

import banner1 from '../assets/home-hero/18393170_5971949.jpg';
import banner2 from '../assets/home-hero/24185036_6911704.jpg';
import banner3 from '../assets/home-hero/31989913_7900707.jpg';
import banner4 from '../assets/home-hero/31989919_7875811.jpg';

const HeroImageSlider = ({ images = [] }) => {
    // Default images if none provided
    const defaultImages = [
        {
            id: 1,
            src: banner1,
            alt: 'Hero Image 1',
            title: 'Welcome to Our Website',
            description: 'Discover amazing products and services'
        },
        {
            id: 2,
            src: banner2,
            alt: 'Hero Image 2',
            title: 'Special Offers',
            description: 'Check out our latest deals and promotions'
        },
        {
            id: 3,
            src: banner3,
            alt: 'Hero Image 3',
            title: 'Join Our Community',
            description: 'Be part of our growing network'
        }
    ];

    const slidesData = images.length > 0 ? images : defaultImages;

    return (
        <div
            className="hero-slider-container"
            style={{
                position: 'relative',
                width: '100%',
                height: '400px',
                borderRadius: '15px',
                overflow: 'hidden'
            }}
        >
            <Swiper
                spaceBetween={0}
                centeredSlides={true}
                effect="fade" // Adding fade effect between slides
                speed={1000} // Transition speed in ms
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true // Dynamic bullets for better look
                }}
                navigation={{
                    prevEl: '.swiper-button-prev',
                    nextEl: '.swiper-button-next'
                }}
                loop={true} // Enable continuous loop
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                className="hero-swiper"
                style={{ width: '100%', height: '100%' }}
            >
                {slidesData.map((image) => (
                    <SwiperSlide
                        key={image.id}
                        style={{ position: 'relative', width: '100%', height: '100%' }}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background:
                                    'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0) 100%)',
                                zIndex: 1
                            }}
                        ></div>
                        {/* Title and description elements removed */}
                    </SwiperSlide>
                ))}

                {/* Custom navigation buttons for more styling control */}
                <div className="swiper-button-prev" style={{ color: 'white' }}></div>
                <div className="swiper-button-next" style={{ color: 'white' }}></div>
            </Swiper>
        </div>
    );
};

export default HeroImageSlider;
