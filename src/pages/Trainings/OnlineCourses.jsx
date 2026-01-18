// src/pages/Courses/OnlineCourses.jsx
import React, { useState, useEffect } from 'react';
import { 
    Video, 
    Clock, 
    BookOpen, 
    Award, 
    PlayCircle,
    Download,
    Search,
    ChevronRight,
    Users,
    Calendar,
    FileText,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../Layout/DashboardLayout';
import '../../css/Courses.css';
import { useAPI } from '../../services/apiService';
import { formatDate, formatCurrency, downloadBlob } from '../../utils/helpers';

const OnlineCourses = () => {
    const { user } = useAuth();
    const api = useAPI();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [downloadingCertificateId, setDownloadingCertificateId] = useState(null);
    const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [searchTerm, filter, courses]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.getOnlineCourses();
            setCourses(response.data || []);
            setFilteredCourses(response.data || []);
        } catch (error) {
            toast.error('Failed to load online courses');
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
        if (filter === 'enrolled') {
            // All courses in this response are enrolled courses
            filtered = filtered;
        } else if (filter === 'completed') {
            // Check if course is completed based on date
            filtered = filtered.filter(course => {
                const courseDate = new Date(course.course_date);
                const today = new Date();
                return courseDate < today;
            });
        } else if (filter === 'upcoming') {
            filtered = filtered.filter(course => {
                const courseDate = new Date(course.course_date);
                const today = new Date();
                return courseDate >= today;
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
            const response = await api.downloadCertificate(course.id, 'online');
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
            const response = await api.downloadReceipt(course.id, 'online');
            downloadBlob(response.data, `receipt-${course.id}.pdf`);
            toast.success('Receipt downloaded successfully');
        } catch (error) {
            toast.error('Failed to download receipt');
        } finally {
            setDownloadingReceiptId(null);
        }
    };

    const handleJoinWhatsAppGroup = (course) => {
        try {
            if (course.seminar?.whatsapp_group) {
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

    const handleStartCourse = (course) => {
        try {
            // Check if course has started
            const courseDate = new Date(course.course_date);
            const today = new Date();
            
            if (courseDate > today) {
                toast.error('This course has not started yet');
                return;
            }
            
            // Here you would typically navigate to the course player
            // For now, just show a message
            toast.success(`Starting "${course.seminar?.title}" course`);
            
            // If there's a video link, open it
            if (course.seminar?.video_link) {
                window.open(course.seminar.video_link, '_blank');
            }
        } catch (error) {
            toast.error('Failed to start course');
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
                    <h1 className="page-title">Online Courses</h1>
                    <p className="page-subtitle">Your enrolled online courses</p>
                </div>

                {/* Filters and Search */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search courses by name or ID..."
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
                            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setFilter('upcoming')}
                        >
                            Upcoming
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
                            <h3>No courses found</h3>
                            <p>You haven't enrolled in any online courses yet.</p>
                        </div>
                    ) : (
                        filteredCourses.map((course) => {
                            const courseDate = new Date(course.course_date);
                            const today = new Date();
                            const isUpcoming = courseDate >= today;
                            const isCompleted = courseDate < today;
                            const isDownloadingCertificate = downloadingCertificateId === course.id;
                            const isDownloadingReceipt = downloadingReceiptId === course.id;
                            
                            return (
                                <div key={course.id} className="course-card">
                                    <div className="course-card-header">
                                        <div className="course-icon-wrapper">
                                            <Video size={28} />
                                        </div>
                                        <div className="course-status">
                                            {isCompleted ? (
                                                <span className="status-badge completed">Completed</span>
                                            ) : isUpcoming ? (
                                                <span className="status-badge upcoming">Upcoming</span>
                                            ) : (
                                                <span className="status-badge enrolled">In Progress</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="course-card-body">
                                        <h3 className="course-title">
                                            {course.seminar?.title || 'Online Course'}
                                        </h3>
                                        
                                        <div className="course-details">
                                            <div className="detail-item">
                                                <Calendar size={16} />
                                                <span>Course Date: {formatDate(course.course_date)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Clock size={16} />
                                                <span>Duration: Self-paced</span>
                                            </div>
                                           
                                            <div className="detail-item">
                                                <BookOpen size={16} />
                                                <span>Classes: {course.seminar?.total_classes || 1}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FileText size={16} />
                                                <span>Registration ID: #{course.id}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="price-tag">
                                                    {parseFloat(course.price || course.total_amount) === 0 ? 
                                                        'GIFT' : 
                                                        formatCurrency(course.price || course.total_amount)
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="course-actions">
                                            {isCompleted ? (
                                                <>
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
                                                    
                                                    {course.transactions?.length > 0 && (
                                                        <button
                                                            onClick={() => !isDownloadingReceipt && handleDownloadReceipt(course)}
                                                            disabled={isDownloadingReceipt}
                                                            className="action-btn receipt-btn"
                                                            style={{ opacity: isDownloadingReceipt ? 0.7 : 1 }}
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
                                                </>
                                            ) : (
                                                <>
                                                  
                                                    
                                                  
                                                </>
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

export default OnlineCourses;