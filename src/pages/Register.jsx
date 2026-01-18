import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Smartphone, Search, X, Briefcase, Calendar } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';
import Layout from '../Layout/Layout';
import whatsappIcon from '../assets/whatsapp.png';

const professions = [
    "Accountant", "Actor", "Actuary", "Administrator", "Agricultural Engineer",
    "Air Traffic Controller", "Airline Pilot", "Animator", "Anthropologist",
    "Archaeologist", "Architect", "Archivist", "Artist", "Astronomer", "Athlete",
    "Audiologist", "Author", "Banker", "Barber", "Biochemist", "Biomedical Engineer",
    "Blacksmith", "Botanist", "Broker", "Business Analyst", "Businessman",
    "Businessperson", "Businesswoman", "Butcher", "Carpenter", "Cartographer",
    "Chef", "Chemical Engineer", "Chemist", "Chiropractor", "Civil Engineer",
    "Clergy", "Coach", "Comedian", "Computer Scientist", "Conservationist",
    "Consultant", "Content Creator", "Copywriter", "Counselor", "Craftsperson",
    "Customer Service Representative", "Dancer", "Data Analyst", "Data Scientist",
    "Delivery Person", "Dentist", "Designer", "Dietitian", "Doctor", "Driver",
    "Economist", "Editor", "Electrician", "Engineer", "Entrepreneur",
    "Environmental Scientist", "Event Planner", "Farmer", "Fashion Designer",
    "Film Director", "Financial Advisor", "Firefighter", "Fisher", "Fisherman",
    "Florist", "Forensic Scientist", "Freelancer", "Game Developer", "Garment Worker",
    "Graphic Designer", "Hairdresser", "Health Educator", "Historian", "Hotel Manager",
    "Housewife", "Human Resources Specialist", "IT Specialist", "Illustrator",
    "Imam", "Interpreter", "Job", "Job Seeker", "Journalist", "Judge",
    "Kazi (Marriage Registrar)", "Laboratory Technician", "Lawyer", "Librarian",
    "Linguist", "Logistician", "Makeup Artist", "Marine Biologist",
    "Marketing Specialist", "Mathematician", "Mechanical Engineer",
    "Meteorologist", "Microbiologist", "Muezzin", "Musician", "NGO Worker", "Nurse",
    "Nutritionist", "Occupational Therapist", "Optometrist", "Painter", "Paramedic",
    "Pathologist", "Pharmacist", "Photographer", "Physical Therapist", "Physician",
    "Physicist", "Pilot", "Plumber", "Police Officer", "Politician", "Professor",
    "Programmer", "Psychologist", "Public Relations Specialist", "Real Estate Agent",
    "Receptionist", "Researcher", "Retail Worker", "Rickshaw Puller", "Rural Farmer",
    "Safety Officer", "Sailor", "Salesperson", "Scientist", "Secretary",
    "Security Guard", "Small Business Owner", "Social Worker", "Software Engineer",
    "Startup Founder", "Statistician", "Student", "Surgeon", "Surveyor", "Tailor",
    "Teacher", "Technician", "Translator", "Travel Agent", "Truck Driver",
    "Urban Planner", "Veterinarian", "Videographer", "Web Developer", "Writer",
    "Zoologist", "Others"
];

