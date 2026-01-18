import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { PlayCircle } from 'lucide-react';
import heroImg from '../../src/assets/heroImg.png';
import videoImg from '../../src/assets/video.png';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const HeroSection = () => {
    const [latestCourse, setLatestCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        fetchLatestCourse();
    }, []);

    const fetchLatestCourse = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.get('featured-offline-course');
            
            if (response.data.success) {
                const data = response.data;
                
                if (data.course) { // Note: your API returns video_course
                    const course = data.course;
                    
                    const formattedCourse = {
                        id: course.id,
                        title: course.title || "Latest Training",
                        type: course.type || 'online',
                        price: course.price || "Free",
                        image: course.image || videoImg,
                        video_link: course.video_link || null,
                        date: course.date || null,
                        deadline: course.deadline || null,
                        duration: course.duration || 'Coming Soon'
                    };
                    
                    setLatestCourse(formattedCourse);
                }
            } else {
                throw new Error(response.data.message || 'Failed to fetch latest course');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching latest course:', err);
            setError('Failed to load latest course.');
            setLoading(false);
        }
    };

    const getCourseUrl = () => {
        if (!latestCourse) return '/';
        
        const type = latestCourse.type?.toLowerCase();
        
        switch(type) {
            case 'online':
            case 'online_course':
            case 'online-course':
                return `/training/Online-Courses/${latestCourse.id}`;
            
            case 'video':
            case 'video_course':
            case 'video-course':
                return `/training/Video-Courses/${latestCourse.id}`;
            
            case 'offline':
            case 'offline_course':
            case 'offline-course':
                return `/training/Offline-Courses/${latestCourse.id}`;
            
            default:
                return `/training/Online-Courses/${latestCourse.id}`;
        }
    };

    const toggleVideo = () => {
        if (latestCourse?.video_link) {
            setShowVideo(!showVideo);
        }
    };

    // Get YouTube embed URL
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        const videoId = extractYouTubeId(url);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url;
    };

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    // Skeleton loader
    if (loading) {
        return (
            <section className="hero-section position-relative overflow-hidden">
                <div className="container">
                    <div className="position-absolute top-0 start-0 w-100 bg-dark opacity-50"></div>
                    <div 
                        className="position-absolute top-0 start-0 w-100 heroImg"
                        style={{
                            backgroundImage: `url(${heroImg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'left',
                        }}
                    ></div>
                    
                    <div className="container position-relative" style={{ minHeight: '85vh' }}>
                        <div className="row align-items-end" style={{ minHeight: '80vh' }}>
                            <div className="col-lg-8 pb-5 ps-5">
                                <Skeleton height={80} width="80%" className="mb-4" />
                                <Skeleton height={40} width="60%" className="mb-4" />
                                <Skeleton height={50} width={200} className="mb-3" />
                            </div>
                            <div className="col-lg-4 pb-5 ps-5 text-start videoTitle">
                                <Skeleton height={20} width="40%" className="mb-3" />
                                <Skeleton height={200} width="100%" className="mb-3" />
                                <Skeleton height={30} width="60%" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="hero-section position-relative overflow-hidden">
            <div className="container">
                {/* Background Image with Overlay */}
                <div className="position-absolute top-0 start-0 w-100 bg-dark opacity-50"></div>
                <div 
                    className="position-absolute top-0 start-0 w-100 heroImg"
                    style={{
                        backgroundImage: `url(${heroImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'left',
                    }}
                ></div>
                
                <div className="container position-relative" style={{ minHeight: '85vh' }}>
                    <div className="row align-items-end" style={{ minHeight: '80vh' }}>
                        <div className="col-lg-8 pb-5 ps-5">
                            <h1 className="hero-text display-4 fw-bold text-white text-start mb-4">
                                {latestCourse?.title || "Train Your Brain For Maximum Success."}
                            </h1>
                          
                            <div className="d-flex flex-wrap gap-3">
                                <Link to={getCourseUrl()} className="starBtn btn-lg px-4 py-3">
                                    Start Now
                                </Link>
                            </div>
                        </div>
                        
                        <div className="col-lg-4 pb-5 ps-5 text-start videoTitle">
                            <h5 className='text-start text-white mb-3'>NEXT EVENT</h5>
                            
                            {latestCourse?.video_link && showVideo ? (
                                // Show YouTube video when clicked
                                <div className="video-player-container-hero mb-3">
                                    <iframe
                                        width="100%"
                                        height="250"
                                        src={getYouTubeEmbedUrl(latestCourse.video_link)}
                                        title={latestCourse.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                  
                                </div>
                            ) : (
                                // Show thumbnail with play button
                                <div 
                                    className="video-container position-relative mb-3" 
                                    style={{ cursor: latestCourse?.video_link ? 'pointer' : 'default' }}
                                    onClick={toggleVideo}
                                >
                                    <img 
                                        src={videoImg} 
                                        alt={latestCourse?.title || "Next Event"} 
                                        className='videoImg w-100'
                                    />
                                    
                                    {latestCourse?.video_link && (
                                        <div className="video-play-overlay position-absolute top-50 start-50 translate-middle">
                                        </div>
                                    )}
                                </div>
                            )}
                            
                           
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;