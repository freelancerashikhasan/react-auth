import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layout/Layout';
import '../Components/css/NotFound.css';


function NotFound() {
    return (
        <Layout>
            <div className="not-found-page">
                {/* Background Pattern */}
                <div className="brain-pattern"></div>
                
                <div className="container">
                    <div className="row justify-content-center align-items-center min-vh-100">
                        <div className="col-12 col-md-10 col-lg-8">
                            <div className="not-found-card text-center">
                               
                                
                                {/* Error Code */}
                                <div className="error-code">
                                    <span className="code-digit">4</span>
                                    <span className="code-digit digit-zero">
                                        <div className="zero-ring"></div>
                                    </span>
                                    <span className="code-digit">4</span>
                                </div>
                                
                                {/* Message */}
                                <h1 className="page-title">Mind Lost in Thought</h1>
                                <p className="page-subtitle">
                                    The page you're looking for doesn't exist or has wandered off into the depths of the internet.
                                </p>
                                
                                {/* Stats Container */}
                                <div className="stats-container mb-5">
                                    <div className="row">
                                        <div className="col-4">
                                            <div className="stat-item">
                                                <div className="stat-number">404</div>
                                                <div className="stat-label">Error Code</div>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="stat-item">
                                                <div className="stat-number">100%</div>
                                                <div className="stat-label">Focus Required</div>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="stat-item">
                                                <div className="stat-number">∞</div>
                                                <div className="stat-label">Mind Power</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="action-buttons">
                                    <Link to="/" className="btn btn-primary btn-lg btn-neural">
                                        <span className="btn-icon">🧠</span>
                                        Return to Training
                                    </Link>
                                    <Link to="/courses" className="btn btn-outline-light btn-lg ms-3">
                                        <span className="btn-icon">📚</span>
                                        Explore Courses
                                    </Link>
                                </div>
                                
                                {/* Navigation Links */}
                                <div className="quick-links mt-5">
                                    <p className="links-title">Quick Navigation:</p>
                                    <div className="d-flex flex-wrap justify-content-center gap-3">
                                        <Link to="/" className="nav-link-item">Home</Link>
                                        <Link to="/courses" className="nav-link-item">Courses</Link>
                                        <Link to="/about" className="nav-link-item">About Us</Link>
                                        <Link to="/contact" className="nav-link-item">Contact</Link>
                                        <Link to="/dashboard" className="nav-link-item">Dashboard</Link>
                                    </div>
                                </div>
                                
                                {/* Inspirational Quote */}
                                <div className="quote-container mt-5 pt-4 border-top">
                                    <p className="quote-text">
                                        "The mind is not a vessel to be filled, but a fire to be kindled."
                                    </p>
                                    <p className="quote-author">- Plutarch</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default NotFound;