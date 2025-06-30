import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ViewPlacePage.css';

const ViewPlacePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch place data
        const statesResponse = await axios.get('http://localhost:5000/api/states');
        const states = statesResponse.data;
        
        let placeData = null;
        let relatedPlaces = [];
        
        for (const state of states) {
          try {
            const response = await axios.get(`http://localhost:5000/api/places/states/${state.id}/places`);
            if (response.data.success && Array.isArray(response.data.data)) {
              const foundPlace = response.data.data.find(p => p.slug === slug);
              if (foundPlace) {
                placeData = foundPlace;
                // Get other places from same state
                relatedPlaces = response.data.data
                  .filter(p => p.id !== foundPlace.id) // Exclude current place
                  .sort(() => 0.5 - Math.random()) // Shuffle array
                  .slice(0, 4); // Get first 4 places
                break;
              }
            }
          } catch (err) {
            continue;
          }
        }

        if (placeData) {
          setPlace(placeData);
          setRelatedBlogs(relatedPlaces); // Using same state for places
        } else {
          throw new Error('Place not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load place details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/1200x600?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000/uploads/places/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="view-place-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading place details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-place-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="view-place-page">
        <div className="error-container">
          <p>Place not found</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-place-page">
      {/* Left Section - Place Content */}
      <div className="place-content-section">
        <div className="place-content">
          <div className="place-description">
            <div className="place-hero-image">
              <img 
                src={getImageUrl(place.featured_image_url)} 
                alt={place.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/1200x600?text=Image+Not+Found';
                }}
              />
            </div>
            <div className="place-meta-info">
              <span className="location">
                <i className="fas fa-map-marker-alt"></i>
                {place.location}
              </span>
              {place.best_time_to_visit && (
                <span className="best-time">
                  <i className="fas fa-calendar-alt"></i>
                  Best Time: {place.best_time_to_visit}
                </span>
              )}
              {place.entry_fee && (
                <span className="entry-fee">
                  <i className="fas fa-ticket-alt"></i>
                  Entry: {place.entry_fee}
                </span>
              )}
            </div>
            <h1>{place.title}</h1>
            <p>{place.description}</p>
            {place.content && (
              <div className="place-content-html" dangerouslySetInnerHTML={{ __html: place.content }} />
            )}
          </div>

          {place.timings && (
            <div className="place-timings">
              <h2>Visiting Hours</h2>
              <p>{place.timings}</p>
            </div>
          )}

          <div className="place-actions">
            <button onClick={() => navigate(-1)} className="back-btn">
              <i className="fas fa-arrow-left"></i> Go Back
            </button>
            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.location)}`, '_blank')}
              className="directions-btn"
            >
              <i className="fas fa-directions"></i> Get Directions
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Places to Visit */}
      <div className="related-blogs-section">
        <h2>Places to Visit</h2>
        <div className="related-blogs-grid">
          {relatedBlogs.map(place => (
            <Link 
              to={`/places/${place.slug}`} 
              key={place.id} 
              className="blog-card"
            >
              <img 
                src={getImageUrl(place.featured_image_url)} 
                alt={place.title}
                className="blog-card-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x225?text=No+Image';
                }}
              />
              <div className="blog-card-content">
                <h3 className="blog-card-title">{place.title}</h3>
              </div>
            </Link>
          ))}
          {relatedBlogs.length === 0 && (
            <p className="no-blogs-message">No other places found in this state.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPlacePage; 