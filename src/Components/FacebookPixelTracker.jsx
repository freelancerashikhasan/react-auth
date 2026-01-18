import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FacebookPixelTracker = () => {
    const location = useLocation();

    // Initialize Facebook Pixel on first load
    useEffect(() => {
        if (!window.fbq) {
            // Load Facebook Pixel script
            !function(f,b,e,v,n,t,s) {
                if(f.fbq)return;
                n=f.fbq=function() {
                    n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
                };
                if(!f._fbq)f._fbq=n;
                n.push=n;
                n.loaded=!0;
                n.version='2.0';
                n.queue=[];
                t=b.createElement(e);
                t.async=!0;
                t.src=v;
                s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
            }(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js');
            
            // Initialize with your pixel ID
            window.fbq('init', '1194810472796931');
        }
    }, []);

    // Track page views on route change
    useEffect(() => {
        if (window.fbq) {
            window.fbq('track', 'PageView');
            
            // Track specific events based on route
            switch(location.pathname) {
                case '/register':
                    window.fbq('track', 'CompleteRegistration');
                    break;
                    
                case '/checkout':
                    window.fbq('track', 'InitiateCheckout');
                    break;
                    
                case '/order-success':
                    // Get order details from URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const amount = urlParams.get('amount');
                    
                    window.fbq('track', 'Purchase', {
                        value: amount ? parseFloat(amount) : 0,
                        currency: 'BDT'
                    });
                    break;
                    
                case '/training-success':
                    window.fbq('track', 'Lead');
                    break;
                    
                default:
                    // Track view content for specific pages
                    if (location.pathname.includes('/training/')) {
                        window.fbq('track', 'ViewContent');
                    } else if (location.pathname.includes('/books/')) {
                        window.fbq('track', 'ViewContent', {
                            content_name: 'Book Details'
                        });
                    }
            }
        }
    }, [location.pathname]);

    // This component doesn't render anything visible
    return (
        <>
            {/* Noscript fallback */}
            <noscript>
                <img 
                    height="1" 
                    width="1" 
                    style={{display:'none'}}
                    src="https://www.facebook.com/tr?id=1194810472796931&ev=PageView&noscript=1"
                    alt=""
                />
            </noscript>
        </>
    );
};

export default FacebookPixelTracker;