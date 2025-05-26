import React, { useEffect, useState, useRef } from 'react';
import './VillageDashboard.css';
import { FaSearch, FaUsers, FaHome, FaTree, FaMountain, FaBook, FaClock, FaRupeeSign, FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const VillageDashboard = () => {
  const [villageData, setVillageData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonalVillages, setSeasonalVillages] = useState([]);
  const [cultureVillages, setCultureVillages] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingSeasonal, setLoadingSeasonal] = useState(true);
  const [loadingCulture, setLoadingCulture] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const packagesSliderRef = useRef(null);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(true);

  // Dummy data for seasonal and cultural sections
  const dummySeasonalVillages = [
    {
      id: 1,
      name: "Malana",
      state: "Himachal Pradesh",
      season: "Summer",
      seasonalDescription: "Experience the magical beauty of Malana during summer with its lush green valleys and pleasant weather.",
      image: "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3"
    },
    {
      id: 2,
      name: "Khajjiar",
      state: "Himachal Pradesh",
      season: "Winter",
      seasonalDescription: "Witness the winter wonderland of Khajjiar with snow-covered meadows and frozen lakes.",
      image: "https://images.unsplash.com/photo-1585409677983-0f6c41f9a05b?ixlib=rb-4.0.3"
    },
    {
      id: 3,
      name: "Munnar",
      state: "Kerala",
      season: "Monsoon",
      seasonalDescription: "Experience the magical monsoon in Munnar with misty tea gardens and gushing waterfalls.",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3"
    }
  ];

  const dummyCultureVillages = [
    {
      id: 1,
      name: "Majuli",
      state: "Assam",
      cultureType: "Tribal Culture",
      cultureDescription: "World's largest river island known for its unique tribal culture and traditional mask-making art.",
      image: "https://images.unsplash.com/photo-1585409677983-0f6c41f9a05b?ixlib=rb-4.0.3"
    },
    {
      id: 2,
      name: "Chettinad",
      state: "Tamil Nadu",
      cultureType: "Heritage",
      cultureDescription: "Famous for its unique architecture, traditional cuisine, and rich cultural heritage.",
      image: "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3"
    },
    {
      id: 3,
      name: "Ziro",
      state: "Arunachal Pradesh",
      cultureType: "Tribal Heritage",
      cultureDescription: "Home to the Apatani tribe, known for their unique culture and sustainable farming practices.",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3"
    }
  ];

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

  useEffect(() => {
    setSeasonalVillages(dummySeasonalVillages);
    setCultureVillages(dummyCultureVillages);
    setLoadingSeasonal(false);
    setLoadingCulture(false);

    // Fetch travel packages
    setLoadingPackages(true);
    fetch('http://localhost:5000/api/packages')
      .then(res => res.json())
      .then(data => {
        setPackages(data || []);
        setLoadingPackages(false);
      })
      .catch(err => {
        console.error('Error fetching packages:', err);
        setPackages([]);
        setLoadingPackages(false);
      });

    // Latest India data (2023 estimates)
    const villageData = {
      stats: {
        totalVillages: 662000,
        totalStates: 28,
        totalUTs: 8,
        totalStatesAndUTs: 36,
        totalDistricts: 766,
        totalPopulation: "1.43B",
        ruralPopulation: "930M",
        literacyRate: "77.7%",
        ruralLiteracy: "73.5%",
        avgHouseholdSize: 4.7,
        totalHouseholds: "250M"
      },
      featuredVillages: [
        {
          name: "Malana",
          state: "Himachal Pradesh",
          image: "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3",
          description: "Ancient village known for its unique culture and traditions"
        },
        {
          name: "Khajjiar",
          state: "Himachal Pradesh",
          image: "https://images.unsplash.com/photo-1585409677983-0f6c41f9a05b?ixlib=rb-4.0.3",
          description: "Mini Switzerland of India"
        },
        {
          name: "Munnar",
          state: "Kerala",
          image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3",
          description: "Tea Gardens and Natural Beauty"
        }
      ]
    };
    setVillageData(villageData);

    const slider = packagesSliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handlePackagesScroll);
      handlePackagesScroll();
    }

    return () => {
      if (slider) {
        slider.removeEventListener('scroll', handlePackagesScroll);
      }
    };
  }, []);

  return (
    <div className="village-dashboard">
      {/* Hero Section with Search */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover India's Beautiful Villages</h1>
          <p>Explore the rich culture, traditions, and natural beauty of Indian villages</p>
          <div className="search-container">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search villages, states, or districts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="search-button">Search</button>
          </div>
        </div>
      </section>

      {/* Updated Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <FaHome className="stat-icon" />
            <h3>{villageData?.stats?.totalVillages.toLocaleString()}</h3>
            <p>Total Villages</p>
          </div>
          <div className="stat-card">
            <FaHome className="stat-icon" />
            <h3>{villageData?.stats?.totalStatesAndUTs}</h3>
            <p>States & UTs</p>
          </div>
          <div className="stat-card">
            <FaTree className="stat-icon" />
            <h3>{villageData?.stats?.totalDistricts}</h3>
            <p>Districts</p>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <h3>{villageData?.stats?.totalPopulation}</h3>
            <p>Total Population</p>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <h3>{villageData?.stats?.ruralPopulation}</h3>
            <p>Rural Population</p>
          </div>
          <div className="stat-card">
            <FaBook className="stat-icon" />
            <h3>{villageData?.stats?.literacyRate}</h3>
            <p>Literacy Rate</p>
          </div>
          <div className="stat-card">
            <FaBook className="stat-icon" />
            <h3>{villageData?.stats?.ruralLiteracy}</h3>
            <p>Rural Literacy</p>
          </div>
          <div className="stat-card">
            <FaHome className="stat-icon" />
            <h3>{villageData?.stats?.totalHouseholds}</h3>
            <p>Rural Households</p>
          </div>
        </div>
      </section>

      {/* Featured Villages Section */}
      <section className="featured-villages-section">
        <h2>Featured Villages</h2>
        <div className="featured-villages-grid">
          {villageData?.featuredVillages?.map((village, index) => (
            <Link to={`/village/${village.id}`} key={index} className="village-card">
              <div className="village-image">
                <img src={village.image} alt={village.name} />
              </div>
              <div className="village-info">
                <h3>{village.name}</h3>
                <p className="village-state">{village.state}</p>
                <p className="village-description">{village.description}</p>
                <button className="explore-button">Explore Village</button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Seasonal Highlights Section */}
      <section className="seasonal-highlights-section">
        <h2>Seasonal Highlights</h2>
        <div className="seasonal-highlights-grid">
          {loadingSeasonal ? (
            <div className="loading-state">Loading seasonal highlights...</div>
          ) : seasonalVillages && seasonalVillages.length > 0 ? (
            seasonalVillages.map((village, index) => (
              <Link to={`/village/${village.id}`} key={index} className="seasonal-card">
                <div className="seasonal-image">
                  <img 
                    src={village.image}
                    alt={village.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <div className="seasonal-content">
                  <h3>{village.name}</h3>
                  <p className="village-name">{village.state}</p>
                  <span className="season">{village.season}</span>
                  <p>{village.seasonalDescription}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-data">No seasonal highlights available.</div>
          )}
        </div>
      </section>

      {/* Local Culture & Heritage Section */}
      <section className="culture-heritage-section">
        <h2>Local Culture & Heritage</h2>
        <div className="culture-grid">
          {loadingCulture ? (
            <div className="loading-state">Loading cultural highlights...</div>
          ) : cultureVillages && cultureVillages.length > 0 ? (
            cultureVillages.map((village, index) => (
              <Link to={`/village/${village.id}`} key={index} className="culture-card">
                <div className="culture-image">
                  <img 
                    src={village.image}
                    alt={village.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                </div>
                <div className="culture-content">
                  <h3>{village.name}</h3>
                  <p className="village-name">{village.state}</p>
                  <span className="culture-type">{village.cultureType}</span>
                  <p>{village.cultureDescription}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-data">No cultural highlights available.</div>
          )}
        </div>
      </section>

      {/* Travel Packages Section */}
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

      {/* Filters Section */}
      <section className="filters-section">
        <h2>Filter Villages</h2>
        <div className="filters-container">
          <div className="filter-group">
            <label>State</label>
            <select>
              <option value="">Select State</option>
              {villageData?.states?.map((state, index) => (
                <option key={index} value={state.name}>{state.name}</option>
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