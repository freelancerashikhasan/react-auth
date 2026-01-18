import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Arrow from '../../src/assets/SliderArrow.svg';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const Event = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(5);
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeVideoIndex, setActiveVideoIndex] = useState(null);
    const [touchStartTime, setTouchStartTime] = useState(0);
    const [touchStartX, setTouchStartX] = useState(0);
    
    const sliderRef = useRef(null);
    const containerRef = useRef(null);
    const videoRefs = useRef({});

    // Fetch reels from API
    useEffect(() => {
        fetchReels();
    }, []);

     const fetchReels = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.get('reels');
            
            // Debug: log the response structure
            console.log('API Response:', response.data);
            
            // Check if response.data is an array directly or has success property
            let apiData;
            
            if (Array.isArray(response.data)) {
                // If response.data is directly an array
                apiData = response.data;
            } else if (response.data.success && response.data.data) {
                // If response has success: true and data property
                apiData = response.data.data;
            } else if (response.reels) {
                // If response has reels property
                apiData = response.reels;
            } else {
                // Fallback: use response.data directly
                apiData = response.data;
            }
            
            // Transform API data to match our reels format
            const formattedReels = transformReelsData(apiData);
            console.log('Formatted Reels:', formattedReels);
            setReels(formattedReels);
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching reels:', err);
            setError('Failed to load reels. Please try again later.');
            setLoading(false);
        }
    };

    const transformReelsData = (apiData) => {
        console.log(apiData);
        // Default fallback items if API fails or returns no data
        const defaultReels = [
            {
                id: 1,
                title: "Mind Training Tips",
                video_link: "Ow39vcs7B-4", // Just the YouTube ID
                description: "Quick mind training techniques",
                thumbnail: null
            },
            {
                id: 2,
                title: "Success Mindset",
                video_link: "Ow39vcs7B-4",
                description: "Develop a success mindset",
                thumbnail: null
            },
            {
                id: 3,
                title: "Focus Training",
                video_link: "Ow39vcs7B-4",
                description: "Improve your focus and concentration",
                thumbnail: null
            },
            {
                id: 4,
                title: "Meditation Guide",
                video_link: "Ow39vcs7B-4",
                description: "Daily meditation practice",
                thumbnail: null
            },
            {
                id: 5,
                title: "Brain Exercise",
                video_link: "Ow39vcs7B-4",
                description: "Simple brain exercises",
                thumbnail: null
            },
            {
                id: 6,
                title: "Stress Management",
                video_link: "Ow39vcs7B-4",
                description: "Manage daily stress effectively",
                thumbnail: null
            },
            {
                id: 7,
                title: "Memory Improvement",
                video_link: "Ow39vcs7B-4",
                description: "Techniques to improve memory",
                thumbnail: null
            }
        ];

        // If no API data, return default reels
        if (!apiData || !apiData.reels || !Array.isArray(apiData.reels) || apiData.reels.length === 0) {
            return defaultReels;
        }

        // Map API reels to our format
        return apiData.reels.map((reel, index) => ({
            id: reel.id || index + 1,
            title: reel.title || "Mind Training Reel",
            // Extract just the YouTube ID if full URL is provided
            video_link: extractYouTubeId(reel.video_link) || `Ow39vcs7B-4`,
        }));
    };

    // Extract YouTube ID from URL
    const extractYouTubeId = (url) => {
        if (!url) return null;
        
        // If it's already just an ID
        if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
            return url;
        }
        
        // Extract from various YouTube URL formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Duplicate reels for infinite scroll effect
    const duplicatedReels = loading || error ? [] : [...reels, ...reels, ...reels];

    // Handle responsive items per view
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsPerView(1.5); // Better for mobile dragging
            } else if (window.innerWidth < 992) {
                setItemsPerView(3);
            } else {
                setItemsPerView(5);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle video click - turn off autoplay
    const handleVideoClick = (index, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close any previously active video
        if (activeVideoIndex !== null) {
            const prevIframe = videoRefs.current[activeVideoIndex];
            if (prevIframe) {
                // Remove autoplay from previous iframe
                const src = prevIframe.src;
                prevIframe.src = src.replace('autoplay=1', 'autoplay=0');
            }
        }
        
        // Update active video index
        setActiveVideoIndex(index === activeVideoIndex ? null : index);
    };

    // Enhanced touch handlers for mobile
    const handleTouchStart = useCallback((e) => {
        e.preventDefault();
        const touch = e.touches[0];
        setTouchStartTime(Date.now());
        setTouchStartX(touch.clientX);
        setStartX(touch.clientX);
        setIsDragging(true);
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'none';
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || !sliderRef.current) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        setDragOffset(deltaX);
        
        // Calculate position with drag
        const itemWidth = 100 / itemsPerView;
        const totalOffset = -currentIndex * itemWidth + (deltaX / containerRef.current?.offsetWidth || 0) * 100;
        
        sliderRef.current.style.transform = `translateX(${totalOffset}%)`;
    }, [isDragging, startX, currentIndex, itemsPerView]);

    const handleTouchEnd = useCallback((e) => {
        if (!isDragging) return;
        
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        
        setIsDragging(false);
        
        // Check if it's a tap (short duration and small movement)
        const isTap = touchDuration < 200 && Math.abs(deltaX) < 10;
        
        if (isTap) {
            // It's a tap, not a swipe - let the click handler handle it
            if (sliderRef.current) {
                sliderRef.current.style.transition = 'transform 0.5s ease';
                sliderRef.current.style.transform = `translateX(-${currentIndex * (100 / itemsPerView)}%)`;
            }
        } else {
            // It's a swipe
            const threshold = 30; // Reduced threshold for mobile
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    // Swipe to right = previous slide
                    prevSlide();
                } else {
                    // Swipe to left = next slide
                    nextSlide();
                }
            } else {
                // Return to current position
                if (sliderRef.current) {
                    sliderRef.current.style.transition = 'transform 0.5s ease';
                    sliderRef.current.style.transform = `translateX(-${currentIndex * (100 / itemsPerView)}%)`;
                }
            }
        }
        
        setDragOffset(0);
    }, [isDragging, touchStartTime, touchStartX, currentIndex, itemsPerView]);

    // Mouse handlers for desktop
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setStartX(e.clientX);
        setIsDragging(true);
        setDragOffset(0);
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'none';
        }
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !sliderRef.current) return;
        
        const deltaX = e.clientX - startX;
        setDragOffset(deltaX);
        
        // Calculate position with drag
        const itemWidth = 100 / itemsPerView;
        const totalOffset = -currentIndex * itemWidth + (deltaX / containerRef.current?.offsetWidth || 0) * 100;
        
        sliderRef.current.style.transform = `translateX(${totalOffset}%)`;
    }, [isDragging, startX, currentIndex, itemsPerView]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging) return;
        
        setIsDragging(false);
        
        // Calculate if drag was significant enough to change slide
        const threshold = 50; // pixels
        if (Math.abs(dragOffset) > threshold) {
            if (dragOffset > 0) {
                // Drag to right = previous slide
                prevSlide();
            } else {
                // Drag to left = next slide
                nextSlide();
            }
        } else {
            // Return to current position
            if (sliderRef.current) {
                sliderRef.current.style.transition = 'transform 0.5s ease';
                sliderRef.current.style.transform = `translateX(-${currentIndex * (100 / itemsPerView)}%)`;
            }
        }
        
        setDragOffset(0);
    }, [isDragging, dragOffset, currentIndex, itemsPerView]);

    // Infinite scroll logic
    const nextSlide = useCallback(() => {
        setCurrentIndex(prev => {
            const newIndex = prev + 1;
            if (newIndex >= reels.length * 2) {
                return reels.length;
            }
            return newIndex;
        });
    }, [reels.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex(prev => {
            const newIndex = prev - 1;
            if (newIndex < 0) {
                return reels.length;
            }
            return newIndex;
        });
    }, [reels.length]);

    // Go to specific slide (for indicators)
    const goToSlide = (index) => {
        // Convert indicator index to actual slide index
        const slideIndex = index * itemsPerView;
        setCurrentIndex(slideIndex >= reels.length * 2 ? reels.length : slideIndex);
    };

    // Calculate total slides for indicators
    const totalSlides = Math.ceil(reels.length / itemsPerView);

    // Reset to middle section when transition ends
    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        const handleTransitionEnd = () => {
            slider.style.transition = 'transform 0.5s ease';
            if (currentIndex === 0) {
                setCurrentIndex(reels.length);
            } else if (currentIndex >= reels.length * 2) {
                setCurrentIndex(reels.length);
            }
        };

        slider.addEventListener('transitionend', handleTransitionEnd);
        return () => slider.removeEventListener('transitionend', handleTransitionEnd);
    }, [currentIndex, reels.length]);

    // Add event listeners for drag
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleMouseUp();
            }
        };

        const handleGlobalMouseMove = (e) => {
            if (isDragging) {
                handleMouseMove(e);
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Calculate current indicator (for infinite slider adjustment)
    const getCurrentIndicator = () => {
        if (reels.length === 0) return 0;
        const actualIndex = currentIndex % reels.length;
        return Math.floor(actualIndex / itemsPerView);
    };

    // Generate YouTube iframe URL with proper parameters
    const getYouTubeIframeUrl = (videoId, index) => {
        const isActive = index === activeVideoIndex;
        const params = new URLSearchParams({
            autoplay: isActive ? '1' : '0',
            rel: '0',
            modestbranding: '1',
            showinfo: '0',
            controls: '1',
            mute: '0',
            playsinline: '1',
            enablejsapi: '0'
        });
        
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    };

    // Skeleton loader
    if (loading) {
        return (
            <section className="py-5 eventSection">
                <div className="py-5 container">
                    <div className="mb-5">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center">
                                <h5 className="display-7 mb-0">Events & Topics</h5>
                                <p className="subtitle ms-3 mb-0" style={{ maxWidth: '700px' }}>
                                    Watch short videos showcasing our travel services in action
                                </p>
                            </div>
                        </div>
                        
                        <div className="row">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="col-md-2 col-sm-4 col-6 mb-3">
                                    <Skeleton height={400} style={{ borderRadius: '15px' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error && reels.length === 0) {
        return (
            <section className="py-5 eventSection">
                <div className="py-5 container">
                    <div className="text-center">
                        <h5 className="display-7 mb-3">Events & Topics</h5>
                        <p className="text-danger mb-3">{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={fetchReels}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-5 eventSection">
            <div className="py-5 container">
                <div className="mb-5">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                            <h5 className="display-7 mb-0">Events & Topics</h5>
                            <p className="subtitle ms-3 mb-0" style={{ maxWidth: '700px' }}>
                                Watch short videos showcasing our travel services in action
                            </p>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                onClick={prevSlide}
                                className="sliderBtn"
                                style={{ width: '50px', height: '50px' }}
                            >
                                <img src={Arrow} alt="Previous" className='sliderArrow' />
                            </button>

                            <button
                                onClick={nextSlide}
                                className="sliderBtn nextslider"
                                style={{ width: '50px', height: '50px' }}
                            >
                                <img src={Arrow} alt="Next" className='sliderArrow' />
                            </button>
                        </div>
                    </div>

                    <div 
                        ref={containerRef}
                        className="position-relative"
                        style={{ 
                            cursor: isDragging ? 'grabbing' : 'grab', 
                            userSelect: 'none',
                            touchAction: 'pan-y pinch-zoom' // Better touch handling
                        }}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="overflow-hidden">
                            <div 
                                ref={sliderRef}
                                className="d-flex"
                                style={{
                                    transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    willChange: 'transform'
                                }}
                            >
                                {duplicatedReels.map((reel, index) => {
                                    const isActive = index === activeVideoIndex;
                                    
                                    return (
                                        <div 
                                            key={`${reel.id}-${index}`}
                                            className="flex-shrink-0 px-2"
                                            style={{ width: `${100 / itemsPerView}%` }}
                                            onClick={(e) => handleVideoClick(index, e)}
                                        >
                                            <div className="border-0 h-100 reels">
                                                <div className="position-relative h-100">
                                                    <div 
                                                        className="h-100"
                                                        style={{
                                                            aspectRatio: '9/16',
                                                            overflow: 'hidden',
                                                            borderRadius: '15px',
                                                            backgroundColor: '#000',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <iframe
                                                            ref={el => videoRefs.current[index] = el}
                                                            className="w-100 h-100"
                                                            src={getYouTubeIframeUrl(reel.video_link, index)}
                                                            title={reel.title}
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                            allowFullScreen
                                                            style={{ border: 'none' }}
                                                            loading="lazy"
                                                        ></iframe>
                                                        
                                                        {/* Play overlay for non-active videos */}
                                                        {!isActive && (
                                                            <div 
                                                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    background: 'rgba(0, 0, 0, 0.3)',
                                                                    zIndex: 2,
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <div className="play-button">
                                                                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                                                        <circle cx="30" cy="30" r="30" fill="white" fillOpacity="0.8"/>
                                                                        <path d="M25 20L40 30L25 40V20Z" fill="#000"/>
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                  
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Drag indicator */}
                        {isDragging && (
                            <div className="position-absolute top-0 end-0 mt-2 me-2 d-none d-md-block">
                                <div className="bg-dark bg-opacity-75 text-white px-2 py-1 rounded small">
                                    {dragOffset > 0 ? '← Swiping right' : '→ Swiping left'}
                                </div>
                            </div>
                        )}
                        
                        {/* Mobile swipe hint */}
                        <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-block d-md-none">
                            <div className="bg-dark bg-opacity-75 text-white px-3 py-2 rounded small">
                                <span className="me-2">←</span> Swipe to navigate <span className="ms-2">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Slider Indicator Buttons */}
                    <div className="d-md-flex justify-content-center mt-4 activity">
                        <div className="d-flex gap-2 align-items-center">
                            {Array.from({ length: totalSlides }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`indicator-btn ${getCurrentIndicator() === index ? 'active' : ''}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .transition-all {
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .reels {
                    transition: transform 0.3s ease;
                }
                .reels:hover {
                    transform: scale(1.02);
                }
                
                .play-button {
                    transition: transform 0.2s ease;
                }
                
                .play-button:hover {
                    transform: scale(1.1);
                }
                
                /* Slider Indicator Styles */
                .indicator-btn {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: none;
                    background-color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.3s ease;
                }
                
                .indicator-btn:hover {
                    background-color: rgba(255, 255, 255, 0.5);
                    transform: scale(1.2);
                }
                
                .indicator-btn.active {
                    background-color: var(--color-white);
                    width: 30px;
                    border-radius: 5px;
                }
                
                /* Responsive adjustments for better mobile experience */
                @media (max-width: 768px) {
                    .flex-shrink-0 {
                        width: ${100 / 1.5}% !important;
                    }
                    
                    .sliderBtn {
                        display: none; /* Hide arrows on mobile */
                    }
                    
                    /* Better touch area */
                    .reels {
                        padding: 5px;
                    }
                    
                    .indicator-btn {
                        width: 8px;
                        height: 8px;
                    }
                    .indicator-btn.active {
                        width: 24px;
                    }
                }
                
                @media (max-width: 576px) {
                    .flex-shrink-0 {
                        width: ${100 / 1.2}% !important; /* Even larger on very small screens */
                    }
                    
                    .indicator-btn {
                        width: 6px;
                        height: 6px;
                    }
                    .indicator-btn.active {
                        width: 20px;
                    }
                }
                
                /* Prevent iframe from capturing clicks during drag */
                iframe {
                    pointer-events: none;
                }
                
                .reels:hover iframe {
                    pointer-events: auto;
                }
            `}</style>
        </section>
    );
};

export default Event;