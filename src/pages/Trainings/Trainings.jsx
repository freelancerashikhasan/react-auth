// src/pages/Trainings/Trainings.jsx
import React, { useState, useEffect } from 'react';
import { 
    Brain, 
    Calendar, 
    Clock, 
    Download, 
    Award,
    FileText,
    BookOpen,
    ExternalLink,
    Search,
    Filter,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { formatDate, formatCurrency, downloadBlob } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useAPI } from '../../services/apiService';
import '../../css/Trainings.css';
import DashboardLayout from '../../Layout/DashboardLayout';

const Trainings = () => {
    const { user } = useAuth();
    const api = useAPI();
    const [loading, setLoading] = useState(true);
    const [trainings, setTrainings] = useState([]);
    const [filteredTrainings, setFilteredTrainings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [downloadingCertificateId, setDownloadingCertificateId] = useState(null);
    const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
    const [downloadingEntryPassId, setDownloadingEntryPassId] = useState(null);

    useEffect(() => {
        fetchTrainings();
    }, []);

    useEffect(() => {
        filterTrainings();
    }, [searchTerm, filter, trainings]);

    const fetchTrainings = async () => {
        try {
            setLoading(true);
            const response = await api.getTrainings();
            setTrainings(response.data);
            setFilteredTrainings(response.data);
        } catch (error) {
            toast.error('Failed to load trainings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterTrainings = () => {
        let filtered = trainings;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(training =>
                training.seminar?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                training.id.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filter === 'upcoming') {
            filtered = filtered.filter(training => {
                const trainingDate = new Date(training.seminar_date);
                const today = new Date();
                return trainingDate >= today;
            });
        } else if (filter === 'completed') {
            filtered = filtered.filter(training => {
                const trainingDate = new Date(training.seminar_date);
                const today = new Date();
                return trainingDate < today;
            });
        }

        setFilteredTrainings(filtered);
    };

    const handleDownloadEntryPass = async (training) => {
        try {
            setDownloadingEntryPassId(training.id);
            const response = await api.downloadEntryPass(training.id);
            downloadBlob(response.data, `entry-pass-${training.id}.pdf`);
            toast.success('Entry pass downloaded successfully');
        } catch (error) {
            toast.error('Failed to download entry pass');
        } finally {
            setDownloadingEntryPassId(null);
        }
    };

    const handleDownloadCertificate = async (training) => {
        try {
            setDownloadingCertificateId(training.id);
            const response = await api.downloadCertificate(training.id, 'offline');
            downloadBlob(response.data, `certificate-${training.id}.pdf`);
            toast.success('Certificate downloaded successfully');
        } catch (error) {
            toast.error('Failed to download certificate');
        } finally {
            setDownloadingCertificateId(null);
        }
    };

    const handleDownloadReceipt = async (training) => {
        try {
            setDownloadingReceiptId(training.id);
            const response = await api.downloadReceipt(training.id, 'offline');
            downloadBlob(response.data, `receipt-${training.id}.pdf`);
            toast.success('Receipt downloaded successfully');
        } catch (error) {
            toast.error('Failed to download receipt');
        } finally {
            setDownloadingReceiptId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="trainings-page">
                <div className="page-header">
                    <h1 className="page-title">Mind Trainings</h1>
                    <p className="page-subtitle">Your registered mind training sessions</p>
                </div>

                {/* Filters and Search */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search trainings by name or ID..."
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
                            All Trainings
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

                {/* Trainings Grid */}
                <div className="trainings-grid">
                    {filteredTrainings.length === 0 ? (
                        <div className="empty-state">
                            <Brain size={48} className="empty-icon" />
                            <h3>No trainings found</h3>
                            <p>You haven't registered for any mind trainings yet.</p>
                        </div>
                    ) : (
                        filteredTrainings.map((training, index) => {
                            const isUpcoming = new Date(training.seminar_date) >= new Date();
                            const isCompleted = new Date(training.seminar_date) < new Date();
                            const isDownloadingCertificate = downloadingCertificateId === training.id;
                            const isDownloadingReceipt = downloadingReceiptId === training.id;
                            const isDownloadingEntryPass = downloadingEntryPassId === training.id;
                            
                            return (
                                <div key={training.id} className="training-card">
                                    <div className="training-card-header">
                                        <div className="training-icon">
                                            <Brain size={24} />
                                        </div>
                                        <div className="training-status">
                                            {isUpcoming ? (
                                                <span className="status-badge upcoming">Upcoming</span>
                                            ) : (
                                                <span className="status-badge completed">Completed</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="training-card-body">
                                        <h3 className="training-title">
                                            {training.seminar?.title || 'Training'}
                                        </h3>
                                        
                                        <div className="training-detail">
                                            <div className="detail-item">
                                                <Calendar size={16} />
                                                <span>Date: {formatDate(training.seminar_date)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Clock size={16} />
                                                <span>Duration: {training.seminar?.duration || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <FileText size={16} />
                                                <span>Entry Code: #{training.id}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="price">
                                                    {training.price === 0 ? 'Free' : formatCurrency(training.price)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="training-actions">
                                            {training.transactions?.length > 0 && (
                                                <button
                                                    onClick={() => !isDownloadingReceipt && handleDownloadReceipt(training)}
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

                                            {isUpcoming && (
                                                <button
                                                    onClick={() => !isDownloadingEntryPass && handleDownloadEntryPass(training)}
                                                    disabled={isDownloadingEntryPass}
                                                    className="action-btn entry-pass-btn"
                                                    style={{ opacity: isDownloadingEntryPass ? 0.7 : 1 }}
                                                >
                                                    {isDownloadingEntryPass ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin mr-2" />
                                                            Downloading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download size={16} />
                                                            Entry Pass
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {isCompleted && (
                                                <button
                                                    onClick={() => !isDownloadingCertificate && handleDownloadCertificate(training)}
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
                                            )}

                                            {training.seminar?.training_materials?.length > 0 && (
                                                <Link
                                                    to={`/trainings/${training.id}/materials`}
                                                    className="action-btn materials-btn"
                                                >
                                                    <BookOpen size={16} />
                                                    Materials
                                                </Link>
                                            )}

                                            <Link
                                                to={`/training/Offline-Courses/${training.id}`}
                                                className="action-btn details-btn"
                                            >
                                                View Details
                                                <ChevronRight size={16} />
                                            </Link>
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

export default Trainings;