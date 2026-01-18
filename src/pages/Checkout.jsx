import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  MapPin, 
  CreditCard, 
  Truck,
  AlertCircle,
  BookOpen,
  FileText,
  Home,
  ChevronRight,
  Shield,
  Clock,
  User,
  Phone,
  Ban,
  Info,
  CheckCircle,
  Download,
  Globe
} from 'lucide-react';
import Layout from '../Layout/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Checkout.css';
import bkash from '../assets/bkash.png';
import ssl from '../assets/ssl.png';
import cash from '../assets/cash.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  // State
  const [cartItems, setCartItems] = useState([]);
  const [suggestions, setSuggestions] = useState({ books: [], pdfs: [] });
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    division_id: '',
    district_id: '',
    upazila_id: '',
    union_id: '',
    address: '',
    payment_method: '',
    notes: ''
  });
  
  // Location data
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [unions, setUnions] = useState([]);
  
  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Checkbox
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);
  
  // Errors
  const [errors, setErrors] = useState({});

  // Check if cart has PDFs
  const hasPDFs = cartItems.some(item => item.type === 'pdf');
  const hasBooks = cartItems.some(item => item.type === 'book');

  // Calculate total book quantity
  const totalBookQuantity = cartItems
    .filter(item => item.type === 'book')
    .reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    handleUrlParams();
  }, [location.search]);

  // Handle URL parameters
  const handleUrlParams = () => {
    const bookId = searchParams.get('book');
    const pdfId = searchParams.get('pdf');
    const quantity = parseInt(searchParams.get('quantity')) || 1;

    if (bookId) {
      addItemToLocalStorage(bookId, 'book', quantity);
      navigate('/checkout', { replace: true });
    } else if (pdfId) {
      addItemToLocalStorage(pdfId, 'pdf', quantity);
      navigate('/checkout', { replace: true });
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await loadCartFromLocalStorage();
      await loadSuggestions();
      await loadDivisions();
    };
    loadInitialData();
  }, []);

  // Update payment method based on cart items
  useEffect(() => {
    if (hasPDFs && formData.payment_method === 'cod') {
      setFormData(prev => ({ 
        ...prev, 
        payment_method: hasBooks ? 'cod' : 'bkash'
      }));
    }
  }, [hasPDFs, hasBooks]);

  // Recalculate shipping when district or cart items change
  useEffect(() => {
    if (formData.district_id && hasBooks) {
      calculateShippingChargeManual(formData.district_id);
    }
  }, [cartItems, formData.district_id, hasBooks]);

  // Add item to localStorage cart
  const addItemToLocalStorage = (productId, type, quantity = 1) => {
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItemIndex = localCart.findIndex(
      item => item.id == productId && item.type === type
    );
    
    if (existingItemIndex >= 0) {
      localCart[existingItemIndex].quantity += quantity;
    } else {
      localCart.push({
        id: productId,
        type: type,
        quantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(localCart));
    loadCartFromLocalStorage();
    loadSuggestions();
  };
  // Add phone number formatting function
const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  
  // If value already starts with +88, return it
  if (cleaned.startsWith('88')) {
    return `+${cleaned}`;
  }
  
  // If value doesn't start with +88 but has 11 digits (typical Bangladesh number)
  if (cleaned.length === 11 && !cleaned.startsWith('88')) {
    return `+88${cleaned}`;
  }
  
  // If it's less than 11 digits, just return the cleaned value
  return cleaned;
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'phone') {
    // Format phone number
    const formattedPhone = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, [name]: formattedPhone }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};


  // Load cart from localStorage
  const loadCartFromLocalStorage = async () => {
    setLoading(true);
    
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      
      if (localCart.length === 0) {
        setCartItems([]);
        setSubtotal(0);
        calculateTotals(0, shippingCharge);
        setLoading(false);
        return;
      }

      const itemsWithDetails = [];
      let totalSubtotal = 0;

      for (const item of localCart) {
        try {
          if (item.type === 'book') {
            const response = await axios.get(`${API_URL}/books/${item.id}`);
            if (response.data.success) {
              const book = response.data.data.book;
              const itemTotal = book.price * item.quantity;
              totalSubtotal += itemTotal;
              
              itemsWithDetails.push({
                ...item,
                title: book.title,
                price: book.price,
                image: book.image || '/default-book.jpg',
                author: book.author,
                publisher: book.publisher,
                item_total: itemTotal
              });
            }
          } else if (item.type === 'pdf') {
            const response = await axios.get(`${API_URL}/pdfs/${item.id}`);
            if (response.data.success) {
              const pdf = response.data.data.book;
              const itemTotal = pdf.price * item.quantity;
              totalSubtotal += itemTotal;
              
              itemsWithDetails.push({
                ...item,
                title: pdf.title,
                price: pdf.price,
                image: pdf.image,
                pages: pdf.pages,
                item_total: itemTotal
              });
            }
          }
        } catch (error) {
          console.error(`Error loading ${item.type} ${item.id}:`, error);
          itemsWithDetails.push({
            ...item,
            title: `Product ${item.id}`,
            price: 0,
            image: item.type === 'book' ? '/default-book.jpg' : '/pdf-icon.png',
            author: '',
            item_total: 0
          });
        }
      }

      setCartItems(itemsWithDetails);
      setSubtotal(totalSubtotal);
      
      // Recalculate shipping if district is selected
      if (formData.district_id && hasBooks) {
        calculateShippingChargeManual(formData.district_id);
      } else {
        calculateTotals(totalSubtotal, shippingCharge);
      }
      
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load suggestions
  const loadSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      
      const response = await axios.get(`${API_URL}/cart/suggestions`, {
        cart: localCart
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSuggestions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const loadDivisions = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart/divisions`);
      if (response.data.success) {
        setDivisions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading divisions:', error);
    }
  };

  const updateQuantity = (itemId, type, newQuantity) => {
    if (newQuantity < 1) return;
    
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = localCart.map(item => {
      if (item.id == itemId && item.type === type) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    loadCartFromLocalStorage();
  };

  const removeItem = (itemId, type) => {
    const localCart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = localCart.filter(
      item => !(item.id == itemId && item.type === type)
    );
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    loadCartFromLocalStorage();
    loadSuggestions();
  };

  const handleDivisionChange = async (e) => {
    const divisionId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      division_id: divisionId,
      district_id: '',
      upazila_id: '',
      union_id: ''
    }));
    setDistricts([]);
    setUpazilas([]);
    setUnions([]);
    setShippingCharge(0);
    
    if (divisionId) {
      try {
        const response = await axios.get(`${API_URL}/cart/districts/${divisionId}`);
        if (response.data.success) {
          setDistricts(response.data.data);
        }
      } catch (error) {
        console.error('Error loading districts:', error);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      district_id: districtId,
      upazila_id: '',
      union_id: ''
    }));
    setUpazilas([]);
    setUnions([]);
    
    if (districtId) {
      try {
        const response = await axios.get(`${API_URL}/cart/upazilas/${districtId}`);
        if (response.data.success) {
          setUpazilas(response.data.data);
        }
        
        calculateShippingChargeManual(districtId);
        
      } catch (error) {
        console.error('Error loading upazilas:', error);
      }
    }
  };

  const handleUpazilaChange = async (e) => {
    const upazilaId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      upazila_id: upazilaId,
      union_id: ''
    }));
    setUnions([]);
    
    if (upazilaId) {
      try {
        const response = await axios.get(`${API_URL}/cart/unions/${upazilaId}`);
        if (response.data.success) {
          setUnions(response.data.data);
        }
      } catch (error) {
        console.error('Error loading unions:', error);
      }
    }
  };
const calculateAdditionalShipping = () => {
  let additionalShipping = 0;
  
  cartItems.forEach(item => {
    if (item.type === 'book' && item.quantity > 2) {
      // For every 2 pieces after the first 2 pieces of the same book, add 10 BDT
      const additionalPieces = item.quantity - 2;
      const additionalGroups = Math.ceil(additionalPieces / 2);
      additionalShipping += additionalGroups * 10;
    }
  });
  
  return additionalShipping;
};
  const calculateShipping = (districtId) => {
    let shipping = 0;
    
    if (hasBooks && districtId) {
      // Base shipping based on district
      if (districtId == 47) {
        shipping += 50;
      } else {
        shipping += 90;
      }
      
      // Add additional shipping for same book quantity > 2
      shipping += calculateAdditionalShipping();
    }
    
    return shipping;
  };
  const getShippingBreakdown = () => {
    let breakdown = '';
    const additionalItems = [];
    
    cartItems.forEach(item => {
      if (item.type === 'book' && item.quantity > 2) {
        const additionalPieces = item.quantity - 2;
        const additionalGroups = Math.ceil(additionalPieces / 2);
        if (additionalGroups > 0) {
          additionalItems.push(`${item.title}: +${additionalGroups}×10 BDT`);
        }
      }
    });
    
    if (additionalItems.length > 0) {
      breakdown = `(base + ${additionalItems.join(', ')})`;
    }
    
    return breakdown;
  };

  const calculateShippingChargeManual = (districtId) => {
    const shipping = calculateShipping(districtId, totalBookQuantity);
    setShippingCharge(shipping);
    calculateTotals(subtotal, shipping);
  };

  const calculateTotals = (newSubtotal, newShipping) => {
    const newTotal = newSubtotal + newShipping - discount;
    setTotal(newTotal);
  };



  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    
    // Only require shipping fields if there are books
    if (hasBooks) {
      if (!formData.division_id) newErrors.division_id = 'Division is required';
      if (!formData.district_id) newErrors.district_id = 'District is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }
    
    if (!formData.payment_method) newErrors.payment_method = 'Payment method is required';
    if (!acceptedTerms) newErrors.terms = 'You must accept the terms and conditions';
    
    if (cartItems.length === 0) {
      newErrors.cart = 'Your cart is empty';
    }
    
    // Validate payment method for PDFs
    if (hasPDFs && formData.payment_method === 'cod') {
      newErrors.payment_method = 'PDF files require online payment (bKash or SSL)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true); 
    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
       const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
        const cleanedPhone = formData.phone.replace(/\D/g, '');
        
        // Ensure phone has +88 prefix
        let finalPhone = formData.phone;
        if (!formData.phone.startsWith('+88')) {
          if (cleanedPhone.length === 11 && cleanedPhone.startsWith('01')) {
            finalPhone = `+88${cleanedPhone}`;
            setFormData(prev => ({ ...prev, phone: finalPhone }));
          }
        }
        
        // Phone validation in validateForm function
        if (!phoneRegex.test(finalPhone)) {
          setErrors(prev => ({ 
            ...prev, 
            phone: 'Please enter a valid Bangladeshi phone number (e.g., +88017XXXXXXXX)' 
          }));
          setIsSubmitting(false);
          return;
        }
      const orderData = {
        ...formData,
        cart: localCart,
        shipping_charge: shippingCharge,
        discount: discount,
        total: total
      };
      
      const response = await axios.post(`${API_URL}/cart/checkout`, orderData);
      
      if (response.data.success) {
        localStorage.removeItem('cart');
        
        if (response.data.redirect_url) {
          window.location.href = response.data.redirect_url;
        } else {
          navigate('/order-success', { 
            state: { 
              orderId: response.data.order_id,
              message: 'Order placed successfully!' 
            }
          });
        }
      }
    } catch (error) {
      setIsSubmitting(false); // ✅ stop loading

      console.error('Checkout error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: 'An error occurred during checkout. Please try again.' });
      }
    }
    finally {
      setIsSubmitting(false); // ✅ stop loading
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="checkout-container py-5">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your cart...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="checkout-container">
        <div className="container">
          {/* Checkout Header */}
          <div className="checkout-header py-4">
            <div className="d-flex align-items-center mb-2">
              <Home size={18} className="text-muted me-2" />
              <ChevronRight size={14} className="text-muted mx-1" />
              <span className="text-muted small">Shopping Cart</span>
              <ChevronRight size={14} className="text-muted mx-1" />
              <span className="text-white fw-medium small">Checkout</span>
            </div>
          </div>
          
          {errors.cart && (
            <div className="alert alert-danger mb-4">
              <div className="d-flex align-items-center">
                <AlertCircle size={18} className="me-2" />
                {errors.cart}
              </div>
            </div>
          )}
          
          {/* PDF Order Notice */}
          {hasPDFs && (
            <div className="alert alert-info mb-4">
              <div className="d-flex align-items-center">
                <Info size={18} className="me-2" />
                <div className="small">
                  <strong>Digital Products Notice:</strong> Your cart contains PDF files which require online payment. 
                  {hasBooks && ' Physical books will be shipped to your address.'}
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-4">
            {/* Left Column - Cart Items & Suggestions */}
            <div className="col-xl-8">
              {/* Cart Items Card */}
              <div className="cart-card">
                <div className="cart-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <ShoppingCart size={22} className="text-primary me-2" />
                      <h2 className="cart-heading">Shopping Cart</h2>
                    </div>
                    <span className="cart-badge">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>
                
                <div className="cart-body">
                  {cartItems.length === 0 ? (
                    <div className="empty-cart text-center py-5">
                      <div className="empty-cart-icon mb-4">
                        <ShoppingCart size={64} className="text-muted opacity-25" />
                      </div>
                      <h3 className="h5 mb-2">Your cart is empty</h3>
                      <p className="text-muted mb-4">Add some items to get started</p>
                      <button 
                        onClick={() => navigate('/')}
                        className="btn btn-primary px-4"
                      >
                        Browse Books
                      </button>
                    </div>
                  ) : (
                    <div className="cart-items-list">
                      {cartItems.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="cart-item-card">
                          <div className="cart-item-image">
                            <div className={`item-badge ${item.type === 'pdf' ? 'bg-danger' : 'bg-primary'}`}>
                              {item.type === 'book' ? (
                                <BookOpen size={12} />
                              ) : (
                                <Download size={12} />
                              )}
                            </div>
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="img-fluid"
                              onError={(e) => {
                                e.target.src = item.type === 'book' 
                                  ? '/default-book.jpg' 
                                  : '/pdf-icon.png';
                              }}
                            />
                          </div>
                          
                          <div className="cart-item-details">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1">
                                <h3 className="item-title">{item.title}</h3>
                                <div className="item-meta">
                                  {item.type === 'pdf' && (
                                    <span className="badge digital-badge me-2">Digital</span>
                                  )}
                                  {item.author && (
                                    <span className="text-muted me-3">
                                      <User size={11} className="me-1" />
                                      {item.author}
                                    </span>
                                  )}
                                  {item.type === 'pdf' && item.pages && (
                                    <span className="text-muted">
                                      <FileText size={11} className="me-1" />
                                      {item.pages} pages
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="item-price">
                                <div className="fw-bold">{item.price} ৳</div>
                                <div className="text-muted small">each</div>
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <div className="quantity-selector">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                                  className="qty-btn"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="qty-value">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                                  className="qty-btn"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              
                              <div className="d-flex align-items-center">
                                <div className="item-total fw-bold me-3">{item.item_total} ৳</div>
                                <button 
                                  onClick={() => removeItem(item.id, item.type)}
                                  className="remove-btn"
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {cartItems.length > 0 && (
                  <div className="cart-footer">
                    <button 
                      onClick={() => navigate('/')}
                      className="btn btn-outline-light"
                    >
                      <ChevronRight size={16} className="me-1 rotate-180" />
                      Continue Shopping
                    </button>
                  </div>
                )}
              </div>
              
              {/* Suggestions Section */}
              {(suggestions.books.length > 0 || suggestions.pdfs.length > 0) && (
                <div className="suggestions-card mt-4">
                  <div className="suggestions-header">
                    <h2 className="suggestions-heading">You Might Also Like</h2>
                  </div>
                  <div className="suggestions-body">
                    {suggestionsLoading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="row g-2">
                        {suggestions.books.slice(0, 3).map((book) => (
                          <div key={book.id} className="col-md-4">
                            <div className="suggestion-item">
                              <div className="suggestion-img">
                                <img 
                                  src={book.image} 
                                  alt={book.title}
                                  className="img-fluid"
                                  onError={(e) => {
                                    e.target.src = '/default-book.jpg';
                                  }}
                                />
                                <div className="suggestion-overlay">
                                  <button 
                                    onClick={() => addItemToLocalStorage(book.id, 'book', 1)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                              <div className="suggestion-info">
                                <h4 className="suggestion-title">{book.title}</h4>
                                <div className="suggestion-author">{book.author}</div>
                                <div className="suggestion-price">{book.price} ৳</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Order Summary & Checkout */}
            <div className="col-xl-4">
              {/* Order Summary Card */}
              <div className="order-summary-card">
                <div className="order-header">
                  <h2 className="order-heading">Order Summary</h2>
                </div>
                <div className="order-body">
                  {/* Personal Information */}
                  <div className="section mb-4">
                    <h3 className="section-title">
                      <User size={16} className="me-2" />
                      Personal Information
                    </h3>
                    <div className="mb-3">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Phone size={14} />
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                           placeholder="+88017XXXXXXXX"
                          onChange={handleInputChange}
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        />
                      </div>
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address (Optional)"
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  {/* Shipping Address - Only show if there are books in cart */}
                  {hasBooks && (
                    <div className="section mb-4">
                      <h3 className="section-title">
                        <MapPin size={16} className="me-2" />
                        Shipping Address
                      </h3>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <select
                            name="division_id"
                            value={formData.division_id}
                            onChange={handleDivisionChange}
                            className={`form-select ${errors.division_id ? 'is-invalid' : ''}`}
                          >
                            <option value="">Division</option>
                            {divisions.map(division => (
                              <option key={division.id} value={division.id}>
                                {division.name}
                              </option>
                            ))}
                          </select>
                          {errors.division_id && (
                            <div className="invalid-feedback">{errors.division_id}</div>
                          )}
                        </div>
                        <div className="col-6">
                          <select
                            name="district_id"
                            value={formData.district_id}
                            onChange={handleDistrictChange}
                            disabled={!formData.division_id}
                            className={`form-select ${errors.district_id ? 'is-invalid' : ''}`}
                          >
                            <option value="">District</option>
                            {districts.map(district => (
                              <option key={district.id} value={district.id}>
                                {district.name}
                              </option>
                            ))}
                          </select>
                          {errors.district_id && (
                            <div className="invalid-feedback">{errors.district_id}</div>
                          )}
                        </div>
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <select
                            name="upazila_id"
                            value={formData.upazila_id}
                            onChange={handleUpazilaChange}
                            disabled={!formData.district_id}
                            className="form-select"
                          >
                            <option value="">Upazila</option>
                            {upazilas.map(upazila => (
                              <option key={upazila.id} value={upazila.id}>
                                {upazila.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-6">
                          <select
                            name="union_id"
                            value={formData.union_id}
                            onChange={handleInputChange}
                            disabled={!formData.upazila_id}
                            className="form-select"
                          >
                            <option value="">Union</option>
                            {unions.map(union => (
                              <option key={union.id} value={union.id}>
                                {union.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mb-2">
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Full Address"
                          rows="2"
                          className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                        />
                        {errors.address && (
                          <div className="invalid-feedback">{errors.address}</div>
                        )}
                      </div>
                      <div className="mb-2">
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Delivery Notes (Optional)"
                          rows="2"
                          className="form-control"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Digital Delivery Notice - Only show if only PDFs */}
                  {!hasBooks && hasPDFs && (
                    <div className="alert alert-warning mb-4 p-2">
                      <div className="d-flex align-items-center">
                        <Info size={14} className="me-2" />
                        <div className="small">
                          <strong>Digital Delivery:</strong> PDF files will be emailed to you
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Method */}
                  <div className="section mb-4">
                    <h3 className="section-title">
                      <CreditCard size={16} className="me-2" />
                      Payment Method
                    </h3>
                    <div className="payment-options">
                      {/* First Row: bKash and Cash on Delivery */}
                      <div className="payment-row">
                        {/* bKash */}
                        <div className="payment-option">
                          <input
                            type="radio"
                            id="bkash"
                            name="payment_method"
                            value="bkash"
                            checked={formData.payment_method === 'bkash'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="bkash">
                            <img src={bkash} alt="" />
                          </label>
                        </div>
                        
                        {/* Cash on Delivery - Only show if cart has books and no PDFs */}
                        {hasBooks && !hasPDFs && (
                          <div className="payment-option">
                            <input
                              type="radio"
                              id="cod"
                              name="payment_method"
                              value="cod"
                              checked={formData.payment_method === 'cod'}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="cod">
                              <img src={cash} alt="" />
                            </label>
                          </div>
                        )}
                        
                        {/* COD Disabled Message when PDFs in cart */}
                        {hasPDFs && (
                          <div className="payment-option disabled">
                            <input
                              type="radio"
                              id="cod_disabled"
                              disabled
                            />
                            <label htmlFor="cod_disabled">
                              <img src={cash} alt="" />
                            </label>
                          </div>
                        )}
                      </div>
                      
                      {/* Second Row: SSL Commerz - Full width */}
                      <div className="payment-row">
                        <div className="payment-option full-width">
                          <input
                            type="radio"
                            id="ssl"
                            name="payment_method"
                            value="ssl"
                            checked={formData.payment_method === 'ssl'}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="ssl">
                            <img src={ssl} alt="" />
                          </label>
                        </div>
                      </div>
                    </div>
                    {errors.payment_method && (
                      <div className="text-danger small mt-1">{errors.payment_method}</div>
                    )}
                  </div>
                  
                  {/* Order Totals */}
                  <div className="totals-section mb-4">
                    <div className="total-row">
                      <span className="total-label">Subtotal</span>
                      <span className="total-value">{subtotal} ৳</span>
                    </div>
                    
                    {/* Shipping - Only show if there are books */}
                    {hasBooks && (
                          <div className="total-row">
                            <span className="total-label">
                              Shipping 
                              {getShippingBreakdown() && (
                                <small className="text-muted ms-1">
                                  {getShippingBreakdown()}
                                </small>
                              )}
                            </span>
                            <span className="total-value">{shippingCharge} ৳</span>
                          </div>
                    )}
                    
                    {discount > 0 && (
                      <div className="total-row">
                        <span className="total-label">Discount</span>
                        <span className="total-value text-success">-{discount} ৳</span>
                      </div>
                    )}
                    
                    <div className="total-divider"></div>
                    <div className="total-row grand-total">
                      <span className="total-label">Total</span>
                      <span className="total-value">{total} ৳</span>
                    </div>
                    
                    {/* PDF Notice in totals */}
                    {hasPDFs && (
                      <div className="pdf-notice mt-2">
                        <FileText size={12} className="me-1" />
                        Includes digital products
                      </div>
                    )}
                  </div>
                  
                  {/* Terms & Conditions */}
                  <div className="section mb-4">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="terms">
                        I agree to the <a href="/terms" className="text-decoration-none">Terms & Conditions</a>
                      </label>
                      {errors.terms && (
                        <div className="text-danger small mt-1">{errors.terms}</div>
                      )}
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="saveInfo"
                        checked={saveInfo}
                        onChange={(e) => setSaveInfo(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="saveInfo">
                        Save my information for faster checkout
                      </label>
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                 <button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0 || !acceptedTerms || !formData.payment_method || isSubmitting}
                    className="checkout-btn w-100"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        {cartItems.length === 0 ? 'Cart is Empty' : 'Place Order'}
                        <ChevronRight size={18} className="ms-2" />
                      </>
                    )}
                  </button>

                  
                  {/* Delivery Info */}
                  <div className="delivery-info mt-4">
                    {hasBooks ? (
                      <>
                        <div className="d-flex align-items-center mb-1">
                          <Truck size={14} className="me-2" />
                          <span className="small">Delivery in 3-5 days</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <Clock size={14} className="me-2" />
                          <span className="small">24/7 Support</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="d-flex align-items-center mb-1">
                          <FileText size={14} className="me-2" />
                          <span className="small text-primary">Instant Digital Delivery</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <Globe size={14} className="me-2" />
                          <span className="small">Access anywhere</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;