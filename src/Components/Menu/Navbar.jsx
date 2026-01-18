import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../../src/assets/Logo.png';
import arrow from '../../../src/assets/Arrow.svg';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    // Function to handle smooth scrolling to sections
    const handleScrollToSection = (sectionId) => {
        setIsOpen(false);
        
        // Navigate to home page
        navigate("/", { replace: false });

        // Scroll to section after navigation
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ 
                    behavior: "smooth",
                    block: "start"
                });
                // Update URL with hash
                window.history.replaceState(null, '', `/#${sectionId}`);
            }
        }, 50);
    };

    // Function to handle navigation without scrolling
    const handleNavigate = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    // Function to handle home navigation (scrolls to top)
    const handleHomeClick = () => {
        setIsOpen(false);
        navigate("/", { replace: false });
        
        // Scroll to top of page
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Clear any hash from URL
            window.history.replaceState(null, '', '/');
        }, 50);
    };

    return (
        <nav className="navbar navbar-expand-lg sticky-top">
            <div className="container">
                {/* Logo - Left */}
                <Link 
                    className="navbar-brand" 
                    to="/" 
                    onClick={handleHomeClick}
                >
                    <img 
                        src={logo} 
                        alt="Sabit International"
                        className="logo-img"
                    />
                </Link>

                {/* Mobile Toggle Button */}
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span
                        className="navbar-toggler-icon"
                        style={{ filter: 'invert(1)' }}
                    ></span>
                </button>

                {/* Navbar Content */}
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
                    {/* Center Links */}
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link 
                                className="nav-link" 
                                to="/"
                                onClick={handleHomeClick}
                            >
                                Home
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className="nav-link" 
                                to=""
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleScrollToSection("offline_course");
                                }}
                            >
                                Offline Courses
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className="nav-link" 
                                to=""
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleScrollToSection("offline_course");
                                }}
                            >
                                Online Courses
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className="nav-link" 
                                to=""
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleScrollToSection("offline_course");
                                }}
                            >
                                Video Courses
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className="nav-link" 
                                to=""
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleScrollToSection("");
                                }}
                            >
                                Audio Courses
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className="nav-link" 
                                to=""
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleScrollToSection("books");
                                }}
                            >
                                Books
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link 
                                className="nav-link" 
                                to=""
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleScrollToSection("books");
                                }}
                            >
                                PDF
                            </Link>
                        </li>
                    </ul>

                    {/* Right Side - Auth Buttons */}
                    <div className="d-flex usericon">
                        {isAuthenticated ? (
                            <div className="nav-item dropdown user-btn">
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
                                        <Link 
                                            className="dropdown-item" 
                                            to="/dashboard"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            className="dropdown-item" 
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button 
                                            className="dropdown-item" 
                                            onClick={() => {
                                                setIsOpen(false);
                                                logout();
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <>
                                <Link 
                                    className="loginBtn" 
                                    to="/login" 
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login <img src={arrow} alt="" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;