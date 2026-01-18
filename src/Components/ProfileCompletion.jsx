import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Briefcase, ChevronLeft, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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

const ProfileCompletion = () => {
    const { completeProfile, user, checkProfileComplete } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        profession: ''
    });
    const [customProfession, setCustomProfession] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
    const [filteredProfessions, setFilteredProfessions] = useState(professions);
    const [loading, setLoading] = useState(false);
    const [profileComplete, setProfileComplete] = useState(false);



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

    // Pre-fill with existing user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                age: user.age || '',
                gender: user.gender || '',
                profession: user.profession || ''
            });
            
            // Check if profession is custom (not in the list)
            if (user.profession && !professions.includes(user.profession) && user.profession !== 'Others') {
                setFormData(prev => ({ ...prev, profession: 'Others' }));
                setCustomProfession(user.profession);
            }
        }
    }, [user]);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // If profession is changed to "Others", show custom input
        if (name === 'profession' && value === 'Others') {
            setCustomProfession('');
        } else if (name === 'profession' && value !== 'Others') {
            setCustomProfession('');
        }
    };

    const handlePhoneChange = (value, country) => {
        setFormData(prev => ({
            ...prev,
            phone: value
        }));
    };

    const handleCustomProfessionChange = (e) => {
        setCustomProfession(e.target.value);
    };

    const handleProfessionSelect = (profession) => {
        setFormData(prev => ({ ...prev, profession }));
        setShowProfessionDropdown(false);
        setSearchQuery('');
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Prepare final data
            const finalData = {
                ...formData,
                // If profession is "Others", use customProfession value
                profession: formData.profession === 'Others' ? customProfession : formData.profession
            };
            
            await completeProfile(finalData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Profile completion failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // If profile is already complete, show loading or redirect
    if (profileComplete) {
        return (
            <Layout>
                <div className="login-page">
                    <div className="profile-completion-container">
                        <div className="profile-card">
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Redirecting to dashboard...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="login-page">
                {/* Animated Background */}
                <div className="background-animation">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                </div>

                <div className="profile-completion-container">
                    <div className="profile-card">
                        {/* Header */}
                        <div className="profile-header">
                            <button
                                onClick={() => navigate(-1)}
                                className="back-button"
                            >
                                <ChevronLeft size={24} />
                                <span className="back-text">Back</span>
                            </button>
                            <div className="profile-icon-container">
                                <div className="profile-icon-wrapper">
                                    <User size={32} className="profile-icon" />
                                </div>
                            </div>
                            <h2 className="profile-title">Complete Your Profile</h2>
                            <p className="profile-subtitle">
                                Add your details to personalize your experience
                                {user?.phone && (
                                    <span className="phone-note">
                                        <br />Phone: {user.phone}
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label className="form-label">
                                    <User className="input-icon" />
                                    Full Name
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Mail className="input-icon" />
                                    Email Address
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* Phone Number with Country Code */}
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="phone-input-wrapper">
                                    <PhoneInput
                                        country={'bd'}
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        inputProps={{
                                            name: 'phone',
                                            required: false,
                                            autoFocus: false
                                        }}
                                        enableSearch
                                        searchPlaceholder="Search country..."
                                        placeholder="Enter phone number"
                                        disableDropdown={false}
                                        countryCodeEditable={true}
                                        specialLabel=""
                                        inputStyle={{
                                            width: '100%',
                                            height: '56px',
                                            fontSize: '16px',
                                            paddingLeft: '60px',
                                            borderRadius: '16px',
                                            border: '2px solid #e0e0e0',
                                            transition: 'border-color 0.3s',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }}
                                        buttonStyle={{
                                            borderRadius: '16px 0 0 16px',
                                            backgroundColor: '#f8f9fa',
                                            border: '2px solid #e0e0e0',
                                            borderRight: 'none',
                                            height: '54px'
                                        }}
                                        dropdownStyle={{
                                            borderRadius: '16px',
                                            marginTop: '10px',
                                            maxHeight: '300px',
                                            overflowY: 'auto'
                                        }}
                                        containerStyle={{
                                            width: '100%'
                                        }}
                                        searchStyle={{
                                            padding: '12px',
                                            margin: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <Calendar className="input-icon" />
                                        Age
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Age"
                                            min="1"
                                            max="150"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <Briefcase className="input-icon" />
                                        Gender
                                    </label>
                                    <div className="input-wrapper select-wrapper">
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="form-input select-input"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <ChevronLeft className="select-arrow" />
                                    </div>
                                </div>
                            </div>

                            {/* Profession Section with Fixed Dropdown */}
                            <div className="form-group profession-group">
                                <label className="form-label">
                                    <Briefcase className="input-icon" />
                                    Profession
                                </label>
                                <div className="profession-input-wrapper" ref={dropdownRef}>
                                    <div className="profession-select-wrapper">
                                        <div 
                                            className="profession-select-trigger"
                                            onClick={() => setShowProfessionDropdown(!showProfessionDropdown)}
                                        >
                                            <input
                                                type="text"
                                                value={formData.profession}
                                                readOnly
                                                className="form-input"
                                                placeholder="Select your profession"
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <ChevronLeft 
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
                                                        />
                                                        {searchQuery && (
                                                            <button
                                                                type="button"
                                                                className="clear-search"
                                                                onClick={handleClearSearch}
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
                                    
                                    {/* Show custom input if "Others" is selected */}
                                    {formData.profession === 'Others' && (
                                        <div className="custom-profession-input">
                                            <div className="input-wrapper">
                                                <input
                                                    type="text"
                                                    value={customProfession}
                                                    onChange={handleCustomProfessionChange}
                                                    className="form-input"
                                                    placeholder="Type your profession here..."
                                                    required={formData.profession === 'Others'}
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

                            <button
                                type="submit"
                                disabled={loading || (formData.profession === 'Others' && !customProfession)}
                                className={`submit-btn ${loading ? 'loading' : ''}`}
                            >
                                {loading ? 'Saving...' : 'Complete Profile & Continue'}
                            </button>

                            <div className="profile-footer">
                                <p className="footer-text">
                                    * All fields are optional except profession when "Others" is selected.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfileCompletion;