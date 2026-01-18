import React, { useState } from 'react';
import { Phone, Lock, Mail, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import whatsapp from '../assets/whatsapp.png';
import toast from 'react-hot-toast';

const PhoneLogin = () => {
    const { sendOtp, login, googleLogin } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState('phone'); // 'phone', 'password', 'email'
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Add +880 prefix for Bangladesh
            const formattedPhone = phone.startsWith('+88') ? phone : `+88${phone}`;
            await sendOtp(formattedPhone);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure phone number has + sign
            let formattedUsername = phone;
            
            // If login method is password (using phone number), add + if not present
            if (loginMethod === 'password') {
                // Check if phone already starts with +, if not add it
                if (phone && !phone.startsWith('+')) {
                    formattedUsername = `+${phone}`;
                }
            }
            
            await login({
                username: formattedUsername,
                password
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            // Call the googleLogin function from AuthContext
            await googleLogin(credentialResponse.credential);
        } catch (error) {
            console.error('Google login failed:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleLogin = async (googleToken) => {
        setLoading(true);
        try {
            await googleLogin(googleToken);
        } catch (error) {
            console.error('Google login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        console.log('Google Login Failed');
        alert('Google login failed. Please try again.');
    };

    const handleWhatsAppRedirect = () => {
        // navigate('/whatsapp-login');
        toast.error('Coming Soon');
    };

    const handlePhoneChange = (value, country) => {
        setPhone(value);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to continue to your account</p>
                </div>

                {/* Login Methods Tabs */}
                <div className="login-tabs">
                    <button
                        className={`login-tab ${loginMethod === 'phone' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('phone')}
                    >
                        <Phone className="tab-icon" />
                        Phone OTP
                    </button>
                    <button
                        className={`login-tab ${loginMethod === 'password' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('password')}
                    >
                        <Lock className="tab-icon" />
                        Password
                    </button>
                    <button
                        className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('email')}
                    >
                        <Mail className="tab-icon" />
                        Email
                    </button>
                </div>

                {/* Form */}
                <div className="login-form-container">
                    {loginMethod === 'phone' ? (
                        <form onSubmit={handlePhoneSubmit} className="login-form">
                            <div className="form-group">
                                <label className="form-label">Phone Number (Bangladesh)</label>
                                <div className="phone-input-wrapper">
                                    <div className="country-code-display">
                                        <span className="country-code">+88</span>
                                    </div>
                                    <div className="input-wrapper">
                                        <Phone className="input-icon" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="form-input"
                                            placeholder="1XXXXXXXXXX"
                                            required
                                            maxLength="11"
                                            pattern="[0-9]{11}"
                                        />
                                    </div>
                                </div>
                                <p className="phone-hint">Enter your 11-digit phone number (without +88)</p>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || phone.length < 10}
                                className={`submit-btn ${loading ? 'loading' : ''}`}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordSubmit} className="login-form">
                            <div className="form-group">
                                <label className="form-label">
                                    {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                                </label>
                                {loginMethod === 'email' ? (
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" />
                                        <input
                                            type="email"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="form-input"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="phone-input-wrapper-2">
                                        <PhoneInput
                                            country={'bd'}
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            inputProps={{
                                                name: 'phone',
                                                required: true
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
                                                transition: 'border-color 0.3s',
                                                backgroundColor: 'white'
                                            }}
                                            buttonStyle={{
                                                borderRadius: '10px 0 0 10px',
                                                backgroundColor: '#f8f9fa',
                                                border: '2px solid #e0e0e0',
                                                borderRight: 'none'
                                            }}
                                            dropdownStyle={{
                                                borderRadius: '10px',
                                                marginTop: '5px',
                                                maxHeight: '300px',
                                                overflowY: 'auto'
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
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-options">
                                <a href="#" className="forgot-link">
                                    Forgot Password?
                                </a>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`submit-btn ${loading ? 'loading' : ''}`}
                            >
                                {loading ? 'Logging in...' : 'Login with Password'}
                            </button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="divider">
                        <div className="divider-line"></div>
                        <span className="divider-text">OR</span>
                        <div className="divider-line"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="social-login">
                        {/* Google Login Button */}
                        <div className="google-login-wrapper">
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    handleGoogleLogin(credentialResponse.credential);
                                }}
                                onError={() => {
                                    console.log('Google Login Failed');
                                    alert('Google login failed. Please try again.');
                                }}
                                useOneTap={false}
                                theme="outline"
                                size="large"
                                width="100%"
                            />
                        </div>
                        
                        {/* WhatsApp Login Button */}
                        <button
                            onClick={handleWhatsAppRedirect}
                            className="social-btn whatsapp-btn"
                        >
                            <img src={whatsapp} alt="WhatsApp" className="whatsapp-icon" />
                            Login via WhatsApp
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="signup-link">
                        <p className="signup-text">
                            Don't have an account?{' '}
                            <a href="/register" className="signup-link-text">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhoneLogin;