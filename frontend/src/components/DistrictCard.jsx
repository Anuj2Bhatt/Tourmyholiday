import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DistrictCard.css';

const DistrictCard = ({ district }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/district/${district.slug}`);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000/${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
  };

  return (
    <div className="custom-district-card" onClick={handleCardClick}>
      <div className="custom-district-card-image">
        <img 
          src={getImageUrl(district.featured_image)}
          alt={district.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
          }}
        />
        <div className="custom-district-overlay">
          <div className="custom-district-badges">
            <span className="custom-district-badge state">{district.state_name}</span>
          </div>
        </div>
      </div>
      <div className="custom-district-card-content">
        <div className="custom-district-header">
          <h3>{district.name}</h3>
        </div>
        
        <div className="custom-district-info">
          <p className="custom-district-description">
            {district.description}
          </p>
        </div>

        <div className="custom-district-footer">
          <div className="custom-district-stats">
            <span className="custom-stat">
              <span className="stat-icon">📍</span>
              {district.state_name}
            </span>
            <span className="custom-stat">
              <span className="stat-icon">🏛️</span>
              District
            </span>
          </div>
          <button className="custom-explore-btn">
            Explore District
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistrictCard; 