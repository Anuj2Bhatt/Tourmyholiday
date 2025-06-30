import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TravelInfoView.css';

const formatImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^uploads\//, '');
  return `http://localhost:5000/uploads/${cleanPath}`;
};

const TravelInfoView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [travelInfo, setTravelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedTravelInfo, setRelatedTravelInfo] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchTravelInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const travelInfoResponse = await axios.get(`http://localhost:5000/api/subdistrict-travel-info/state/1`);

        if (!travelInfoResponse.data || travelInfoResponse.data.length === 0) {
          throw new Error('Travel information not found');
        }

        // Find the specific travel info with matching slug
        const travelInfo = travelInfoResponse.data.find(info => info.slug === slug);
        if (!travelInfo) {
          throw new Error('Travel information not found');
        }

        setTravelInfo(travelInfo);

        // Fetch related travel info (excluding current item)
        const filtered = travelInfoResponse.data.filter(item => item.slug !== slug);
        // Get 4 random items
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRelatedTravelInfo(shuffled.slice(0, 4));

      } catch (err) {
        setError('Failed to load travel information');
      } finally {
        setLoading(false);
      }
    };

    fetchTravelInfo();
  }, [slug]);

  // Navigation handlers for related items
  const handlePrevItems = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextItems = () => {
    setCurrentPage(prev => 
      Math.min(Math.ceil(relatedTravelInfo.length / itemsPerPage) - 1, prev + 1)
    );
  };

  if (loading) {
    return (
      <div className="travel-info-loading">
        <div className="loading-spinner"></div>
        <p>Loading travel information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="travel-info-error">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  if (!travelInfo) {
    return (
      <div className="travel-info-error">
        <h2>Not Found</h2>
        <p>The travel information you are looking for does not exist.</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="travel-info-view">
      {/* Header with back button */}
      <div className="travel-info-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{travelInfo.title}</h1>
      </div>

      <div className="travel-info-content">
        {/* Left Section - Main Content */}
        <div className="travel-info-main">
          {/* Featured Image */}
          <div className="travel-info-featured-image">
            {travelInfo.featured_image ? (
              <img 
                src={formatImageUrl(travelInfo.featured_image)}
                alt={travelInfo.title}
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

          {/* Description */}
          <div className="travel-info-description">
            <h2>About</h2>
            <div dangerouslySetInnerHTML={{ __html: travelInfo.description }} />
          </div>

          {/* Cards Section */}
          <div className="travel-info-cards">
            {/* Best Time to Visit Card */}
            {travelInfo.best_time_to_visit && (
              <div className="travel-info-card">
                <div className="card-content">
                  <h3>Best Time to Visit</h3>
                  <div dangerouslySetInnerHTML={{ __html: travelInfo.best_time_to_visit }} />
                </div>
              </div>
            )}

            {/* How to Reach Card */}
            {travelInfo.how_to_reach && (
              <div className="travel-info-card">
                <div className="card-content">
                  <h3>How to Reach</h3>
                  <div dangerouslySetInnerHTML={{ __html: travelInfo.how_to_reach }} />
                </div>
              </div>
            )}

            {/* Local Transport Card */}
            {travelInfo.local_transport && (
              <div className="travel-info-card">
                <div className="card-content">
                  <h3>Local Transport</h3>
                  <div dangerouslySetInnerHTML={{ __html: travelInfo.local_transport }} />
                </div>
              </div>
            )}

            {/* Accommodation Card */}
            {travelInfo.accommodation && (
              <div className="travel-info-card">
                <div className="card-content">
                  <h3>Accommodation</h3>
                  <div dangerouslySetInnerHTML={{ __html: travelInfo.accommodation }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Related Travel Info */}
        <div className="travel-info-sidebar">
          <h3>Related Travel Information</h3>
          {relatedTravelInfo.length > 0 ? (
            <div className="related-travel-grid">
              {relatedTravelInfo.map(item => (
                <div 
                  key={item.id} 
                  className="related-travel-card"
                  onClick={() => navigate(`/travel-info/${item.slug}`)}
                >
                  <div className="related-travel-image">
                    {item.featured_image ? (
                      <img
                        src={formatImageUrl(item.featured_image)}
                        alt={item.title}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="no-image-placeholder">
                        No Image Available
                      </div>
                    )}
                  </div>
                  <div className="related-travel-content">
                    <h4>{item.title}</h4>
                    <p>{item.description?.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-related-travel">No related travel information available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelInfoView; 