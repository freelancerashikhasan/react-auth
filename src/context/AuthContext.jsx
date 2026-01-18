import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || null);
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [requiresProfileCompletion, setRequiresProfileCompletion] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const navigate = useNavigate();

    // Request interceptor
    useEffect(() => {
        const requestInterceptor = axiosInstance.interceptors.request.use(
            (config) => {
                if (authToken) {
                    config.headers.Authorization = `Bearer ${authToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
                    originalRequest._retry = true;
                    
                    try {
                        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/refresh`, {
                            refresh_token: refreshToken
                        });
                        
                        const { token, refresh_token } = response.data;
                        
                        localStorage.setItem('authToken', token);
                        if (refresh_token) {
                            localStorage.setItem('refreshToken', refresh_token);
                            setRefreshToken(refresh_token);
                        }
                        setAuthToken(token);
                        
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        
                        return axiosInstance(originalRequest);
                    } catch (refreshError) {
                        handleLogout();
                        toast.error('Session expired. Please login again.');
                        return Promise.reject(refreshError);
                    }
                }
                
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [authToken, refreshToken]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (authToken) {
                try {
                    const response = await axiosInstance.get('/user');
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    if (error.response?.status === 401) {
                        handleLogout();
                    }
                }
            }
            setLoading(false);
        };

        fetchUserData();
    }, [authToken]);

      const getAndStoreRedirectUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirectUrl');
        
        if (redirectUrl) {
            // Store in localStorage for later use
            localStorage.setItem('loginRedirectUrl', redirectUrl);
        }
        return redirectUrl;
    };
     const clearRedirectUrl = () => {
        localStorage.removeItem('loginRedirectUrl');
    };

    // Function to redirect after successful login
    const redirectAfterLogin = (defaultPath = '/dashboard') => {
        const redirectUrl = localStorage.getItem('loginRedirectUrl');
        
        setTimeout(() => {
            if (redirectUrl) {
                // Clear the stored URL
                clearRedirectUrl();
                // Navigate to the redirect URL
                navigate(redirectUrl);
            } else {
                // Use default path
                navigate(defaultPath);
            }
        }, 100);
    };

    // OTP methods
    const sendOtp = async (phone) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/send-otp', { phone });
            setPhoneNumber(phone);
            setOtpSent(true);
            toast.success('OTP sent successfully!');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
            throw error;
        } finally {
            setLoading(false);
        }
    };


    const verifyOtp = async (otp) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/verify-otp', { 
                phone: phoneNumber, 
                otp 
            });
            
            const { token, refresh_token, user } = response.data;
            
            localStorage.setItem('authToken', token);
            localStorage.setItem('refreshToken', refresh_token);
            localStorage.setItem('user', JSON.stringify(user));
            
            setAuthToken(token);
            setRefreshToken(refresh_token);
            setUser(user);
            setOtpSent(false);
            
            toast.success('Login Successful!');
            
            setTimeout(() => {
                redirectAfterLogin('/profile');
            }, 100);
            
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // WhatsApp OTP methods
    const sendWhatsAppOtp = async (phone) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/whatsapp/send-otp', { phone });
            setPhoneNumber(phone);
            setOtpSent(true);
            toast.success('OTP sent to WhatsApp!');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send WhatsApp OTP');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const verifyWhatsAppOtp = async (otp) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/whatsapp/verify-otp', { 
                phone: phoneNumber, 
                otp 
            });
            
            // Check if profile completion is required
            // if (response.data.requires_profile_completion) {
            //     // Store temp user data
            //     localStorage.setItem('tempUser', JSON.stringify(response.data.user));
            //     setRequiresProfileCompletion(true);
            //     setOtpSent(false);
                
            //     // Navigate to profile completion
            //     navigate('/complete-profile');
            //     return response.data;
            // }
            
            // Complete login
            const { token, refresh_token, user } = response.data;
            
            localStorage.setItem('authToken', token);
            localStorage.setItem('refreshToken', refresh_token || token);
            localStorage.setItem('user', JSON.stringify(user));
            
            setAuthToken(token);
            setRefreshToken(refresh_token || token);
            setUser(user);
            setOtpSent(false);
            
            toast.success('WhatsApp Login Successful!');
            
            setTimeout(() => {
                redirectAfterLogin('/profile');
            }, 100);
            
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (credentials) => {
        try {
            const response = await axiosInstance.post('/login', credentials);
            const { token, refresh_token, user } = response.data;
            
            localStorage.setItem('authToken', token);
            localStorage.setItem('refreshToken', refresh_token || token);
            localStorage.setItem('user', JSON.stringify(user));
            
            setAuthToken(token);
            setRefreshToken(refresh_token || token);
            setUser(user);
            
            toast.success('Login Successful!');
            
            setTimeout(() => {
               redirectAfterLogin('/profile');
            }, 100);
            
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const handleRegister = async (userData) => {
        try {
            const response = await axiosInstance.post('/register', userData);
            toast.success('Registration successful! Please login.');
            
            setTimeout(() => {
                navigate('/login');
            }, 100);
            
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };
    const checkProfileComplete = async () => {
        try {
            const response = await axiosInstance.get('/auth/check-profile');
            return response.data.profile_complete;
        } catch (error) {
            console.error('Error checking profile status:', error);
            return false;
        }
    };

    const handleGoogleLogin = async (googleToken) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/auth/google/login', {
                google_token: googleToken
            });
            
            const { token, refresh_token, user, requires_profile_completion } = response.data;
            
            // Store auth data regardless of profile completion status
            localStorage.setItem('authToken', token);
            localStorage.setItem('refreshToken', refresh_token || token);
            localStorage.setItem('user', JSON.stringify(user));
            
            setAuthToken(token);
            setRefreshToken(refresh_token || token);
            setUser(user);
            
            // Set profile completion requirement
            setRequiresProfileCompletion(requires_profile_completion);
            
            toast.success(response.data.message || 'Google login successful!');
            
            // Redirect based on profile completion status
            // if (requires_profile_completion) {
            //     // Profile needs completion
            //     navigate('/complete-profile');
            // } else {
                // Profile is complete, go to dashboard
                redirectAfterLogin('/profile');
            // }
            
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (authToken) {
                await axiosInstance.post('/logout');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tempUser');
            setAuthToken(null);
            setRefreshToken(null);
            setUser(null);
            setOtpSent(false);
            setPhoneNumber('');
            setRequiresProfileCompletion(false);
            toast.success('Logged out successfully!');
            
            setTimeout(() => {
                navigate('/');
            }, 100);
        }
    };

    const updateUserProfile = async (userData) => {
        try {
            const response = await axiosInstance.put('/user/profile', userData);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            toast.success('Profile updated successfully!');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
            throw error;
        }
    };

    const changePassword = async (passwordData) => {
        try {
            await axiosInstance.put('/user/password', passwordData);
            toast.success('Password changed successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password change failed');
            throw error;
        }
    };
     const registerSendOtp = async (phone) => {
        try {
            const response = await axiosInstance.post('/auth/register/otp', { phone });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    };

    const registerVerifyOtp = async (data) => {
        try {
            const response = await axiosInstance.post('/auth/register/verify', data);
            const { token, user } = response.data;
            
            // Store token and user
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            setUser(user);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    };

    const completeProfile = async (profileData) => {
        try {
            setLoading(true);
            
            // Use the current authenticated user's ID
            const userId = user?.id;
            
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await axiosInstance.post('/auth/complete-profile', {
                user_id: userId,
                ...profileData
            });
            
            const { token, refresh_token, user: updatedUser } = response.data;
            
            // Update auth data
            localStorage.setItem('authToken', token);
            localStorage.setItem('refreshToken', refresh_token || token);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setAuthToken(token);
            setRefreshToken(refresh_token || token);
            setUser(updatedUser);
            setRequiresProfileCompletion(false);
            
            toast.success('Profile completed successfully!');
            
            // Redirect to dashboard after profile completion
            setTimeout(() => {
                redirectAfterLogin('/profile');
            }, 100);
            
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete profile');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const resetOtpState = () => {
        setOtpSent(false);
        setPhoneNumber('');
    };

    const value = {
        authToken,
        user,
        loading,
        otpSent,
        phoneNumber,
        requiresProfileCompletion,
        isAuthenticated: !!authToken,
        sendOtp,
        verifyOtp,
        sendWhatsAppOtp,
        checkProfileComplete,
        verifyWhatsAppOtp,
        login: handleLogin,
        register: handleRegister,
        googleLogin: handleGoogleLogin, // Renamed to handleGoogleLogin
        logout: handleLogout,
          registerSendOtp,
            registerVerifyOtp,
        updateProfile: updateUserProfile,
        changePassword,
        completeProfile,
        resetOtpState,
        setRequiresProfileCompletion,
         getAndStoreRedirectUrl, 
        clearRedirectUrl
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;