import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle, 
  Download, 
  Home, 
  Video, 
  Calendar, 
  Clock,
  Users,
  Award,
  Share2,
  PlayCircle,
  BookOpen,
  Zap,
  Sparkles,
  Trophy,
  ThumbsUp,
  MessageCircle,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Layout from '../Layout/Layout';
import '../css/TrainingSuccess.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const TrainingSuccess = () => {
  const { type, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [training, setTraining] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingMaterials, setDownloadingMaterials] = useState(false);
  
  // Get data from location state if redirected from enrollment
  const enrollmentData = location.state?.enrollmentData;
  const message = location.state?.message;
  const paymentMethod = location.state?.paymentMethod;

  useEffect(() => {
    if (type && id) {
      fetchTrainingAndEnrollment();
    } else if (enrollmentData) {
      // If we have enrollment data but no params, use that
      setTraining(enrollmentData.training);
      setEnrollment(enrollmentData.enrollment);
      setLoading(false);
    } else {
      setError('No training information found');
      setLoading(false);
    }
  }, [type, id, enrollmentData]);

  const fetchTrainingAndEnrollment = async () => {
    try {
      setLoading(true);
      
      // Fetch training details
      const trainingResponse = await axios.get(`${API_URL}/training/${type}/${id}`);
      
      if (trainingResponse.data.success) {
        setTraining(trainingResponse.data.data);
        
        // Check if user is enrolled (only if authenticated)
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const enrollmentCheck = await axios.get(`${API_URL}/enrollment/check/${type}/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (enrollmentCheck.data.success && enrollmentCheck.data.enrolled) {
              setEnrollment(enrollmentCheck.data.enrollment);
            }
          } catch (enrollmentError) {
            console.log('Enrollment check failed, user may not be enrolled:', enrollmentError);
          }
        }
      } else {
        setError(trainingResponse.data.message || 'Failed to fetch training details');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error loading training information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTrainingTypeIcon = (type) => {
    switch(type) {
      case 'offline-course':
      case 'offline_course':
        return <Users size={24} className="text-blue-500" />;
      case 'online-course':
      case 'online_course':
        return <Calendar size={24} className="text-green-500" />;
      case 'video-course':
      case 'video_course':
        return <Video size={24} className="text-red-500" />;
      default:
        return <BookOpen size={24} className="text-purple-500" />;
    }
  };

  const getTrainingTypeLabel = (type) => {
    switch(type) {
      case 'offline-course':
      case 'offline_course':
        return 'Offline Training';
      case 'online-course':
      case 'online_course':
        return 'Live Online Course';
      case 'video-course':
      case 'video_course':
        return 'Video Course';
      default:
        return 'Training';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleAccessCourse = () => {
    if (type === 'video-course' || type === 'video_course') {
      // Redirect to video course player
      navigate(`/dashboard`);
    } else if (type === 'online-course' || type === 'online_course') {
      // Redirect to online course dashboard
      navigate(`/dashboard`);
    } else {
      // Redirect to offline course details
      navigate(`/dashboard`);
    }
  };

  const handleDownloadMaterials = async () => {
    if (!training) return;
    
    navigate(`/dashboard`);

  };

  const handleShareSuccess = () => {
    const shareText = `I just enrolled in "${training?.title}" on Sabit International! 🎓`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Training Enrollment',
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to share. Please copy the URL manually.'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="training-success-container min-vh-100 py-5">
          <div className="container">
            <div className="text-center py-5">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="mt-3 text-muted">Loading your enrollment details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !training) {
    return (
      <Layout>
        <div className="training-success-container min-vh-100 py-5">
          <div className="container">
            <div className="text-center py-5">
              <div className="alert alert-danger max-w-md mx-auto">
                <div className="d-flex align-items-center">
                  <AlertCircle size={20} className="me-2" />
                  <div>{error || 'Training not found'}</div>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/trainings')}
                  className="btn btn-primary"
                >
                  Browse Trainings
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isVideoCourse = type.includes('video');
  const isOnlineCourse = type.includes('online');
  const isOfflineCourse = type.includes('offline');

  return (
    <Layout>
      <div className="training-success-container min-vh-100 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              {/* Success Hero Section */}
              <div className="success-hero text-center mb-5">
                <div className="success-icon-wrapper mb-4">
                  <div className="success-badge position-relative d-inline-block">
                    <div className="success-circle-1"></div>
                    <div className="success-circle-2"></div>
                    <div className="success-circle-3"></div>
                    <CheckCircle className="text-success position-relative" size={64} />
                  </div>
                </div>
                
                <h1 className="display-5 fw-bold text-dark mb-3">
                  Enrollment Successful! 🎉
                </h1>
                
                <p className="lead text-muted mb-4">
                  {message || 'Congratulations! You are now enrolled in this training.'}
                </p>
                
                <div className="alert alert-success d-inline-flex align-items-center">
                  <Sparkles size={20} className="me-2" />
                  <span>You're all set! Access your course below.</span>
                </div>
              </div>

              {/* Training Summary Card */}
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
                <div className="card-header bg-gradient-primary text-white py-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {getTrainingTypeIcon(type)}
                      <div className="ms-3">
                        <h2 className="h4 mb-0">Course Details</h2>
                        <small className="opacity-75">{getTrainingTypeLabel(type)}</small>
                      </div>
                    </div>
                    {enrollment && (
                      <span className="badge bg-light text-dark fs-6 px-3 py-2">
                        Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-8">
                      <h3 className="h3 fw-bold mb-3">{training.title}</h3>
                      <p className="text-muted mb-4">
                        {training.basic_info?.substring(0, 200)}...
                      </p>
                      
                      <div className="training-meta-grid mb-4">
                        <div className="meta-item">
                          <div className="meta-icon">
                            <Calendar size={20} />
                          </div>
                          <div className="meta-content">
                            <small className="text-muted">Start Date</small>
                            <div className="fw-semibold">
                              {formatDate(training.deadline || training.date)}
                            </div>
                          </div>
                        </div>
                        
                        {training.duration && (
                          <div className="meta-item">
                            <div className="meta-icon">
                              <Clock size={20} />
                            </div>
                            <div className="meta-content">
                              <small className="text-muted">Duration</small>
                              <div className="fw-semibold">{training.duration}</div>
                            </div>
                          </div>
                        )}
                        
                        <div className="meta-item">
                          <div className="meta-icon">
                            <Award size={20} />
                          </div>
                          <div className="meta-content">
                            <small className="text-muted">Certificate</small>
                            <div className="fw-semibold text-success">Included</div>
                          </div>
                        </div>
                        
                        <div className="meta-item">
                          <div className="meta-icon">
                            <Users size={20} />
                          </div>
                          <div className="meta-content">
                            <small className="text-muted">Access</small>
                            <div className="fw-semibold">Lifetime</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="course-thumbnail rounded overflow-hidden">
                        <img 
                          src={training.image || '/default-training.jpg'} 
                          alt={training.title}
                          className="img-fluid"
                          style={{ height: '180px', objectFit: 'cover', width: '100%' }}
                        />
                      </div>
                      
                      {paymentMethod && (
                        <div className="mt-3">
                          <small className="text-muted">Payment Method:</small>
                          <div className="fw-semibold text-uppercase">{paymentMethod}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps Section */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h3 className="h4 mb-4 fw-semibold">What's Next?</h3>
                  
                  <div className="row g-4">
                    {/* Step 1 */}
                    <div className="col-md-4">
                      <div className="step-card text-center p-3 h-100">
                        <div className="step-number-wrapper mb-3">
                          <div className="step-number">1</div>
                          <div className="step-icon bg-primary bg-opacity-10">
                            {isVideoCourse ? (
                              <PlayCircle className="text-primary" size={32} />
                            ) : (
                              <Zap className="text-primary" size={32} />
                            )}
                          </div>
                        </div>
                        <h5 className="fw-semibold mb-2">
                          {isVideoCourse ? 'Start Learning' : 'Prepare for Class'}
                        </h5>
                        <p className="text-muted small mb-0">
                          {isVideoCourse 
                            ? 'Access video lessons immediately'
                            : 'Get ready for your training session'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="col-md-4">
                      <div className="step-card text-center p-3 h-100">
                        <div className="step-number-wrapper mb-3">
                          <div className="step-number">2</div>
                          <div className="step-icon bg-success bg-opacity-10">
                            <BookOpen className="text-success" size={32} />
                          </div>
                        </div>
                        <h5 className="fw-semibold mb-2">Study Materials</h5>
                        <p className="text-muted small mb-0">
                          Download resources and practice materials
                        </p>
                      </div>
                    </div>
                    
                    {/* Step 3 */}
                    <div className="col-md-4">
                      <div className="step-card text-center p-3 h-100">
                        <div className="step-number-wrapper mb-3">
                          <div className="step-number">3</div>
                          <div className="step-icon bg-warning bg-opacity-10">
                            <Trophy className="text-warning" size={32} />
                          </div>
                        </div>
                        <h5 className="fw-semibold mb-2">Get Certified</h5>
                        <p className="text-muted small mb-0">
                          Complete the course and earn your certificate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h3 className="h4 mb-4 fw-semibold">Quick Actions</h3>
                  
                  <div className="row g-3">
                    {/* Access Course Button */}
                    <div className="col-md-6">
                      <button
                        onClick={handleAccessCourse}
                        className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center py-3"
                      >
                        <PlayCircle className="me-2" size={20} />
                        {isVideoCourse ? 'Start Watching Now' : 'Access Course'}
                        <ChevronRight className="ms-2" size={18} />
                      </button>
                    </div>
                    
                    {/* Download Materials */}
                    <div className="col-md-3">
                      <button
                        onClick={handleDownloadMaterials}
                        disabled={downloadingMaterials}
                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center py-3"
                      >
                        {downloadingMaterials ? (
                          <>
                            <Loader2 className="animate-spin me-2" size={18} />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="me-2" size={18} />
                            Materials
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Share */}
                   
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <h3 className="h4 mb-4 fw-semibold">Need Help?</h3>
                  
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="help-card p-3 rounded-3 bg-light">
                        <div className="d-flex align-items-start">
                          <MessageCircle size={24} className="text-primary me-3 flex-shrink-0" />
                          <div>
                            <h5 className="fw-semibold mb-2">Course Support</h5>
                            <p className="text-muted small mb-0">
                              Have questions about the course content?
                            </p>
                           <a
                            href="https://wa.me/8801925235393"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary mt-2"
                          >
                            Contact Instructor (WhatsApp)
                          </a>

                          </div>
                        </div>
                      </div>
                    </div>
                    
                  
                  </div>
                </div>
              </div>

             

              {/* Main Action Buttons */}
              <div className="action-buttons mt-5 pt-3">
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                  <button
                    onClick={handleAccessCourse}
                    className="btn btn-primary btn-lg px-5 py-3 d-flex align-items-center justify-content-center"
                  >
                    <PlayCircle className="me-2" size={20} />
                    {isVideoCourse ? 'Start Learning Now' : 'Go to Course Dashboard'}
                  </button>
                  
                  <Link
                    to="/profile"
                    className="btn btn-outline-primary btn-lg px-5 py-3 d-flex align-items-center justify-content-center"
                  >
                    <Home className="me-2" size={20} />
                    My Courses
                  </Link>
                  
                  <Link
                    to="/"
                    className="btn btn-outline-dark btn-lg px-5 py-3 d-flex align-items-center justify-content-center"
                  >
                    <Sparkles className="me-2" size={20} />
                    Browse More
                  </Link>
                </div>
              </div>

           
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrainingSuccess;