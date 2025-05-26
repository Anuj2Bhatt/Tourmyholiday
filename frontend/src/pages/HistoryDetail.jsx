import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Articles.css';

const HistoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentHistories, setRecentHistories] = useState([]);

  // Debug logs
  console.log('HistoryDetail component mounted');
  console.log('URL params:', useParams());
  console.log('Current slug:', slug);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/default-article.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    try {
      const cleanPath = imagePath.replace(/\\/g, '/').trim();
      return cleanPath.startsWith('uploads/') 
        ? `http://localhost:5000/${cleanPath}`
        : `http://localhost:5000/uploads/${cleanPath}`;
    } catch (error) {
      console.error('Error processing image path:', error);
      return '/images/default-article.jpg';
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log('Fetching history detail for slug:', slug);
        const response = await axios.get(`http://localhost:5000/api/territory-history/slug/${slug}`);
        console.log('History detail response:', response.data);
        
        if (!response.data.success) {
          throw new Error('No data received from server');
        }
        
        setHistory(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history detail:', err);
        setError('Error loading history details');
        setLoading(false);
      }
    };

    const fetchRecentHistories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/territory-history?limit=3&sort=desc');
        if (response.data.success) {
          setRecentHistories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching recent histories:', err);
        setRecentHistories([]);
      }
    };

    if (slug) {
      fetchHistory();
      fetchRecentHistories();
    } else {
      setLoading(false);
    }
  }, [slug]);

  // Render state debug
  console.log('Component state:', { loading, error, history });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/history')} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="error-container">
        <div className="error">History not found</div>
        <button onClick={() => navigate('/history')} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="history-detail-main">
      <div className="article-main-layout">
        <div className="article-left-section">
          <article className="article-content">
            <header className="article-header">
              <button className="back-button" onClick={() => navigate('/history')}>
                ← Go Back
              </button>
              <h1 className="history-title-main">{history.title}</h1>
              <div className="article-meta">
                <span className="author">Author: {history.author || 'Admin'}</span>
                {history.created_at && !isNaN(new Date(history.created_at).getTime()) && (
                  <span className="date">
                    {new Date(history.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </header>

            {history.image && (
              <div className="article-featured-image-full">
                <img 
                  src={getImageUrl(history.image)} 
                  alt={history.title}
                  className="history-detail-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-article.jpg';
                  }}
                />
              </div>
            )}

            <div 
              className="article-body history-detail-body"
              dangerouslySetInnerHTML={{ __html: history.content }}
            />
          </article>
        </div>

        <aside className="article-right-sidebar">
          <div className="sidebar-section">
            <h3>Recent History</h3>
            <ul className="sidebar-list">
              {recentHistories.length === 0 && <li>No recent history</li>}
              {recentHistories.map(item => (
                <li key={item.id}>
                  <Link className="recent-post-link" to={`/history/${item.slug}`}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {history.meta_keywords && (
            <div className="sidebar-section">
              <h3>Tags</h3>
              <div className="article-tags">
                {history.meta_keywords.split(',').map((tag, index) => (
                  <span key={index} className="tag">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default HistoryDetail; 