const Register = () => {
    const { registerSendOtp, registerVerifyOtp, sendWhatsAppOtp, completeProfile } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP & Basic Info, 3: Complete Profile
    const [otpMethod, setOtpMethod] = useState('phone'); // 'phone' or 'whatsapp'
    const [formData, setFormData] = useState({
        phone: '',
        otp: ['', '', '', '', '', ''],
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        gender: '',
        profession: '',
        customProfession: '',
        countryCode: 'bd'
    });
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(300);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProfessions, setFilteredProfessions] = useState(professions);
    
    const otpRefs = useRef([]);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Initialize OTP refs
    useEffect(() => {
        otpRefs.current = otpRefs.current.slice(0, 6);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfessionDropdown(false);
            }
        };

        if (showProfessionDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            // Focus search input when dropdown opens
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfessionDropdown]);

    // Filter professions based on search
    useEffect(() => {
        if (searchQuery) {
            const filtered = professions.filter(prof => 
                prof.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProfessions(filtered);
        } else {
            setFilteredProfessions(professions);
        }
    }, [searchQuery]);

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Validate phone number
            if (otpMethod === 'phone' && !formData.phone.startsWith('880')) {
                setError('SMS OTP is only available for Bangladesh numbers (+880)');
                setLoading(false);
                return;
            }

            // Ensure phone includes country code
            const phoneWithPlus = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
            
            if (otpMethod === 'whatsapp') {
                await sendWhatsAppOtp(phoneWithPlus);
                setSuccess('WhatsApp OTP sent successfully!');
            } else {
                await registerSendOtp(phoneWithPlus);
                setSuccess('SMS OTP sent successfully!');
            }
            setStep(2);
            
            // Start OTP timer
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            // Focus first OTP input
            setTimeout(() => {
                if (otpRefs.current[0]) {
                    otpRefs.current[0].focus();
                }
            }, 100);
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError(error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            // Validate password strength
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters long');
                setLoading(false);
                return;
            }

            const otpString = formData.otp.join('');
            if (otpString.length !== 6) {
                setError('Please enter a valid 6-digit OTP');
                setLoading(false);
                return;
            }

            // Ensure phone includes country code
            const phoneWithPlus = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
            
            const result = await registerVerifyOtp({
                phone: phoneWithPlus,
                otp: otpString,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword
            });
            
            setSuccess('Registration successful! Please complete your profile.');
            setStep(3);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError(error.message || 'Registration failed. Please try again.');
            // Reset OTP on error
            setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
            if (otpRefs.current[0]) {
                otpRefs.current[0].focus();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Validate age
            if (!formData.age || formData.age < 13 || formData.age > 100) {
                setError('Please enter a valid age between 13 and 100');
                setLoading(false);
                return;
            }

            if (!formData.gender) {
                setError('Please select your gender');
                setLoading(false);
                return;
            }

            if (!formData.profession) {
                setError('Please select your profession');
                setLoading(false);
                return;
            }

            if (formData.profession === 'Others' && !formData.customProfession) {
                setError('Please specify your profession');
                setLoading(false);
                return;
            }

            // Prepare profile data
            const profileData = {
                age: formData.age,
                gender: formData.gender,
                profession: formData.profession === 'Others' ? formData.customProfession : formData.profession
            };

            await completeProfile(profileData);
            
            // Navigate to dashboard on success
            navigate('/dashboard', { 
                state: { message: 'Profile completed successfully!' } 
            });
        } catch (error) {
            console.error('Error completing profile:', error);
            setError(error.message || 'Failed to complete profile. Please try again.');
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            // Ensure phone includes country code
            const phoneWithPlus = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
            
            if (otpMethod === 'whatsapp') {
                await sendWhatsAppOtp(phoneWithPlus);
                setSuccess('WhatsApp OTP resent successfully!');
            } else {
                await registerSendOtp(phoneWithPlus);
                setSuccess('SMS OTP resent successfully!');
            }
            setTimer(300);
            setFormData(prev => ({ ...prev, otp: ['', '', '', '', '', ''] }));
            
            // Focus first OTP input
            if (otpRefs.current[0]) {
                otpRefs.current[0].focus();
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            setError(error.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        // Only allow numbers
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length > 1) return;
        
        const newOtp = [...formData.otp];
        newOtp[index] = numericValue;
        setFormData(prev => ({ ...prev, otp: newOtp }));
        
        // Auto focus next input if value entered
        if (numericValue && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        
        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handlePhoneChange = (value, country) => {
        // react-phone-input-2 already includes + in the value
        setFormData(prev => ({ ...prev, phone: value }));
        setFormData(prev => ({ ...prev, countryCode: country.countryCode }));
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpMethodChange = (method) => {
        setOtpMethod(method);
        setFormData(prev => ({ ...prev, phone: '' }));
        setError('');
        setSuccess('');
    };

    const handleSkipProfile = () => {
        navigate('/dashboard', { 
            state: { message: 'You can complete your profile later from settings.' } 
        });
    };

    const getPhoneInputCountry = () => {
        return otpMethod === 'phone' ? 'bd' : formData.countryCode || 'us';
    };

    const handleProfessionSelect = (profession) => {
        setFormData(prev => ({ ...prev, profession }));
        setShowProfessionDropdown(false);
        setSearchQuery('');
        
        // Reset custom profession if not "Others"
        if (profession !== 'Others') {
            setFormData(prev => ({ ...prev, customProfession: '' }));
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <Layout>
            <div className="register-container">
                <div className="register-card">
                    {/* Progress Steps */}
                    <div className="progress-steps">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <div className="step-label">Verify</div>
                        </div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Register</div>
                        </div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <div className="step-label">Profile</div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="success-message">
                            <span className="success-icon">✓</span>
                            <span className="success-text">{success}</span>
                        </div>
                    )}

                    {/* Step 1: OTP Method Selection & Phone Input */}
                    {step === 1 && (
                        <div className="register-step">
                            <div className="step-header">
                                <h2 className="step-title">Create Account</h2>
                                <p className="step-subtitle">Choose verification method and enter your number</p>
                            </div>

                            {/* OTP Method Selection */}
                            <div className="otp-method-selector">
                                <button
                                    className={`otp-method-btn ${otpMethod === 'phone' ? 'active' : ''}`}
                                    onClick={() => handleOtpMethodChange('phone')}
                                    type="button"
                                    disabled={loading}
                                >
                                    <Smartphone className="method-icon" />
                                    <span>SMS OTP</span>
                                    <span className="method-note">(Bangladesh only)</span>
                                </button>
                                <button
                                    className={`otp-method-btn ${otpMethod === 'whatsapp' ? 'active' : ''}`}
                                    onClick={() => handleOtpMethodChange('whatsapp')}
                                    type="button"
                                    disabled={loading}
                                >
                                    <img src={whatsappIcon} alt="WhatsApp" className="whatsapp-icon" />
                                    <span>WhatsApp OTP</span>
                                    <span className="method-note">(All countries)</span>
                                </button>
                            </div>

                            <form onSubmit={handlePhoneSubmit} className="register-form">
                                <div className="form-group">
                                    <label className="form-label">
                                        {otpMethod === 'phone' ? 'Bangladesh Phone Number' : 'Phone Number with WhatsApp'}
                                    </label>
                                    <div className="phone-input-wrapper">
                                        <PhoneInput
                                            country={getPhoneInputCountry()}
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            inputProps={{
                                                required: true,
                                                name: 'phone',
                                                disabled: loading
                                            }}
                                            enableSearch
                                            placeholder={otpMethod === 'phone' ? 'Enter Bangladesh phone number' : 'Enter phone number with WhatsApp'}
                                            inputStyle={{
                                                width: '100%',
                                                height: '50px',
                                                fontSize: '16px',
                                                paddingLeft: '60px',
                                                borderRadius: '12px',
                                                border: '2px solid #333',
                                                background: '#1a1a1a',
                                                color: '#fff',
                                                transition: 'all 0.3s ease',
                                            }}
                                            buttonStyle={{
                                                borderRadius: '12px 0 0 12px',
                                                background: '#2a2a2a',
                                                border: '2px solid #333',
                                                borderRight: 'none'
                                            }}
                                            dropdownStyle={{
                                                background: '#1a1a1a',
                                                color: '#fff',
                                                border: '1px solid #333',
                                                borderRadius: '12px'
                                            }}
                                            searchStyle={{
                                                background: '#2a2a2a',
                                                color: '#fff',
                                                border: '1px solid #333',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                margin: '10px'
                                            }}
                                        />
                                    </div>
                                    {otpMethod === 'phone' && (
                                        <p className="input-note">
                                            Note: SMS OTP is only available for Bangladesh numbers (+880)
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !formData.phone}
                                    className={`submit-btn ${loading ? 'loading' : ''}`}
                                >
                                    {loading ? 'Sending OTP...' : `Send OTP via ${otpMethod === 'phone' ? 'SMS' : 'WhatsApp'}`}
                                </button>

                                <div className="login-redirect">
                                    <p className="redirect-text">
                                        Already have an account?{' '}
                                        <a href="/login" className="redirect-link">
                                            Sign In
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 2: OTP Verification & Basic Info */}
                    {step === 2 && (
                        <div className="register-step">
                            <button
                                onClick={() => setStep(1)}
                                className="back-button"
                                type="button"
                                disabled={loading}
                            >
                                <ArrowLeft className="back-icon" />
                            </button>

                            <div className="step-header">
                                <h2 className="step-title">Verify {otpMethod === 'phone' ? 'Phone' : 'WhatsApp'}</h2>
                                <p className="step-subtitle">
                                    Enter OTP sent to <span className="phone-number">{formData.phone}</span>
                                    <br />
                                    <small className="otp-method">via {otpMethod === 'phone' ? 'SMS' : 'WhatsApp'}</small>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyAndRegister} className="register-form">
                                {/* OTP Input */}
                                <div className="form-group">
                                    <label className="form-label">6-Digit Verification Code</label>
                                    <div className="otp-inputs">
                                        {formData.otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={el => otpRefs.current[index] = el}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="otp-input"
                                                disabled={loading}
                                            />
                                        ))}
                                    </div>
                                    <div className="otp-timer">
                                        <span className="timer-text">
                                            {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : 'OTP expired'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={timer > 0 || loading}
                                            className="resend-btn"
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div className="form-section">
                                    <h3 className="section-title">Basic Information</h3>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <div className="input-wrapper">
                                            <User className="input-icon" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className="form-input"
                                                placeholder="Enter your full name"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <div className="input-wrapper">
                                            <Mail className="input-icon" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                                className="form-input"
                                                placeholder="Enter your email"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <div className="input-wrapper">
                                            <Lock className="input-icon" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                className="form-input"
                                                placeholder="Create a strong password"
                                                required
                                                minLength="8"
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="password-toggle"
                                                disabled={loading}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        <p className="password-hint">
                                            Must be at least 8 characters with letters and numbers
                                        </p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
                                        <div className="input-wrapper">
                                            <Lock className="input-icon" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="form-input"
                                                placeholder="Confirm your password"
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="password-toggle"
                                                disabled={loading}
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || formData.otp.some(d => !d) || !formData.name || !formData.email || !formData.password || !formData.confirmPassword}
                                    className={`submit-btn ${loading ? 'loading' : ''}`}
                                >
                                    {loading ? 'Verifying...' : 'Complete Registration'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 3: Profile Completion with Profession Dropdown */}
                    {step === 3 && (
                        <div className="register-step">
                            <button
                                onClick={() => setStep(2)}
                                className="back-button"
                                type="button"
                                disabled={loading}
                            >
                                <ArrowLeft className="back-icon" />
                            </button>

                            <div className="step-header">
                                <h2 className="step-title">Complete Your Profile</h2>
                                <p className="step-subtitle">Tell us more about yourself to get started</p>
                            </div>

                            <form onSubmit={handleCompleteProfile} className="register-form">
                                <div className="form-section">
                                    <h3 className="section-title">Personal Details</h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group half-width">
                                            <label className="form-label">Age</label>
                                            <div className="input-wrapper">
                                                <Calendar className="input-icon" />
                                                <input
                                                    type="number"
                                                    value={formData.age}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                                                    className="form-input"
                                                    placeholder="Age"
                                                    min="13"
                                                    max="100"
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group half-width">
                                            <label className="form-label">Gender</label>
                                            <div className="radio-group">
                                                {['male', 'female', 'other'].map((gender) => (
                                                    <label key={gender} className="radio-label">
                                                        <input
                                                            type="radio"
                                                            name="gender"
                                                            value={gender}
                                                            checked={formData.gender === gender}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                                            className="radio-input"
                                                            disabled={loading}
                                                        />
                                                        <span className="radio-custom"></span>
                                                        <span className="radio-text">
                                                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profession Selection with Search Dropdown */}
                                    <div className="form-group profession-group" ref={dropdownRef}>
                                        <label className="form-label">Profession</label>
                                        <div className="profession-input-wrapper">
                                            <div className="profession-select-wrapper">
                                                <div 
                                                    className="profession-select-trigger"
                                                    onClick={() => !loading && setShowProfessionDropdown(!showProfessionDropdown)}
                                                >
                                                    <div className="input-wrapper">
                                                        <Briefcase className="input-icon" />
                                                        <input
                                                            type="text"
                                                            value={formData.profession}
                                                            readOnly
                                                            className="form-input"
                                                            placeholder="Select your profession"
                                                            style={{ cursor: 'pointer' }}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <ArrowLeft 
                                                        size={20} 
                                                        className={`dropdown-arrow ${showProfessionDropdown ? 'open' : ''}`}
                                                    />
                                                </div>
                                                
                                                {showProfessionDropdown && (
                                                    <>
                                                        <div className="dropdown-overlay" onClick={() => setShowProfessionDropdown(false)} />
                                                        <div className="profession-dropdown">
                                                            <div className="dropdown-header">
                                                                <h4 className="dropdown-title">Select Profession</h4>
                                                                <button
                                                                    type="button"
                                                                    className="dropdown-close"
                                                                    onClick={() => setShowProfessionDropdown(false)}
                                                                    disabled={loading}
                                                                >
                                                                    <X size={20} />
                                                                </button>
                                                            </div>
                                                            <div className="dropdown-search">
                                                                <Search size={18} className="search-icon" />
                                                                <input
                                                                    ref={searchInputRef}
                                                                    type="text"
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                    className="search-input"
                                                                    placeholder="Search professions..."
                                                                    disabled={loading}
                                                                />
                                                                {searchQuery && (
                                                                    <button
                                                                        type="button"
                                                                        className="clear-search"
                                                                        onClick={handleClearSearch}
                                                                        disabled={loading}
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="dropdown-info">
                                                                <span className="profession-count">
                                                                    {filteredProfessions.length} professions
                                                                </span>
                                                                {searchQuery && (
                                                                    <span className="search-query">
                                                                        Searching: "{searchQuery}"
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="dropdown-list-container">
                                                                <div className="dropdown-list">
                                                                    {filteredProfessions.length === 0 ? (
                                                                        <div className="no-results">
                                                                            <Search size={24} />
                                                                            <p>No professions found</p>
                                                                            <small>Try a different search term</small>
                                                                        </div>
                                                                    ) : (
                                                                        filteredProfessions.map((profession, index) => (
                                                                            <div
                                                                                key={index}
                                                                                className={`dropdown-item ${formData.profession === profession ? 'selected' : ''}`}
                                                                                onClick={() => handleProfessionSelect(profession)}
                                                                            >
                                                                                <span className="profession-text">{profession}</span>
                                                                                {formData.profession === profession && (
                                                                                    <div className="checkmark">✓</div>
                                                                                )}
                                                                            </div>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="dropdown-footer">
                                                                <p className="footer-note">
                                                                    Can't find your profession? Select "Others" below and type it.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {/* Custom profession input for "Others" */}
                                            {formData.profession === 'Others' && (
                                                <div className="custom-profession-input">
                                                    <div className="input-wrapper">
                                                        <input
                                                            type="text"
                                                            value={formData.customProfession}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, customProfession: e.target.value }))}
                                                            className="form-input"
                                                            placeholder="Type your profession here..."
                                                            required={formData.profession === 'Others'}
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                    <div className="custom-note-wrapper">
                                                        <div className="info-icon">💡</div>
                                                        <p className="custom-note">
                                                            Please specify your profession if it's not in the list above.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.age || !formData.gender || !formData.profession || (formData.profession === 'Others' && !formData.customProfession)}
                                        className={`submit-btn ${loading ? 'loading' : ''}`}
                                    >
                                        {loading ? 'Completing...' : 'Complete Profile & Continue'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSkipProfile}
                                        className="skip-btn"
                                        disabled={loading}
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Register;