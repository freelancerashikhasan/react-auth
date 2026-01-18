import React from 'react';

const WhyChooseUs = () => {
    const features = [
        {
            icon: 'bi-clock-history',
            title: 'Quick Processing',
            description: 'Fastest visa processing with dedicated team'
        },
        {
            icon: 'bi-cash-coin',
            title: 'Best Price Guarantee',
            description: 'Lowest price guaranteed for all services'
        },
        {
            icon: 'bi-person-check',
            title: 'Expert Consultation',
            description: 'Professional guidance from experienced consultants'
        },
        {
            icon: 'bi-headset',
            title: '24/7 Support',
            description: 'Round the clock customer support'
        },
        {
            icon: 'bi-shield-check',
            title: '100% Security',
            description: 'Secure payment and data protection'
        },
        {
            icon: 'bi-star',
            title: 'Premium Service',
            description: 'Personalized service for every client'
        }
    ];

    return (
        <section className="py-5 bg-dark text-white">
            <div className="container py-5">
                <div className="text-center mb-5">
                    <span className="badge bg-warning mb-3">WHY CHOOSE US</span>
                    <h2 className="display-5 fw-bold mb-3">We Make Your Travel Easy</h2>
                    <p className="lead text-light mx-auto" style={{maxWidth: '700px'}}>
                        Experience excellence in every step of your journey with our dedicated services
                    </p>
                </div>

                <div className="row g-4">
                    {features.map((feature, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div className="card h-100 border-0 bg-dark bg-opacity-50 hover-lift transition-all">
                                <div className="card-body p-4 text-center">
                                    <div className="mb-4">
                                        <div className="bg-warning bg-opacity-20 p-3 rounded-circle d-inline-block">
                                            <i className={`bi ${feature.icon} fs-2 text-warning`}></i>
                                        </div>
                                    </div>
                                    <h4 className="card-title mb-3">{feature.title}</h4>
                                    <p className="card-text text-light">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;