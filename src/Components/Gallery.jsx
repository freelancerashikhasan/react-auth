import React, { useState } from 'react';

const Gallery = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    
    const galleryItems = [
        { category: 'visa', image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' },
        { category: 'travel', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' },
        { category: 'tour', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' },
        { category: 'hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' },
        { category: 'immigration', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w i=1350&q=80' },
        { category: 'visa', image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80' },
    ];

    const filteredItems = activeFilter === 'all' 
        ? galleryItems 
        : galleryItems.filter(item => item.category === activeFilter);

    return (
        <section className="py-5">
            <div className="container py-5">
                <div className="text-center mb-5">
                    <span className="badge bg-primary mb-3">GALLERY</span>
                    <h2 className="display-5 fw-bold mb-3">Our Success Stories</h2>
                    <p className="lead text-muted mx-auto" style={{maxWidth: '700px'}}>
                        Moments we've captured from our successful journeys and happy clients
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
                    {['all', 'visa', 'travel', 'tour', 'hotel', 'immigration'].map((filter) => (
                        <button
                            key={filter}
                            className={`btn ${activeFilter === filter ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <div className="row g-3">
                    {filteredItems.map((item, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div className="gallery-item position-relative overflow-hidden rounded-3">
                                <img 
                                    src={item.image} 
                                    alt={`Gallery ${index + 1}`}
                                    className="img-fluid w-100 transition-scale"
                                    style={{height: '250px', objectFit: 'cover'}}
                                />
                                <div className="gallery-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-all">
                                    <div className="text-center text-white">
                                        <i className="bi bi-zoom-in fs-3 mb-2"></i>
                                        <p className="mb-0 fw-bold">View Details</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;