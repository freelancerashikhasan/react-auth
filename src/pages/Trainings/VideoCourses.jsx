// src/pages/Courses/VideoCourses.jsx
import React, { useState, useEffect } from 'react';
import { 
    Video, 
    PlayCircle, 
    Clock, 
    Award, 
    Download,
    Search,
    ChevronRight,
    Users,
    Calendar,
    FileText,
    BookOpen,
    Loader2,
    Play
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../Layout/DashboardLayout';
import '../../css/Courses.css';
import { useAPI } from '../../services/apiService';
import { formatDate, formatCurrency, downloadBlob } from '../../utils/helpers';

const VideoCourses = () => {
    const { user } = useAuth();
    const api = useAPI();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [downloadingCertificateId, setDownloadingCertificateId] = useState(null);
    const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
    const [playingCourseId, setPlayingCourseId] = useState(null);

    useEffect(() => {
        fetchVideoCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [searchTerm, filter, courses]);

    const fetchVideoCourses = async () => {
        try {
            setLoading(true);
            const response = await api.getVideoCourses();
            setCourses(response.data || []);
            setFilteredCourses(response.data || []);
        } catch (error) {
            toast.error('Failed to load video courses');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = courses;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.seminar?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.id?.toString().includes(searchTerm) ||
                course.course_id?.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filter === 'completed') {
            filtered = filtered.filter(course => {
                return course.status === 1 || course.progress === 100;
            });
        } else if (filter === 'in-progress') {
            filtered = filtered.filter(course => {
                return course.progress > 0 && course.progress < 100;
            });
        } else if (filter === 'not-started') {
            filtered = filtered.filter(course => {
                return course.progress === 0;
            });
        }

        setFilteredCourses(filtered);
    };

    const handleDownloadMaterials = async (course) => {
        try {
            const response = await api.downloadCourseMaterials(course.course_id || course.id);
            downloadBlob(response.data, `course-materials-${course.course_id || course.id}.zip`);
            toast.success('Course materials downloaded successfully');
        } catch (error) {
            toast.error('Failed to download materials');
        }
    };

    const handleDownloadCertificate = async (course) => {
        try {
            setDownloadingCertificateId(course.id);
            const response = await api.downloadCertificate(course.id, 'video');
            downloadBlob(response.data, `certificate-${course.id}.pdf`);
            toast.success('Certificate downloaded successfully');
        } catch (error) {
            toast.error('Failed to download certificate');
        } finally {
            setDownloadingCertificateId(null);
        }
    };

    const handleDownloadReceipt = async (course) => {
        try {
            setDownloadingReceiptId(course.id);
            const response = await api.downloadReceipt(course.id, 'video');
            downloadBlob(response.data, `receipt-${course.id}.pdf`);
            toast.success('Receipt downloaded successfully');
        } catch (error) {
            toast.error('Failed to download receipt');
        } finally {
            setDownloadingReceiptId(null);
        }
    };

    const handleStartCourse = (course) => {
        // Navigate to the video course player page
        navigate(`/video-courses/player/${course.course_id || course.id}`);
    };

    const handlePreviewCourse = (course) => {
        // Open a preview modal or direct link to first video
        if (course.seminar?.video_link) {
            window.open(course.seminar.video_link, '_blank');
            toast.success('Opening course preview...');
        } else {
            toast.error('No preview available for this course');
        }
    };

    const handlePlayDemo = async (course) => {
        try {
            setPlayingCourseId(course.id);
            // Get course details to find first video
            const response = await api.getVideoCourseDetails(course.course_id || course.id);
            const courseData = response.data;
            
            if (courseData.videos && Object.keys(courseData.videos).length > 0) {
                // Get first video from first group
                const firstGroup = Object.values(courseData.videos)[0];
                if (firstGroup && firstGroup.length > 0) {
                    const firstVideo = firstGroup[0];
                    if (firstVideo.video_url) {
                        window.open(firstVideo.video_url, '_blank');
                        toast.success('Playing demo video...');
                    } else {
                        toast.error('No demo video available');
                    }
                } else {
                    toast.error('No videos available in this course');
                }
            } else {
                toast.error('No videos available in this course');
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
            toast.error('Failed to load demo video');
        } finally {
            setPlayingCourseId(null);
        }
    };

    const handleJoinWhatsAppGroup = (course) => {
        try {
            if (course.whatsapp_group) {
                let groupLink = course.whatsapp_group;
                
                // If whatsapp_group is an array, find appropriate group
                if (Array.isArray(course.whatsapp_group)) {
                    groupLink = course.whatsapp_group[0]?.link;
                    
                    if (user?.gender && course.whatsapp_group.length > 1) {
                        const genderGroup = course.whatsapp_group.find(group => 
                            group.gender?.toLowerCase() === user.gender?.toLowerCase()
                        );
                        if (genderGroup) {
                            groupLink = genderGroup.link;
                        }
                    }
                }
                
                if (groupLink) {
                    window.open(groupLink, '_blank');
                    toast.success('Opening WhatsApp group...');
                } else {
                    toast.error('No WhatsApp group available');
                }
            } else if (course.seminar?.whatsapp_group) {
                const whatsappGroups = JSON.parse(course.seminar.whatsapp_group);
                
                // Find group based on user gender or use first group
                let groupLink = whatsappGroups[0]?.link;
                
                if (user?.gender && whatsappGroups.length > 1) {
                    const genderGroup = whatsappGroups.find(group => 
                        group.gender?.toLowerCase() === user.gender?.toLowerCase()
                    );
                    if (genderGroup) {
                        groupLink = genderGroup.link;
                    }
                }
                
                if (groupLink) {
                    window.open(groupLink, '_blank');
                    toast.success('Opening WhatsApp group...');
                } else {
                    toast.error('No WhatsApp group available');
                }
            } else {
                toast.error('No WhatsApp group available for this course');
            }
        } catch (error) {
            toast.error('Failed to join WhatsApp group');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="courses-page">
                <div className="page-header">
                    <h1 className="page-title" style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #2196F3 100%)' }}>
                        Video Courses
                    </h1>
                    <p className="page-subtitle">Your enrolled video courses with recorded sessions</p>
                </div>

                {/* Filters and Search */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search video courses by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Courses
                        </button>
                        <button
                            className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                            onClick={() => setFilter('in-progress')}
                        >
                            In Progress
                        </button>
                        <button
                            className={`filter-btn ${filter === 'not-started' ? 'active' : ''}`}
                            onClick={() => setFilter('not-started')}
                        >
                            Not Started
                        </button>
                        <button
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="courses-grid">
                    {filteredCourses.length === 0 ? (
                        <div className="empty-state">
                            <Video size={48} className="empty-icon" />
                            <h3>No video courses found</h3>
                            <p>You haven't enrolled in any video courses yet.</p>
                        </div>
                    ) : (
                        filteredCourses.map((course) => {
                            const isCompleted = course.progress === 100;
                            const isInProgress = course.progress > 0 && course.progress < 100;
                            const isNotStarted = course.progress === 0;
                            const isDownloadingCertificate = downloadingCertificateId === course.id;
                            const isDownloadingReceipt = downloadingReceiptId === course.id;
                            const isPlayingDemo = playingCourseId === course.id;
                            
                            // Calculate progress color
                            let progressColor = '#6C5CE7'; // Default purple
                            if (isCompleted) progressColor = '#00B894'; // Green
                            if (isInProgress) progressColor = '#FDCB6E'; // Yellow
                            
                            return (
                                <div key={course.id} className="course-card">
                                    <div className="course-card-header">
                                        <div className="course-icon-wrapper">
                                            <Video size={28} />
                                        </div>
                                        <div className="course-status">
                                            {isCompleted ? (
                                                <span className="status-badge completed">Completed</span>
                                            ) : isInProgress ? (
                                                <span className="status-badge in-progress">In Progress</span>
                                            ) : (
                                                <span className="status-badge enrolled">Enrolled</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="course-card-body">
                                        <h3 className="course-title">
                                            {course.seminar?.title || 'Video Course'}
                                        </h3>
                                        
                                        <div className="course-details">
                                            <div className="detail-item">
                                                <Calendar size={16} />
                                                <span>Enrolled: {formatDate(course.created_at)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <BookOpen size={16} />
                                                <span>Classes: {course.seminar?.total_classes || course.total_videos || 0}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Users size={16} />
                                                <span>Videos: {course.total_videos || course.seminar?.total_classes || 0}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FileText size={16} />
                                                <span>Reg ID: #{course.id}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="price-tag">
                                                    {parseFloat(course.price || course.seminar?.price || 0) === 0 ? 
                                                        'GIFT' : 
                                                        formatCurrency(course.price || course.seminar?.price || 0)
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        {(isInProgress || isCompleted) && (
                                            <div className="progress-container">
                                                <div className="progress-label">
                                                    <span>Progress</span>
                                                    <span>{course.progress || 0}%</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{ 
                                                            width: `${course.progress || 0}%`,
                                                            backgroundColor: progressColor
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons Row 1 - Main Actions */}
                                        <div className="course-actions">
                                            {/* Play/Continue Button */}
                                                <button
                                                    className="action-btn watch-btn"
                                                    onClick={() => handleStartCourse(course)}
                                                    style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #2196F3 100%)',color:'#fff' }}
                                                >
                                                    <PlayCircle size={16} />
                                                    {isInProgress ? 'Continue' : 'Start Course'}
                                                </button>
                                                <button
                                                    onClick={() => !isDownloadingCertificate && handleDownloadCertificate(course)}
                                                    disabled={isDownloadingCertificate}
                                                    className="action-btn certificate-btn"
                                                    style={{ opacity: isDownloadingCertificate ? 0.7 : 1 }}
                                                >
                                                    {isDownloadingCertificate ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin mr-2" />
                                                            Downloading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Award size={16} />
                                                            Certificate
                                                        </>
                                                    )}
                                                </button>
                                            
                                          
                                        </div>

                                        {/* Action Buttons Row 2 - Secondary Actions */}
                                        <div className="course-actions secondary-actions">
                                            {/* WhatsApp Group Button */}
                                            {(course.whatsapp_group || course.seminar?.whatsapp_group) && (
                                                <button
                                                    onClick={() => handleJoinWhatsAppGroup(course)}
                                                    className="action-btn whatsapp-btn"
                                                    style={{ 
                                                        backgroundColor: '#25D366',
                                                        flex: 1
                                                    }}
                                                >
                                                    <img 
                                                        src="https://cdn-icons-png.flaticon.com/512/124/124034.png" 
                                                        alt="WhatsApp" 
                                                        style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }}
                                                    />
                                                    WhatsApp
                                                </button>
                                            )}
                                            
                                            {/* Receipt Button */}
                                            {isCompleted && course.transactions?.length > 0 && (
                                                <button
                                                    onClick={() => !isDownloadingReceipt && handleDownloadReceipt(course)}
                                                    disabled={isDownloadingReceipt}
                                                    className="action-btn receipt-btn"
                                                    style={{ 
                                                        opacity: isDownloadingReceipt ? 0.7 : 1,
                                                        flex: 1
                                                    }}
                                                >
                                                    {isDownloadingReceipt ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin mr-2" />
                                                            Downloading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText size={16} />
                                                            Receipt
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            
                                            {/* Materials Button */}
                                            {(course.training_materials?.length > 0 || course.seminar?.training_materials?.length > 0) && (
                                                <button
                                                    onClick={() => handleDownloadMaterials(course)}
                                                    className="action-btn materials-btn"
                                                    style={{ flex: 1 }}
                                                >
                                                    <Download size={16} />
                                                    Materials
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VideoCourses;