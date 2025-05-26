import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Articles.css';
import Tags from '../components/Tags';

const getCategoryEmoji = (category) => {
  switch (category) {
    case 'Travel Guide': return '🌍';
    case 'Adventure': return '🏔️';
    case 'Pilgrimage': return '🕌';
    case 'Culture': return '🎭';
    case 'Wildlife': return '🐾';
    case 'Food & Cuisine': return '🍜';
    case 'History': return '📜';
    case 'Nature & Landscapes': return '🌿';
    default: return '📌';
  }
};

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    // Filter articles when category changes
    if (selectedCategory === 'All') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article => article.category === selectedCategory);
      setFilteredArticles(filtered);
    }
  }, [selectedCategory, articles]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/articles');
      // Only show published articles
      const publishedArticles = response.data.filter(article => article.status === 'published');
      setArticles(publishedArticles);
      setFilteredArticles(publishedArticles);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch articles');
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    navigate(`/articles/${article.slug}`);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const getImageUrl = (imagePath) => {
    console.log('Image path received:', imagePath);
    
    // If no image path, return placeholder
    if (!imagePath) {
      console.log('No image path, returning placeholder');
      return '/images/default-article.jpg';
    }

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    try {
      // Clean up the path and ensure it has the correct format
      const cleanPath = imagePath.replace(/\\/g, '/').trim();
      
      // If path already includes 'uploads/', use it as is
      if (cleanPath.startsWith('uploads/')) {
        return `http://localhost:5000/${cleanPath}`;
      }
      
      // Otherwise, add 'uploads/' prefix
      return `http://localhost:5000/uploads/${cleanPath}`;
    } catch (error) {
      console.error('Error processing image path:', error);
      return '/images/default-article.jpg';
    }
  };

  if (loading) return <div className="loading">Loading articles...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="articles-page">
      <h1>Latest Articles</h1>
      
      {/* Tags component with category selection */}
      <Tags 
        articles={articles} 
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      <div className="articles-grid">
        {filteredArticles.map((article) => (
          <div 
            key={article.id} 
            className="article-card"
            onClick={() => handleArticleClick(article)}
          >
            <div className="article-image">
              <img 
                src={getImageUrl(article.featured_image)} 
                alt={article.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-article.jpg';
                }}
              />
              <span className="article-category">{article.category}</span>
            </div>
            <div className="article-content">
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <div className="article-meta-row">
                <span className="article-date">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
                <span className="article-category-emoji">
                  {getCategoryEmoji(article.category)}
                </span>
                <div className="article-tags">
                  {article.tags && article.tags.split(',').map((tag, index) => (
                    <span key={index} className="tag">{tag.trim()}</span>
                  ))}
                </div>
              </div>
              <button 
                className="read-more-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleArticleClick(article);
                }}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Articles; 