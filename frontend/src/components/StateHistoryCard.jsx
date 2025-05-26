import React from 'react';
import { Link } from 'react-router-dom';
import './StateHistoryCard.css';

const StateHistoryCard = ({ history }) => {
  // Function to remove HTML tags from content
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="history-card">
      <div className="history-card-image">
        {history.image ? (
          <img 
            src={history.image.startsWith('http') ? history.image : `http://localhost:5000${history.image}`}
            alt={history.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
            }}
          />
        ) : (
          <div className="no-image-placeholder">No Image Available</div>
        )}
      </div>
      <div className="history-card-content">
        <h3 title={history.title}>{history.title}</h3>
        <p>{stripHtml(history.content)}</p>
        <Link 
          to={`/history/${history.slug}`} 
          className="read-more-btn"
        >
          Read More
        </Link>
      </div>
    </div>
  );
};

export default StateHistoryCard; 