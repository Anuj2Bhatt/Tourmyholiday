import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { territoryService } from '../services/territoryService';
import "./UnionTeritory.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UnionTeritory = () => {
  const navigate = useNavigate();
  const [territories, setTerritories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTerritories(); 
  }, []);

  const fetchTerritories = async () => {
    try {
      setLoading(true);
      const response = await territoryService.getAllTerritories();
      if (response.success) {
        // Format image URLs
        const formattedTerritories = response.data.map(territory => ({
          ...territory,
          preview_image: territory.preview_image.startsWith('http') 
            ? territory.preview_image 
            : `${API_URL}${territory.preview_image}`
        }));
        setTerritories(formattedTerritories);
      } else {
        setError('Failed to fetch territories');
      }
    } catch (err) {
      setError(err.message || 'Error loading territories');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get emoji for activity
  const getEmojiForActivity = (activity) => {
    const activityEmojis = {
      'beaches': '🏖️',
      'mountains': '⛰️',
      'culture': '🎭',
      'food': '🍽️',
      'history': '🏛️',
      'nature': '🌿',
      'adventure': '🏂',
      'temples': '🕍',
      'wildlife': '🦁',
      'shopping': '🛍️',
      'nightlife': '🌃',
      'art': '🎨',
      'architecture': '🏛️',
      'festivals': '🎉',
      'music': '🎵',
      'dance': '💃',
      'sports': '⚽',
      'photography': '📸',
      'relaxation': '🧘',
      'education': '📚'
    };

    // Try to find a matching emoji
    for (const [key, emoji] of Object.entries(activityEmojis)) {
      if (activity.toLowerCase().includes(key)) {
        return emoji;
      }
    }

    // Default emoji if no match found
    return '✨';
  };

  const handleCardClick = (slug) => {
    navigate(`/territory/${slug}`);
  };

  if (loading) {
    return (
      <div className="teritory-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading territories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teritory-section">
        <div className="error-container">
          <h2>Error Loading Territories</h2>
          <p>{error}</p>
          <button onClick={fetchTerritories} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="teritory-section">
      <h2>Union Territories of India</h2>
      <div className="teritory-grid">
        {territories.map((territory) => (
          <div 
            key={territory.id} 
            className="Teritory-card"
            onClick={() => handleCardClick(territory.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(territory.slug);
              }
            }}
          >
            <div className="teritory-image">
              <img 
                src={territory.preview_image} 
                alt={territory.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
            </div>
            <div className="teritory-content">
              <h3>{territory.title}</h3>
              <p className="teritory-capital">
                <strong>Capital:</strong> {territory.capital}
              </p>
              {territory.famous_for && (
                <div className="teritory-activities">
                  <h4>Popular Activities</h4>
                  <div className="activities-buttons">
                    {territory.famous_for.split(',').map((activity, index) => (
                      <button 
                        key={index} 
                        className="activity-button"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {getEmojiForActivity(activity.trim())} {activity.trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="territory-actions">
                <button 
                  className="explore-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(territory.slug);
                  }}
                >
                  Explore
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnionTeritory; 