import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlacesToVisitCard.css';

const PlacesToVisitCard = ({ place }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/places/${place.slug}`);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000/uploads/places/${imageUrl}`;
  };

  return (
    <div className="place-card">
      <div className="place-image">
        <img 
          src={getImageUrl(place.featured_image_url)} 
          alt={place.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
          }}
        />
        {place.featured && (
          <div className="featured-badge">
            Featured
          </div>
        )}
      </div>
      <div className="place-content">
        <h3>{place.title}</h3>
        <p className="place-location">📍 {place.location}</p>
        <p className="place-description">{place.description}</p>
        <div className="place-meta">
          {place.best_time_to_visit && (
            <span className="meta-item">
              <span className="meta-icon">🗓️</span>
              Best Time: {place.best_time_to_visit}
            </span>
          )}
          {place.entry_fee && (
            <span className="meta-item">
              <span className="meta-icon">💰</span>
              Entry: {place.entry_fee}
            </span>
          )}
        </div>
        <div className="card-footer">
          <button className="read-more-btn" onClick={handleClick}>
            Read More
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacesToVisitCard; 