import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import courseImage from '../assets/container.png';
import arrowRight from '../assets/arrowRight.svg';
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const Courses = () => {
    // Filter categories based on your API data structure
    const filters = ['All', 'Offline Trainings', 'Online Trainings', 'Video Courses'];
     const navigate = useNavigate(); 
    // State for API data
    const [apiData, setApiData] = useState({
        offline_courses: [],
        online_courses: [],
        video_courses: [],
        books: [],
        pdfs: [],
        latest_book: null,
        latest_seminar: null
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.get('courses');
            
            if (response.data.success) {
                setApiData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch courses');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses. Please try again later.');
            setLoading(false);
        }
    };

    // Combine all courses for processing
    const getAllCourses = () => {
        const allCourses = [];
        
        // Add offline courses
        if (apiData.offline_courses && apiData.offline_courses.length > 0) {
            allCourses.push(...apiData.offline_courses.map(course => ({
                ...course,
                category: 'Offline Trainings'
            })));
        }
        
        // Add online courses
        if (apiData.online_courses && apiData.online_courses.length > 0) {
            allCourses.push(...apiData.online_courses.map(course => ({
                ...course,
                category: 'Online Trainings'
            })));
        }
        
        // Add video courses
        if (apiData.video_courses && apiData.video_courses.length > 0) {
            allCourses.push(...apiData.video_courses.map(course => ({
                ...course,
                category: 'Video Courses'
            })));
        }
        
        // Add books (if you want to include them)
        if (apiData.books && apiData.books.length > 0) {
            allCourses.push(...apiData.books.map(book => ({
                ...book,
                category: 'Books'
            })));
        }
        
        // Add PDFs (if you want to include them)
        if (apiData.pdfs && apiData.pdfs.length > 0) {
            allCourses.push(...apiData.pdfs.map(pdf => ({
                ...pdf,
                category: 'PDFs'
            })));
        }
        
        return allCourses;
    };

    // Group courses by category for "All" view
    const getGroupedCourses = () => {
        const allCourses = getAllCourses();
        
        return {
            'Offline Trainings': allCourses.filter(course => course.category === 'Offline Trainings'),
            'Online Trainings': allCourses.filter(course => course.category === 'Online Trainings'),
            'Video Courses': allCourses.filter(course => course.category === 'Video Courses'),
            'Books': allCourses.filter(course => course.category === 'Books'),
            'PDFs': allCourses.filter(course => course.category === 'PDFs')
        };
    };

    // Handle filter click
    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    // Get courses based on active filter
    const getFilteredCourses = () => {
        if (activeFilter === 'All') {
            return getGroupedCourses();
        }
        
        // For specific filters, get from API data directly
        switch (activeFilter) {
            case 'Offline Trainings':
                return {
                    [activeFilter]: apiData.offline_courses?.map(course => ({
                        ...course,
                        category: 'Offline Trainings'
                    })) || []
                };
            case 'Online Trainings':
                return {
                    [activeFilter]: apiData.online_courses?.map(course => ({
                        ...course,
                        category: 'Online Trainings'
                    })) || []
                };
            case 'Video Courses':
                return {
                    [activeFilter]: apiData.video_courses?.map(course => ({
                        ...course,
                        category: 'Video Courses'
                    })) || []
                };
            case 'Books':
                return {
                    [activeFilter]: apiData.books?.map(book => ({
                        ...book,
                        category: 'Books'
                    })) || []
                };
            case 'PDFs':
                return {
                    [activeFilter]: apiData.pdfs?.map(pdf => ({
                        ...pdf,
                        category: 'PDFs'
                    })) || []
                };
            default:
                return {};
        }
    };

    // Strip HTML tags from description for display
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...';
    };

    // Skeleton loader component
    const renderSkeleton = () => {
        return (
            <div className="courses-container">
                {filters.slice(1).map((category) => (
                    <div key={category} className="mb-5">
                        {/* Category Title Skeleton */}
                        {activeFilter === 'All' && (
                            <Skeleton 
                                height={30} 
                                width={200} 
                                className="mb-4" 
                                style={{ borderRadius: '8px' }}
                            />
                        )}
                        
                        {/* Courses Grid Skeleton */}
                        <div className="row g-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4">
                                    <div className="coursescards h-100 d-flex flex-column">
                                        {/* Course Image Skeleton */}
                                        <div className="coursesimage-container position-relative">
                                            <Skeleton 
                                                height={200} 
                                                className="w-100" 
                                                style={{ borderRadius: '12px 12px 0 0' }}
                                            />
                                        </div>
                                      
                                        {/* Card Body Skeleton */}
                                        <div className="card-body d-flex flex-column p-3">
                                            <div className="row g-0 align-items-center h-100">
                                                {/* Left content skeleton */}
                                                <div className="col-10">
                                                    <Skeleton 
                                                        height={20} 
                                                        width={120} 
                                                        className="mb-2" 
                                                        style={{ borderRadius: '4px' }}
                                                    />
                                                    <Skeleton 
                                                        height={24} 
                                                        className="mb-2" 
                                                        style={{ borderRadius: '4px' }}
                                                    />
                                                    <Skeleton 
                                                        height={20} 
                                                        width={80} 
                                                        style={{ borderRadius: '4px' }}
                                                    />
                                                </div>

                                                {/* Right arrow button skeleton */}
                                                <div className="col-2 d-flex align-items-center justify-content-end">
                                                    <Skeleton 
                                                        circle 
                                                        height={40} 
                                                        width={40} 
                                                        style={{ borderRadius: '50%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render course card
    const renderCourseCard = (course) => {
        return (
            <div key={course.id} onClick={() => navigate(`/training/${course.category.replace(/\s+/g, '-')}/${course.id}`)} className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4" id='offline_course'>
                <div className="coursescards h-100 d-flex flex-column">
                    {/* Course Image Container */}
                    <div className="coursesimage-container position-relative">
                        <img 
                            src={course.image || courseImage} 
                            alt={course.title}
                            className="coursesimage"
                            onError={(e) => {
                                e.target.src = courseImage;
                            }}
                        />
                    </div>
                  
                    {/* Card Body */}
                    <div className="card-body d-flex flex-column">
                        <div className="row g-0 align-items-center h-100">
                            {/* Left content */}
                            <div className="col-10">
                                <p className="coursesbadge mb-1">{course.category}</p>
                                <h5 className="coursestitle mb-1">
                                    {course.title.length > 40
                                        ? course.title.slice(0, 40) + '...'
                                        : course.title}
                                </h5>
                                <h5 className="coursesprice mb-0">{course.price}</h5>
                            </div>

                            {/* Right arrow button */}
                            <div className="col-2 d-flex align-items-center justify-content-end">
                                <button className="coursesbtn d-flex align-items-center justify-content-center">
                                    <img src={arrowRight} alt="arrow" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="py-5 courses-section">
            <div className="container py-2">
                <div className="text-center mb-5">
                    <span className="courses-badge mb-5">Shop</span>
                    <h2 className="courses-title mt-5">Explore products & <br />
                        programs</h2>
                    <p className="courses-subtitle">
                        Unlock the power of every moment with tools from the world's most acclaimed personal growth program.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="row mb-5">
                    <div className="col-12 mt-5">
                        <div className="d-flex flex-wrap justify-content-start gap-3">
                            {loading ? (
                                // Filter buttons skeleton
                                <>
                                    {[1, 2, 3, 4].map((item) => (
                                        <Skeleton 
                                            key={item}
                                            height={40} 
                                            width={120} 
                                            style={{ borderRadius: '20px' }}
                                        />
                                    ))}
                                </>
                            ) : (
                                filters.map((filter) => (
                                    <button
                                        key={filter}
                                        className={`btn ${activeFilter === filter ? 'filter-active' : 'filter-inactive'}`}
                                        onClick={() => handleFilterClick(filter)}
                                        disabled={loading}
                                    >
                                        {filter}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                        <button 
                            className="btn btn-link p-0 ms-2" 
                            onClick={fetchCourses}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading Skeleton or Courses Grid */}
                {loading ? (
                    renderSkeleton()
                ) : (
                    <div className="courses-container">
                        {Object.entries(getFilteredCourses()).map(([category, categoryCourses]) => {
                            // Only show category if it has courses or if it's "All" view
                            if (!categoryCourses || categoryCourses.length === 0) {
                                return null;
                            }
                            
                            return (
                                <div key={category} className="mb-5">
                                    {/* Category Title */}
                                    {activeFilter === 'All' && (
                                        <h3 className="mb-4 pb-2 category-title">{category}</h3>
                                    )}
                                    
                                    {/* Courses Grid */}
                                    <div className="row g-4">
                                        {categoryCourses.map(renderCourseCard)}
                                    </div>
                                </div>
                            );
                        })}

                        {/* No Courses Message */}
                        {Object.values(getFilteredCourses()).every(arr => !arr || arr.length === 0) && (
                            <div className="text-center py-5">
                                <div className="mb-4">
                                    <i className="bi bi-book fs-1 text-muted"></i>
                                </div>
                                <h4 className="text-white">No courses available</h4>
                                <p className="text-white">Check back soon for new courses!</p>
                            </div>
                        )}
                    </div>
                )}

               
            </div>
        </section>
    );
};

export default Courses;