import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import './Culture.css';

const Culture = () => {
  const [activeRegion, setActiveRegion] = useState('All');
  const [selectedCulture, setSelectedCulture] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const regions = [
    'All',
    'North India',
    'South India',
    'East India',
    'West India',
    'North East India',
    'Central India'
  ];

  useEffect(() => {
    const fetchCultures = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/india-culture');
        let arr = [];
        if (Array.isArray(response.data)) arr = response.data;
        else if (Array.isArray(response.data.data)) arr = response.data.data;
        setCultures(arr);
      } catch (err) {
        setError('Failed to fetch cultures');
        setCultures([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCultures();
  }, []);

  const filterCultures = () => {
    let filtered = cultures;
    
    // Filter by region
    if (activeRegion !== 'All') {
      filtered = filtered.filter(culture => culture.region === activeRegion);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(culture => 
        (culture.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (culture.state_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (culture.language || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const openCultureModal = (culture) => {
    setSelectedCulture(culture);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCultureModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  const getRegionStats = () => {
    const stats = {};
    regions.forEach(region => {
      if (region !== 'All') {
        stats[region] = cultures.filter(culture => culture.region === region).length;
      }
    });
    return stats;
  };

  return (
    <div className="culture-container-js">
      {/* New Header Section */}
      <div className="culture-header">
        <div className="header-content">
          <h1>India's Cultural Heritage</h1>
          <p>Discover the rich tapestry of tribal communities and cultural traditions that make India unique</p>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="culture-stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{cultures.length}</div>
            <div className="stat-label">Cultural Communities</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{regions.length - 1}</div>
            <div className="stat-label">Regions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100+</div>
            <div className="stat-label">Languages</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Years of Heritage</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search cultures, locations, or languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="region-filter">
          <h3>Filter by Region</h3>
          <div className="region-buttons">
            {regions.map(region => (
              <button 
                key={region} 
                className={activeRegion === region ? 'active' : ''}
                onClick={() => setActiveRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="culture-count">
        <h3>{filterCultures().length} Cultural Communities Found</h3>
        {(searchTerm || activeRegion !== 'All') && (
          <button 
            className="clear-filters"
            onClick={() => {
              setSearchTerm('');
              setActiveRegion('All');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading/Error */}
      {loading && <div className="loading">Loading cultures...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Cultures Grid */}
      <div className="cultures-grid">
        {filterCultures().map(culture => (
          <div 
            key={culture.id} 
            className="culture-card"
            onClick={() => openCultureModal(culture)}
          >
            <div className="culture-image">
              <img src={culture.featured_image ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/uploads/${culture.featured_image}` : '/placeholder.jpg'} alt={culture.title} />
              <div className="culture-region-tag">
                {culture.region}
              </div>
            </div>
            <div className="culture-card-content">
              <h3>{culture.title}</h3>
              <p className="culture-location"><i className="location-icon">📍</i> {culture.state_name}</p>
              <div className="culture-highlights">
                <div className="highlight">
                  <span className="highlight-title">Population</span>
                  <span className="highlight-value">{culture.population || '-'}</span>
                </div>
                <div className="highlight">
                  <span className="highlight-title">Language</span>
                  <span className="highlight-value">{culture.language || '-'}</span>
                </div>
              </div>
              <p className="culture-description">{(culture.description || '').replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
              <button className="explore-culture-btn">Explore Culture</button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filterCultures().length === 0 && !loading && (
        <div className="no-results">
          <h3>No cultures found</h3>
          <p>Try adjusting your search terms or region filter</p>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedCulture && (
        <div className="culture-modal" onClick={closeCultureModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeCultureModal}>&times;</button>
            <div className="modal-header">
              <img src={selectedCulture.featured_image ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/uploads/${selectedCulture.featured_image}` : 'https://via.placeholder.com/400x250?text=No+Image'} alt={selectedCulture.title || 'Culture'} />
              <div className="culture-title">
                <h2>{selectedCulture.title || 'No Title'}</h2>
                <p className="culture-region"><span>{selectedCulture.region || '-'}</span></p>
                <p className="culture-location">{selectedCulture.state_name || '-'}</p>
              </div>
            </div>
            <div className="culture-stats">
              <div className="stat">
                <div className="stat-title">Population</div>
                <div className="stat-value">{selectedCulture.population || '-'}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Language</div>
                <div className="stat-value">{selectedCulture.language || '-'}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Region</div>
                <div className="stat-value">{selectedCulture.region || '-'}</div>
              </div>
            </div>
            <div className="culture-overview">
              <h3>About {selectedCulture.title || 'this'} Culture</h3>
              <div dangerouslySetInnerHTML={{ __html: selectedCulture.description || 'No description available.' }} />
            </div>
            <div className="culture-details">
              <div className="detail-section">
                <h4>Traditions</h4>
                <ul>
                  {(selectedCulture.traditions || []).length > 0 ? (
                    (selectedCulture.traditions || []).map((tradition, index) => (
                    <li key={index}>{tradition}</li>
                    ))
                  ) : (
                    <li>No traditions info.</li>
                  )}
                </ul>
              </div>
              <div className="detail-section">
                <h4>Festivals</h4>
                <ul>
                  {(selectedCulture.festivals || []).length > 0 ? (
                    (selectedCulture.festivals || []).map((festival, index) => (
                    <li key={index}>{festival}</li>
                    ))
                  ) : (
                    <li>No festivals info.</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="culture-lifestyle">
              <div className="lifestyle-section">
                <h4>Traditional Dress</h4>
                <p>{selectedCulture.dress || 'No dress info.'}</p>
              </div>
              <div className="lifestyle-section">
                <h4>Cuisine</h4>
                <p>{selectedCulture.cuisine || 'No cuisine info.'}</p>
              </div>
            </div>
            {Array.isArray(selectedCulture.famousPeople) && selectedCulture.famousPeople.length > 0 && (
              <div className="notable-people">
                <h4>Notable Personalities</h4>
                <ul>
                  {selectedCulture.famousPeople.map((person, index) => (
                    <li key={index}>{person}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="culture-preservation">
              <h4>Cultural Preservation</h4>
              <p>The preservation of {selectedCulture.title || 'this'} culture faces challenges in the modern world. Efforts are being made by various organizations and the government to document, protect, and promote their unique traditions.</p>
            </div>
          </div>
        </div>
      )}

      {/* Cultural Preservation Section */}
      <div className="culture-preservation-section">
        <h2>Preserving India's Cultural Heritage</h2>
        <p>India's cultural diversity is a treasure that needs protection and preservation. Learn about initiatives to safeguard indigenous knowledge and traditions.</p>
        <div className="preservation-cards">
          <div className="preservation-card">
            <div className="preservation-icon">📚</div>
            <h3>Documentation</h3>
            <p>Efforts to record languages, traditions, art forms, and cultural practices</p>
          </div>
          <div className="preservation-card">
            <div className="preservation-icon">🏫</div>
            <h3>Education</h3>
            <p>Programs to teach traditional skills to younger generations</p>
          </div>
          <div className="preservation-card">
            <div className="preservation-icon">🏆</div>
            <h3>Recognition</h3>
            <p>Formal acknowledgment of cultural practices through UNESCO and government programs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Culture; 