import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wildlifeService } from '../services/wildlifeService';
import { API_URL } from '../config';
import './WildlifeSanctuaries.css';

const WildlifeSanctuaries = () => {
  const [sanctuaries, setSanctuaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSanctuaries();
  }, []);

  const fetchSanctuaries = async () => {
    try {
      const data = await wildlifeService.getAllSanctuaries();
      setSanctuaries(data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch wildlife sanctuaries');
      setLoading(false);
    }
  };

  const getImageUrl = (featuredImage) => {
    if (!featuredImage) return '/placeholder-image.jpg';
    const imageUrl = `${API_URL}/uploads/${featuredImage}`;
    return imageUrl;
  };

  if (loading) return <div className="loading">Loading wildlife sanctuaries...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!sanctuaries || sanctuaries.length === 0) return <div className="no-data">No wildlife sanctuaries found</div>;

  return (
    <div className="sanctuaries-container">
      <div className="sanctuaries-header">
        <h1>Indian Wildlife Sanctuaries</h1>
        <p>Explore the diverse wildlife sanctuaries across India, each offering unique experiences and wildlife encounters.</p>
      </div>

      <div className="sanctuaries-grid">
        {sanctuaries.map((sanctuary) => (
          <Link to={`/wildlife/${sanctuary.slug}`} key={sanctuary.id} className="sanctuary-card">
            <div className="sanctuary-image">
              <img 
                src={getImageUrl(sanctuary.featured_image)}
                alt={sanctuary.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            <div className="sanctuary-info">
              <h2>{sanctuary.title}</h2>
              <p className="location">{sanctuary.location}</p>
              <p className="description">{sanctuary.description}</p>
              <div className="sanctuary-details">
                <span className="best-time">
                  <i className="fas fa-calendar"></i> Best Time: {sanctuary.best_time || 'Year-round'}
                </span>
                <span className="area">
                  <i className="fas fa-map-marker-alt"></i> Area: {sanctuary.area || 'Not specified'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WildlifeSanctuaries; 