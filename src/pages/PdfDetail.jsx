import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../css/BookDetail.css';
import Layout from '../Layout/Layout';

// Icons
import { 
  Star, 
  StarHalf,
  ShoppingCart, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  ChevronRight,
  Minus,
  Plus,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Bookmark,
  Eye,
  Users,
  Award,
  Calendar,
  DollarSign,
  Package,
  Shield,
  Headphones,
  Download,
  Heart,
  Share2
} from 'lucide-react';

// WhatsApp Icon Component
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12.032 0a12 12 0 00-10.163 18.373L0 24l5.627-1.869A12 12 0 1012.032 0zm6.446 17.297c-.3.857-1.527 1.567-2.513 1.767-.77.16-1.77.3-5.13-1.19-4.46-1.92-7.31-6.64-7.53-6.94-.22-.3-1.77-2.36-1.77-4.5 0-2.14 1.08-3.19 1.5-3.6.3-.3.77-.45 1.23-.45h.38c.3 0 .68.01.98.3.3.3 1.08 1.05 1.18 1.14.1.09.19.24.19.39 0 .15-.06.3-.13.45-.06.15-.13.45-.26.6-.16.3-.33.6-.5.9-.09.15-.19.3-.08.48.1.19.45.83.97 1.35.68.68 1.25.89 1.44 1 .19.1.3.09.45-.05.15-.14.64-.74.81-.98.17-.24.34-.3.45-.3h.23c.1 0 .23 0 .34.15.11.15.45.68.45.68s.23.53.34.68c.1.15.19.3.08.6-.11.3-.51 1.25-.7 1.7-.19.45-.38.45-.68.3-.3-.15-1.27-.46-2.16-1.46-.8-.83-1.34-1.85-1.5-2.16-.16-.31-.02-.48.12-.63.12-.12.3-.3.45-.45.15-.15.19-.26.3-.43.11-.17.06-.3-.02-.43-.08-.13-.45-1.07-.62-1.46-.17-.39-.34-.34-.45-.34h-.38c-.12 0-.3.01-.45.15-.15.14-.57.56-.57 1.35s.58 1.57.66 1.68c.08.11 1.14 1.74 2.76 2.43 1.62.69 1.62.46 1.92.43.3-.03.98-.2 1.12-.4.14-.2.14-.37.1-.5z" />
  </svg>
);

// Download Icon Component
const DownloadIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const PdfDetail = () => {
  const { id } = useParams();
  
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
 const [isDownloading, setIsDownloading] = useState(false);
  useEffect(() => {
    fetchBookData();
  }, [id]);
  
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  const handleDownload = async (fileUrl, fileName) => {
    try {
      setIsDownloading(true);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'download';
      link.target = '_blank';
      
      // Append to document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
     
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download the file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  const fetchBookData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch book details
      const bookResponse = await axiosInstance.get(`pdf/${id}`);
      if (bookResponse.data.success) {
        const bookData = bookResponse.data.data.book;
        setBook(bookData);
        
        // Extract YouTube video ID if exists
        if (bookData.video_link) {
          const videoId = extractYouTubeId(bookData.video_link);
          bookData.video_link = videoId;
        }
        
        // Fetch sale quantity
       
        // Set related books from the same API response
        setRelatedBooks(bookResponse.data.data.related_books || []);
      } else {
        throw new Error(bookResponse.data.message || 'Failed to fetch book details');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching book data:', err);
      setError('Failed to load book details. Please try again later.');
      setLoading(false);
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!book) return;
    
    // Check if book is out of stock (for specific book ID 4)

    
    const cartItem = {
      id: book.id,
      title: book.title,
      image: book.image,
      price: book.price,
      quantity: quantity,
      type: 'book'
    };
    
    // Add to cart logic
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(item => item.id === book.id && item.type === 'book');
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show success message
    alert('Added to cart successfully!');
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    const message = !isWishlisted ? 'Added to wishlist' : 'Removed from wishlist';
    alert(message);
  };

  const shareOnSocialMedia = (platform) => {
    const url = window.location.href;
    const title = book?.title || '';
    const text = `Check out this amazing book: "${title}" by Sabit Rayhan`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      instagram: `https://www.instagram.com/`,
      youtube: 'https://www.youtube.com/@sabitinternational'
    };
    
    if (platform === 'youtube') {
      window.open(shareUrls.youtube, '_blank');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={20} fill="#60a5fa" color="#60a5fa" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} size={20} fill="#60a5fa" color="#60a5fa" />);
      } else {
        stars.push(<Star key={i} size={20} color="#475569" />);
      }
    }
    
    return stars;
  };

  const getYouTubeThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  if (loading) {
    return (
      <Layout>
        <BookDetailSkeleton />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="book-detail-error">
          <div className="container">
            <div className="error-content">
              <h1 className="error-title">Something went wrong</h1>
              <p className="error-message">{error}</p>
              <button 
                className="btn-retry"
                onClick={fetchBookData}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book || book.visibility !== 1) {
    return (
      <Layout>
        <div className="book-detail-unavailable">
          <div className="container">
            <div className="unavailable-content">
              <h1 className="unavailable-title">This book is not available</h1>
              <p className="unavailable-message">
                Sorry, this book is not available for purchase online at the moment.
                Please check back later or contact our support team for more information.
              </p>
              <Link to="/books" className="btn-browse">
                Browse Other Books
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isOutOfStock = false;
  const hasYouTubeVideo = book.youtube_video_id;

  return (
    <Layout>
      <div className="book-detail-page">
        {/* Hero Section */}
        <div className="book-hero-section">
          <div className="container">
            <div className="">
              <nav className="breadcrumb-nav">
                <Link to="/">Home</Link>
                <ChevronRight size={16} />
                <a to="/books" disabled>Books</a>
                <ChevronRight size={16} />
                <span className="current-page">{book.title}</span>
              </nav>
              
              <div className="row">
                {/* Left Column - Book Image & Video */}
                <div className="col-lg-5 ">
                  <div className="book-media-section">
                    {/* Book Image Container */}
                    <div className="book-image-container">
                      <img 
                        src={book.image} 
                        alt={book.title}
                        className={`book-main-image ${imageLoading ? 'loading' : 'loaded'}`}
                        onLoad={() => setImageLoading(false)}
                        onError={(e) => {
                          e.target.src = '/default-book.jpg';
                          setImageLoading(false);
                        }}
                      />
                      {imageLoading && <div className="image-skeleton"></div>}
                      
                      {/* Stock Badge */}
                      {isOutOfStock ? (
                        <div className="stock-badge out-of-stock">
                          <CheckCircle size={16} />
                          <span>Out of Stock</span>
                        </div>
                      ) : (
                        <div className="stock-badge in-stock">
                          <CheckCircle size={16} />
                          <span>In Stock</span>
                        </div>
                      )}
                      
                      
                    </div>
                    
                    {/* YouTube Video Section */}
                    {book.video_link && (
                      <div className="video-section">
                        <div className="video-thumbnail-section">
                          <h4 className="video-section-title">
                            <Youtube size={24} />
                            Watch Book Introduction
                          </h4>
                          <div 
                            className="video-thumbnail-wrapper"
                            // onClick={() => setShowVideoModal(true)}
                          >
                               <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${book.video_link}?autoplay=0&rel=0`}
                                    title="Book Introduction Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    ></iframe>
                            {/* <div className="play-button-overlay">
                              <PlayCircle size={64} />
                            </div> */}
                            {/* <div className="video-info">
                              <span className="video-duration">3:45</span>
                              <span className="video-title">Book Introduction</span>
                            </div> */}
                          </div>
                         
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Column - Book Info */}
                <div className="col-lg-7 ">
                  <div className="book-info-section">
                   
                    
                    <h1 className="book-title">{book.title}</h1>
                   
                    
                      <div className="book-price-section">
                      <div className="current-price">
                        <h2>{book.price} BDT</h2>
                      </div>
                      {book.original_price && book.original_price > book.price && (
                        <div className="original-price">
                          <del>{book.original_price} BDT</del>
                          <span className="discount-badge">
                            {Math.round((1 - book.price/book.original_price) * 100)}% OFF
                          </span>
                        </div>
                      )}
                      
                    </div>
                    
                  
                    
                    {/* Key Features */}
                 
                    
                    {/* Quantity Selector */}
                    <div className="mb-4">
                      <h5 className='text-start pb-2'>Select Quantity</h5>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn minus"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus size={20} />
                        </button>
                        <input 
                          type="number" 
                          className="quantity-input"
                          value={quantity}
                          min="1"
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setQuantity(isNaN(value) || value < 1 ? 1 : value);
                          }}
                        />
                        <button 
                          className="quantity-btn plus"
                          onClick={() => handleQuantityChange(1)}
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      <div className="">
                     <button 
                      className={`btn ${book.file_url ? 'btn-buy-now' : 'btn-buy-now'}`}
                      onClick={() => {
                        if (book.file_url) {
                          // Handle download if file_url exists
                          handleDownload(book.file_url, book.title);
                        } else {
                          // Handle Buy Now if no file_url
                          if (isOutOfStock) {
                            alert('This book is currently out of stock');
                            return;
                          }
                          window.location.href = `/checkout?pdf=${id}&quantity=${quantity}`;
                        }
                      }}
                    >
                      {book.file_url ? (
                        <>
                          Download
                          <Download size={20} />
                        </>
                      ) : (
                        <>
                          Buy Now
                          <ChevronRight size={20} />
                        </>
                      )}
                    </button> 
                      </div>
                    </div>
                       <div className="key-features">
                     
                      <div className="feature-item">
                        <Shield size={20} />
                        <div>
                          <h6>Secure Payment</h6>
                          <p>100% secure payment</p>
                        </div>
                      </div>
                      <div className="feature-item">
                        <Headphones size={20} />
                        <div>
                          <h6>Support 24/7</h6>
                          <p>Dedicated support</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="action-buttons-grid">
                     
                      
                     
                      
                     
                    </div>
                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="book-tabs-section">
          <div className="container">
         
            
            <div className="tab-content">
           
           
                <div className="">
                  <div className="description-header">
                    <h3>About the Book</h3>
                    <div className="book-meta">
                   
                    </div>
                  </div>
                  
                  <div 
                    className="book-description-content"
                    dangerouslySetInnerHTML={{ __html: book.description || 'No description available.' }}
                  />
                  
                  {hasYouTubeVideo && (
                    <div className="video-embed-section">
                      <h4>Watch Book Introduction</h4>
                      <div className="video-embed-wrapper">
                        <div className="video-embed">
                          <iframe
                            width="100%"
                            height="400"
                            src={`https://www.youtube.com/embed/${book.video_link}?rel=0&showinfo=0`}
                            title="Book Introduction"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                        <div className="video-info-card">
                          <h5>What you'll learn from this video:</h5>
                          <ul>
                            <li>Book overview and key concepts</li>
                            <li>Author's insights and writing process</li>
                            <li>Practical applications of the content</li>
                            <li>Success stories from readers</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
           
            </div>
          </div>
        </div>
        
        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="related-books-section">
            <div className="container">
              <div className="section-header">
                <h2>You May Also Like</h2>
              
              </div>
              
              <div className="row">
                {relatedBooks.map(relatedBook => (
                  <div key={relatedBook.id} className="related-book-card  col-md-4">
                    <div className="book-image">
                      <img 
                        src={relatedBook.image} 
                        alt={relatedBook.title}
                        onError={(e) => {
                          e.target.src = '/default-book.jpg';
                        }}
                      />
                      <div className="book-overlay">
                        <button 
                          className="quick-view-btn"
                          onClick={() => window.location.href = `/pdfs/${relatedBook.id}`}
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="book-info">
                      <h4 className="book-title">{relatedBook.title}</h4>
                      <p className="book-author">By {relatedBook.author || 'Sabit Rayhan'}</p>
                      <div className="book-price">{relatedBook.price} BDT</div>
                      <button 
                        className="btn-add-related"
                        onClick={() => window.location.href = `/pdfs/${relatedBook.id}`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* FAQ Section */}
        <div className="faq-section">
          <div className="container">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h4>What is the delivery time?</h4>
                <p>Inside Dhaka: 3-5 working days. Outside Dhaka: 5-7 working days.</p>
              </div>
              <div className="faq-item">
                <h4>Is the book available in PDF format?</h4>
                <p>Currently, this book is only available in physical print format.</p>
              </div>
              <div className="faq-item">
                <h4>Can I get a discount for bulk purchase?</h4>
                <p>Yes, contact our support team for bulk purchase discounts.</p>
              </div>
              <div className="faq-item">
                <h4>How can I contact support?</h4>
                <p>Call: 01925235393 or Email: support@sabitinternational.com</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Modal */}
        {showVideoModal && hasYouTubeVideo && (
          <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}>
            <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="close-modal-btn"
                onClick={() => setShowVideoModal(false)}
              >
                ×
              </button>
              <div className="video-modal-embed">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${book.youtube_video_id}?autoplay=1&rel=0`}
                  title="Book Introduction Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Skeleton Component
const BookDetailSkeleton = () => {
  return (
    <div className="book-detail-skeleton">
      <div className="container">
        <div className="skeleton-hero">
          {/* Breadcrumb Skeleton */}
          <div style={{ marginBottom: '40px' }}>
            <Skeleton height={20} width={300} baseColor="#1e293b" highlightColor="#334155" />
          </div>
          
          <div className="row">
            {/* Left Column Skeleton */}
            <div className="col-lg-5">
              <Skeleton height={500} baseColor="#1e293b" highlightColor="#334155" borderRadius={16} />
              <Skeleton height={200} style={{ marginTop: '25px' }} baseColor="#1e293b" highlightColor="#334155" borderRadius={16} />
            </div>
            
            {/* Right Column Skeleton */}
            <div className="col-lg-7">
              <Skeleton height={30} width={200} baseColor="#1e293b" highlightColor="#334155" />
              <Skeleton height={50} style={{ marginTop: '15px' }} baseColor="#1e293b" highlightColor="#334155" />
              <Skeleton height={30} width={150} style={{ marginTop: '15px' }} baseColor="#1e293b" highlightColor="#334155" />
              <Skeleton height={100} style={{ marginTop: '30px' }} baseColor="#1e293b" highlightColor="#334155" borderRadius={16} />
              <Skeleton height={120} style={{ marginTop: '25px' }} baseColor="#1e293b" highlightColor="#334155" borderRadius={16} />
              <Skeleton height={70} style={{ marginTop: '25px' }} baseColor="#1e293b" highlightColor="#334155" borderRadius={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfDetail;