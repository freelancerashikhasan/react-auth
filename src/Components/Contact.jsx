import React from 'react';
import { useForm } from 'react-hook-form';

const Contact = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log('Contact form data:', data);
        // Handle form submission
    };

    return (
        <section className="py-5 bg-light">
            <div className="container py-5">
                <div className="text-center mb-5">
                    <span className="badge bg-primary mb-3">CONTACT US</span>
                    <h2 className="display-5 fw-bold mb-3">Get In Touch</h2>
                    <p className="lead text-muted mx-auto" style={{maxWidth: '700px'}}>
                        Have questions? We're here to help. Contact us for any inquiries
                    </p>
                </div>

                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-start mb-4">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                        <i className="bi bi-geo-alt text-primary fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-1">Office Address</h5>
                                        <p className="text-muted mb-0">
                                            123 Travel Street, City Center<br />
                                            Dhaka, Bangladesh
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-start mb-4">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                        <i className="bi bi-telephone text-primary fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-1">Phone Number</h5>
                                        <p className="text-muted mb-0">
                                            +880 1234 567890<br />
                                            +880 9876 543210
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-start">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                        <i className="bi bi-envelope text-primary fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-1">Email Address</h5>
                                        <p className="text-muted mb-0">
                                            info@sabitinternational.com<br />
                                            support@sabitinternational.com
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h5 className="mb-3">Business Hours</h5>
                                <ul className="list-unstyled">
                                    <li className="d-flex justify-content-between mb-2">
                                        <span>Saturday - Thursday</span>
                                        <span className="fw-bold">9:00 AM - 10:00 PM</span>
                                    </li>
                                    <li className="d-flex justify-content-between mb-2">
                                        <span>Friday</span>
                                        <span className="fw-bold">10:00 AM - 8:00 PM</span>
                                    </li>
                                    <li className="d-flex justify-content-between">
                                        <span>Emergency</span>
                                        <span className="fw-bold text-danger">24/7 Available</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Full Name *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                {...register('name', { required: 'Name is required' })}
                                            />
                                            {errors.name && (
                                                <div className="invalid-feedback">
                                                    {errors.name.message}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label className="form-label">Phone Number *</label>
                                            <input
                                                type="tel"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                {...register('phone', { 
                                                    required: 'Phone is required',
                                                    pattern: {
                                                        value: /^[0-9+\-\s]+$/,
                                                        message: 'Invalid phone number'
                                                    }
                                                })}
                                            />
                                            {errors.phone && (
                                                <div className="invalid-feedback">
                                                    {errors.phone.message}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label className="form-label">Email Address *</label>
                                            <input
                                                type="email"
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                {...register('email', { 
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address'
                                                    }
                                                })}
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback">
                                                    {errors.email.message}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label className="form-label">Service Interested</label>
                                            <select className="form-select" {...register('service')}>
                                                <option value="">Select a service</option>
                                                <option value="visa">Visa Processing</option>
                                                <option value="ticket">Air Ticket</option>
                                                <option value="hotel">Hotel Booking</option>
                                                <option value="tour">Tour Package</option>
                                                <option value="immigration">Immigration</option>
                                            </select>
                                        </div>
                                        
                                        <div className="col-12">
                                            <label className="form-label">Message *</label>
                                            <textarea
                                                rows="5"
                                                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                                {...register('message', { 
                                                    required: 'Message is required',
                                                    minLength: {
                                                        value: 10,
                                                        message: 'Message must be at least 10 characters'
                                                    }
                                                })}
                                            ></textarea>
                                            {errors.message && (
                                                <div className="invalid-feedback">
                                                    {errors.message.message}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-primary px-4 py-2">
                                                Send Message <i className="bi bi-send ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;