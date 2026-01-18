// Facebook Pixel Service
class FacebookPixelService {
    constructor() {
        this.pixelId = null;
        this.isInitialized = false;
        this.pendingEvents = [];
    }

    // Initialize Facebook Pixel with ID
    init(pixelId) {
        if (!pixelId || this.isInitialized) return;
        
        this.pixelId = pixelId;
        
        // Create Facebook Pixel script
        const script = document.createElement('script');
        script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
        
        // Create noscript fallback
        const noscript = document.createElement('noscript');
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
        document.head.appendChild(noscript);
        
        this.isInitialized = true;
        
        // Process any pending events
        this.processPendingEvents();
    }

    // Process pending events after initialization
    processPendingEvents() {
        if (!this.isInitialized) return;
        
        this.pendingEvents.forEach(event => {
            this.trackEvent(event.name, event.properties);
        });
        this.pendingEvents = [];
    }

    // Track standard events
    trackEvent(eventName, properties = {}) {
        if (!this.isInitialized) {
            this.pendingEvents.push({ name: eventName, properties });
            return;
        }

        if (window.fbq) {
            window.fbq('track', eventName, properties);
            console.log(`Facebook Pixel: Tracked ${eventName}`, properties);
        }
    }

    // Track custom events
    trackCustomEvent(eventName, properties = {}) {
        if (!this.isInitialized) {
            this.pendingEvents.push({ name: eventName, properties });
            return;
        }

        if (window.fbq) {
            window.fbq('trackCustom', eventName, properties);
            console.log(`Facebook Pixel: Tracked custom ${eventName}`, properties);
        }
    }

    // Track page view
    trackPageView() {
        this.trackEvent('PageView');
    }

    // Track purchase
    trackPurchase(value, currency = 'BDT', contents = []) {
        this.trackEvent('Purchase', {
            value,
            currency,
            contents
        });
    }

    // Track add to cart
    trackAddToCart(value, contents = []) {
        this.trackEvent('AddToCart', {
            value,
            currency: 'BDT',
            contents
        });
    }

    // Track initiate checkout
    trackInitiateCheckout(value, contents = []) {
        this.trackEvent('InitiateCheckout', {
            value,
            currency: 'BDT',
            contents
        });
    }

    // Track complete registration
    trackCompleteRegistration() {
        this.trackEvent('CompleteRegistration');
    }

    // Track lead generation (for training enrollments)
    trackLead(trainingName, trainingValue = 0) {
        this.trackEvent('Lead', {
            content_name: trainingName,
            value: trainingValue,
            currency: 'BDT'
        });
    }
}

// Create singleton instance
const facebookPixel = new FacebookPixelService();

export default facebookPixel;