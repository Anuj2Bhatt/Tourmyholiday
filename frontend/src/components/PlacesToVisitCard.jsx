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
    <div className="places-to-visit-card">
      <div className="places-to-visit-image">
        <img 
          src={getImageUrl(place.featured_image_url)} 
          alt={place.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
          }}
        />
        {place.featured && (
          <div className="places-to-visit-featured-badge">
            Featured
          </div>
        )}
      </div>
      <div className="places-to-visit-content">
        <h3 className="places-to-visit-title">{place.title}</h3>
        <p className="places-to-visit-description">
          {place.description}
        </p>
        <div className="places-to-visit-footer">
          <button className="places-to-visit-read-more" onClick={handleClick}>
            Read More
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacesToVisitCard; 