import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StateHistoryCard from './StateHistoryCard';
import './StatePage.css';
import DistrictCard from './DistrictCard';
import PlacesToVisitCard from './PlacesToVisitCard';
import axios from 'axios';
import { API_URL } from '../config';

const StatePage = () => {
  const { stateName } = useParams();
  const navigate = useNavigate();
  const [stateData, setStateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllCards, setShowAllCards] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [placesToVisit, setPlacesToVisit] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const carouselRef = useRef(null);
  const [setArticlesCount] = useState(0);
  const [setPackagesCount] = useState(0);
  const [setHotelsCount] = useState(0);
  const [currentPlacesPage, setCurrentPlacesPage] = useState(0);
  const placesScrollRef = useRef(null);
  const [totalPlacesPages, setTotalPlacesPages] = useState(0);
  const [seasonImages, setSeasonImages] = useState({
    summer: [],
    monsoon: [],
    autumn: [],
    winter: [],
    spring: []
  });
  const [activeSeason, setActiveSeason] = useState('summer');
  const [selectedSeason] = useState('all');


  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = container.offsetWidth;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };
  // Card images from localStorage
  const getCardImage = (key) => localStorage.getItem(key);
  const [hotelImg, setHotelImg] = useState(getCardImage('hotel_card_img'));
  const [articleImg, setArticleImg] = useState(getCardImage('article_card_img'));
  const [packageImg, setPackageImg] = useState(getCardImage('package_card_img'));
  const [eventImg, setEventImg] = useState(getCardImage('event_card_img'));

  const handleImageUpload = (e, key, setImg) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImg(ev.target.result);
      localStorage.setItem(key, ev.target.result);
    };
    reader.readAsDataURL(file);
  };


  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/test`);
      if (!response.ok) {
        throw new Error('Server is not responding properly');
      }
      const data = await response.json();
      return data.message === 'Server is running';
    } catch (err) {
      console.error('Server status check failed:', err);
      return false;
    }
  };

  const fetchStateData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check server status
      const isServerRunning = await checkServerStatus();
      if (!isServerRunning) {
        throw new Error('Backend server is not running. Please start the server and try again.');
      }

      // Format state name for API
      const formattedStateName = stateName.toLowerCase().replace(/\s+/g, '-');

      // Fetch state data
      const response = await fetch(`${API_URL}/api/states/${formattedStateName}`);

      if (!response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch state data: ${response.statusText}`);
        } else {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      if (!data.history || !Array.isArray(data.history)) {
        throw new Error('Invalid history data received from server');
      }

      // Fetch state images
      const imagesResponse = await fetch(`${API_URL}/api/states/images/${data.id}`);
      let images = [];
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        images = imagesData.map(img => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `${API_URL}${img.url}`
        }));
      }

      const districtsResponse = await fetch(`${API_URL}/api/districts/state/${data.name}`);
      if (!districtsResponse.ok) {
        setDistricts([]); // ✅ move this inside the if block
      } else {
        const districtsData = await districtsResponse.json();
        setDistricts(districtsData);
      }

      // Ensure each history item has the correct image URL
      const historyWithImages = data.history.map(item => ({
        ...item,
        image: item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : null
      }));

      setStateData({
        ...data,
        history: historyWithImages,
        images: images
      });

      // Fetch places to visit using the correct API endpoint
      const placesResponse = await fetch(`${API_URL}/api/places/states/${data.id}/places`);
      if (placesResponse.ok) {
        const placesResponseData = await placesResponse.json();
        // Get the places array from the response
        const placesData = placesResponseData.data || [];

        // Sort places: featured places first, then by creation date
        const sortedPlaces = placesData.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });

        // Ensure each place has the correct image URL
        const placesWithImages = sortedPlaces.map(place => ({
          ...place,
          featured_image_url: place.featured_image ?
            (place.featured_image.startsWith('http') ?
              place.featured_image :
              `${API_URL}/uploads/places/${place.featured_image}`) :
            null
        }));
        setPlacesToVisit(placesWithImages);
      } else {
        setPlacesToVisit([]);
      }

      // Fetch articles, packages, hotels count when stateData is loaded
      if (!stateData) return;
      const slug = stateData.slug || stateData.name?.toLowerCase().replace(/\s+/g, '-');
      // Fetch articles count
      fetch(`${API_URL}/api/states/${slug}/articles`)
        .then(res => res.json())
        .then(data => setArticlesCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setArticlesCount(0));
      // Fetch packages count
      fetch(`${API_URL}/api/states/${slug}/packages`)
        .then(res => res.json())
        .then(data => setPackagesCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setPackagesCount(0));
      // Fetch hotels count
      fetch(`${API_URL}/api/states/${slug}/hotels`)
        .then(res => res.json())
        .then(data => setHotelsCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setHotelsCount(0));
    } catch (err) {
      console.error('Error fetching state data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stateName]);

  useEffect(() => {
    fetchStateData();
  }, [fetchStateData]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!stateData || !stateData.images || stateData.images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev =>
        prev === stateData.images.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [stateData]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === stateData?.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? stateData?.images.length - 1 : prev - 1
    );
  };

  const handleShowMore = () => {
    setShowAllCards(true);
  };
  useEffect(() => {
    const fetchSeasonImages = async () => {
      try {
        if (!stateData?.id) return;
        const response = await axios.get(`${API_URL}/api/state-season-images/${stateData.id}`);
        setSeasonImages(response.data);
      } catch (error) {
        console.error('Error fetching season images:', error);
      }
    };

    fetchSeasonImages();
  }, [stateData]);

  // Add this new useEffect for fetching videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!stateData?.id) return;

      try {
        setVideosLoading(true);
        const response = await axios.get(`${API_URL}/api/videos`, {
          params: {
            entity_type: 'state',
            entity_id: stateData.id
          }
        });
        setVideos(response.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, [stateData?.id]);

  // Auto-slide logic
  useEffect(() => {
    if (isVideoPlaying || videos.length <= 3) return;
    const interval = setInterval(() => {
      // Pick a random start index such that 3 videos can be shown
      const maxStart = Math.max(0, videos.length - 3);
      let nextIndex = Math.floor(Math.random() * (maxStart + 1));
      setCarouselIndex(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVideoPlaying, videos]);

  // Helper to handle video play/pause
  const handleIframeFocus = () => setIsVideoPlaying(true);
  const handleIframeBlur = () => setIsVideoPlaying(false);

  // Navigation handlers
  const handlePrev = () => {
    setCarouselIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };
  const handleNext = () => {
    setCarouselIndex((prev) => (prev + 1) % videos.length);
  };


  // Get the 3 videos to show
  const visibleVideos = videos.slice(carouselIndex, carouselIndex + 3);
  if (visibleVideos.length < 3 && videos.length > 3) {
    visibleVideos.push(...videos.slice(0, 3 - visibleVideos.length));
  }

  // Calculate total pages when places data changes
  useEffect(() => {
    if (placesToVisit.length > 0) {
      const cardsPerPage = window.innerWidth >= 1200 ? 4 :
        window.innerWidth >= 992 ? 3 :
          window.innerWidth >= 576 ? 2 : 1;
      setTotalPlacesPages(Math.ceil(placesToVisit.length / cardsPerPage));
    }
  }, [placesToVisit]);

  const handlePlacesScroll = (direction) => {
    if (!placesScrollRef.current) return;

    const container = placesScrollRef.current;
    const cardWidth = container.querySelector('.places-to-visit-card')?.offsetWidth || 300;
    const gap = 30; // This should match the gap in CSS
    const scrollAmount = (cardWidth + gap) * (window.innerWidth >= 1200 ? 4 :
      window.innerWidth >= 992 ? 3 :
        window.innerWidth >= 576 ? 2 : 1);

    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentPlacesPage(prev => Math.max(0, prev - 1));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setCurrentPlacesPage(prev => Math.min(totalPlacesPages - 1, prev + 1));
    }
  };



  // Filter places based on selected season
  const getFilteredPlaces = () => {
    if (selectedSeason === 'all') return placesToVisit;
    return placesToVisit.filter(place => {
      const bestTime = place.best_time_to_visit?.toLowerCase() || '';
      return bestTime.includes(selectedSeason.toLowerCase());
    });
  };

  if (loading) {
    return (
      <div className="state-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-page">
        <div className="error-container">
          <h2>Error Loading State Data</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchStateData} className="retry-btn">Retry</button>
            <button onClick={() => navigate('/')} className="home-btn">Go to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (!stateData) {
    return (
      <div className="state-page">
        <div className="error-container">
          <h2>State Not Found</h2>
          <p>The requested state could not be found.</p>
          <button onClick={() => navigate('/')} className="home-btn">Go to Home</button>
        </div>
      </div>
    );
  }



  // Get the history items to display
  const displayedHistory = showAllCards
    ? stateData.history
    : stateData.history.slice(0, 3);

  return (
    <div className="state-page">
      {/* Image Slider Section */}
      <section className="image-slider-section">
        {stateData?.images && stateData.images.length > 0 ? (
          <>
            <div className="slider-container">
              <button className="slider-btn prev" onClick={prevSlide}>❮</button>
              <div className="slider">
                {stateData.images.map((img, index) => (
                  <div
                    key={index}
                    className={`slide ${index === currentSlide ? 'active' : ''}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || img.caption || 'State image'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                      }}
                    />
                    {img.caption && <div className="slide-caption">{img.caption}</div>}
                  </div>
                ))}
              </div>
              <button className="slider-btn next" onClick={nextSlide}>❯</button>
            </div>
            <div className="slider-dots">
              {stateData.images.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="no-images-message">
            <p>No images available for this state.</p>
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="history-section">
        <div className="history-container">
          <div className="history-header-group">
            <div className="history-header-inline">
              <h2 className="state-history-heading">History</h2>
            </div>
          </div>
          {/* Table of Contents */}
          <div className="table-of-contents">
            <h3>Table of Contents</h3>
            <ul>
              {stateData.history.map((item, index) => (
                <li key={index}>
                  <a href={`#history-${index}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </div>
          {/* Divider (if any) can go here */}
          {/* History Cards */}
          <div className="history-cards-grid">
            {displayedHistory.map((history, index) => (
              <StateHistoryCard key={index} history={history} />
            ))}
          </div>
          {/* Show More Button */}
          {!showAllCards && stateData.history.length > 3 && (
            <div className="show-more-container">
              <button className="show-more-btn" onClick={handleShowMore}>
                Show More History ({stateData.history.length - 3} more)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Districts Section */}
      <div className="districts-section">
        <h2>Districts in {stateData.name}</h2>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading districts...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Error loading districts: {error}</p>
            <button onClick={fetchStateData} className="retry-btn">Retry</button>
          </div>
        ) : districts && districts.length > 0 ? (
          <div className="districts-grid">
            {districts.map(district => (
              <DistrictCard
                key={district.id}
                district={district}
              />
            ))}
          </div>
        ) : (
          <div className="no-districts-message">
            <p>No districts available for {stateData.name}.</p>
          </div>
        )}
      </div>

      {/* Places to Visit Section */}
      <div className="places-to-visit-section">
        <h2>Popular Places to Visit in {stateData.name}</h2>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading places...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Error loading places: {error}</p>
            <button onClick={fetchStateData} className="retry-btn">Retry</button>
          </div>
        ) : placesToVisit && placesToVisit.length > 0 ? (
          <div className="places-container">
            {currentPlacesPage > 0 && (
              <button
                className="places-nav-btn left"
                onClick={() => handlePlacesScroll('left')}
                aria-label="Previous places"
              >
                &#8592;
              </button>
            )}
            <div className="places-grid" ref={placesScrollRef}>
              {getFilteredPlaces().map(place => (
                <PlacesToVisitCard
                  key={place.id}
                  place={place}
                />
              ))}
            </div>
            {currentPlacesPage < totalPlacesPages - 1 && (
              <button
                className="places-nav-btn right"
                onClick={() => handlePlacesScroll('right')}
                aria-label="Next places"
              >
                &#8594;
              </button>
            )}
          </div>
        ) : (
          <div className="no-places-message">
            <p>No places available for {stateData.name} yet.</p>
          </div>
        )}
      </div>

      <div className="seasonal-highlights-section">
        <h2 className="section-title">Seasonal Highlights</h2>
        <p className="section-description">
          Discover the beauty of {stateData.name} through different seasons
        </p>

        <div className="season-tabs">
          <button
            className={`season-tab ${activeSeason === 'summer' ? 'active' : ''}`}
            onClick={() => setActiveSeason('summer')}
          >
            Summer
          </button>
          <button
            className={`season-tab ${activeSeason === 'monsoon' ? 'active' : ''}`}
            onClick={() => setActiveSeason('monsoon')}
          >
            Monsoon
          </button>
          <button
            className={`season-tab ${activeSeason === 'autumn' ? 'active' : ''}`}
            onClick={() => setActiveSeason('autumn')}
          >
            Autumn
          </button>
          <button
            className={`season-tab ${activeSeason === 'winter' ? 'active' : ''}`}
            onClick={() => setActiveSeason('winter')}
          >
            Winter
          </button>
          <button
            className={`season-tab ${activeSeason === 'spring' ? 'active' : ''}`}
            onClick={() => setActiveSeason('spring')}
          >
            Spring
          </button>
        </div>

        <div className="seasonal-images-carousel-wrapper">
          <button onClick={() => scroll('left')} className="scroll-button left">←</button>

          <div className="seasonal-images-carousel" ref={scrollRef}>
            {seasonImages[activeSeason]?.length > 0 ? (
              seasonImages[activeSeason].map(image => (
                <div key={image.id} className="seasonal-image-card">
                  <h3 className="seasonal-image-title">{image.location}</h3>
                  <img
                    src={image.url}
                    alt={image.alt || `${activeSeason} in ${image.location}`}
                    loading="lazy"
                    className="seasonal-image"
                  />
                  {image.caption && <p className="seasonal-image-caption">{image.caption}</p>}
                </div>
              ))
            ) : (
              <div className="no-images-message">
                No images available for {activeSeason} season
              </div>
            )}
          </div>

          <button onClick={() => scroll('right')} className="scroll-button right">→</button>
        </div>

      </div>

      {/* Videos Section */}
      <section className="state-videos-section">
        <h2>Videos of {stateData.name}</h2>
        {videosLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading videos...</p>
          </div>
        ) : videos.length > 0 ? (
          <div className="state-videos-carousel" ref={carouselRef}>
            {videos.length > 3 && (
              <button className="carousel-arrow left" onClick={handlePrev}>&#8592;</button>
            )}
            <div className="state-videos-grid carousel-grid">
              {visibleVideos.map((video, index) => {
                const getYouTubeId = (url) => {
                  if (!url) return null;
                  let videoId = null;
                  if (url.includes('youtube.com/shorts/')) {
                    videoId = url.split('shorts/')[1]?.split('?')[0];
                  } else if (url.includes('youtube.com/watch?v=')) {
                    videoId = url.split('v=')[1]?.split('&')[0];
                  } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1]?.split('?')[0];
                  } else if (url.includes('youtube.com/embed/')) {
                    videoId = url.split('embed/')[1]?.split('?')[0];
                  } else if (url.length === 11) {
                    videoId = url;
                  }
                  return videoId;
                };
                const videoId = getYouTubeId(video.youtube_url);
                return (
                  <div key={carouselIndex + index} className="video-thumb-card carousel-video-card">
                    <div className="video-thumb-image" style={{ position: 'relative' }}>
                      {videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                          title={video.title || 'YouTube video'}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          style={{ width: '100%', height: '100%', borderRadius: '8px' }}
                          tabIndex={0}
                          onFocus={handleIframeFocus}
                          onBlur={handleIframeBlur}
                        />
                      ) : (
                        <div className="video-error">Invalid video URL</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {videos.length > 3 && (
              <button className="carousel-arrow right" onClick={handleNext}>&#8594;</button>
            )}
          </div>
        ) : (
          <div className="no-videos">
            No videos available for this state.
          </div>
        )}
      </section>

      {/* Quick Links Cards Section */}
      <section className="state-quick-links-section">
        <div className="state-quick-links-grid">
          {/* Hotels Card */}
          <div className="quick-link-card hotels-card" onClick={() => navigate('/hotels')} tabIndex={0} role="button">
            <div className="quick-link-card-img-wrap">
              <div className="quick-link-card-desc">Find the best hotels in this state.</div>
              {!hotelImg && (
                <label className="card-upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleImageUpload(e, 'hotel_card_img', setHotelImg)}
                  />
                  <span role="img" aria-label="Upload">🖼️</span>
                </label>
              )}
              <img src={hotelImg || '/images/hotels-card.jpg'} alt="Hotels" className="quick-link-card-img" />
            </div>
            <div className="quick-link-card-content">
              <h3>Hotels</h3>
            </div>
          </div>
          {/* Articles Card */}
          <div className="quick-link-card articles-card" onClick={() => navigate('/articles')} tabIndex={0} role="button">
            <div className="quick-link-card-img-wrap">
              <div className="quick-link-card-desc">Read travel articles and guides.</div>
              {!articleImg && (
                <label className="card-upload-btn card-upload-btn-articles" style={{ opacity: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleImageUpload(e, 'article_card_img', setArticleImg)}
                  />
                  <span role="img" aria-label="Upload">🖼️</span>
                </label>
              )}
              <img src={articleImg || '/images/articles-card.jpg'} alt="Articles" className="quick-link-card-img" />
            </div>
            <div className="quick-link-card-content">
              <h3>Articles</h3>
            </div>
          </div>
          {/* Packages Card */}
          <div className="quick-link-card packages-card" onClick={() => navigate('/packages')} tabIndex={0} role="button">
            <div className="quick-link-card-img-wrap">
              <div className="quick-link-card-desc">Explore travel packages and deals.</div>
              {!packageImg && (
                <label className="card-upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleImageUpload(e, 'package_card_img', setPackageImg)}
                  />
                  <span role="img" aria-label="Upload">🖼️</span>
                </label>
              )}
              <img src={packageImg || '/images/packages-card.jpg'} alt="Packages" className="quick-link-card-img" />
            </div>
            <div className="quick-link-card-content">
              <h3>Packages</h3>
            </div>
          </div>
          {/* Events & Festivals Card */}
          <div className="quick-link-card events-card" onClick={() => navigate('/event-and-festivals')} tabIndex={0} role="button">
            <div className="quick-link-card-img-wrap">
              <div className="quick-link-card-desc">See upcoming events and festivals.</div>
              {!eventImg && (
                <label className="card-upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleImageUpload(e, 'event_card_img', setEventImg)}
                  />
                  <span role="img" aria-label="Upload">🖼️</span>
                </label>
              )}
              <img src={eventImg || '/images/events-card.jpg'} alt="Events & Festivals" className="quick-link-card-img" />
            </div>
            <div className="quick-link-card-content">
              <h3>Events & Festivals</h3>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default StatePage; 