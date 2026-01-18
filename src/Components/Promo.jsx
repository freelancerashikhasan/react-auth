import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import promo from '../assets/hero2.png';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

function Promo() {
    const [featuredCourse, setFeaturedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeaturedCourse();
    }, []);

    const fetchFeaturedCourse = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.get('featured-online-course');
            
            if (response.data.success) {
                const data = response.data; 
                
                if (data.video_course) { // Changed from offline_course to video_course
                    const featuredCourse = data.video_course; 
                    
                    const formattedCourse = {
                        id: featuredCourse.id,
                        title: featuredCourse.title || "Featured Mind Training",
                        price: featuredCourse.price || "Free",
                        image: featuredCourse.image || promo,
                        description: featuredCourse.description || "A special training session",
                        category: featuredCourse.category || "Online Course",
                        date: featuredCourse.created_at || new Date().toISOString(),
                        type: featuredCourse.type || 'online' // Get type from API
                    };
                    
                    setFeaturedCourse(formattedCourse);
                } else {
                    setFeaturedCourse(null);
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch featured course');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching featured course:', err);
            setError('Failed to load featured course. Please try again later.');
            setLoading(false);
        }
    };

    // Get dynamic URL based on course type
    const getCourseUrl = () => {
        if (!featuredCourse) return '#';
        
        const type = featuredCourse.type?.toLowerCase();
        
        switch(type) {
            case 'online':
                return `/training/Online-Courses/${featuredCourse.id}`;
            
            case 'video':
                return `/training/Video-Courses/${featuredCourse.id}`;
            
            case 'offline':
                return `/training/Offline-Courses/${featuredCourse.id}`;
            
            default:
                return `/training/Online-Courses/${featuredCourse.id}`;
        }
    };

    const getButtonText = () => {
        if (!featuredCourse) return 'Start Now';
        
        const type = featuredCourse.type?.toLowerCase();
        
        switch(type) {
            case 'online':
                return 'Start Now';
            
            case 'video':
                return 'Start Now';
            
            case 'offline':
                return 'Start Now';
            
            default:
                return 'Start Now';
        }
    };

    // Skeleton loader
    const renderSkeleton = () => {
        return (
            <section 
                className="py-5 d-flex align-items-center justify-content-center"
                style={{
                    backgroundImage: `url(${promo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    minHeight: '80vh'
                }}
            >
                <div className="container text-center promo-content">
                    <Skeleton 
                        height={60} 
                        width="80%" 
                        className="mb-4 mx-auto" 
                        style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.1)' }}
                    />
                    <Skeleton 
                        height={20} 
                        width="70%" 
                        className="mb-4 mx-auto" 
                        style={{ borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}
                    />
                    <Skeleton 
                        height={50} 
                        width={200} 
                        className="mt-3 mx-auto"
                        style={{ borderRadius: '25px', background: 'rgba(255,255,255,0.1)' }}
                    />
                </div>
            </section>
        );
    };

    // Error display
    const renderError = () => {
        return (
            <section 
                className="py-5 d-flex align-items-center justify-content-center"
                style={{
                    backgroundImage: `url(${promo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    minHeight: '80vh'
                }}
            >
                <div className="container text-center promo-content">
                    <h1 className="text-white mb-4">Something went wrong</h1>
                    <p className="text-white mb-4">{error}</p>
                    <button 
                        className="starBtn btn-lg px-4 py-3"
                        onClick={fetchFeaturedCourse}
                    >
                        Try Again
                    </button>
                </div>
            </section>
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

    // Render featured course with Promo design
    return (
        <section 
            className="py-5 d-flex align-items-center justify-content-center"
            style={{
                backgroundImage: `url(${promo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                minHeight: '80vh'
            }}
        >
            <div className="container text-center promo-content">
                <h1 className="text-white mb-4">
                    "Be the master of your <br /> mind, body and soul"
                </h1>
                <p className="text-white mb-4">
                    "Transform your life by aligning your present with your vision—powered by <br />
                    Sabit Rayhan's proven methodology."
                </p>
                
                <Link 
                    to={getCourseUrl()} 
                    className="starBtn btn-lg px-4 py-3"
                >
                    {getButtonText()}
                </Link>
            </div>
        </section>
    );
}

export default Promo;