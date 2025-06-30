import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './History.css';

const History = () => {
  const [historyCards, setHistoryCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistories = async () => {
      try {   
        const response = await axios.get('http://localhost:5000/api/state-history');
        if (!response.data) {
          throw new Error('No data received from server');
        }
        setHistoryCards(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Error loading history data');
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

    if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="history-container">
      <h2 className="history-title">Uttarakhand History</h2>
      <div className="history-content">
        <div className="cards-section">
          <div className="history-grid">
            {historyCards.map((card) => (
              <div 
                key={card.id} 
                className="history-card modern-history-card"
              >
                <div className="history-image">
                  <img 
                    src={card.image || '/images/default-article.jpg'} 
                    alt={card.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-article.jpg';
                    }}
                  />
                </div>
                <div className="history-card-content">
                  <h3 className="history-card-title">{card.title}</h3>
                  <p className="history-card-description">
                    {card.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  <Link 
                    to={`/history/${card.slug}`}
                    className="read-more-btn modern-read-more-btn"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History; 