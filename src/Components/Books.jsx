import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import courseImage from '../assets/books.png';
import arrowRight from '../assets/arrowRight.svg';
import downloadIcon from '../assets/download.svg'; // Add a download icon
import { useNavigate } from 'react-router-dom';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const Books = () => {
    const navigate = useNavigate();

    // Filter categories
    const filters = ['All', 'Books', 'PDF'];
    
    // State for API data
    const [apiData, setApiData] = useState({
        books: [],
        pdfs: [],
        latest_book: null
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [downloading, setDownloading] = useState({}); // Track downloading state for each PDF

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axiosInstance.get('books');
            
            if (response.data.success) {
                setApiData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch books');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching books:', err);
            setError('Failed to load books. Please try again later.');
            setLoading(false);
        }
    };

    // Combine all books for processing
    const getAllBooks = () => {
        const allItems = [];
        
        // Add books
        if (apiData.books && apiData.books.length > 0) {
            allItems.push(...apiData.books.map(item => ({
                ...item,
                category: 'Books',
                isFree: item.price === 'Free' || item.price === '0 BDT' || item.price === '0.00 BDT'
            })));
        }
        
        // Add PDFs
        if (apiData.pdfs && apiData.pdfs.length > 0) {
            allItems.push(...apiData.pdfs.map(item => ({
                ...item,
                category: 'PDF',
                isFree: item.price === 'Free' || item.price === '0 BDT' || item.price === '0.00 BDT'
            })));
        }
        
        return allItems;
    };

    // Group items by category for "All" view
    const getGroupedItems = () => {
        const allItems = getAllBooks();
        
        return {
            'Books': allItems.filter(item => item.category === 'Books'),
            'PDF': allItems.filter(item => item.category === 'PDF')
        };
    };

    // Handle filter click
    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    // Get items based on active filter
    const getFilteredItems = () => {
        if (activeFilter === 'All') {
            return getGroupedItems();
        }
        
        // For specific filters, get from API data directly
        switch (activeFilter) {
            case 'Books':
                return {
                    [activeFilter]: apiData.books?.map(item => ({
                        ...item,
                        category: 'Books',
                        isFree: item.price === 'Free' || item.price === '0 BDT' || item.price === '0.00 BDT'
                    })) || []
                };
            case 'PDF':
                return {
                    [activeFilter]: apiData.pdfs?.map(item => ({
                        ...item,
                        category: 'PDF',
                        isFree: item.price === 'Free' || item.price === '0 BDT' || item.price === '0.00 BDT'
                    })) || []
                };
            default:
                return {};
        }
    };

    // Download PDF file
    const handleDownloadPDF = async (item) => {
        if (!item.file) {
            alert('Download link not available');
            return;
        }

        setDownloading(prev => ({ ...prev, [item.id]: true }));

        try {
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = item.file;
            link.download = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // For cross-origin downloads, you might need a different approach
            // const response = await axiosInstance.get(`download-pdf/${item.id}`, {
            //     responseType: 'blob'
            // });
            
            // const url = window.URL.createObjectURL(new Blob([response.data]));
            // const link = document.createElement('a');
            // link.href = url;
            // link.setAttribute('download', `${item.title}.pdf`);
            // document.body.appendChild(link);
            // link.click();
            // link.remove();
            // window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error downloading PDF:', err);
            alert('Failed to download PDF. Please try again.');
        } finally {
            setDownloading(prev => ({ ...prev, [item.id]: false }));
        }
    };

    // Handle button click
    const handleItemClick = (item) => {
        if (item.category === 'PDF' && item.isFree && item.file) {
            handleDownloadPDF(item);
        } else {
            if (item.category === 'PDF') {
                navigate(`/checkout?pdf=${item.id}&quantity=1`);
            }else{
                navigate(`/checkout?book=${item.id}&quantity=1`);

            }
        }
    };

    // Skeleton loader component
    const renderSkeleton = () => {
        return (
            <div className="books-container" id='books'>
                {filters.slice(1).map((category) => (
                    <div key={category} className="mb-5">
                        {/* Category Title Skeleton */}
                        {activeFilter === 'All' && (
                            <Skeleton 
                                height={30} 
                                width={200} 
                                className="mb-4" 
                                style={{ borderRadius: '8px' }}
                            />
                        )}
                        
                        {/* Books Grid Skeleton */}
                        <div className="row g-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4">
                                    <div className="book-card h-100 d-flex flex-column">
                                        {/* Book Image Skeleton */}
                                        <div className="book-image-container position-relative">
                                            <Skeleton 
                                                height={250} 
                                                className="w-100" 
                                                style={{ borderRadius: '12px 12px 0 0' }}
                                            />
                                        </div>
                                      
                                        {/* Card Body Skeleton */}
                                        <div className="card-body d-flex flex-column p-3">
                                            <Skeleton 
                                                height={20} 
                                                width={80} 
                                                className="mb-2" 
                                                style={{ borderRadius: '4px' }}
                                            />
                                            <Skeleton 
                                                height={24} 
                                                className="mb-3" 
                                                style={{ borderRadius: '4px' }}
                                            />
                                            <div className="d-flex align-items-center justify-content-end mt-auto">
                                                <Skeleton 
                                                    height={40} 
                                                    width={120} 
                                                    style={{ borderRadius: '20px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

   const renderBookCard = (item) => {
    const isFreePDF = item.category === 'PDF' && item.isFree;
    const isDownloading = downloading[item.id];

    const handleCardClick = () => {
        if (item.category === 'Books') {
            navigate(`/books/${item.id}`);
        } else if (item.category === 'PDF') {
            navigate(`/pdfs/${item.id}`);
        }
    };

    return (
        <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4" id='books'>
            {/* CARD */}
            <div 
                className="book-card h-100 d-flex flex-column cursor-pointer"
                onClick={handleCardClick}
            >
                {/* Image */}
                <div className="book-image-container position-relative">
                    <img
                        src={item.image || courseImage}
                        alt={item.title}
                        className="book-image"
                        onError={(e) => (e.target.src = courseImage)}
                    />
                    {isFreePDF && <span className="free-badge">FREE</span>}
                </div>

                {/* Body */}
                <div className="card-body d-flex flex-column p-3">
                    <p className="book-badge mb-1">{item.category}</p>

                    <h5 className="book-title mb-1">
                        {item.title.length > 28
                            ? item.title.slice(0, 28) + '...'
                            : item.title}
                    </h5>

                    <h6 className="book-price mb-3">
                        {item.author ? `By: ${item.author}` : ''}
                    </h6>

                    {/* BUTTON */}
                    <div className="mt-auto text-end">
                     <button
                            className="book-btn-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(item);
                            }}
                        >
                            {isDownloading ? (
                                'Downloading...'
                            ) : isFreePDF ? (
                                'Download'
                            ) : (
                                <>
                                    {item.price}
                                    <img src={arrowRight} alt="arrow" />
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};


    return (
        <section className="py-5 courses-section">
            <div className="container py-2">
                <div className="text-center mb-5">
                    <span className="courses-badge mb-5">Book Collection</span>
                    <h2 className="courses-title mt-5">Books Written By
                         <br /> Sabit Rayhan
                        </h2>
                    <p className="courses-subtitle">
                        Reading books expands the mind, sparks imagination, and builds knowledge—one page at a time.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="row mb-5">
                    <div className="col-12 mt-5">
                        <div className="d-flex flex-wrap justify-content-start gap-3">
                            {loading ? (
                                // Filter buttons skeleton
                                <>
                                    {[1, 2, 3].map((item) => (
                                        <Skeleton 
                                            key={item}
                                            height={40} 
                                            width={100} 
                                            style={{ borderRadius: '20px' }}
                                        />
                                    ))}
                                </>
                            ) : (
                                filters.map((filter) => (
                                    <button
                                        key={filter}
                                        className={`btn ${activeFilter === filter ? 'filter-active' : 'filter-inactive'}`}
                                        onClick={() => handleFilterClick(filter)}
                                        disabled={loading}
                                    >
                                        {filter}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                        <button 
                            className="btn btn-link p-0 ms-2" 
                            onClick={fetchBooks}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading Skeleton or Books Grid */}
                {loading ? (
                    renderSkeleton()
                ) : (
                    <div className="books-container">
                        {Object.entries(getFilteredItems()).map(([category, categoryItems]) => {
                            // Only show category if it has items or if it's "All" view
                            if (!categoryItems || categoryItems.length === 0) {
                                return null;
                            }
                            
                            return (
                                <div key={category} className="mb-5">
                                    {/* Category Title */}
                                    {activeFilter === 'All' && (
                                        <h3 className="mb-4 pb-2 category-title">{category}</h3>
                                    )}
                                    
                                    {/* Books Grid */}
                                    <div className="row g-4">
                                        {categoryItems.map(renderBookCard)}
                                    </div>
                                </div>
                            );
                        })}

                        {/* No Books Message */}
                        {Object.values(getFilteredItems()).every(arr => !arr || arr.length === 0) && (
                            <div className="text-center py-5">
                                <div className="mb-4">
                                    <i className="bi bi-book fs-1 text-white"></i>
                                </div>
                                <h4 className="text-white">No books available</h4>
                                <p className="text-white">Check back soon for new books!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </section>
    );
};

export default Books;