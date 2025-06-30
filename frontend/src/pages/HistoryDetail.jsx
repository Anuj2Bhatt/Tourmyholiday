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
  const [randomHistories, setRandomHistories] = useState([]);
  const [failedImages, setFailedImages] = useState(new Set());

  const getImageUrl = (imagePath) => {
    
    // If no image path, return placeholder
    if (!imagePath) {
      return 'http://localhost:5000/uploads/default-article.jpg';
    }

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    try {
      // Clean up the path and ensure it has the correct format
      const cleanPath = imagePath.replace(/\\/g, '/').trim();
      
      // Remove leading slash if present
      const pathWithoutLeadingSlash = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
      
      // If path already includes 'uploads/', use it as is
      if (pathWithoutLeadingSlash.startsWith('uploads/')) {
        return `http://localhost:5000/${pathWithoutLeadingSlash}`;
      }
      
      // If it's just a filename, determine if it's territory or state history
      if (pathWithoutLeadingSlash.startsWith('territory-history-')) {
        return `http://localhost:5000/uploads/territory-history/${pathWithoutLeadingSlash}`;
      }
      
      // Otherwise assume it's a state history image
      return `http://localhost:5000/uploads/${pathWithoutLeadingSlash}`;
    } catch (error) {
      return 'http://localhost:5000/uploads/default-article.jpg';
    }
  };

  const handleImageError = (e, imagePath) => {
    // If we've already tried to load this image, stop
    if (failedImages.has(imagePath)) {
      e.target.style.display = 'none';
      return;
    }

    // Add to failed images set
    setFailedImages(prev => new Set([...prev, imagePath]));
    
    // Try to load default image only once
    e.target.onerror = null;
    e.target.src = 'http://localhost:5000/uploads/default-article.jpg';
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/territory-history/slug/${slug}`);
        
        if (!response.data.success) {
          throw new Error('No data received from server');
        }
        
        setHistory(response.data.data);
        setLoading(false);
      } catch (err) {
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
        setRecentHistories([]);
      }
    };

    const fetchRandomHistories = async () => {
      try {
        // Only fetch territory histories by adding territory_id filter
        const response = await axios.get('http://localhost:5000/api/territory-history', {
          params: {
            limit: 3,
            sort: 'random',
            type: 'territory' // Add this to filter only territory histories
          }
        });
        if (response.data.success) {
          setRandomHistories(response.data.data);
        }
      } catch (err) {
        setRandomHistories([]);
      }
    };

    if (slug) {
      fetchHistory();
      fetchRecentHistories();
      fetchRandomHistories();
    } else {
      setLoading(false);
    }
  }, [slug]);

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
          <article className="history-content">
            <header className="article-header">
              <button className="back-button" onClick={() => navigate('/')}>
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
                  onError={(e) => handleImageError(e, history.image)}
                />
              </div>
            )}

            <div 
              className="article-body history-detail-body"
              dangerouslySetInnerHTML={{ __html: history.content }}
            />
          </article>
        </div>

        <aside className="history-detail-sidebar" style={{
          width: '400px',
          padding: '25px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          height: 'fit-content',
          position: 'sticky',
          top: '20px',
          maxHeight: 'calc(100vh - 40px)', // Viewport height minus top and bottom margins
          overflowY: 'auto', // Enable scrolling within sidebar
          alignSelf: 'flex-start', // Align to top of container
          scrollbarWidth: 'thin', // For Firefox
          scrollbarColor: '#888 #f1f1f1', // For Firefox
          '&::-webkit-scrollbar': { // For Chrome/Safari
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555'
          }
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '2px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 1,
            paddingTop: '5px'
          }}>
            More Stories
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px'
          }}>
            {randomHistories.map(item => {    
              return (
                <Link 
                  key={item.id} 
                  to={`/history/${item.slug}`} 
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    border: '1px solid #eee'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    position: 'relative'
                  }}>
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => handleImageError(e, item.image)}
                    />
                    {failedImages.has(item.image) && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        fontSize: '14px'
                      }}>
                        Image not available
                      </div>
                    )}
                  </div>
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#fff'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      margin: 0,
                      lineHeight: 1.4,
                      color: '#333',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      {item.title}
                    </h3>
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ fontSize: '16px' }}>📅</span>
                        {item.created_at && new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HistoryDetail; 