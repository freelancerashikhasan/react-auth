import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle, 
  Download, 
  Home, 
  ShoppingBag, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Package, 
  CreditCard,
  Truck,
  Clock,
  BookOpen,
  Check,
  Mail,
  Printer,
  Share2,
  AlertCircle
} from 'lucide-react';
import Layout from '../Layout/Layout';
import '../css/OrderSuccess.css';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [downloadingPDFs, setDownloadingPDFs] = useState(false);
  
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('order_id');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setError('No order ID found');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/${id}`);
      
      if (response.data.success) {
        setOrderData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      if (err.response?.status === 404) {
        setError('Order not found. Please check your order ID.');
      } else {
        setError('Error loading order details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!orderData) return;
    
    try {
      setDownloadingReceipt(true);
      
      // Method 1: Try direct download endpoint
      try {
        const response = await axios.get(`${API_URL}/orders/${orderData.id}/receipt/download`, {
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf'
          }
        });
        
        // Create blob and download
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt-order-${orderData.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        return;
        
      } catch (directDownloadError) {
        console.log('Direct download failed, trying alternative method:', directDownloadError);
      }
      
      // Method 2: Try regular receipt endpoint
      try {
        const receiptResponse = await axios.get(`${API_URL}/orders/${orderData.id}/receipt`);
        
        if (receiptResponse.data.success) {
          if (receiptResponse.data.data?.download_url) {
            // If URL is returned, open in new tab
            window.open(receiptResponse.data.data.download_url, '_blank');
          } else if (receiptResponse.data.data?.base64_pdf) {
            // If base64 is returned, decode and download
            const base64Data = receiptResponse.data.data.base64_pdf;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-order-${orderData.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          } else if (receiptResponse.data.data?.pdf_base64) {
            // Alternative base64 field
            const base64Data = receiptResponse.data.data.pdf_base64;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-order-${orderData.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          }
        } else {
          alert('Failed to generate receipt. Please try again.');
        }
      } catch (receiptError) {
        console.error('Receipt generation error:', receiptError);
        
        // Method 3: Fallback to old method
        try {
          const response = await axios.get(`${API_URL}/orders/${orderData.id}/receipt`, {
            responseType: 'blob'
          });
          
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `receipt-order-${orderData.id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          alert('Failed to download receipt. Please try again or contact support.');
        }
      }
      
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const handleDownloadPDFs = async (bookId, bookTitle, pdfUrl = null) => {
        try {
            if (pdfUrl) {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.setAttribute('download', `${bookTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
                link.setAttribute('target', '_blank'); // Open in new tab if download doesn't work
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Book download started');
                
               
            } 
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download book');
        }
    };

  const handleShareOrder = () => {
    if (!orderData) return;
    
    const orderNumber = orderData.id;
    const datePrefix = orderData.date ? new Date(orderData.date).getDate().toString().padStart(2, '0') + 
                     (new Date(orderData.date).getMonth() + 1).toString().padStart(2, '0') + 
                     new Date(orderData.date).getFullYear() : '';
    const fullOrderId = datePrefix + orderNumber;
    
    const shareText = `I just placed an order #${fullOrderId} from Sabit International! Total: ${orderData.price} BDT`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Order from Sabit International',
        text: shareText,
        url: shareUrl,
      }).catch(err => {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} - ${shareUrl}`)
          .then(() => alert('Order link copied to clipboard!'))
          .catch(() => alert('Failed to share. Please copy the URL manually.'));
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`)
        .then(() => alert('Order link copied to clipboard!'))
        .catch(() => {
          // Ultimate fallback
          const textArea = document.createElement('textarea');
          textArea.value = `${shareText} - ${shareUrl}`;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Order link copied to clipboard!');
        });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="order-success-container min-vh-100 py-5">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your order details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !orderData) {
    return (
      <Layout>
        <div className="order-success-container min-vh-100 py-5">
          <div className="container">
            <div className="text-center py-5">
              <div className="alert alert-danger">
                <div className="d-flex align-items-center">
                  <AlertCircle size={20} className="me-2" />
                  <div>{error || 'Order not found'}</div>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => navigate('/')}
                  className="btn btn-primary me-3"
                >
                  <Home className="me-2" size={18} />
                  Back to Home
                </button>
                <button 
                  onClick={() => navigate('/books')}
                  className="btn btn-outline-primary"
                >
                  <ShoppingBag className="me-2" size={18} />
                  Browse Books
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'N/A';
    }
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    return (item.price * item.quantity).toFixed(2);
  };

  // Calculate order date prefix
  const getOrderDatePrefix = () => {
    if (!orderData.date) return '';
    try {
      const date = new Date(orderData.date);
      if (isNaN(date.getTime())) return '';
      return date.getDate().toString().padStart(2, '0') + 
             (date.getMonth() + 1).toString().padStart(2, '0') + 
             date.getFullYear();
    } catch (e) {
      return '';
    }
  };

  const hasPDFs = orderData.order_items?.some(item => item.type === 'pdf') || false;
  const hasBooks = orderData.order_items?.some(item => item.type === 'book') || false;
  const orderDatePrefix = getOrderDatePrefix();
  const fullOrderId = orderDatePrefix + orderData.id;

  return (
    <Layout>
      <div className="order-success-container min-vh-100 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              {/* Success Header */}
              <div className="success-header text-center mb-5">
                <div className="success-icon-wrapper d-inline-flex align-items-center justify-content-center mb-4">
                  <CheckCircle className="text-success" size={64} />
                </div>
                <h1 className="display-5 fw-bold text-dark mb-3">
                  Order Confirmed! 🎉
                </h1>
                <p className="lead text-muted mb-0">
                  Thank you for your purchase. Your order has been received and is being processed.
                </p>
                <div className="alert alert-success mt-4">
                  <div className="d-flex align-items-center">
                    <Check className="me-2" size={20} />
                    <div>
                      <strong>Order ID:</strong> #{fullOrderId}
                      {orderData.date && (
                        <span className="ms-3">
                          <Calendar size={14} className="me-1" />
                          {formatDate(orderData.date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notice */}
              <div className="notice-card p-4 rounded-4 shadow text-white position-relative overflow-hidden mb-4">
                <div className="position-absolute top-0 start-0 w-100 h-100 notice-gradient"></div>
                <div className="position-relative">
                  <h4 className="fw-bold mb-3 d-flex align-items-center">
                    <FileText size={20} className="me-2" />
                    <span>Order Information</span>
                  </h4>
                  <p className="mb-3">
                    Dear {orderData.name},<br/><br/>
                    Your order has been successfully placed. You will receive an SMS confirmation shortly.
                    {hasPDFs && ' Your PDF files are available for download below.'}
                    {hasBooks && ' Physical books will be shipped to your address.'}
                    <br/><br/>
                    Thank you for shopping with us.
                  </p>
                  <div className="d-flex align-items-center">
                    <CreditCard size={16} className="me-2" />
                    <span className="fw-bold">Payment Method: </span>
                    <span className="ms-2 text-uppercase">{orderData.payment_method || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                {/* Order Summary Card */}
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div className="card-header bg-primary bg-gradient text-white py-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <h2 className="h4 mb-0">
                          <Package className="me-2" size={20} />
                          Order Summary
                        </h2>
                        <span className="badge bg-light text-primary fs-6 px-3 py-2">
                          #{fullOrderId}
                        </span>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="h5 mb-3 fw-semibold">Items Ordered</h4>
                        {orderData.order_items?.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-borderless mb-0">
                              <thead>
                                <tr className="border-bottom">
                                  <th className="fw-medium text-muted">Product</th>
                                  <th className="fw-medium text-muted text-center">Quantity</th>
                                  <th className="fw-medium text-muted text-center">Type</th>
                                  <th className="fw-medium text-muted text-end">Price</th>
                                  <th className="fw-medium text-muted text-end">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderData.order_items.map((item, index) => (
                                  <tr key={index} className="border-bottom">
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="bg-light rounded p-2 me-3">
                                          {item.type === 'pdf' ? (
                                            <FileText size={20} className="text-primary" />
                                          ) : (
                                            <BookOpen size={20} className="text-warning" />
                                          )}
                                        </div>
                                        <div>
                                          <span className="fw-medium d-block">
                                            {item.book?.title || item.pdf?.title || `Item ${index + 1}`}

                                              {hasPDFs && (
                                                <button 
                                                  onClick={() => handleDownloadPDFs(
                                                            item.pdf?.id, 
                                                            item.pdf?.title || item.pdf?.title,
                                                            item.file_url // Pass the direct URL here
                                                        )}
                                                  disabled={downloadingPDFs}
                                                  className="btn btn-success w-100 d-flex align-items-center justify-content-center py-2"
                                                >
                                                  {downloadingPDFs ? (
                                                    <>
                                                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                      Downloading...
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Download className="me-2" size={18} />
                                                      Download PDFs
                                                    </>
                                                  )}
                                                </button>
                                                
                                              )}
                                          </span>
                                          <small className="text-muted">
                                            {item.type === 'book' && item.book?.author && `by ${item.book.author}`}
                                            {item.type === 'pdf' && item.pdf?.pages && `${item.pdf.pages} pages`}
                                          </small>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-center align-middle">
                                      <span className="badge bg-secondary">{item.quantity}</span>
                                    </td>
                                    <td className="text-center align-middle">
                                      <span className={`badge ${item.type === 'pdf' ? 'bg-info' : 'bg-warning'}`}>
                                        {item.type?.toUpperCase() || 'PRODUCT'}
                                      </span>
                                    </td>
                                    <td className="text-end align-middle fw-semibold">
                                      {item.price ? `${item.price} ৳` : 'N/A'}
                                    </td>
                                    <td className="text-end align-middle fw-bold">
                                      {calculateItemTotal(item)} ৳
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan="3"></td>
                                  <td className="text-end fw-bold py-3">Subtotal:</td>
                                  <td className="text-end fw-bold py-3">
                                    {((orderData.price || 0) - (orderData.delivery_charge || 0)).toFixed(2)} ৳
                                  </td>
                                </tr>
                                {hasBooks && orderData.delivery_charge && orderData.delivery_charge > 0 && (
                                  <tr>
                                    <td colSpan="3"></td>
                                    <td className="text-end fw-bold py-3">Delivery:</td>
                                    <td className="text-end fw-bold py-3">
                                      {orderData.delivery_charge} ৳
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td colSpan="3"></td>
                                  <td className="text-end fw-bold py-3">Total:</td>
                                  <td className="text-end fw-bold fs-5 text-primary py-3">
                                    {orderData.price || 0} ৳
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Package size={48} className="text-muted mb-3" />
                            <p className="text-muted">No items found in this order.</p>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="row g-3">
                        <div className="col-md-4">
                          <button 
                            onClick={handleDownloadReceipt}
                            disabled={downloadingReceipt}
                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center py-2"
                          >
                            {downloadingReceipt ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Printer className="me-2" size={18} />
                                Download Receipt
                              </>
                            )}
                          </button>
                        </div>
                        <div className="col-md-4">
                        
                           
                        </div>
                        <div className="col-md-4">
                          <button 
                            onClick={handleShareOrder}
                            className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center py-2"
                          >
                            <Share2 className="me-2" size={18} />
                            Share Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details Card */}
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-header bg-dark bg-gradient text-white py-4">
                      <h3 className="h5 mb-0">
                        <Calendar className="me-2" size={20} />
                        Order Details
                      </h3>
                    </div>
                    <div className="card-body p-4">
                      <div className="order-details-list">
                        <div className="order-detail-item mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="icon-wrapper bg-light-primary rounded-circle p-2 me-3">
                              <User size={18} className="text-primary" />
                            </div>
                            <div>
                              <small className="text-muted d-block">Customer Name</small>
                              <span className="fw-semibold">{orderData.name || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="order-detail-item mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="icon-wrapper bg-light-success rounded-circle p-2 me-3">
                              <Phone size={18} className="text-success" />
                            </div>
                            <div>
                              <small className="text-muted d-block">Phone Number</small>
                              <span className="fw-semibold">{orderData.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {orderData.email && (
                          <div className="order-detail-item mb-3">
                            <div className="d-flex align-items-center mb-2">
                              <div className="icon-wrapper bg-light-info rounded-circle p-2 me-3">
                                <Mail size={18} className="text-info" />
                              </div>
                              <div>
                                <small className="text-muted d-block">Email Address</small>
                                <span className="fw-semibold">{orderData.email}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {orderData.address && (
                          <div className="order-detail-item mb-3">
                            <div className="d-flex align-items-start mb-2">
                              <div className="icon-wrapper bg-light-warning rounded-circle p-2 me-3">
                                <MapPin size={18} className="text-warning" />
                              </div>
                              <div>
                                <small className="text-muted d-block">Shipping Address</small>
                                <span className="fw-semibold">{orderData.address}</span>
                                {orderData.district?.name && (
                                  <div className="small text-muted mt-1">
                                    {orderData.district.name}
                                    {orderData.division?.name && `, ${orderData.division.name}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="order-detail-item mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="icon-wrapper bg-light-danger rounded-circle p-2 me-3">
                              <CreditCard size={18} className="text-danger" />
                            </div>
                            <div>
                              <small className="text-muted d-block">Payment Method</small>
                              <span className="fw-semibold text-uppercase">
                                {orderData.payment_method || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="order-detail-item mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="icon-wrapper bg-light-info rounded-circle p-2 me-3">
                              {orderData.status === 1 ? (
                                <Check className="text-success" size={18} />
                              ) : (
                                <Clock className="text-info" size={18} />
                              )}
                            </div>
                            <div>
                              <small className="text-muted d-block">Order Status</small>
                              <span className={`fw-semibold ${
                                orderData.status === 1 ? 'text-success' : 'text-info'
                              }`}>
                                {orderData.status === 1 ? 'Confirmed' : 'Processing'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {orderData.notes && (
                          <div className="order-detail-item">
                            <div className="d-flex align-items-start mb-2">
                              <div className="icon-wrapper bg-light-secondary rounded-circle p-2 me-3">
                                <FileText size={18} className="text-secondary" />
                              </div>
                              <div>
                                <small className="text-muted d-block">Order Notes</small>
                                <span className="fw-semibold">{orderData.notes}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="card border-0 shadow-sm rounded-4 mt-4">
                <div className="card-body p-4">
                  <h3 className="h4 mb-4 fw-semibold text-dark">What happens next?</h3>
                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="next-step-card text-center p-3 h-100">
                        <div className="step-icon-wrapper mb-3">
                          <div className="step-number">1</div>
                          <Package className="text-primary" size={32} />
                        </div>
                        <h5 className="fw-semibold mb-2">Order Processing</h5>
                        <p className="text-muted small mb-0">
                          We're preparing your order. You'll receive SMS/email updates.
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="next-step-card text-center p-3 h-100">
                        <div className="step-icon-wrapper mb-3">
                          <div className="step-number">2</div>
                          {hasPDFs ? (
                            <Download className="text-success" size={32} />
                          ) : (
                            <Truck className="text-success" size={32} />
                          )}
                        </div>
                        <h5 className="fw-semibold mb-2">
                          {hasPDFs ? 'Instant Access' : 'Shipping'}
                        </h5>
                        <p className="text-muted small mb-0">
                          {hasPDFs 
                            ? 'Download your PDFs immediately from your account.'
                            : 'Physical books will be shipped within 24 hours.'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="next-step-card text-center p-3 h-100">
                        <div className="step-icon-wrapper mb-3">
                          <div className="step-number">3</div>
                          <CheckCircle className="text-warning" size={32} />
                        </div>
                        <h5 className="fw-semibold mb-2">Delivery</h5>
                        <p className="text-muted small mb-0">
                          {hasBooks 
                            ? 'Delivery within 3-5 business days. Track via SMS.'
                            : 'Digital delivery completed instantly.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons mt-5 pt-3">
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <Link
                    to="/"
                    className="btn btn-lg btn-primary px-5 py-3 d-flex align-items-center justify-content-center"
                  >
                    <Home className="me-2" size={20} />
                    Back to Homepage
                  </Link>
                  
                  <Link
                    to="/books"
                    className="btn btn-lg btn-outline-dark px-5 py-3 d-flex align-items-center justify-content-center"
                  >
                    <ShoppingBag className="me-2" size={20} />
                    Continue Shopping
                  </Link>
                  
                  {hasPDFs && (
                    <button
                      onClick={handleDownloadPDFs}
                      disabled={downloadingPDFs}
                      className="btn btn-lg btn-success px-5 py-3 d-flex align-items-center justify-content-center"
                    >
                      {downloadingPDFs ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Downloading PDFs...
                        </>
                      ) : (
                        <>
                          <Download className="me-2" size={20} />
                          Download All PDFs
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Support Info */}
              <div className="text-center mt-5 pt-4 border-top">
                <p className="text-muted mb-2">
                  Need help? Contact our support team
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-4">
                  <a href="mailto:support@sabitinternational.com" className="text-decoration-none text-primary">
                    <Mail size={16} className="me-1" />
                    support@sabitinternational.com
                  </a>
                  <a href="tel:+8801712345678" className="text-decoration-none text-primary">
                    <Phone size={16} className="me-1" />
                    +880 1712-345678
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;