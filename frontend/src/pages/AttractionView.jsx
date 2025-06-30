import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AttractionView.css';

  

// API configuration
const API_BASE_URL = 'http://localhost:5000';

// Add formatImageUrl function
const formatImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Remove any leading 'uploads/' to prevent double prefixing
  const cleanPath = imagePath.replace(/^uploads\//, '');
  return `${API_BASE_URL}/uploads/${cleanPath}`;
};

// Create custom axios instance with error suppression
const api = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: function (status) {
    return status < 500; // Resolve only if status is less than 500
  }
});

// Add response interceptor to handle 404s silently
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      return Promise.resolve({ status: 404, data: null });
    }
    return Promise.reject(error);
  }
);

// Custom request handler
const makeRequest = async (url, signal) => {
  try {
    const response = await api.get(url, { 
      signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    return { status: 404, data: null };
  }
};

const AttractionView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [relatedAttractions, setRelatedAttractions] = useState([]);
  const [showStoryView, setShowStoryView] = useState(false);
  const [storyImageIndex, setStoryImageIndex] = useState(0);
  const abortControllerRef = useRef(null);
  const requestInProgressRef = useRef(false);

  // Fetch images with signal
  const fetchImages = async (attractionId, signal) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attraction-images/${attractionId}`);
      
      const processedImages = response.data.map(img => {
        const imageUrl = img.image_path || img.image_url;
        let finalUrl = imageUrl;
        if (imageUrl && !imageUrl.startsWith('http')) {
          const cleanPath = imageUrl.replace(/^uploads\//, '');
          finalUrl = `${API_BASE_URL}/uploads/${cleanPath}`;
        }
        return {
          ...img,
          image_url: finalUrl,
          caption: img.caption || img.alt_text || ''
        };
      });

      setImages(processedImages);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setImages([]);
    }
  };

  // Function to fetch related attractions
  const fetchRelatedAttractions = async (currentAttractionId, subdistrictId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attractions/subdistrict/${subdistrictId}`);
      // Filter out current attraction and get 4 random attractions
      const filtered = response.data.filter(a => a.id !== currentAttractionId);
      const random = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 4);
      setRelatedAttractions(random);
    } catch (err) {
      setRelatedAttractions([]);
    }
  };

  // Main useEffect for fetching attraction data
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (requestInProgressRef.current) return;
      requestInProgressRef.current = true;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        
        // Get attractions for all subdistricts to find the one with matching slug
        const subdistrictIds = [1, 2, 3, 4, 5]; // Add all your subdistrict IDs here
        const responses = await Promise.all(
          subdistrictIds.map(id => 
            axios.get(`${API_BASE_URL}/api/attractions/subdistrict/${id}`)
          )
        );
        
        // Combine all attractions and find the one with matching slug
        const allAttractions = responses.flatMap(response => response.data);
        const attraction = allAttractions.find(a => a.slug === slug);
        
        if (!attraction) {
          setError('The attraction you are looking for does not exist or has been removed.');
          return;
        }

        setAttraction(attraction);
        
        // Fetch both images and related attractions
        if (attraction.id) {
          await Promise.all([
            fetchImages(attraction.id, signal),
            fetchRelatedAttractions(attraction.id, attraction.subdistrict_id)
          ]);
        }
      } catch (err) {
        if (err.name === 'AbortError' || !isMounted) return;
        setError('The attraction you are looking for does not exist or has been removed.');
      } finally {
        if (isMounted) {
          setLoading(false);
          requestInProgressRef.current = false;
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      requestInProgressRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [slug]);

  // Story view handlers
  const openStoryView = (index) => {
    setStoryImageIndex(index);
    setShowStoryView(true);
    document.body.style.overflow = 'hidden';
  };

  const closeStoryView = () => {
    setShowStoryView(false);
    document.body.style.overflow = 'auto';
  };

  const handleStoryPrev = (e) => {
    e.stopPropagation();
    setStoryImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleStoryNext = (e) => {
    e.stopPropagation();
    setStoryImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  if (loading) return (
    <div className="attraction-loading">
      <div className="loading-spinner"></div>
      <p>Loading attraction details...</p>
    </div>
  );

  if (error) return (
    <div className="attraction-error-container">
      <div className="attraction-error">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    </div>
  );

  if (!attraction) return (
    <div className="attraction-error-container">
      <div className="attraction-error">
        <h2>Not Found</h2>
        <p>The attraction you are looking for does not exist.</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="attraction-view-container">
      {/* Header with back button */}
      <div className="attraction-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{attraction.title || attraction.name}</h1>
      </div>

      <div className="attraction-content-layout">
        {/* Left Section - Featured Content */}
        <div className="attraction-main-content">
          {/* Featured Image */}
          <div className="attraction-featured-image">
            {attraction.featured_image ? (
              <img 
                src={formatImageUrl(attraction.featured_image)}
                alt={attraction.title}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="no-image-placeholder">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="attraction-content-section">
            <div className="attraction-description">
              <h2>About {attraction.title || attraction.name}</h2>
              <div dangerouslySetInnerHTML={{ __html: attraction.description }} />
            </div>

            {/* Additional Information */}
            <div className="attraction-details">
              {attraction.location && (
                <div className="detail-item">
                  <h3>Location</h3>
                  <p>{attraction.location}</p>
                </div>
              )}
              
              {attraction.best_time_to_visit && (
                <div className="detail-item">
                  <h3>Best Time to Visit</h3>
                  <p>{attraction.best_time_to_visit}</p>
                </div>
              )}

              {attraction.how_to_reach && (
                <div className="detail-item">
                  <h3>How to Reach</h3>
                  <p>{attraction.how_to_reach}</p>
                </div>
              )}

              {attraction.entry_fee && (
                <div className="detail-item">
                  <h3>Entry Fee</h3>
                  <p>{attraction.entry_fee}</p>
                </div>
              )}

              {attraction.timings && (
                <div className="detail-item">
                  <h3>Opening Hours</h3>
                  <p>{attraction.timings}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Related Attractions */}
        <div className="attraction-sidebar">
          <h3>More Attractions</h3>
          <div className="related-attractions-grid">
            {relatedAttractions.map((related) => (
              <div 
                key={related.id} 
                className="related-attraction-card"
                onClick={() => navigate(`/attraction/${related.slug}`)}
              >
                <div className="related-attraction-image">
                  {related.featured_image ? (
                    <img 
                      src={formatImageUrl(related.featured_image)}
                      alt={related.title}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="related-attraction-info">
                  <h4>{related.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story View Modal */}
      {showStoryView && images.length > 0 && (
        <div className="story-view" onClick={closeStoryView}>
          <button className="story-close" onClick={closeStoryView}>×</button>
          <div className="story-content" onClick={e => e.stopPropagation()}>
            <button className="story-nav prev" onClick={handleStoryPrev}>❮</button>
            <div className="story-image-container">
              <img 
                src={formatImageUrl(images[storyImageIndex].image_url)}
                alt={images[storyImageIndex].caption || `${attraction.title} - Image ${storyImageIndex + 1}`}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              {images[storyImageIndex].caption && (
                <div className="story-caption">
                  {images[storyImageIndex].caption}
                </div>
              )}
            </div>
            <button className="story-nav next" onClick={handleStoryNext}>❯</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttractionView; 