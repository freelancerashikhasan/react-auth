// src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../Layout/DashboardLayout';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Cake,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Calendar,
  Brain,
  Award,
  Video,
  CalendarCheck,
  Bell,
  Lock,
  CreditCard,
  Download,
  Trash2,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import '../Components/css/Profile.css';
import { useAPI } from '../services/apiService';

const Profile = () => {
  const { getProfile, updateProfile, uploadImage } = useAPI();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
    age: '',
    joinDate: '',
    bio: '',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [passwordData, setPasswordData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    trainingsCompleted: 0,
    certificatesEarned: 0,
    hoursWatched: 0,
    appointments: 0
  });

  // Load user profile data
  useEffect(() => {
    loadProfileData();
    loadStats();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await getProfile();
      if (response.data.success) {
        const userData = response.data.user;
        setUser({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          profession: userData.profession,
          age: userData.age,
          joinDate: userData.join_date,
          bio: userData.bio,
          avatar: userData.image || 'https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg'
        });
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          profession: userData.profession,
          age: userData.age,
          bio: userData.bio
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    // You can implement stats loading from your API
    // For now, using static data
    setStats({
      trainingsCompleted: 8,
      certificatesEarned: 5,
      hoursWatched: 12,
      appointments: 3
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Prepare data for API
      const updateData = { ...formData };
      
      // Add password if provided
      if (passwordData.password) {
        updateData.password = passwordData.password;
        updateData.password_confirmation = passwordData.password_confirmation;
      }
      
      const response = await updateProfile(updateData);
      
      if (response.data.success) {
        // Update local state with new data
        const updatedUser = response.data.user;
        setUser(prev => ({
          ...prev,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profession: updatedUser.profession,
          age: updatedUser.age,
          bio: updatedUser.bio,
          avatar: updatedUser.image || prev.avatar
        }));
        
        // Reset password fields
        setPasswordData({
          password: '',
          password_confirmation: ''
        });
        
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, SVG, GIF)');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadImage(formData);
      
      if (response.data.success) {
        setUser(prev => ({
          ...prev,
          avatar: response.data.image_url
        }));
        toast.success('Profile image updated successfully!');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setPasswordData({
      password: '',
      password_confirmation: ''
    });
    setIsEditing(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading && !isEditing) {
    return (
      <DashboardLayout>
        <div className="profile-page">
          <div className="loading-container">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings</p>
        </div>

        <div className="profile-container">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="profile-avatar" 
                />
                <label className="change-avatar-btn">
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <Camera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </>
                  )}
                </label>
              </div>
              
              {/* READ-ONLY VIEW - Shows when NOT editing */}
              {!isEditing && (
                <div className="profile-info-static">
                  <h2>{user.name || 'No name provided'}</h2>
                  <p className="profession">
                    <Briefcase size={16} />
                    {user.profession || 'No profession provided'}
                  </p>
                  
                  <div className="profile-details">
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>{user.email || 'No email provided'}</span>
                    </div>
                    <div className="detail-item">
                      <Phone size={16} />
                      <span>{user.phone || 'No phone provided'}</span>
                    </div>
                    <div className="detail-item">
                      <Cake size={16} />
                      <span>{user.age ? `${user.age} years` : 'Age not specified'}</span>
                    </div>
                    {user.bio && (
                      <div className="bio-section">
                        <h4>About Me</h4>
                        <p className="bio">{user.bio}</p>
                      </div>
                    )}
                  </div>
                  
                  <p className="member-since">
                    <Calendar size={16} />
                    Member since {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    }) : 'N/A'}
                  </p>
                  
                  <button 
                    className="edit-profile-btn" 
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                </div>
              )}
              
              {/* EDIT FORM - Shows when IS editing */}
              {isEditing && (
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">
                        <User size={16} />
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">
                        <Mail size={16} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">
                        <Phone size={16} />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="profession">
                        <Briefcase size={16} />
                        Profession
                      </label>
                      <input
                        type="text"
                        id="profession"
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        placeholder="Enter your profession"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="age">
                        <Cake size={16} />
                        Age
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Enter your age"
                        min="1"
                        max="100"
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="bio">
                        <Edit size={16} />
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows="3"
                        maxLength="1000"
                      />
                      <div className="char-count">
                        {formData.bio?.length || 0}/1000 characters
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="form-group full-width">
                      <label htmlFor="password">
                        <Lock size={16} />
                        Change Password (Optional)
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={passwordData.password}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          className="password-input"
                          minLength="8"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="input-hint">Leave blank to keep current password</p>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="confirmPassword">
                        <Lock size={16} />
                        Confirm Password
                      </label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password_confirmation"
                          name="password_confirmation"
                          value={passwordData.password_confirmation}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="password-input"
                          disabled={!passwordData.password}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                          disabled={!passwordData.password}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="stats-card">
            <h3>Your Activity</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">
                  <Brain size={20} />
                </div>
                <div className="stat-content">
                  <h4>{stats.trainingsCompleted}</h4>
                  <p>Trainings Completed</p>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <Award size={20} />
                </div>
                <div className="stat-content">
                  <h4>{stats.certificatesEarned}</h4>
                  <p>Certificates Earned</p>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <Video size={20} />
                </div>
                <div className="stat-content">
                  <h4>{stats.hoursWatched}</h4>
                  <p>Hours Watched</p>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <CalendarCheck size={20} />
                </div>
                <div className="stat-content">
                  <h4>{stats.appointments}</h4>
                  <p>Appointments</p>
                </div>
              </div>
            </div>
          </div>

        
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;