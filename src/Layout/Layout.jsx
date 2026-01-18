import React from 'react';
import Navbar from '../Components/Menu/Navbar';
import Footer from '../Components/Footer';

const Layout = ({ children, showNavbar = true, showFooter = true }) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            {showNavbar && <Navbar />}
            
            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>
            
            {/* Footer */}
            {showFooter && <Footer />}
        </div>
    );
};

export default Layout;