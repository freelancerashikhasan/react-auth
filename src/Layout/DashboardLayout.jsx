// src/components/Layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Home,
  Brain,
  Video,
  CalendarCheck,
  Book,
  Award,
  User,
  Bell,
  Settings,
  Search,
  Mail,
  ChevronDown,
  Menu,
  X,
  Crown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import '../css/DashboardLayout.css';
import logo from '../assets/Logo.png';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();

    const menuItems = [
        {
            id: 'dashboard',
            icon: Home,
            label: 'Dashboard',
            path: '/dashboard',
            badge: null
        },
        {
            id: 'trainings',
            icon: Brain,
            label: 'Mind Trainings',
            path: '/trainings',
            badge: null
        },
        {
            id: 'video-courses',
            icon: Video,
            label: 'Video Courses',
            path: '/video-courses',
            badge: null
        },
        {
            id: 'online-courses',
            icon: Video,
            label: 'Online Courses',
            path: '/online-courses',
            badge: null
        },
       
        {
            id: 'books',
            icon: Book,
            label: 'Books/PDFs',
            path: '/orders',
            badge: null
        },
       
        {
            id: 'profile',
            icon: User,
            label: 'Profile',
            path: '/profile',
            badge: null
        },
        // {
        //     id: 'notifications',
        //     icon: Bell,
        //     label: 'Notifications',
        //     path: '/notifications',
        //     badge: null
        // },
        // {
        //     id: 'settings',
        //     icon: Settings,
        //     label: 'Settings',
        //     path: '/settings',
        //     badge: null
        // }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = () => {
        // Handle logout logic
        console.log('Logging out...');
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            {/* Top Navigation Bar */}
            <header className="top-navbar">
                <div className="nav-left">
                      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <Menu size={24} />
                    </button>
                    <Link to={'/'} className="logo">
                        <img className='logo-img' src={logo} alt="" />
                    </Link>
                </div>


                <div className="nav-right">
                    <div className="nav-icons">
                        <button className="nav-icon notification-btn">
                            <Bell size={20} />
                            <span className="badge">12</span>
                        </button>
                     
                        <div className="user-dropdown">
                          <a
                            className="nav-link dropdown-toggle d-flex align-items-center"
                            href="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            👤 {user?.name}
                        </a>

                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                            <Link className="dropdown-item" to="/dashboard">
                                Dashboard
                            </Link>
                            </li>
                            <li>
                            <Link className="dropdown-item" to="/profile">
                                Profile
                            </Link>
                            </li>
                            <li>
                            <hr className="dropdown-divider" />
                            </li>
                            <li>
                            <button className="dropdown-item" onClick={logout}>
                                Logout
                            </button>
                            </li>
                        </ul>
                        </div>
                    </div>
                </div>

             
            </header>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
               

                <div className="sidebar-content">
                    <nav className="sidebar-menu">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    <div className="menu-icon">
                                        <IconComponent size={20} />
                                        {item.badge && <span className="menu-badge">{item.badge}</span>}
                                    </div>
                                    {!sidebarCollapsed && (
                                        <span className="menu-label">{item.label}</span>
                                    )}
                                    {!sidebarCollapsed && isActive(item.path) && (
                                        <div className="active-indicator"></div>
                                    )}
                                </button>
                            );
                        })}
                        {/* Logout Button */}
                        <button className="menu-item logout-btn" onClick={handleLogout}>
                            <div className="menu-icon">
                                <LogOut size={20} />
                            </div>
                            {!sidebarCollapsed && (
                                <span className="menu-label">Logout</span>
                            )}
                        </button>
                    </nav>

                  
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="mobile-sidebar-overlay">
                    <div className="mobile-sidebar">
                        <div className="mobile-sidebar-header">
                            <div className="logo">
                                <Brain size={24} className="brain-icon" />
                                <span className="logo-text">MindMaster</span>
                            </div>
                            <button className="close-mobile-menu" onClick={toggleMobileMenu}>
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="mobile-menu">
                            {menuItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        className={`mobile-menu-item ${isActive(item.path) ? 'active' : ''}`}
                                        onClick={() => handleNavigation(item.path)}
                                    >
                                        <IconComponent size={20} />
                                        <span>{item.label}</span>
                                        {item.badge && <span className="mobile-badge">{item.badge}</span>}
                                    </button>
                                );
                            })}
                            <button className="mobile-menu-item logout-btn" onClick={handleLogout}>
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="content-wrapper">
                    {children || <Outlet />}
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="bottom-nav">
                {menuItems.slice(0, 4).map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <IconComponent size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default DashboardLayout;