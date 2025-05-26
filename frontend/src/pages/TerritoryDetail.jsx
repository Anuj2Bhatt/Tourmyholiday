import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './TerritoryDetail.css';
import '../styles/TerritoryDistrictCard.css';
import { useAuth } from '../contexts/AuthContext';
import TerritoryDistrictDetail from './TerritoryDistrictDetail';

const TerritoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [territoryData, setTerritoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [setShowAllCards] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [placesToVisit, setPlacesToVisit] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const carouselRef = useRef(null);
  const [articlesCount, setArticlesCount] = useState(0);
  const [packagesCount, setPackagesCount] = useState(0);
  const [hotelsCount, setHotelsCount] = useState(0);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllToc, setShowAllToc] = useState(false);
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState(null);

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

  const fetchTerritoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First fetch territory data
      const response = await axios.get(`http://localhost:5000/api/territories/slug/${slug}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch territory data');
      }

      const data = response.data.data;
      
      if (!data) {
        throw new Error('No territory data received');
      }

      // Fetch territory districts
      try {
        const districtsResponse = await axios.get(`http://localhost:5000/api/territory-districts/territory/${data.id}`);
        if (districtsResponse.data) {
          const districtsWithImages = districtsResponse.data.map(district => ({
            ...district,
            featured_image: district.featured_image ? 
              (district.featured_image.startsWith('http') ? 
                district.featured_image : 
                `http://localhost:5000${district.featured_image}`) : 
              null
          }));
          setDistricts(districtsWithImages);
        }
      } catch (districtsError) {
        console.error('Error fetching territory districts:', districtsError);
        setDistricts([]);
      }

      // Fetch territory history
      try {
        const historyResponse = await axios.get(`http://localhost:5000/api/territory-history`, {
          params: { territory_id: data.id }
        });
        
        if (historyResponse.data.success) {
          const historyWithImages = historyResponse.data.data.map(item => ({
            ...item,
            image: item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : null
          }));
          data.history = historyWithImages;
        }
      } catch (historyError) {
        console.error('Error fetching territory history:', historyError);
        data.history = [];
      }

      // Then fetch territory images
      try {
        const imagesResponse = await axios.get(`http://localhost:5000/api/territory-images/by-territory/${data.id}`);
        if (imagesResponse.data.success) {
          const imagesWithFullUrls = imagesResponse.data.data.map(image => ({
            ...image,
            image_url: image.image_url.startsWith('http') 
              ? image.image_url 
              : `http://localhost:5000${image.image_url}`
          }));
          data.images = imagesWithFullUrls;
        }
      } catch (imagesError) {
        console.error('Error fetching territory images:', imagesError);
        data.images = [];
      }

      setTerritoryData(data);

      // Fetch places to visit
      try {
        const placesResponse = await axios.get(`http://localhost:5000/api/places/territories/${slug}/places`);
        if (placesResponse.data) {
          const placesData = placesResponse.data;
          
          // Sort places: featured first, then by creation date
          const sortedPlaces = placesData.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
          });

          const placesWithImages = sortedPlaces.map(place => ({
            ...place,
            featured_image_url: place.featured_image ? 
              (place.featured_image.startsWith('http') ? 
                place.featured_image : 
                `http://localhost:5000/uploads/places/${place.featured_image}`) : 
              null
          }));
          setPlacesToVisit(placesWithImages);
        }
      } catch (placesError) {
        console.error('Error fetching places:', placesError);
        setPlacesToVisit([]);
      }

      // Fetch counts
      try {
        const [articlesRes, packagesRes, hotelsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/territories/${slug}/articles`),
          axios.get(`http://localhost:5000/api/territories/${slug}/packages`),
          axios.get(`http://localhost:5000/api/territories/${slug}/hotels`)
        ]);

        setArticlesCount(articlesRes.data.length || 0);
        setPackagesCount(packagesRes.data.length || 0);
        setHotelsCount(hotelsRes.data.length || 0);
      } catch (countsError) {
        console.error('Error fetching counts:', countsError);
        setArticlesCount(0);
        setPackagesCount(0);
        setHotelsCount(0);
      }

    } catch (err) {
      console.error('Error fetching territory data:', err);
      setError(err.message || 'Failed to fetch territory data');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTerritoryData();
  }, [fetchTerritoryData]);

  // Auto-slide for images
  useEffect(() => {
    if (!territoryData?.images || territoryData.images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev =>
        prev === territoryData.images.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [territoryData]);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!territoryData?.id) return;
      
      try {
        setVideosLoading(true);
        const response = await axios.get(`http://localhost:5000/api/videos`, {
          params: {
            entity_type: 'territory',
            entity_id: territoryData.id
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
  }, [territoryData?.id]);

  // Auto-slide for videos
  useEffect(() => {
    if (isVideoPlaying || videos.length <= 3) return;
    const interval = setInterval(() => {
      const maxStart = Math.max(0, videos.length - 3);
      let nextIndex = Math.floor(Math.random() * (maxStart + 1));
      setCarouselIndex(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVideoPlaying, videos]);

  // Navigation handlers
  const handlePrev = () => setCarouselIndex((prev) => (prev - 1 + videos.length) % videos.length);
  const handleNext = () => setCarouselIndex((prev) => (prev + 1) % videos.length);
  const handleShowMore = () => setShowAllCards(true);
  const nextSlide = () => setCurrentSlide((prev) => prev === territoryData?.images.length - 1 ? 0 : prev + 1);
  const prevSlide = () => setCurrentSlide((prev) => prev === 0 ? territoryData?.images.length - 1 : prev - 1);

  // Video handlers
  const handleIframeFocus = () => setIsVideoPlaying(true);
  const handleIframeBlur = () => setIsVideoPlaying(false);

  // Get visible videos
  const visibleVideos = videos.slice(carouselIndex, carouselIndex + 3);
  if (visibleVideos.length < 3 && videos.length > 3) {
    visibleVideos.push(...videos.slice(0, 3 - visibleVideos.length));
  }

  // Get displayed history items with null check
  const displayedHistory = territoryData?.history 
    ? (showAllHistory 
        ? territoryData.history 
        : territoryData.history.slice(0, 3))
    : [];

  const location = useLocation();

  // Loading state
  if (loading) {
    return (
      <div className="territory-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading territory data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="territory-page">
        <div className="error-container">
          <h2>Error Loading Territory Data</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchTerritoryData} className="retry-btn">Retry</button>
            <button onClick={() => navigate('/')} className="home-btn">Go to Home</button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!territoryData) {
    return (
      <div className="territory-page">
        <div className="error-container">
          <h2>Territory Not Found</h2>
          <p>The requested territory could not be found.</p>
          <button onClick={() => navigate('/')} className="home-btn">Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="territory-page">
      {/* Admin Actions */}
      {user?.role === 'admin' && (
        <div className="admin-actions">
          <button 
            className="edit-btn"
            onClick={() => navigate(`/admin/territories/edit/${territoryData.id}`)}
          >
            Edit Territory
          </button>
          <button 
            className="delete-btn"
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this territory?')) {
                try {
                  await axios.delete(`http://localhost:5000/api/territories/${territoryData.id}`);
                  navigate('/');
                } catch (error) {
                  console.error('Error deleting territory:', error);
                  alert('Failed to delete territory');
                }
              }
            }}
          >
            Delete Territory
          </button>
        </div>
      )}

      {/* Image Slider Section */}
      <section className="image-slider-section">
        <div className="slider-container">
          <button className="slider-btn prev" onClick={prevSlide} disabled={!territoryData?.images?.length}>❮</button>
          <div className="slider">
            {territoryData?.images?.length > 0 ? (
              territoryData.images.map((img, index) => (
                <div 
                  key={img.id || index} 
                  className={`slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <img 
                    src={img.image_url}
                    alt={img.alt_text || img.description || 'Territory image'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                    }}
                  />
                  {img.description && <div className="slide-caption">{img.description}</div>}
                </div>
              ))
            ) : (
              <div className="slide active">
                <img 
                  src="https://via.placeholder.com/800x400?text=No+Images+Available"
                  alt="No images available"
                />
                <div className="slide-caption">No images available for this territory</div>
              </div>
            )}
          </div>
          <button className="slider-btn next" onClick={nextSlide} disabled={!territoryData?.images?.length}>❯</button>
        </div>
        {territoryData?.images?.length > 0 && (
          <div className="slider-dots">
            {territoryData.images.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        )}
      </section>

      {/* History Section */}
      <section className="territory-history-section">
        <div className="territory-history-container">
          <div className="territory-history-header">
            <h2 className="territory-history-title">History of {territoryData?.title || 'Territory'}</h2>
            <p className="territory-history-subtitle">Discover the rich heritage and fascinating stories that shaped this beautiful territory</p>
          </div>

          <div className="territory-history-content">
            {/* Table of Contents */}
            {territoryData?.history && territoryData.history.length > 0 && (
              <div className="territory-history-toc">
                <h3>Table of Contents</h3>
                <ul>
                  {(showAllToc ? territoryData.history : territoryData.history.slice(0, 4)).map((item, index) => (
                    <li key={item.id || index}>
                      <a href={`#history-${item.id || index}`}>{item.title}</a>
                    </li>
                  ))}
                </ul>
                {territoryData.history.length > 4 && (
                  <button 
                    onClick={() => setShowAllToc(!showAllToc)}
                    className="toc-show-more-button"
                  >
                    {showAllToc ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}

            {/* History Cards Grid */}
            <div className="territory-history-grid">
              {territoryData?.history && territoryData.history.length > 0 ? (
                <>
                  {displayedHistory.map((history, index) => (
                    <div key={history.id || index} className="territory-history-card" id={`history-${history.id || index}`}>
                      {history.image && (
                        <div className="territory-history-card-image">
                          <img 
                            src={history.image} 
                            alt={history.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      )}
                      <div className="territory-history-card-content">
                        <h3 className="territory-history-card-title">{history.title}</h3>
                        <p className="territory-history-card-description">
                          {history.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                        <Link 
                          to={`/history/${history.slug}`}
                          className="territory-history-read-more"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  ))}
                  {territoryData.history.length > 3 && (
                    <div className="territory-history-show-more">
                      {showAllHistory ? (
                        <button 
                          onClick={() => setShowAllHistory(false)}
                          className="show-more-button show-less-button"
                        >
                          Show Less
                        </button>
                      ) : (
                        <button 
                          onClick={() => setShowAllHistory(true)}
                          className="show-more-button"
                        >
                          Show More History
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="territory-history-empty">
                  No history available for this territory.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Update the Districts Section */}
      <section className="territory-districts-section">
        <div className="territory-districts-container">
          <div className="territory-districts-header">
            <h2 className="territory-districts-title">Districts in {territoryData?.title || 'Territory'}</h2>
            <p className="territory-districts-subtitle">Explore the diverse districts that make up this beautiful territory</p>
          </div>

          <div className="territory-districts-grid">
            {districts && districts.length > 0 ? (
              districts.map(district => (
                <div key={district.id} className="district-card" onClick={() => {
                  navigate(`/territory-district/${district.slug}`);
                }}>
                  <div className="district-card-image">
                    <img 
                      src={district.featured_image ? 
                        (district.featured_image.startsWith('http') ? 
                          district.featured_image : 
                          `http://localhost:5000${district.featured_image}`) : 
                        'https://via.placeholder.com/400x300?text=District+Image'
                      }
                      alt={district.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div className="district-card-content">
                    <h3 className="district-card-title">{district.name}</h3>
                    <p className="district-card-description">
                      {district.description ? 
                        district.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 
                        'No description available for this district.'}
                    </p>
                    <span className="district-card-read-more">Read More</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="district-empty-state">
                <div className="district-empty-icon">🏞️</div>
                <h3>No Districts Added Yet</h3>
                <p>This territory currently has no districts. Districts will appear here once they are added.</p>
                {user?.role === 'admin' && (
                  <button 
                    className="add-district-btn"
                    onClick={() => navigate('/admin/districts')}
                  >
                    Add Districts
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Places to Visit Section */}
      <div className="places-to-visit-section">
        <h2>Popular Places to Visit in {territoryData.name}</h2>
        <div className="places-slider-container">
          <button 
            className="places-slider-btn prev" 
            onClick={() => {
              const container = document.querySelector('.places-grid');
              container.scrollBy({ left: -400, behavior: 'smooth' });
            }}
          >
            ❮
          </button>
          <div className="places-grid">
            {placesToVisit.map(place => (
              <div key={place.id} className="place-card">
                <div className="place-image">
                  <img 
                    src={place.featured_image_url || 'https://via.placeholder.com/300x200?text=Place+Image'} 
                    alt={place.name}
                  />
                </div>
                <div className="place-content">
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>
                  {place.featured && <span className="featured-badge">Featured</span>}
                </div>
              </div>
            ))}
          </div>
          <button 
            className="places-slider-btn next"
            onClick={() => {
              const container = document.querySelector('.places-grid');
              container.scrollBy({ left: 400, behavior: 'smooth' });
            }}
          >
            ❯
          </button>
        </div>
      </div>

      {/* Videos Section */}
      <section className="territory-videos-section">
        <h2>Videos of {territoryData.name}</h2>
        {videosLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading videos...</p>
          </div>
        ) : videos.length > 0 ? (
          <div className="territory-videos-carousel" ref={carouselRef}>
            {videos.length > 3 && (
              <button className="carousel-arrow left" onClick={handlePrev}>&#8592;</button>
            )}
            <div className="territory-videos-grid">
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
                  <div key={carouselIndex + index} className="video-card">
                    <div className="video-container">
                      {videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                          title={video.title || 'YouTube video'}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
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
            No videos available for this territory.
          </div>
        )}
      </section>

      {/* Quick Links Section */}
      <section className="territory-quick-links-section">
        <div className="territory-quick-links-grid">
          {/* Hotels Card */}
          <div className="quick-link-card hotels-card" onClick={() => navigate('/hotels')}>
            <div className="quick-link-card-img-wrap">
              <div className="quick-link-card-desc">Find the best hotels in this territory.</div>
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
              <h3>Hotels ({hotelsCount})</h3>
            </div>
          </div>

          {/* Articles Card */}
          <div className="quick-link-card articles-card" onClick={() => navigate('/articles')}>
            <div className="quick-link-card-img-wrap">
              <div className="quick-link-card-desc">Read travel articles and guides.</div>
              {!articleImg && (
                <label className="card-upload-btn">
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
              <h3>Articles ({articlesCount})</h3>
            </div>
          </div>

          {/* Packages Card */}
          <div className="quick-link-card packages-card" onClick={() => navigate('/packages')}>
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
              <h3>Packages ({packagesCount})</h3>
            </div>
          </div>

          {/* Events Card */}
          <div className="quick-link-card events-card" onClick={() => navigate('/event-and-festivals')}>
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

export default TerritoryDetail; 