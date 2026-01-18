import React, { useState } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../Layout/Layout';
import '../Components/css/Login.css';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const WhatsAppLogin = () => {
    const { sendWhatsAppOtp } = useAuth();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 5) {
            alert('Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            await sendWhatsAppOtp(phone);
            // OTP sent, navigation handled by AuthContext
        } catch (error) {
            console.error('WhatsApp OTP error:', error);
            alert(error.response?.data?.message || 'Failed to send WhatsApp OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="login-page">
                <div className="background-animation">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>

                <div className="whatsapp-login-container">
                    <div className="whatsapp-card">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="back-button"
                        >
                            <ArrowLeft className="back-icon" />
                        </button>

                        {/* Header */}
                        <div className="whatsapp-header">
                            <div className="whatsapp-icon-container">
                                <MessageSquare className="whatsapp-icon" size={40} />
                            </div>
                            <h2 className="whatsapp-title">Login via WhatsApp</h2>
                            <p className="whatsapp-subtitle">
                                We'll send a verification code to your WhatsApp
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="whatsapp-form">
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="phone-input-wrapper-2">
                                    <PhoneInput
                                        country={'bd'}
                                        value={phone}
                                        onChange={(value, country) => {
                                            console.log('Phone value:', value);
                                            console.log('Country:', country);
                                            setPhone(value);
                                        }}
                                        inputProps={{
                                            name: 'phone',
                                            required: true,
                                            autoFocus: true
                                        }}
                                        enableSearch
                                        searchPlaceholder="Search country..."
                                        placeholder="Enter phone number"
                                        disableDropdown={false}
                                        countryCodeEditable={true}
                                        specialLabel=""
                                        inputStyle={{
                                            width: '100%',
                                            height: '50px',
                                            fontSize: '16px',
                                            paddingLeft: '60px',
                                            borderRadius: '10px',
                                            border: '2px solid #e0e0e0',
                                            transition: 'border-color 0.3s'
                                        }}
                                        buttonStyle={{
                                            borderRadius: '10px 0 0 10px',
                                            backgroundColor: '#f8f9fa',
                                            border: '2px solid #e0e0e0',
                                            borderRight: 'none'
                                        }}
                                        dropdownStyle={{
                                            borderRadius: '10px',
                                            marginTop: '5px'
                                        }}
                                        containerStyle={{
                                            width: '100%'
                                        }}
                                        searchStyle={{
                                            padding: '10px',
                                            margin: '10px',
                                            borderRadius: '5px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                </div>
                                <p className="phone-hint">Enter your phone number with country code</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !phone}
                                className={`whatsapp-submit-btn ${loading ? 'loading' : ''}`}
                            >
                                <MessageSquare className="btn-icon" />
                                {loading ? 'Sending to WhatsApp...' : 'Send WhatsApp OTP'}
                            </button>

                            {/* Info Box */}
                            <div className="info-box">
                                <div className="info-icon">ℹ️</div>
                                <div className="info-content">
                                    <h4>How it works:</h4>
                                    <ul>
                                        <li>Select your country from the dropdown</li>
                                        <li>Enter your phone number</li>
                                        <li>We'll send a 6-digit OTP via WhatsApp</li>
                                        <li>Enter the OTP on the next screen to verify</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="terms-note">
                                <p className="terms-text">
                                    By continuing, you agree to receive a one-time verification message on WhatsApp. Standard messaging rates may apply.
                                </p>
                            </div>
                        </form>

                        {/* Back to normal login */}
                        <div className="back-to-login">
                            <p className="back-to-login-text">
                                Prefer other login methods?{' '}
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="back-to-login-link"
                                >
                                    Go back to login
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default WhatsAppLogin;