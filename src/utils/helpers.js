// src/utils/helpers.js
import toast from 'react-hot-toast';

/**
 * Format date to readable string
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};

/**
 * Format currency in BDT
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '৳ 0';
    
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return '৳ 0';
    
    return new Intl.NumberFormat('bn-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(numAmount);
};

/**
 * Format date in Bengali
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatDateBn = (dateString) => {
    if (!dateString) return 'তারিখ নেই';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'অবৈধ তারিখ';
        
        const banglaMonths = [
            'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
            'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
        ];
        
        const banglaDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
        
        const day = banglaDays[date.getDay()];
        const dateNum = date.getDate();
        const month = banglaMonths[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day}বার, ${dateNum} ${month} ${year}`;
    } catch (error) {
        console.error('Error formatting Bengali date:', error);
        return formatDate(dateString);
    }
};

/**
 * Convert number to Bengali digits
 * @param {number|string} number 
 * @returns {string}
 */
export const toBengaliDigits = (number) => {
    if (number === null || number === undefined) return '';
    
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(number).replace(/\d/g, (digit) => banglaDigits[digit]);
};

/**
 * Download blob as file
 * @param {Blob} blob 
 * @param {string} filename 
 */
export const downloadBlob = (blob, filename) => {
    try {
        // Create URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        link.style.display = 'none';
        
        // Append to document, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading file:', error);
        toast.error('Failed to download file');
    }
};

/**
 * Format file size to readable string
 * @param {number} bytes 
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get status badge configuration
 * @param {string} status 
 * @returns {Object}
 */
export const getStatusBadge = (status) => {
    const statusMap = {
        'completed': { 
            class: 'status-completed', 
            text: 'Completed',
            color: 'green'
        },
        'pending': { 
            class: 'status-pending', 
            text: 'Pending',
            color: 'yellow'
        },
        'approved': { 
            class: 'status-approved', 
            text: 'Approved',
            color: 'blue'
        },
        'cancelled': { 
            class: 'status-cancelled', 
            text: 'Cancelled',
            color: 'red'
        },
        'in-progress': { 
            class: 'status-in-progress', 
            text: 'In Progress',
            color: 'purple'
        },
        'upcoming': { 
            class: 'status-upcoming', 
            text: 'Upcoming',
            color: 'blue'
        },
        'default': { 
            class: 'status-default', 
            text: status || 'Unknown',
            color: 'gray'
        }
    };
    
    return statusMap[status?.toLowerCase()] || statusMap.default;
};

/**
 * Format time duration
 * @param {string} duration 
 * @returns {string}
 */
export const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    
    // Handle various duration formats
    if (typeof duration === 'string') {
        // Convert "2 hours" to "2h"
        return duration
            .replace(/\s*hours?\s*/gi, 'h ')
            .replace(/\s*days?\s*/gi, 'd ')
            .replace(/\s*weeks?\s*/gi, 'w ')
            .replace(/\s*months?\s*/gi, 'm ')
            .trim();
    }
    
    return duration;
};

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get user initials from name
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name) => {
    if (!name) return 'U';
    
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
};

/**
 * Check if date is upcoming
 * @param {string|Date} dateString 
 * @returns {boolean}
 */
export const isUpcoming = (dateString) => {
    if (!dateString) return false;
    
    try {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    } catch (error) {
        return false;
    }
};

/**
 * Calculate progress percentage
 * @param {number} current 
 * @param {number} total 
 * @returns {number}
 */
export const calculateProgress = (current, total) => {
    if (!total || total === 0) return 0;
    const percentage = (current / total) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
};

/**
 * Parse API error response
 * @param {Error} error 
 * @returns {string}
 */
export const getErrorMessage = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    
    if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        return Object.values(errors).flat().join(', ');
    }
    
    if (error.message) {
        return error.message;
    }
    
    return 'An unknown error occurred';
};

/**
 * Debounce function for search inputs
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Format phone number
 * @param {string} phone 
 * @returns {string}
 */
export const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format Bangladeshi phone numbers
    if (digits.length === 11 && digits.startsWith('01')) {
        return `+880 ${digits.substring(1, 4)} ${digits.substring(4, 8)} ${digits.substring(8)}`;
    }
    
    // Return as is for other formats
    return phone;
};

/**
 * Get training type label
 * @param {string} type 
 * @returns {string}
 */
export const getTrainingType = (type) => {
    const types = {
        'offline': 'Offline Training',
        'online': 'Online Course',
        'video': 'Video Course',
        'appointment': 'Appointment'
    };
    
    return types[type] || type || 'Training';
};

/**
 * Check if certificate is available
 * @param {Object} training 
 * @param {string} type 
 * @returns {boolean}
 */
export const isCertificateAvailable = (training, type = 'offline') => {
    if (!training?.seminar_date) return false;
    
    const trainingDate = new Date(training.seminar_date);
    const today = new Date();
    
    // Certificate available after training date
    return trainingDate < today;
};

/**
 * Format seminar time
 * @param {string} time 
 * @returns {string}
 */
export const formatTime = (time) => {
    if (!time) return '';
    
    try {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
        return time;
    }
};

export default {
    formatDate,
    formatCurrency,
    formatDateBn,
    toBengaliDigits,
    downloadBlob,
    formatFileSize,
    getStatusBadge,
    formatDuration,
    truncateText,
    getInitials,
    isUpcoming,
    calculateProgress,
    getErrorMessage,
    debounce,
    formatPhone,
    getTrainingType,
    isCertificateAvailable,
    formatTime
};