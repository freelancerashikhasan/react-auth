// src/services/api.js
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance without interceptors (they're in AuthContext)
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const userAPI = {
    // User data
    getProfile: (token) => api.get('/user', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    updateProfile: (data, token) => api.put('/user/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    uploadImage: (formData, token) => api.post('/user/upload-image', formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    }),
    
    // Dashboard data
    getDashboardData: (token) => api.get('/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    
    // Trainings
    getTrainings: (token) => api.get('/user/trainings', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    getTrainingDetails: (id, token) => api.get(`/user/trainings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    downloadEntryPass: (id, token) => api.get(`/user/trainings/${id}/entry-pass`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    }),
    downloadCertificate: (id, type, token) => api.get(`/user/trainings/${id}/certificate/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    }),
    downloadReceipt: (id, type, token) => api.get(`/user/receipt/${id}/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    }),
    
    // Appointments
    getAppointments: (token) => api.get('/user/appointments', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    downloadAppointmentReceipt: (id, token) => api.get(`/user/appointments/${id}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    }),
    
    // Online Courses
    getOnlineCourses: (token) => api.get('/user/online-courses', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    
    // Books/PDFs
    getOrders: (token) => api.get('/user/orders', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    downloadBook: (id, token) => api.get(`/user/books/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    }),
    downloadOrderReceipt: (id, token) => api.get(`/user/orders/${id}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    }),
    
    // Video Courses
    getVideoCourses: (token) => api.get('/user/video-courses', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    getFreeCourse: (token) => api.get('/user/free-course', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    getVideoCourseDetails: (id, token) => api.get(`/user/video-courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    markVideoAsWatched: (courseId, videoId, token) => api.post(`/user/video-courses/${courseId}/watch`, {
        video_id: videoId
    }, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    downloadCourseMaterials: (courseId, token) => api.get(`/user/video-courses/${courseId}/materials`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    }),
    
    // Training Materials
    getTrainingMaterials: (id, type, token) => api.get(`/user/materials/${id}/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    downloadMaterial: (id, token) => api.get(`/user/materials/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    }),
    
    // Logout is handled in AuthContext
};

export const useAPI = () => {
    const { authToken } = useAuth();
    
    return {
        getProfile: () => userAPI.getProfile(authToken),
        updateProfile: (data) => userAPI.updateProfile(data, authToken),
        uploadImage: (formData) => userAPI.uploadImage(formData, authToken),
        getDashboardData: () => userAPI.getDashboardData(authToken),
        getTrainings: () => userAPI.getTrainings(authToken),
        getTrainingDetails: (id) => userAPI.getTrainingDetails(id, authToken),
        downloadEntryPass: (id) => userAPI.downloadEntryPass(id, authToken),
        downloadCertificate: (id, type) => userAPI.downloadCertificate(id, type, authToken),
        downloadReceipt: (id, type) => userAPI.downloadReceipt(id, type, authToken),
        getAppointments: () => userAPI.getAppointments(authToken),
        downloadAppointmentReceipt: (id) => userAPI.downloadAppointmentReceipt(id, authToken),
        getOnlineCourses: () => userAPI.getOnlineCourses(authToken),
        getOrders: () => userAPI.getOrders(authToken),
        downloadBook: (id) => userAPI.downloadBook(id, authToken),
        downloadOrderReceipt: (id) => userAPI.downloadOrderReceipt(id, authToken),
        getVideoCourses: () => userAPI.getVideoCourses(authToken),
        getFreeCourse: () => userAPI.getFreeCourse(authToken),
        getVideoCourseDetails: (id) => userAPI.getVideoCourseDetails(id, authToken),
        markVideoAsWatched: (courseId, videoId) => userAPI.markVideoAsWatched(courseId, videoId, authToken),
        downloadCourseMaterials: (courseId) => userAPI.downloadCourseMaterials(courseId, authToken),
        getTrainingMaterials: (id, type) => userAPI.getTrainingMaterials(id, type, authToken),
        downloadMaterial: (id) => userAPI.downloadMaterial(id, authToken),
    };
};

export default api;