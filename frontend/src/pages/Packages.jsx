import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Packages.css';

const Packages = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    'All',
    'Pilgrimage',
    'Adventure',
    'Snow Trekking',
    'Trek',
    'culture'
  ];

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/packages');
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const data = await response.json();
      console.log('Fetched packages data:', data);
      setPackages(data);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = activeCategory === 'All' 
    ? packages 
    : packages.filter(pkg => pkg.category === activeCategory);

  console.log('Filtered packages:', filteredPackages);

  const handleCardClick = (slug) => {
    navigate(`/packages/${slug}`);
  };

  if (loading) return <div className="loading">Loading packages...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="packages-container">
      <div className="packages-header">
        <h1>Our Packages</h1>
        <p>Choose from our carefully curated tour packages</p>
      </div>

      <div className="categories-section">
        <div className="categories-container">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="packages-grid">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="package-card" onClick={() => handleCardClick(pkg.slug)}>
            <div className="package-image">
              <img 
                src={
                  pkg.featured_image
                    ? pkg.featured_image
                    : pkg.image1
                      ? pkg.image1
                      : '/placeholder-image.jpg'
                }
                alt={pkg.package_name}
                onError={(e) => {
                  console.error('Image failed to load:', pkg.featured_image || pkg.image1);
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              <div className="category-tag">{pkg.category}</div>
              <div className="price-tag">₹{pkg.price}</div>
            </div>
            <div className="package-content">
              <h3>{pkg.package_name}</h3>
              <p className="package-description">{stripHtml(pkg.description)}</p>
              <div className="package-details">
                <p>{pkg.duration}</p>
                <p>{pkg.location}</p>
              </div>
              <button className="explore-btn">
                <span className="btn-text">Explore Package</span>
                <span className="btn-icon">🔍</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Packages;