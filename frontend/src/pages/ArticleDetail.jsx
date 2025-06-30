import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ArticleView.css';

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [randomArticles, setRandomArticles] = useState([]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/default-article.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    try {
      const cleanPath = imagePath.replace(/\\/g, '/').trim();
      return cleanPath.startsWith('uploads/') 
        ? `http://localhost:5000/${cleanPath}`
        : `http://localhost:5000/uploads/${cleanPath}`;
    } catch (error) {
      return '/images/default-article.jpg';
    }
  };

  const fetchArticle = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/articles/slug/${slug}`);
      setArticle(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch article');
      setLoading(false);
    }
  }, [slug]);

  // Fetch random articles
  useEffect(() => {
    const fetchRandomArticles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/articles');
          // Filter out current article and get random 4 articles
        const filteredArticles = response.data
          .filter(article => article.slug !== slug && article.status === 'published')
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
        setRandomArticles(filteredArticles);
      } catch (err) {
        setRandomArticles([]);
      }
    };

    fetchRandomArticles();
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  if (loading) return <div className="loading">Loading article...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!article) return <div className="error">Article not found</div>;

  return (
    <div className="article-main-layout">
      <div className="article-left-section">
        <article className="article-content">
          <header className="article-header">
            <button className="back-button" onClick={() => navigate('/articles')}>
              ← Back to Articles
            </button>
            <h1>{article.title}</h1>
            <div className="article-meta">
              <span className="author">By {article.author || 'Admin'}</span>
              <span className="date">
                {new Date(article.created_at).toLocaleDateString()}
              </span>
              {article.featured && (
                <span className="featured-badge">Featured</span>
              )}
            </div>
          </header>

          {article.featured_image && (
            <div className="article-featured-image">
              <img 
                src={getImageUrl(article.featured_image)} 
                alt={article.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-article.jpg';
                }}
              />
            </div>
          )}

          <div 
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>

      <aside className="article-suggestions-section">
        <div className="suggestions-section">
          <h3>More Articles</h3>
          <div className="random-articles-grid">
            {randomArticles.map(randomArticle => (
              <Link 
                key={randomArticle.id} 
                to={`/articles/${randomArticle.slug}`}
                className="random-article-card"
              >
                <div className="random-article-image">
                  <img 
                    src={getImageUrl(randomArticle.featured_image)} 
                    alt={randomArticle.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-article.jpg';
                    }}
                  />
                </div>
                <h4 className="random-article-title">{randomArticle.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ArticleDetail; 