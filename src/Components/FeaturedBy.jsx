import React, { useState, useEffect, useRef } from 'react';
import courseImage from '../assets/books.png';
import '../Components/css/featuredBy.css';

// TV channel images - replace with actual logos
const tvChannels = [
    { id: 1, name: 'ATN Bangla', logo: 'https://backend.sabitinternational.com/frontend/assets/images/img/feature-1.png' },
    { id: 2, name: 'Channel I', logo: 'https://backend.sabitinternational.com/frontend/assets/images/img/feature-2.png' },
    { id: 3, name: 'NTV', logo: 'https://backend.sabitinternational.com/frontend/assets/images/img/feature-3.png' },
    { id: 4, name: 'RTV', logo: 'https://backend.sabitinternational.com/frontend/assets/images/img/feature-4.png' },
    { id: 5, name: 'BTV', logo: 'https://backend.sabitinternational.com/frontend/assets/images/img/feature-5.png' },
    { id: 6, name: 'Independent TV', logo: 'https://backend.sabitinternational.com/frontend/assets/images/img/feature-6.png' },
    { id: 7, name: 'Somoy TV', logo: 'https://backend.sabitinternational.com/frontend/assets/images/img/feature-7.png' },
];

function FeaturedBy() {
    const heroItem = {
        title: "All Special Recorded Mind Trainings.",
        price: "5100 BDT",
        image: courseImage,
        description: "A complete collection of Sabit Rayhan's specially recorded mind training sessions designed to boost focus, clarity, and mental strength."
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const sliderRef = useRef(null);
    const itemsToShow = 7;

    // Create circular array of items for infinite loop
    useEffect(() => {
        const totalItems = tvChannels.length;
        const visibleArray = [];
        
        for (let i = 0; i < itemsToShow; i++) {
            const index = (currentIndex + i) % totalItems;
            visibleArray.push({
                ...tvChannels[index],
                originalIndex: index,
                position: i
            });
        }
        
        setVisibleItems(visibleArray);
    }, [currentIndex]);

    // Auto-play slider with pause on hover
    useEffect(() => {
        if (isPaused) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % tvChannels.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [isPaused]);

    // Navigation functions
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % tvChannels.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + tvChannels.length) % tvChannels.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    // Handle mouse events for pause
    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    return (
        <div className="">
            <div className="feature-by-section">
                <div className="hero-overlay"></div>
                
                <div className="hero-content-container">
                    <div className="text-center text-white hero-content-wrapper">
                        {/* Featured By Section */}
                        <div className="featured-by-section">
                            <h3 className="featured-by-title mb-5">Featured By</h3>
                            
                            {/* Full Width White Background for Slider */}
                            <div className="slider-white-bg">
                                <div 
                                    className="circular-slider-container"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    ref={sliderRef}
                                >
                                    {/* Circular Logo Slider */}
                                    <div className="circular-slider">
                                        {visibleItems.map((channel, position) => (
                                            <div 
                                                key={`${channel.id}-${channel.originalIndex}`}
                                                className={`slider-item position-${position} ${
                                                    position === 3 ? 'active' : ''
                                                }`}
                                                onClick={() => goToSlide(channel.originalIndex)}
                                            >
                                                <div className="channel-rectangle">
                                                    <div className="channel-rectangle-inner">
                                                        <img 
                                                            src={channel.logo} 
                                                            alt={channel.name}
                                                            className="channel-logo"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                  
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeaturedBy;