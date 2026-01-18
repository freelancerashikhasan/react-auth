import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import {
  Calendar,
  Clock,
  Users,
  Star,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  ChevronRight,
  PlayCircle,
  Award,
  CheckCircle,
  BookOpen,
  FileText,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Headphones,
  Globe,
  Video as VideoIcon,
  MessageSquare,
  ThumbsUp,
  Eye,
  Bookmark,
  Download,
  User,
  Phone,
  Mail,
  Lock,
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import '../css/TrainingDetails.css';
import Layout from '../Layout/Layout';
import AuthContext from '../context/AuthContext';
import bkash from '../assets/bkash.png';
import ssl from '../assets/ssl.png';
import toast from 'react-hot-toast';
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
const TrainingDetails = () => {
  const [training, setTraining] = useState(null);
  const [relatedTrainings, setRelatedTrainings] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [commentForm, setCommentForm] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  // Check if user is already enrolled in this training
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [videoGridLayout, setVideoGridLayout] = useState([]);
  const { pathname } = useLocation();
   const currentPath = encodeURIComponent(location.pathname + location.search);
  useEffect(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth', // remove if you want instant
      });
    }, [pathname]);
  useEffect(() => {
    fetchTrainingDetails();
    checkBookmarkStatus();
    checkEnrollmentStatus();
  }, [type, id, user]);

  useEffect(() => {
    if (training?.videos?.length > 0) {
      const layouts = [
        ['landscape', 'portrait', 'portrait'],
        ['portrait', 'landscape', 'square'],
        ['square', 'portrait', 'landscape'],
        ['landscape', 'square', 'landscape'],
      ];
      
      // Cycle through layouts for a dynamic look
      const videosWithLayout = training.videos.map((video, index) => {
        const layoutCycle = layouts[index % layouts.length];
        const size = layoutCycle[index % layoutCycle.length];
        
        return {
          ...video,
          layoutSize: size,
          aspectRatio: size === 'landscape' ? 16/9 : 
                      size === 'portrait' ? 9/16 : 
                      size === 'square' ? 1 : 4/3
        };
      });
      
      setVideoGridLayout(videosWithLayout);
    }
  }, [training?.videos]);


  const fetchTrainingDetails = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.get(`/training/${type}/${id}`);
      
      if (response.data.success) {
        const data = response.data.data;
        data.type = type;
        
        if (data.video_url) {
          data.youtube_id = extractYouTubeId(data.video_url);
        }
        
        setTraining(data);
        setRelatedTrainings(response.data.related || []);
      }
      
      const commentsResponse = await axiosInstance.get(`/training/${type}/${id}/comments`);
      if (commentsResponse.data.success) {
        setComments(commentsResponse.data.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching training details:', error);
      setLoading(false);
    }
  };

  const checkBookmarkStatus = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(id));
  };

  const checkEnrollmentStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`/enrollment/check/${type}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setIsEnrolled(response.data.enrolled);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axiosInstance.post(`/training/${type}/${id}/comments`, {
        name: commentForm.name,
        phone: commentForm.phone,
        comment: commentForm.message
      });
      
      if (response.data.success) {
        alert('Comment submitted successfully! Waiting for approval.');
        setCommentForm({ name: '', phone: '', message: '' });
        
        const commentsResponse = await axiosInstance.get(`/training/${type}/${id}/comments`);
        if (commentsResponse.data.success) {
          setComments(commentsResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      localStorage.setItem('returnUrl', window.location.pathname);
      navigate(`/login?redirectUrl=${currentPath}`);
      return;
    }
    
    setEnrollmentLoading(true);
    
    try {
      // Convert frontend type to backend type
      const typeMap = {
        'offline-course': 'Offline-Courses',
        'offline_course': 'Offline-Courses',
        'online-course': 'Online-Courses',
        'online_course': 'Online-Courses',
        'video-course': 'Video-Courses',
        'video_course': 'Video-Courses'
      };
      
      const formData = {
        training_id: parseInt(id),
        training_type: typeMap[type] || type,
        payment_method: paymentMethod,
      };
      
      
      const response = await axiosInstance.post('/enroll', formData);
      
      if (response.data.success) {

        
        // Check if already enrolled
        if (response.data.already_enrolled) {
            toast.error(response.data.message || 'You are already enrolled in this course!');
          
          if (response.data.redirectUrl) {
            navigate(response.data.redirectUrl);
          } else {
            navigate('/dashboard');
          }
          
          setShowEnrollmentForm(false);
          return;
        }
        
        setEnrollmentSuccess(true);
        setIsEnrolled(true);
        
        // Handle payment redirect
        let paymentUrl = null;
        
        // New consistent format: response.data.payment_url
        if (response.data.payment_url) {
          paymentUrl = response.data.payment_url;
          console.log('Payment URL found:', paymentUrl);
        }
        // Old format fallback (if you still have some old responses)
        else if (response.data.redirectUrl?.payment_url) {
          paymentUrl = response.data.redirectUrl.payment_url;
        } else if (response.data.redirectUrl?.bkashURL) {
          paymentUrl = response.data.redirectUrl.bkashURL;
        }
        
        if (paymentUrl) {
          setPaymentUrl(paymentUrl);
          
          // Open payment in new tab
          setTimeout(() => {
            window.open(paymentUrl, '_blank');
          }, 500);
        } else {
          setTimeout(() => {
            setShowEnrollmentForm(false);
            setEnrollmentSuccess(false);
            
            // Redirect to courses page
            if (response.data.redirectUrl) {
              navigate(response.data.redirectUrl);
            } else {
              navigate('dashboard');
            }
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        logout();
        navigate(`/login?redirectUrl=${currentPath}`);
      } else if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        if (typeof errorData === 'string') {
          alert(errorData);
        } else if (typeof errorData === 'object') {
          // Join all error messages
          const messages = [];
          Object.values(errorData).forEach(err => {
            if (Array.isArray(err)) {
              messages.push(...err);
            } else {
              messages.push(err);
            }
          });
          alert(messages.join('\n'));
        }
      } else {
        alert('Failed to process enrollment. Please try again.');
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTrainingTypeIcon = (type) => {
    switch(type) {
      case 'offline-course':
      case 'offline_course':
        return <Users className="type-icon" size={20} />;
      case 'online-course':
      case 'online_course':
        return <Globe className="type-icon" size={20} />;
      case 'video-course':
      case 'video_course':
        return <VideoIcon className="type-icon" size={20} />;
      default:
        return <BookOpen className="type-icon" size={20} />;
    }
  };

  const getTrainingTypeLabel = (type) => {
    switch(type) {
      case 'offline-course':
      case 'offline_course':
        return 'Offline Training';
      case 'online-course':
      case 'online_course':
        return 'Live Online';
      case 'video-course':
      case 'video_course':
        return 'Video Course';
      default:
        return 'Training';
    }
  };

  const getTrainingTypeColor = (type) => {
    switch(type) {
      case 'offline-course':
      case 'offline_course':
        return '#3b82f6';
      case 'online-course':
      case 'online_course':
        return '#10b981';
      case 'video-course':
      case 'video_course':
        return '#ef4444';
      default:
        return '#8b5cf6';
    }
  };

  const shareOnSocialMedia = (platform) => {
    const url = window.location.href;
    const title = training?.title || '';
    const text = `Check out this amazing training: "${title}" by Sabit International`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      instagram: `https://www.instagram.com/`,
      youtube: 'https://www.youtube.com/@sabitinternational'
    };
    
    if (platform === 'youtube') {
      window.open(shareUrls.youtube, '_blank');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(b => b !== id);
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      alert('Removed from bookmarks');
    } else {
      bookmarks.push(id);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      alert('Added to bookmarks');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />);
      } else {
        stars.push(<Star key={i} size={18} color="#4b5563" />);
      }
    }
    
    return stars;
  };

  const renderEnrollmentButton = () => {
    if (isEnrolled) {
      return (
        <div className="enrollment-status enrolled text-left">
          <CheckCircle size={20} />
          <span>You are enrolled in this training</span>
          <Link to="/dashboard" className="view-course-btn">
            View Course
            <ChevronRight size={16} />
          </Link>
        </div>
      );
    }

    if (training?.booking_status === 0) {
      return (
        <button 
          onClick={() => setShowEnrollmentForm(true)}
          className="enroll-button primary"
        >
          <Zap size={20} />
          {isAuthenticated ? 'Enroll Now' : 'Login to Enroll'}
          <ChevronRight size={20} />
        </button>
      );
    } else {
      return (
        <div className="registration-closed">
          <span>Registration Closed</span>
          <p>This training is no longer accepting enrollments</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="training-details">
          <div className="container">
            <div className="skeleton-details">
              <div className="skeleton-hero"></div>
              <div className="skeleton-content"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!training) {
    return (
      <Layout>
        <div className="training-not-found">
          <div className="container">
            <div className="not-found-content">
              <div className="not-found-icon">
                <Target size={64} />
              </div>
              <h2>Training Not Found</h2>
              <p>The training you're looking for doesn't exist or has been removed.</p>
              <a  className="btn-primary" disabled>
                <ChevronRight size={20} />
                Browse All Trainings
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const price = training.price ? `${training.price} BDT` : 'Gift Mind Training';
  const typeColor = getTrainingTypeColor(type);
  const isFree = !training.price || training.price === 0;

  return (
    <Layout>
      <div className="training-details">
        {/* Hero Section */}
        <section className="training-hero-detail">
          <div className="hero-gradient-bg"></div>
          <div className="container">
            <nav className="breadcrumb">
              <Link to="/" className="breadcrumb-link">
                <Zap size={14} />
                Home
              </Link>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <a className="breadcrumb-link" disabled>
                <Target size={14} />
                Trainings
              </a>
              <ChevronRight size={14} className="breadcrumb-separator" />
              <span className="current">
                <Sparkles size={14} />
                {training.title}
              </span>
            </nav>
            
            <div className="hero-content">
              <div className="training-media-section">
                <div className="training-image-container">
                  <img 
                    src={training.image || '/default-training.jpg'}
                    alt={training.title}
                    className={`training-main-image ${imageLoaded ? 'loaded' : 'loading'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      e.target.src = '/default-training.jpg';
                      setImageLoaded(true);
                    }}
                  />
                  {!imageLoaded && <div className="image-skeleton"></div>}
                  
                  {/* Quick Actions */}
                 
                </div>
                
                {/* YouTube Video Section */}
                {training.video_link && (
                  <div className="video-preview-section">
                  
                      <div className="video-thumbnail">
                        <iframe
                          width="100%"
                          height="500"
                          src={training.video_link}
                          title="Training Introduction"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                )}
              </div>

              
              
              <div className="training-info">
                <div className="training-header">
                  <h1 className="training-title">
                    <span className="title-text">{training.title}</span>
                    {training.booking_status === 0 && (
                      <span className="availability-badge available">
                        <CheckCircle size={16} />
                        Registration Open
                      </span>
                    )}
                   
                  </h1>
                  
                  <div className="training-meta-stats">
                    <div className="meta-stat">
                      <Users size={18} />
                      <span className="stat-label">Participants</span>
                      <span className="stat-value">100+</span>
                    </div>
                    <div className="meta-stat">
                      <TrendingUp size={18} />
                      <span className="stat-label">Success Rate</span>
                      <span className="stat-value">98%</span>
                    </div>
                    <div className="meta-stat">
                      <Award size={18} />
                      <span className="stat-label">Certification</span>
                      <span className="stat-value">Yes</span>
                    </div>
                  </div>
                </div>
                
                <div className="training-description-preview">
                  <p>
                    {training?.basic_info?.length > 200
                      ? training.basic_info.substring(0, 200) + '...'
                      : training?.basic_info}
                  </p>

                </div>
                
                <div className="training-features">
                  <div className="feature">
                    <Shield size={20} />
                    <span>Lifetime Access</span>
                  </div>
                  <div className="feature">
                    <Headphones size={20} />
                    <span>24/7 Support</span>
                  </div>
                
                </div>
                
                  {training.deadline && (
                  <div className="training-schedule">
                    
                    <div className="schedule-item">
                      <Calendar size={20} />
                      <div>
                        <span className="schedule-label">Training Date</span>
                        <span className="schedule-value">{formatDate(training.deadline)}</span>
                      </div>
                    </div>
                    </div>
                  )}
                  {training.date && (
                    <div className="training-schedule">

                    <div className="schedule-item">
                      <Calendar size={20} />
                      <div>
                        <span className="schedule-label">Training Date</span>
                        <span className="schedule-value">{formatDate(training.date)}</span>
                      </div>
                    </div>
                    </div>
                  )}
                  
                  {training.duration && (
                    
                    <div className="schedule-item">
                      <Clock size={20} />
                      <div>
                        <span className="schedule-label">Duration</span>
                        <span className="schedule-value">{training.duration}</span>
                      </div>
                    </div>
                  )}
                
                <div className="training-price-section">
                  <div className="price-main">
                    <div className="price-amount-wrapper">
                      <span className="price-amount">{price}</span>
                      {training.original_price && training.original_price > training.price && (
                        <span className="original-price">
                          <del>{training.original_price} BDT</del>
                          <span className="discount-badge">
                            Save {Math.round((1 - training.price/training.original_price) * 100)}%
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {training.id === 26 && (
                    <div className="booking-info">
                      <span className="booking-label">Booking Amount</span>
                      <span className="booking-amount">25,000 BDT</span>
                    </div>
                  )}
                  
                  <div className="enrollment-actions">
                    {renderEnrollmentButton()}
                  </div>
                  
                  <div className="social-share-section">
                    <div className="social-share">
                      <span className="share-label">Share this training:</span>
                      <div className="social-icons">
                        <button onClick={() => shareOnSocialMedia('facebook')} className="social-icon facebook">
                          <Facebook size={20} />
                        </button>
                        <button onClick={() => shareOnSocialMedia('whatsapp')} className="social-icon whatsapp">
                          <MessageCircle size={20} />
                        </button>
                        <button onClick={() => shareOnSocialMedia('twitter')} className="social-icon twitter">
                          <Twitter size={20} />
                        </button>
                        <button onClick={() => shareOnSocialMedia('instagram')} className="social-icon instagram">
                          <Instagram size={20} />
                        </button>
                        <button onClick={() => shareOnSocialMedia('youtube')} className="social-icon youtube">
                          <Youtube size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {training.videos && training.videos.length > 0 && (
                <section className="video-poster-collage">
                  <div className="container">
                    <div className="collage-header">
                      <div className="collage-title-section">
                        <h2>
                          <Sparkles size={28} />
                          <span>Video Gallery</span>
                        </h2>
                      </div>
                      <div className="collage-stats">
                        <div className="stat-item">
                          <VideoIcon size={20} />
                          <span>{training.videos.length} Videos</span>
                        </div>
                      </div>
                    </div>
                    
                  
                    {/* Video Grid Layout */}
                    {training.videos.length > 1 && (
                      <div className="">
                        <div className="video-posters-grid">
                          {training.videos.map((video, index) => (
                            <div 
                              key={video.id}
                              style={{
                                animationDelay: `${index * 0.1}s`
                              }}
                            >
                              <div className="poster-container">
                                <div className="poster-thumbnail">
                                  {video.poster ? (
                                    <img 
                                      src={video.poster} 
                                      alt={video.title}
                                      className="poster-img"
                                    />
                                  ) : (
                                    <div className="thumbnail-fallback">
                                      <PlayCircle size={32} />
                                    </div>
                                  )}
                                  
                                 
                                  
                                  <div className="poster-overlay"></div>
                                </div>
                                
                                <div className="poster-details">
                                  <div className="video-sequence">
                                    <div className="sequence-indicator">
                                      <span>{String(index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <h4 className="video-name">{video.title}</h4>
                                  </div>
                                 
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

        {/* Tabs Section */}
        <section className="training-tabs-section">
          <div className="container">
            <div className="tabs-navigation">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
                style={{ '--active-color': typeColor }}
              >
                <BookOpen size={18} />
                Description
              </button>
             
              <button 
                className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
                style={{ '--active-color': typeColor }}
              >
                <MessageSquare size={18} />
                Comments ({comments.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                onClick={() => setActiveTab('faq')}
                style={{ '--active-color': typeColor }}
              >
                <MessageCircle size={18} />
                FAQ
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="description-content">
                  <div className="description-header">
                    <h2>About This Training</h2>
                    <div className="description-meta">
                      <span className="meta-item">
                        <Clock size={16} />
                        {training.duration || 'Flexible'}
                      </span>
                      <span className="meta-item">
                        <Users size={16} />
                        Suitable for All Levels
                      </span>
                    </div>
                  </div>
                  
                  <div 
                    className="description-body"
                    dangerouslySetInnerHTML={{ __html: training.basic_info || 'No description available.' }}
                  />
                  
                  {training.video_link && (
                    <div className="video-section">
                      <div className="video-section-header">
                        <h3>
                          <PlayCircle size={24} />
                          Watch Training Introduction
                        </h3>
                      </div>
                      <div className="video-embed">
                        <iframe
                          width="100%"
                          height="400"
                          src={training.video_link}
                          title="Training Introduction"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                  
                  {training.id === 27 && (
                    <div className="special-note">
                      <div className="special-note-icon">
                        <Sparkles size={24} />
                      </div>
                      <div className="special-note-content">
                        <h4>Gift Mind Training</h4>
                        <p>This is a special gift mind training program designed for personal transformation and spiritual growth.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
         
              
              {activeTab === 'comments' && (
                <div className="comments-section">
                  <div className="comment-form-section">
                    <h3>Share Your Thoughts</h3>
                    <p>Your feedback helps others make better decisions</p>
                    <form onSubmit={handleCommentSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            placeholder="Your Name *"
                            value={commentForm.name}
                            onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="tel"
                            placeholder="Phone Number *"
                            value={commentForm.phone}
                            onChange={(e) => setCommentForm({...commentForm, phone: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <textarea
                          placeholder="Write your comment here... *"
                          value={commentForm.message}
                          onChange={(e) => setCommentForm({...commentForm, message: e.target.value})}
                          rows="4"
                          required
                        />
                      </div>
                      <button type="submit" className="submit-comment-btn">
                        <MessageSquare size={18} />
                        Submit Comment
                        <ChevronRight size={16} />
                      </button>
                    </form>
                  </div>
                  
                  <div className="comments-list-section">
                    <h3>What Others Are Saying</h3>
                    {comments.length > 0 ? (
                      <div className="comments-list">
                        {comments.map(comment => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                              {comment.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="comment-content">
                              <div className="comment-header">
                                <div className="comment-author">
                                  <span className="author-name">{comment.name}</span>
                                  <span className="comment-date">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="comment-rating">
                                  {renderStars(5)}
                                </div>
                              </div>
                              <div className="comment-body">
                                <p>{comment.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-comments">
                        <MessageSquare size={48} />
                        <h4>No comments yet</h4>
                        <p>Be the first to share your thoughts!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'faq' && (
                <div className="faq-content">
                  <h2>Frequently Asked Questions</h2>
                  <div className="faq-list">
                    {[
                      {
                        question: "What is the refund policy?",
                        answer: "We offer a 30-day money-back guarantee if you're not satisfied with the training."
                      },
                      {
                        question: "Do I need any prerequisites?",
                        answer: "No prerequisites required. This training is suitable for all levels."
                      },
                      {
                        question: "Will I get a certificate?",
                        answer: "Yes, you'll receive a completion certificate after finishing the training."
                      },
                      {
                        question: "How long do I have access to the materials?",
                        answer: "You get lifetime access to all training materials and updates."
                      },
                      {
                        question: "Is there any support after training?",
                        answer: "Yes, we provide 24/7 support and access to our community forum."
                      }
                    ].map((faq, index) => (
                      <div key={index} className="faq-item">
                        <div className="faq-question">
                          <span>Q: {faq.question}</span>
                          <ChevronRight size={20} />
                        </div>
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Trainings */}
        {relatedTrainings.length > 0 && (
          <section className="related-trainings">
            <div className="container">
              <div className="section-header">
                <h2>
                  <Sparkles size={28} />
                  You May Also Like
                </h2>
                <Link to="/trainings" className="view-all">
                  View All Trainings
                  <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="related-grid">
                {relatedTrainings.map(related => {
                  const relatedTypeColor = getTrainingTypeColor(related.type);
                  
                  return (
                    <div key={related.id} className="related-card">
                      <div className="related-image">
                        <img 
                          src={related.image}
                          alt={related.title}
                        />
                        <div className="related-overlay">
                          <Link 
                            to={`/training/${related.type}/${related.id}`}
                            className="quick-view-btn"
                          >
                            <Eye size={20} />
                            Quick View
                          </Link>
                        </div>
                      </div>
                      <div className="related-content">
                        <h3>{related.title}</h3>
                        <div className="related-meta">
                          {related.deadline && (
                            <span className="meta-item">
                              <Calendar size={14} />
                              {formatDate(related.deadline)}
                            </span>
                          )}
                          <span className="meta-item price">
                            {related.price ? `${related.price} BDT` : 'Free'}
                          </span>
                        </div>
                        <div className="related-actions">
                          <Link 
                            to={`/training/${related.type}/${related.id}`}
                            className="related-link"
                          >
                            View Details
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Enrollment Form Modal */}
        {showEnrollmentForm && (
          <div className="enrollment-modal-overlay">
            <div className="enrollment-modal">
              <button 
                className="close-enrollment-modal"
                onClick={() => setShowEnrollmentForm(false)}
              >
                <X size={24} />
              </button>
              
              {enrollmentSuccess ? (
                <div className="enrollment-success">
                  <div className="success-icon">
                    <CheckCircle size={64} />
                  </div>
                  <h3>Enrollment Successful!</h3>
                  <p>Thank you for enrolling in {training.title}.</p>
                  {paymentUrl ? (
                    <>
                      <p>Redirecting to payment...</p>
                      <div className="payment-redirect">
                        <Loader2 size={24} className="spinner" />
                        <span>Please wait while we redirect you to the payment page.</span>
                      </div>
                    </>
                  ) : (
                    <p>Our team will contact you shortly with further details.</p>
                  )}
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setShowEnrollmentForm(false);
                      setEnrollmentSuccess(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="enrollment-form-container">
                  <div className="enrollment-header">
                    <h2>
                      <Zap size={24} />
                      Enroll in {training.title}
                    </h2>
                    <p>Complete your enrollment to secure your spot</p>
                  </div>
                  
                  {!isAuthenticated ? (
                    <div className="login-required">
                      <div className="login-alert">
                        <AlertCircle size={48} />
                        <h4>Login Required</h4>
                        <p>You need to log in to enroll in this training.</p>
                      </div>
                      <div className="login-actions">
                        <Link 
                         to={`/login?redirectUrl=${currentPath}`}
                          className="btn-primary"
                          onClick={() => localStorage.setItem('returnUrl', window.location.pathname)}
                        >
                          <Lock size={20} />
                          Login Now
                        </Link>
                        <Link to="/register" className="btn-secondary">
                          <User size={20} />
                          Register
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleEnrollmentSubmit} className="enrollment-form">
                      <div className="training-summary">
                        <h4>Training Summary</h4>
                        <div className="summary-details">
                          <div className="summary-item">
                            <span className="summary-label">Training:</span>
                            <span className="summary-value">{training.title}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Date:</span>
                            <span className="summary-value">{formatDate(training.deadline)}</span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-label">Price:</span>
                            <span className="summary-value price-value">{price}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!isFree && (
                        <div className="payment-methods-section">
                          <h4>Select Payment Method</h4>
                          <p>Choose how you would like to pay</p>
                          
                          <div className="payment-methods-grid" >
                            <label className={`payment-method-card ${paymentMethod === 'bkash' ? 'selected' : ''}`} 
                               style={{
                                    backgroundImage: `url(${bkash})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'left',
                                }}
                            >
                              <input
                                type="radio"
                                name="payment_method"
                                value="bkash"
                                checked={paymentMethod === 'bkash'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                             
                            </label>
                            
                            <label className={`payment-method-card ${paymentMethod === 'ssl' ? 'selected' : ''}`}
                               style={{
                                backgroundImage: `url(${ssl})`,
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                              }}

                            >
                              <input
                                type="radio"
                                name="payment_method"
                                value="ssl"
                                checked={paymentMethod === 'ssl'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                             
                            </label>
                            
                           
                          </div>
                        </div>
                      )}
                      
                      <div className="enrollment-terms">
                        <label className="terms-checkbox">
                          <input type="checkbox" required />
                          <span>I agree to the Terms & Conditions and Privacy Policy</span>
                        </label>
                      </div>
                      
                      <div className="enrollment-form-actions">
                        <button 
                          type="submit" 
                          className="submit-enrollment-btn"
                          disabled={enrollmentLoading}
                        >
                          {enrollmentLoading ? (
                            <>
                              <Loader2 size={20} className="spinner" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap size={20} />
                              {isFree ? 'Complete Enrollment' : 'Proceed to Payment'}
                              <ChevronRight size={20} />
                            </>
                          )}
                        </button>
                        
                        <button 
                          type="button" 
                          className="cancel-enrollment-btn"
                          onClick={() => setShowEnrollmentForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && training.youtube_id && (
          <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}>
            <div className="video-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="close-video-modal"
                onClick={() => setShowVideoModal(false)}
              >
                <X size={24} />
              </button>
              <div className="video-modal-content">
                <iframe
                  width="100%"
                  height="500"
                  src={`https://www.youtube.com/embed/${training.youtube_id}?autoplay=1`}
                  title={training.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrainingDetails;