import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Articles.css';

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

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

  const fetchArticle = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/articles/slug/${slug}`);
      setArticle(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to fetch article');
      setLoading(false);
    }
  }, [slug]);

  // Fetch categories
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // Fetch 3 recent posts
  useEffect(() => {
    axios.get('http://localhost:5000/api/articles?limit=3&sort=desc')
      .then(res => setRecentPosts(res.data))
      .catch(() => setRecentPosts([]));
  }, []);

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

      <aside className="article-right-sidebar">
        <div className="sidebar-section">
          <h3>Search Articles</h3>
          <input 
            className="sidebar-search" 
            type="text" 
            placeholder="Search articles..." 
          />
        </div>

        {article.meta_keywords && (
          <div className="sidebar-section">
            <h3>Tags</h3>
            <div className="article-tags">
              {article.meta_keywords.split(',').map((tag, index) => (
                <span key={index} className="tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-section">
          <h3>Recent Posts</h3>
          <ul className="sidebar-list">
            {recentPosts.length === 0 && <li>No recent posts</li>}
            {recentPosts.map(post => (
              <li key={post.id}>
                <Link className="recent-post-link" to={`/articles/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Categories</h3>
          <ul className="sidebar-list">
            {categories.length === 0 && <li>No categories</li>}
            {categories.map(cat => (
              <li key={cat.id}>{cat.name}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default ArticleDetail; 