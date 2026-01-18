// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
    Brain,
    Video,
    CalendarCheck,
    Award,
    FileText,
    BookOpen,
    CalendarPlus,
    ShoppingCart,
    Settings,
    Clock,
    MapPin,
    ArrowUp,
    ArrowDown,
    Calendar,
    CheckCircle,
    Bell,
    Download,
    ExternalLink,
    Users,
    TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../services/apiService';
import DashboardLayout from '../Layout/DashboardLayout';
import '../css/Dashboard.css';
const Dashboard = () => {
    const { user } = useAuth();
    const api = useAPI();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.getDashboardData();
            setDashboardData(response.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    const latestTraining = dashboardData?.latestTraining;
    const stats = dashboardData?.stats || {};

    return (
        <DashboardLayout>

            <div className="dashboard-page">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1 className="welcome-title">Welcome back, {user?.name}!</h1>
                    <p className="welcome-subtitle">Track your mind transformation journey</p>
                </div>
                <div className="user-stats">
                    <div className="stat-item">
                        <Brain size={20} />
                        <span>{stats.totalTrainings || 0} Trainings</span>
                    </div>
                    <div className="stat-item">
                        <Award size={20} />
                        <span>{stats.certificates || 0} Certificates</span>
                    </div>
                </div>
            </div>

           

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon training">
                        <Brain size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalTrainings || 0}</h3>
                        <p>Total Trainings</p>
                    </div>
                    <div className="stat-trend positive">
                        <ArrowUp size={12} />
                        <span>+{stats.trainingGrowth || 0}%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon courses">
                        <Video size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.completedCourses || 0}</h3>
                        <p>Completed Courses</p>
                    </div>
                    <div className="stat-trend positive">
                        <ArrowUp size={12} />
                        <span>+{stats.courseGrowth || 0}%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon appointments">
                        <CalendarCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.upcomingAppointments || 0}</h3>
                        <p>Book Purchases</p>
                    </div>
                    <div className="stat-trend negative">
                        <ArrowDown size={12} />
                        <span>-{stats.appointmentChange || 0}%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon certificates">
                        <Award size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.certificates || 0}</h3>
                        <p>Certificates</p>
                    </div>
                    <div className="stat-trend positive">
                        <ArrowUp size={12} />
                        <span>+{stats.trainingGroth || 0}%</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="content-grid">
                <div className="content-card">
                    <div className="card-header">
                        <h3>Recent Trainings</h3>
                        <Link to="/trainings" className="view-all-btn">
                            View All
                        </Link>
                    </div>
                    <div className="activity-list">
                        {dashboardData?.recentTrainings?.slice(0, 3).map((training) => (
                            <div key={training.id} className="activity-item">
                                <div className="activity-icon">
                                    <Brain size={20} />
                                </div>
                                <div className="activity-content">
                                    <h4>{training.seminar?.title}</h4>
                                    <p className="activity-meta">
                                        {new Date(training.seminar_date).toLocaleDateString()} • 
                                        #{training.id}
                                    </p>
                                </div>
                                <div className="activity-status">
                                    {new Date(training.seminar_date) >= new Date() ? (
                                        <span className="status upcoming">Upcoming</span>
                                    ) : (
                                        <span className="status completed">Completed</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="content-card">
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-actions-grid">
                        <Link to="/trainings" className="quick-action-btn">
                            <Brain size={24} />
                            <span>View Trainings</span>
                        </Link>
                        <Link to="/courses" className="quick-action-btn">
                            <Video size={24} />
                            <span>Video Courses</span>
                        </Link>
                       
                        <Link to="/books" className="quick-action-btn">
                            <ShoppingCart size={24} />
                            <span>Buy Books</span>
                        </Link>
                      
                        <Link to="/profile" className="quick-action-btn">
                            <Settings size={24} />
                            <span>Profile Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default Dashboard;