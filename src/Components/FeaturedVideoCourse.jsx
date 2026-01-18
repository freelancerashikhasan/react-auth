import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import arrowRight from '../assets/arrowRight.svg';
import courseImage from '../assets/books.png';
import '../Components/css/feature.css';
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

function FeaturedVideoCourse() {
    const [featuredCourse, setFeaturedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLatestVideoCourse();
    }, []);

    const fetchLatestVideoCourse = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.get('featured-video-course');
            
            if (response.data.success) {
                const data = response.data;
                
                if (data.video_course ) {
                    const latestCourse = data.video_course; 
                    
                    const formattedCourse = {
                        id: latestCourse.id,
                        title: latestCourse.title || "Featured Mind Training",
                        price: latestCourse.price || "Free",
                        image: latestCourse.image || courseImage,
                        description: latestCourse.description || "A special recorded mind training session",
                        category: latestCourse.category || "Video Course",
                        date: latestCourse.created_at || new Date().toISOString()
                    };
                    
                    setFeaturedCourse(formattedCourse);
                } else {
                    // No video courses available
                    setFeaturedCourse(null);
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch courses');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching featured course:', err);
            setError('Failed to load featured course. Please try again later.');
            setLoading(false);
        }
    };

    // Strip HTML tags from description for display
    const stripHtml = (html) => {
        if (!html) return '';
        // Remove HTML tags and limit to 150 characters
        const plainText = html.replace(/<[^>]*>?/gm, '');
        return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Skeleton loader for hero section
    const renderSkeleton = () => {
        return (
            <div className="featured-section">
                <div className="feature-section hero-background skeleton-background">
                    <div className="hero-overlay"></div>
                    <div className="container hero-content-container">
                        <div className="text-center text-white hero-content-wrapper">
                            <Skeleton 
                                height={60} 
                                width="80%" 
                                className="mb-4 mx-auto" 
                                style={{ borderRadius: '8px' }}
                            />
                            <Skeleton 
                                height={20} 
                                width="60%" 
                                className="mb-3 mx-auto" 
                                style={{ borderRadius: '4px' }}
                            />
                            <Skeleton 
                                height={20} 
                                width="70%" 
                                className="mb-3 mx-auto" 
                                style={{ borderRadius: '4px' }}
                            />
                            <Skeleton 
                                height={20} 
                                width="50%" 
                                className="mb-4 mx-auto" 
                                style={{ borderRadius: '4px' }}
                            />
                            <Skeleton 
                                height={50} 
                                width={200} 
                                style={{ borderRadius: '25px', margin: '0 auto' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Error display
    const renderError = () => {
        return (
            <div className="featured-section">
                <div className="feature-section hero-background error-background">
                    <div className="hero-overlay"></div>
                    <div className="container hero-content-container">
                        <div className="text-center text-white hero-content-wrapper">
                            <h1 className="hero-title mb-4">Something went wrong</h1>
                            <p className="hero-description mb-4">{error}</p>
                            <button 
                                className="book-now-btn"
                                onClick={fetchLatestVideoCourse}
                            >
                                <span>Try Again</span>
                                <img src={arrowRight} alt="arrow" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Don't render anything if no featured course
    if (!loading && !error && !featuredCourse) {
        return null;
    }

    // Show loading skeleton
    if (loading) {
        return renderSkeleton();
    }

    // Show error
    if (error) {
        return renderError();
    }

    // Render featured course
    return (
        <div className="featured-section">
            {/* Full Height Hero Section with Background Image */}
            <div 
                className="feature-section hero-background"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${featuredCourse.image})`,
                    backgroundPosition: 'top',
                }}
            >
                {/* Optional overlay for better text readability */}
                <div className="hero-overlay"></div>
                
                {/* Centered Content */}
                <div className="container hero-content-container">
                      <div className="text-center text-white hero-content-wrapper">
                        {/* Main Title */}
                        <h1 className="hero-title mb-4">
                            &quot;{featuredCourse.title}&quot;
                        </h1>
                        
                        {/* Description */}
                        <p className="hero-description mb-4">
                           {featuredCourse?.description?.length > 200
                                ? featuredCourse.description.slice(0, 200) + '...'
                                : featuredCourse?.description}

                        </p>
                      
                        
                        {/* Book Now Button */}
                        <button
                            onClick={() => navigate(`/training/Video-Courses/${featuredCourse.id}`)}
                            className="book-now-btn"
                            >
                            <span>Purchase Now</span>
                        </button>

                    </div>
                </div>
            </div>

        </div>
    );
}

export default FeaturedVideoCourse;