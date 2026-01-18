// src/pages/Orders/Orders.jsx
import React, { useState, useEffect } from 'react';
import { 
    ShoppingBag, 
    Calendar, 
    Download, 
    FileText,
    Package,
    Truck,
    CheckCircle,
    Clock,
    Search,
    ChevronRight,
    CreditCard,
    User,
    MapPin,
    Phone,
    Mail,
    BookOpen,
    FileDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useAPI } from '../../services/apiService';
import DashboardLayout from '../../Layout/DashboardLayout';
import '../../css/Courses.css';

const Orders = () => {
    const { user } = useAuth();
    const api = useAPI();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchTerm, filter, orders]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Note: Changed from api.getOrders() to api.orders() based on your route
            const response = await api.getOrders();
            setOrders(response.data || []);
            setFilteredOrders(response.data || []);
        } catch (error) {
            toast.error('Failed to load orders');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.id.toString().includes(searchTerm) ||
                order.order_items?.some(item => 
                    item.book?.title?.toLowerCase().includes(searchLower)
                ) ||
                order.name?.toLowerCase().includes(searchLower) ||
                order.phone?.includes(searchTerm)
            );
        }

        // Apply status filter
        if (filter !== 'all') {
            if (filter === 'delivered') {
                filtered = filtered.filter(order => order.delivery_status === 'delivered');
            } else if (filter === 'not_delivered') {
                filtered = filtered.filter(order => order.delivery_status === 'not_delivered');
            } else if (filter === 'completed') {
                filtered = filtered.filter(order => order.status === 1);
            }
        }

        setFilteredOrders(filtered);
    };

    const handleDownloadReceipt = async (orderId) => {
        try {
            const response = await api.downloadOrderReceipt(orderId);
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-order-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Receipt downloaded successfully');
        } catch (error) {
            toast.error('Failed to download receipt');
        }
    };

    const handleDownloadPDF = async (bookId, bookTitle, pdfUrl = null) => {
        try {
            if (pdfUrl) {
                // Method 1: Direct download from URL (if file is publicly accessible)
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.setAttribute('download', `${bookTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
                link.setAttribute('target', '_blank'); // Open in new tab if download doesn't work
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Book download started');
                
                // Method 2: Fetch and download (if you need to handle auth/cors)
                /*
                const response = await fetch(pdfUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/pdf',
                    },
                    credentials: 'include', // Include cookies if needed
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${bookTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                toast.success('Book downloaded successfully');
                */
            } else {
                // Fallback to API download if no direct URL
                const response = await api.downloadBook(bookId);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${bookTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Book downloaded successfully');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download book');
        }
    };

  

    const getStatusBadge = (deliveryStatus, status) => {
        if (deliveryStatus === 'delivered') {
            return { 
                color: '#4CAF50', 
                label: 'Delivered', 
                icon: <CheckCircle size={16} /> 
            };
        } else if (deliveryStatus === 'not_delivered') {
            return { 
                color: '#FF9800', 
                label: 'Not Delivered', 
                icon: <Package size={16} /> 
            };
        } else if (status === 1) {
            return { 
                color: '#2196F3', 
                label: 'Active', 
                icon: <CheckCircle size={16} /> 
            };
        } else {
            return { 
                color: '#757575', 
                label: 'Unknown', 
                icon: <Clock size={16} /> 
            };
        }
    };

    const getPaymentMethodDisplay = (method) => {
        switch(method?.toLowerCase()) {
            case 'cod':
                return 'Cash on Delivery';
            case 'card':
                return 'Credit/Debit Card';
            case 'bkash':
                return 'bKash';
            case 'nagad':
                return 'Nagad';
            default:
                return method || 'N/A';
        }
    };

    const formatPrice = (price) => {
        return `৳${parseFloat(price || 0).toFixed(2)}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="courses-page">
                <div className="page-header">
                    <h1 className="page-title" style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #FF9800 100%)' }}>
                        My Orders
                    </h1>
                    <p className="page-subtitle">Your purchased books and orders history</p>
                </div>

                {/* Stats Summary */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(108, 92, 231, 0.05) 100%)',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(108, 92, 231, 0.2)',
                        flex: '1',
                        minWidth: '200px'
                    }}>
                        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{orders.length}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Total Orders</p>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        flex: '1',
                        minWidth: '200px'
                    }}>
                        <h3 style={{ color: '#4CAF50', marginBottom: '0.5rem' }}>
                            {orders.filter(o => o.delivery_status === 'delivered').length}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Delivered</p>
                    </div>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 152, 0, 0.2)',
                        flex: '1',
                        minWidth: '200px'
                    }}>
                        <h3 style={{ color: '#FF9800', marginBottom: '0.5rem' }}>
                            {orders.filter(o => o.delivery_status === 'not_delivered').length}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Pending Delivery</p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order ID, book title, name, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All Orders
                        </button>
                        <button
                            className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                            onClick={() => setFilter('delivered')}
                        >
                            Delivered
                        </button>
                        <button
                            className={`filter-btn ${filter === 'not_delivered' ? 'active' : ''}`}
                            onClick={() => setFilter('not_delivered')}
                        >
                            Not Delivered
                        </button>
                        <button
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Active
                        </button>
                    </div>
                </div>

                {/* Orders Grid */}
                <div className="courses-grid">
                    {filteredOrders.length === 0 ? (
                        <div className="empty-state">
                            <ShoppingBag size={48} className="empty-icon" />
                            <h3>No orders found</h3>
                            <p>You haven't placed any orders yet.</p>
                            <Link to="/books" className="action-btn watch-btn" style={{ marginTop: '1rem', textDecoration: 'none' }}>
                                Browse Books
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const statusInfo = getStatusBadge(order.delivery_status, order.status);
                            const totalItems = order.order_items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
                            const hasPDF = order.order_items?.some(item => item.pdf?.file);
                            const hasDigitalBook = order.order_items?.some(item => item.book?.resource_link);
                            
                            return (
                                <div key={order.id} className="course-card">
                                    <div className="course-card-header">
                                        <div className="course-icon-wrapper">
                                            <ShoppingBag size={28} />
                                        </div>
                                        <div className="order-status">
                                            <span 
                                                className="status-badge" 
                                                style={{
                                                    background: `linear-gradient(135deg, ${statusInfo.color}22 0%, ${statusInfo.color}11 100%)`,
                                                    color: statusInfo.color,
                                                    borderColor: `${statusInfo.color}33`
                                                }}
                                            >
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="course-title">
                                        Order #{order.id}
                                    </h3>
                                    
                                    <div className="course-details">
                                        <div className="detail-item">
                                            <Calendar size={18} />
                                            <span>Date: {formatDate(order.created_at)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <CreditCard size={18} />
                                            <span>Payment: {getPaymentMethodDisplay(order.payment_method)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <User size={18} />
                                            <span>Items: {totalItems}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="price-tag">
                                                Total: {formatPrice(order.price)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div style={{ margin: '1rem 0' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem'
                                        }}>
                                            {order.name && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <User size={14} style={{ color: '#6C5CE7' }} />
                                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{order.name}</span>
                                                </div>
                                            )}
                                            {order.phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Phone size={14} style={{ color: '#6C5CE7' }} />
                                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{order.phone}</span>
                                                </div>
                                            )}
                                            {order.email && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Mail size={14} style={{ color: '#6C5CE7' }} />
                                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{order.email}</span>
                                                </div>
                                            )}
                                            {order.address && (
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                    <MapPin size={14} style={{ color: '#6C5CE7', marginTop: '2px' }} />
                                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{order.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div style={{ marginTop: '1rem' }}>
                                        <h4 style={{ 
                                            color: 'rgba(255,255,255,0.9)', 
                                            marginBottom: '0.75rem', 
                                            fontSize: '0.95rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <BookOpen size={16} />
                                            Order Items:
                                        </h4>
                                        {order.order_items?.slice(0, 3).map((item, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                padding: '0.75rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '8px',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <div>
                                                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '500' }}>
                                                        {item.book?.title || 'Book'}
                                                    </div>
                                                    <div style={{ 
                                                        color: 'rgba(255,255,255,0.6)', 
                                                        fontSize: '0.8rem',
                                                        marginTop: '0.25rem'
                                                    }}>
                                                        Qty: {item.quantity || 1} × {formatPrice(item.price)}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: '#6C5CE7', fontWeight: '600' }}>
                                                        {formatPrice(item.price * (item.quantity || 1))}
                                                    </div>
                                                    {item.pdf?.file_url && (
                                                        <button
                                                            onClick={() => handleDownloadPDF(
                                                                item.book?.id, 
                                                                item.book?.title || item.pdf?.title,
                                                                item.pdf.file_url // Pass the direct URL here
                                                            )}
                                                            className="action-btn materials-btn"
                                                        >
                                                            <FileText size={18} />
                                                            Download {item.pdf?.title || 'PDF'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {order.order_items?.length > 3 && (
                                            <div style={{
                                                textAlign: 'center',
                                                color: 'rgba(255,255,255,0.6)',
                                                fontSize: '0.85rem',
                                                marginTop: '0.5rem',
                                                padding: '0.5rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '8px'
                                            }}>
                                                +{order.order_items.length - 3} more items
                                            </div>
                                        )}
                                    </div>

                                    {/* Delivery Details */}
                                    {order.delivery_charge && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                                Delivery Charge:
                                            </div>
                                            <div style={{ color: '#FF9800', fontWeight: '600' }}>
                                                {formatPrice(order.delivery_charge)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="course-actions">
                                        <button
                                            onClick={() => handleDownloadReceipt(order.id)}
                                            className="action-btn download-btn"
                                        >
                                            <Download size={18} />
                                            Receipt
                                        </button>
                                        
                                        {hasPDF && (
                                            <button
                                                onClick={() => {
                                                    const pdfItem = order.order_items.find(item => item.pdf?.file);
                                                    if (pdfItem?.pdf) {
                                                        handleDownloadPDF(pdfItem.pdf.id, pdfItem.pdf.title,pdfItem.pdf.file_url);
                                                    }
                                                }}
                                                className="action-btn materials-btn"
                                            >
                                                <FileText size={18} />
                                                Download PDF
                                            </button>
                                        )}

                                      
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Orders;