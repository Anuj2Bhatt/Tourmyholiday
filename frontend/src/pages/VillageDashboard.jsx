import React, { useEffect, useState, useRef } from 'react';
import './VillageDashboard.css';
import { FaUsers, FaHome, FaTree, FaMountain, FaBook, FaClock, FaRupeeSign, FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const VillageDashboard = () => {
  const [allVillages, setAllVillages] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(true);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const packagesSliderRef = useRef(null);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(true);

  // API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Helper to get random villages
  const getRandomVillages = (count) => {
    if (!allVillages.length) return [];
    const shuffled = [...allVillages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Format image URL
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}/${imagePath}`;
  };

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        setLoadingVillages(true);
        const stateVillagesResponse = await axios.get(`${API_URL}/api/villages`);
        const stateVillages = stateVillagesResponse.data || [];
        const territoryVillagesResponse = await axios.get(`${API_URL}/api/territory-villages`);
        const territoryVillages = territoryVillagesResponse.data || [];
        const allVillagesData = [
          ...stateVillages.map(village => ({ ...village, type: 'state' })),
          ...territoryVillages.map(village => ({ ...village, type: 'territory' }))
        ];
        setAllVillages(allVillagesData);
        setLoadingVillages(false);
      } catch (error) {
        setAllVillages([]);
        setLoadingVillages(false);
      }
    };
    fetchVillages();
    setLoadingPackages(true);
    axios.get(`${API_URL}/api/packages`)
      .then(res => {
        setPackages(res.data || []);
        setLoadingPackages(false);
      })
      .catch(err => {
        setPackages([]);
        setLoadingPackages(false);
      });
  }, []);

  const scrollPackages = (direction) => {
    if (packagesSliderRef.current) {
      const scrollAmount = packagesSliderRef.current.offsetWidth;
      packagesSliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handlePackagesScroll = () => {
    if (packagesSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = packagesSliderRef.current;
      setShowLeftNav(scrollLeft > 0);
      setShowRightNav(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="village-dashboard">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover India's Beautiful Villages</h1>
          <p>Explore the rich culture, traditions, and natural beauty of Indian villages</p>
        </div>
      </section>

      {/* Featured Villages Section */}
      <section className="featured-villages-section">
        <h2>Featured Villages</h2>
        <div className="featured-villages-grid">
          {loadingVillages ? (
            <div className="loading-state">Loading villages...</div>
          ) : getRandomVillages(6).map((village, index) => (
            <Link to={`/village/${village.id}`} key={index} className="village-card">
              <div className="village-image">
                <img src={formatImageUrl(village.featured_image || village.preview_image)} alt={village.name} />
              </div>
              <div className="village-info">
                <h3>{village.name}</h3>
                <p className="village-state">{village.state_name || village.state || ''}</p>
                <p className="village-description">{village.description?.slice(0, 80) || ''}</p>
                <button className="explore-button">Explore Village</button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="seasonal-highlights-section">
        <h2>Seasonal Highlights</h2>
        <div className="seasonal-highlights-grid">
          {loadingVillages ? (
            <div className="loading-state">Loading villages...</div>
          ) : getRandomVillages(6).map((village, index) => (
            <Link to={`/village/${village.id}`} key={index} className="seasonal-card">
              <div className="seasonal-image">
                <img src={formatImageUrl(village.featured_image || village.preview_image)} alt={village.name} />
              </div>
              <div className="seasonal-content">
                <h3>{village.name}</h3>
                <p className="village-name">{village.state_name || village.state || ''}</p>
                <span className="season">{village.season || 'All Seasons'}</span>
                <p>{village.description?.slice(0, 80) || ''}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="culture-heritage-section">
        <h2>Local Culture & Heritage</h2>
        <div className="culture-grid">
          {loadingVillages ? (
            <div className="loading-state">Loading villages...</div>
          ) : getRandomVillages(6).map((village, index) => (
            <Link to={`/village/${village.id}`} key={index} className="culture-card">
              <div className="culture-image">
                <img src={formatImageUrl(village.featured_image || village.preview_image)} alt={village.name} />
              </div>
              <div className="culture-content">
                <h3>{village.name}</h3>
                <p className="village-name">{village.state_name || village.state || ''}</p>
                <span className="culture-type">{village.cultureType || 'Culture'}</span>
                <p>{village.description?.slice(0, 80) || ''}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="packages-section">
        <h2>Travel Packages</h2>
        <div className="packages-slider-container">
          {showLeftNav && (
            <button 
              className="slider-nav-button left" 
              onClick={() => scrollPackages('left')}
              aria-label="Previous packages"
            >
              <FaChevronLeft />
            </button>
          )}
          <div className="packages-slider" ref={packagesSliderRef}>
            {loadingPackages ? (
              <div className="loading-state">Loading travel packages...</div>
            ) : packages && packages.length > 0 ? (
              packages.map((pkg, index) => (
                <Link to={`/packages/${pkg.slug}`} key={pkg.id} className="package-card">
                  <div className="package-image">
                    <img 
                      src={pkg.featured_image || pkg.image2 || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
                      alt={pkg.package_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  <div className="package-content">
                    <h3>{pkg.package_name}</h3>
                    <div className="package-meta">
                      <div className="package-duration">
                        <FaClock />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="package-price">
                        <FaRupeeSign />
                        <span>{parseFloat(pkg.price).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="package-description">{pkg.description}</p>
                    <Link 
                      to={`/packages/${pkg.slug}`} 
                      className="book-package-button"
                    >
                      Book Now
                      <span className="button-arrow">→</span>
                    </Link>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-data">No travel packages available.</div>
            )}
          </div>
          {showRightNav && (
            <button 
              className="slider-nav-button right" 
              onClick={() => scrollPackages('right')}
              aria-label="Next packages"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </section>

      <section className="filters-section">
        <h2>Filter Villages</h2>
        <div className="filters-container">
          <div className="filter-group">
            <label>State</label>
            <select>
              <option value="">Select State</option>
              {allVillages.map((village, index) => (
                <option key={index} value={village.state}>{village.state}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Region</label>
            <select>
              <option value="">Select Region</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="central">Central</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type</label>
            <select>
              <option value="">Select Type</option>
              <option value="hill">Hill Station</option>
              <option value="coastal">Coastal</option>
              <option value="desert">Desert</option>
              <option value="forest">Forest</option>
            </select>
          </div>
          <button className="apply-filters">Apply Filters</button>
        </div>
      </section>
    </div>
  );
};

export default VillageDashboard; 