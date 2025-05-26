import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './States.css';

const States = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedStates, setLikedStates] = useState(() => {
    const saved = localStorage.getItem('likedStates');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    localStorage.setItem('likedStates', JSON.stringify(likedStates));
  }, [likedStates]);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/states');
      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }
      let data = await response.json();
      data = data
        .map(state => ({
          ...state,
          metaTitle: state.meta_title,
          metaDescription: state.meta_description,
          metaKeywords: state.meta_keywords,
        }))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setStates(data);
    } catch (err) {
      console.error('Error fetching states:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (stateId, e) => {
    e.preventDefault();
    setLikedStates(prev => ({
      ...prev,
      [stateId]: !prev[stateId]
    }));
  };

  if (loading) {
    return (
      <div className="states-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading states...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="states-section">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={fetchStates} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <section className="states-section">
      <div className="section-header">
        <h2>Explore Indian States</h2>
        <p>Discover the diverse beauty and culture of India's states</p>
      </div>
      
      <div className="states-grid">
        {states.map((state) => (
          <div key={state.id} className="states-page-card">
            <div className="states-page-image">
              <img 
                src={state.image?.startsWith('http') ? state.image : `http://localhost:5000${state.image}`}
                alt={state.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              <button 
                className={`states-page-like-button ${likedStates[state.id] ? 'liked' : ''}`}
                onClick={(e) => handleLike(state.id, e)}
                aria-label={likedStates[state.id] ? 'Unlike state' : 'Like state'}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>
            
            <div className="states-page-content">
              <div className="states-page-header">
                <h3>{state.name}</h3>
                <span className="states-page-emoji">{state.emoji}</span>
              </div>
              
              <div className="states-page-info">
                <p className="states-page-capital">Capital: {state.capital}</p>
                <p className="states-page-description">
                  {state.description}
                </p>
              </div>

              <div className="states-page-activities">
                <h4>Popular Activities:</h4>
                <div className="states-page-activities-list">
                  {(state.activities || '').split(',').slice(0, 3).map((activity, index) => (
                    <span key={index} className="states-page-activity-tag">{activity.trim()}</span>
                  ))}
                </div>
              </div>

              <Link to={`/${state.name.toLowerCase().replace(/\s+/g, '-')}`} className="states-page-read-more">
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default States; 