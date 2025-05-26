import React from 'react';
import './Tags.css';

const Tags = ({ articles, onCategorySelect, selectedCategory }) => {
  // Get unique categories from all articles
  const categories = ['All', ...new Set(articles.map(article => article.category))];
  
  return (
    <div className="tags-container">
      <h3>Filter by Category</h3>
      <div className="tags-list">
        {categories.map((category, index) => (
          <button 
            key={index} 
            className={`tag ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategorySelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tags;
