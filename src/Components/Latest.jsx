import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import arrowRight from '../assets/arrowRight.svg';
import courseImage from '../assets/books.png';
import '../Components/css/Latest.css';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

function Latest() {
    const [gridItems, setGridItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLatestCourses();
    }, []);

    const fetchLatestCourses = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.get('latest-courses');
            
            if (response.data.success) {
                const data = response.data.data;
                
                // Transform API data to match our grid format
                const formattedItems = transformCoursesData(data);
                setGridItems(formattedItems);
            } else {
                throw new Error(response.data.message || 'Failed to fetch courses');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching latest courses:', err);
            setError('Failed to load courses. Please try again later.');
            setLoading(false);
        }
    };

    const transformCoursesData = (apiData) => {
        // Default fallback items
        const defaultItems = [
            {
                id: 1,
                title: "Special Mind Training (Recorded)",
                category: "Books",
                price: "5100 BDT",
                image: courseImage,
                type: "large-left",
                course_type: "book",
                url: "/book/1" // Book URL
            },
            {
                id: 2,
                title: "Digital Marketing Mastery",
                category: "Training",
                price: "4500 BDT",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
                type: "small-right-top",
                course_type: "online",
                url: "/training/Online-Courses/2" // Online course URL
            },
            {
                id: 3,
                title: "Python Programming Audio Series",
                category: "Audio",
                price: "3500 BDT",
                image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec9?w-600&h=400&fit=crop",
                type: "small-right-bottom-left",
                course_type: "video",
                url: "/training/Video-Courses/3" // Video course URL
            },
            {
                id: 4,
                title: "Data Science Video Course",
                category: "Video",
                price: "6500 BDT",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
                type: "small-right-bottom-right",
                course_type: "pdf",
                url: "/pdfs/4" // PDF URL
            }
        ];

        // If no API data, return default items
        if (!apiData || !apiData.courses || !Array.isArray(apiData.courses) || apiData.courses.length === 0) {
            return defaultItems;
        }

        // Map API courses to grid items
        const courses = apiData.courses.slice(0, 4); // Take first 4 courses
        const gridTypes = ["large-left", "small-right-top", "small-right-bottom-left", "small-right-bottom-right"];
        
        return courses.map((course, index) => ({
            id: course.id,
            title: course.title || "Course Title",
            category: course.category || getCategoryFromType(course.type),
            price: course.price ? `${course.price} BDT` : 'Free',
            image: course.image || getDefaultImage(index),
            type: gridTypes[index] || gridTypes[0],
            course_type: course.type || 'online',
            video_url: course.video_url || null,
            description: course.description || course.basic_info || "",
            date: course.date || null,
            duration: course.duration || '',
            url: course.url || getCourseUrl(course) // Use URL from API or generate it
        }));
    };

    const getCategoryFromType = (type) => {
        switch(type?.toLowerCase()) {
            case 'video':
            case 'video_course':
                return 'Video';
            case 'online':
            case 'online_course':
                return 'Training';
            case 'offline':
            case 'offline_course':
                return 'Workshop';
            case 'book':
                return 'Books';
            case 'pdf':
                return 'PDF';
            case 'audio':
                return 'Audio';
            default:
                return 'Books';
        }
    };

    const getDefaultImage = (index) => {
        const defaultImages = [
            courseImage,
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
            "https://images.unsplash.com/photo-1526379879527-8559ecfcaec9?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
        ];
        return defaultImages[index] || courseImage;
    };

    const getCourseUrl = (course) => {
        if (!course) return '#';
        
        const type = course.type?.toLowerCase();
        
        switch(type) {
            case 'online':
            case 'online_course':
                return `/training/Online-Courses/${course.id}`;
            
            case 'video':
            case 'video_course':
                return `/training/Video-Courses/${course.id}`;
            
            case 'offline':
            case 'offline_course':
                return `/training/Offline-Courses/${course.id}`;
            
            case 'book':
                return `/books/${course.id}`;
            
            case 'pdf':
                return `/pdfs/${course.id}`;
            
            case 'audio':
                return `/audio/${course.id}`;
            
            default:
                return `/training/Online-Courses/${course.id}`;
        }
    };

    // Skeleton loader
    const renderSkeleton = () => {
        return (
            <div className="latest-section">
                <div className="container">
                    {/* Title Section Skeleton */}
                    <div className="text-center">
                        <Skeleton 
                            height={50} 
                            width="60%" 
                            className="mb-3 mt-5 mx-auto" 
                            style={{ borderRadius: '8px' }}
                        />
                        <Skeleton 
                            height={20} 
                            width="80%" 
                            className="mb-5 mx-auto" 
                            style={{ borderRadius: '4px' }}
                        />
                    </div>

                    {/* Grid Skeleton */}
                    <div className="latest-grid-container">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className={`latest-grid-item ${item === 1 ? 'large-left' : item === 2 ? 'small-right-top' : item === 3 ? 'small-right-bottom-left' : 'small-right-bottom-right'}`}>
                                <div className="latest-grid-card">
                                    <div className="h-100 d-flex flex-column">
                                        <Skeleton 
                                            height={item === 1 ? 300 : 180} 
                                            width="100%" 
                                            style={{ borderRadius: '8px 8px 0 0' }}
                                        />
                                        
                                        <div className="latest-grid-content">
                                            <Skeleton height={20} width="30%" className="mb-2" />
                                            <Skeleton height={25} width="100%" className="mb-2" />
                                            <Skeleton height={20} width="40%" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Error display
    const renderError = () => {
        return (
            <div className="latest-section">
                <div className="container">
                    <div className="text-center">
                        <h2 className="courses-title mt-5">Books, Training, Audio and Video Courses</h2>
                        <p className="courses-subtitle">
                            Books, training sessions, audio programs, and video courses designed to educate, develop skills, and enhance personal or professional growth effectively.
                        </p>
                    </div>

                    <div className="text-center my-5">
                        <p className="text-danger mb-3">{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={fetchLatestCourses}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Use default items if loading failed
    const displayItems = error ? [] : gridItems;

    if (loading) {
        return renderSkeleton();
    }

    if (error && displayItems.length === 0) {
        return renderError();
    }

    return (
        <div className="latest-section">
            <div className="container">
                {/* Title Section */}
                <div className="text-center">
                    <h2 className="courses-title mt-5">Books, Training, Audio and Video Courses</h2>
                    <p className="courses-subtitle">
                        Books, training sessions, audio programs, and video courses designed to educate, develop skills, and enhance personal or professional growth effectively.
                    </p>
                </div>

                {/* Grid Container */}
                <div className="latest-grid-container">
                    {displayItems.map(item => (
                        <div key={item.id} className={`latest-grid-item ${item.type}`}>
                            <div className="latest-grid-card">
                                <div className="h-100 d-flex flex-column">
                                    <div className="latest-grid-image-container">
                                        <img 
                                            src={item.image} 
                                            alt={item.title}
                                            className="latest-grid-image"
                                            onError={(e) => {
                                                e.target.src = getDefaultImage(0);
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="latest-grid-content">
                                        <div className="d-flex flex-column h-100">
                                            <div className="flex-grow-1">
                                                <span className="book-badge2">{item.category}</span>
                                                
                                                {/* Main content row */}
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    {/* Left side: Title and Price in column */}
                                                    <div className="flex-grow-1 me-3">
                                                        <h3 className="book-title mb-1">{item.title}</h3>
                                                        <p className="book-price mb-0">{item.price}</p>
                                                    </div>
                                                    
                                                    {/* Right side: Button - Always on right */}
                                                    <div className="flex-shrink-0">
                                                        <Link 
                                                            to={item.url || getCourseUrl(item)}
                                                            className="coursesbtn d-flex align-items-center justify-content-center"
                                                        >
                                                            <img src={arrowRight} alt="arrow" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Latest;