import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TravelInfoCard.css';

const formatDescription = (description) => {
  if (!description) return '';
  const plainText = description.replace(/<[^>]+>/g, '');
  return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
};

const formatImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^uploads\//, '');
  return `http://localhost:5000/uploads/${cleanPath}`;
};

const TravelInfoCard = ({ travel }) => {
  const navigate = useNavigate();

  return (
    <div className="travel-card">
      <div className="travel-card-image">
        {travel.featured_image ? (
          <img
            src={formatImageUrl(travel.featured_image)}
            alt={travel.title}
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        ) : (
          <div className="travel-no-image">
            No Image Available
          </div>
        )}
      </div>
      <div className="travel-card-content">
        <h3 className="travel-card-title">{travel.title}</h3>
        <div className="travel-card-description">
          {formatDescription(travel.description)}
        </div>
        <button
          className="travel-read-more"
          onClick={() => navigate(`/travel/${travel.slug}`)}
        >
          Read More
        </button>
      </div>
    </div>
  );
};

export default TravelInfoCard; 