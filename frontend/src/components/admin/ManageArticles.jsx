import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageArticles.css';
import ArticleForm from '../../pages/admin/ArticleForm';

const ManageArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/articles`);
      setArticles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch articles');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        setLoading(true);
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/articles/${id}`);
        fetchArticles();
      } catch (err) {
        setError('Failed to delete article');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        // Debug log to see what's being sent
        for (let pair of formData.entries()) {
            const value = pair[1];
            const displayValue = value instanceof File ? `File: ${value.name} (${value.type})` : value;
            console.log(`${pair[0]}: ${displayValue}`);
            }

        const config = {
            headers: {
                'Accept': 'application/json'
            }
        };

        let response;
        const url = editingArticle 
            ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/articles/${editingArticle.id}`
            : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/articles`;

        const method = editingArticle ? 'put' : 'post';
        
        console.log(`Making ${method.toUpperCase()} request to:`, url);
        
        response = await axios[method](url, formData, config);
        
        if (response.data) {
            // Success
            await fetchArticles(); // Refresh the articles list
            setShowForm(false);
            setEditingArticle(null);
            // Optional: Show success message
            alert(editingArticle ? 'Article updated successfully!' : 'Article created successfully!');
        }
    } catch (err) {
        let errorMessage = 'Failed to save article. ';
        
        if (err.response) {
            // Server responded with an error
            if (err.response.data?.message) {
                errorMessage += err.response.data.message;
            } else if (err.response.data?.error) {
                errorMessage += err.response.data.error;
            } else {
                errorMessage += `Server error (${err.response.status})`;
            }
        } else if (err.request) {
            // Request was made but no response
            errorMessage += 'No response from server. Please check your connection.';
        } else {
            // Other error
            errorMessage += err.message;
        }

        setError(errorMessage);
        alert(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const getImageUrl = (imagePath) => {
    // If no image path, return placeholder
    if (!imagePath) {
      return `${process.env.PUBLIC_URL}/images/no-image.png`;
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
        return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${cleanPath}`;
      }
      
      // Otherwise, add 'uploads/' prefix
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${cleanPath}`;
    } catch (error) {
      return `${process.env.PUBLIC_URL}/images/no-image.png`;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="manage-articles-container">
      {showForm ? (
        <ArticleForm
          article={editingArticle}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingArticle(null);
          }}
          loading={loading}
        />
      ) : (
        <>
          <div className="manage-articles-header">
            <h2>Manage Blogs</h2>
            <button 
              className="add-new-btn"
              onClick={() => setShowForm(true)}
              disabled={loading}
            >
              + Add New
            </button>
          </div>

          <div className="articles-table">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th style={{ width: '200px' }}>Blog Name</th>
                  <th>Author</th>
                  <th style={{ width: '150px' }}>Featured Image</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, index) => (
                  <tr key={article.id}>
                    <td>{index + 1}.</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.title}
                    </td>
                    <td>{article.author}</td>
                    <td>
                      <div style={{ width: '100px', height: '60px', position: 'relative', overflow: 'hidden' }}>
                        <img 
                          src={getImageUrl(article.featured_image)}
                          alt={article.title}
                          className="article-thumbnail"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            backgroundColor: '#f5f5f5'
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/no-image.png';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${article.status?.toLowerCase() || 'draft'}`}>
                        {article.status || 'Draft'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`featured-badge-article ${article.featured ? 'yes' : 'no'}`}
                        >
                        {article.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="article-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(article)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(article.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageArticles; 