import { useEffect, useState } from 'react';
import axios from 'axios';
import facebookPixel from '../services/facebookPixel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const useFacebookPixel = () => {
    const [pixelId, setPixelId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPixelId = async () => {
            try {
                setLoading(true);
                
                // Try to get pixel ID from API
                const response = await axios.get(`${API_URL}/facebook-pixel/config`);
                
                if (response.data.success && response.data.pixel_id) {
                    setPixelId(response.data.pixel_id);
                    facebookPixel.init(response.data.pixel_id);
                    console.log('Facebook Pixel initialized with ID:', response.data.pixel_id);
                } else {
                    console.warn('No Facebook Pixel ID returned from API');
                    // You could set a default pixel ID here if needed
                    // facebookPixel.init('DEFAULT_PIXEL_ID');
                }
            } catch (err) {
                console.error('Failed to fetch Facebook Pixel ID:', err);
                setError(err.message);
                // Initialize with default pixel ID if API fails
                if (import.meta.env.VITE_FACEBOOK_PIXEL_ID) {
                    facebookPixel.init(import.meta.env.VITE_FACEBOOK_PIXEL_ID);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPixelId();
    }, []);

    return {
        pixelId,
        loading,
        error,
        trackEvent: facebookPixel.trackEvent,
        trackCustomEvent: facebookPixel.trackCustomEvent,
        trackPageView: facebookPixel.trackPageView,
        trackPurchase: facebookPixel.trackPurchase,
        trackAddToCart: facebookPixel.trackAddToCart,
        trackInitiateCheckout: facebookPixel.trackInitiateCheckout,
        trackCompleteRegistration: facebookPixel.trackCompleteRegistration,
        trackLead: facebookPixel.trackLead
    };
};

export default useFacebookPixel;