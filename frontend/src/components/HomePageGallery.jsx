import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './HomePageGallery.css';
import GalleryViewer from './GalleryViewer';

const HomePageGallery = () => {
  const navigate = useNavigate();
  const [galleryImages, setGalleryImages] = useState([
    // Default images to show while loading or if API fails
    {
      id: 1,
      url: '/images/featured-destination.jpg',
      altText: 'Featured destination'
    },
    {
      id: 2,
      url: '/images/destination1.jpg',
      altText: 'Beautiful destination 1'
    },
    {
      id: 3,
      url: '/images/destination2.jpg',
      altText: 'Beautiful destination 2'
    },
    {
      id: 4,
      url: '/images/destination3.jpg',
      altText: 'Beautiful destination 3'
    },
    {
      id: 5,
      url: '/images/destination4.jpg',
      altText: 'Beautiful destination 4'
    }
  ]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showGalleryViewer, setShowGalleryViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const autoSlideInterval = useRef(null);
  const isMobile = window.innerWidth <= 480;

  // Load gallery images from API
  useEffect(() => {
    fetch('http://localhost:5000/api/gallery')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setGalleryImages(data);
        }
      })
      .catch(error => {
        console.error('Error fetching gallery images:', error);
        // Keep using default images if API fails
      });
  }, []);

  // Auto slide functionality
  useEffect(() => {
    if (isMobile) {
      startAutoSlide();
    }
    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
  }, [isMobile]);

  const startAutoSlide = () => {
    autoSlideInterval.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds
  };

  const stopAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
    }
  };

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
    stopAutoSlide();
    startAutoSlide();
  };

  const handleImageClick = () => {
    // Show GalleryViewer for both mobile and desktop
    setShowGalleryViewer(true);
    setSelectedImageIndex(currentImageIndex);
  };

  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
    stopAutoSlide();
    startAutoSlide();
  };

  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
    stopAutoSlide();
    startAutoSlide();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleViewMore = () => {
    setShowGalleryViewer(true);
    setSelectedImageIndex(0);
  };

  const handleCloseViewer = () => {
    setShowGalleryViewer(false);
  };

  const defaultImage = '/images/default-destination.jpg';

  return (
    <div className="gallery-container">      
      <div className="main-section">
        <div className="left-section">
          <div className="main-image" onClick={handleImageClick}>
            <TransitionGroup>
              <CSSTransition
                key={currentImageIndex}
                timeout={500}
                classNames="fade"
              >
                <img
                  src={galleryImages[currentImageIndex]?.url || defaultImage}
                  alt={galleryImages[currentImageIndex]?.altText || "Featured destination"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
              </CSSTransition>
            </TransitionGroup>
            
            {/* Keep Dots Navigation */}
            {isMobile && (
              <div className="slider-dots">
                {galleryImages.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDotClick(index);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        {/* Remove Gallery Modal since we're using GalleryViewer for both mobile and desktop */}
        
        <div className="right-section">
          <div className="image-grid">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="image-item">
                <img 
                  src={galleryImages[index]?.url || defaultImage}
                  alt={galleryImages[index]?.altText || `Gallery image ${index}`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
                {index === 4 && (
                  <div className="view-more-overlay" onClick={handleViewMore}>
                    <div className="see-all-overlay">See all</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showGalleryViewer && (
        <GalleryViewer 
          images={galleryImages}
          startIndex={selectedImageIndex}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

export default HomePageGallery; 