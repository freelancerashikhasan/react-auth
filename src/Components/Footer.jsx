import React from 'react';
import { Link } from 'react-router-dom';
import footerLogo from '../assets/logo.png';
import sslLogo from '../assets/ssl-logo-banks.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-section">
            <div className="container">
                <div className="row">
                    {/* Left Section with Logo */}
                    <div className="col-md-12 col-lg-4 mb-2">
                        <div className="footer-left">
                            <Link to="/">
                                <img 
                                    src={footerLogo} 
                                    alt="Sabit International" 
                                    className="footer-logo"
                                />
                            </Link>
                        </div>
                        <p className="pt-2 footer-quote">
                            "Your mind is a garden; your thoughts are the seeds. You can grow flowers, or you can grow weeds."
                        </p>
                        
                        {/* Optional Google Map */}
                        {/* <div className="w-100 wow fadeInUp" data-wow-delay="400ms">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!4v1732697629155!6m8!1m7!1sXM2seOhf5TipbolUBk0_5Q!2m2!1d23.81999001747593!2d90.38873550022812!3f355.73!4f8!5f0.4000000000000002"
                                width="300" 
                                height="300" 
                                style={{border: 0}} 
                                allowFullScreen="" 
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Sabit International Location"
                            ></iframe>
                        </div> */}
                    </div>
                    
                    {/* Right Section */}
                    <div className="col-md-12 col-lg-8">
                        <h1 className="footer-right-h1">
                            Let's Grow Together<span className="text-aqua">.</span>
                        </h1>
                        <br />
                        
                        <div className="row">
                            {/* Services Section */}
                            <div className="col-lg-4 col-md-12 col-sm-12 mt-3">
                                <h5 className="text-white">Service</h5>
                                <br />
                                <div className="footer-links">
                                    <Link to="/">
                                        <p>Mind Training</p>
                                    </Link>
                                    <Link to="/">
                                        <p>Book</p>
                                    </Link>
                                    <a href="#audio-section">
                                        <p>Audio Training</p>
                                    </a>
                                    <a href="#video-section">
                                        <p>Video Training</p>
                                    </a>
                                </div>
                            </div>
                            
                            {/* Connect Section */}
                            <div className="col-lg-4 col-md-12 col-sm-12 mt-3">
                                <h5 className="text-white">Connect</h5>
                                <br />
                                <div className="footer-links">
                                    <a href="https://www.facebook.com/sabitinternational" target="_blank" rel="noopener noreferrer">
                                        <p>Facebook</p>
                                    </a>
                                    <a href="https://wa.me/8801925235393" target="_blank" rel="noopener noreferrer">
                                        <p>Whatsapp</p>
                                    </a>
                                    <a href="https://www.youtube.com/@sabitinternational" target="_blank" rel="noopener noreferrer">
                                        <p>Youtube</p>
                                    </a>
                                </div>
                            </div>
                            
                            {/* Get In Touch Section */}
                            <div className="col-lg-4 col-md-12 col-sm-12 mt-3">
                                <h5 className="text-white">Get In Touch</h5>
                                <br />
                                <div className="footer-links">
                                    <p>
                                        <a href="https://sabitinternational.com" target="_blank" rel="noopener noreferrer">
                                            SabitInternational.com
                                        </a>
                                    </p>
                                    <p>
                                        <a href="mailto:sabitinternational@gmail.com">
                                            sabitinternational@gmail.com
                                        </a>
                                    </p>
                                  
                                </div>
                            </div>
                            
                            {/* SSL Logo */}
                            <div className="col-md-12 mt-3">
                                <img 
                                    src={sslLogo} 
                                    alt="SSL Secured Payment" 
                                    className="ssl-logo"
                                />
                            </div>
                            
                            {/* Copyright */}
                            <div className="col-md-12 mt-3">
                                <p className="copyright">
                                    Copyright &copy; {currentYear}. <a href="/">Sabit International</a>. All Rights Reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;