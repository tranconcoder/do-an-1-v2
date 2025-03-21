import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import additional modules for more features
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade'; // Import effect-fade CSS

import banner1 from '../../assets/home-hero/18393170_5971949.jpg';
import banner2 from '../../assets/home-hero/24185036_6911704.jpg';
import banner3 from '../../assets/home-hero/31989913_7900707.jpg';
import banner4 from '../../assets/home-hero/31989919_7875811.jpg';

const HeroImageSlider = ({ images = [] }) => {
    // Default images if none provided
    const defaultImages = [
        { id: 1, src: banner1 },
        { id: 2, src: banner2 },
        { id: 3, src: banner3 },
        { id: 4, src: banner4 }
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
                            alt="slider"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
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
