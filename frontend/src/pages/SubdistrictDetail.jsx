import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './SubdistrictDetail.css';
import TravelInfoCard from '../components/TravelInfoCard';

// Helper to strip HTML and truncate
const formatDescription = (description) => {
  if (!description) return '';
  const plainText = description.replace(/<[^>]+>/g, '');
  return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
};

const formatImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  // Remove 'uploads/' if it's at the start of the path
  const cleanPath = imagePath.replace(/^uploads\//, '');
  return `http://localhost:5000/uploads/${cleanPath}`;
};

const WeatherCard = ({ weatherData, loading }) => {
  // Time-of-day detection
  const now = new Date();
  const hour = now.getHours();
  let timeOfDay = 'day';
  if (hour >= 5 && hour < 8) timeOfDay = 'morning';
  else if (hour >= 8 && hour < 17) timeOfDay = 'day';
  else if (hour >= 17 && hour < 19) timeOfDay = 'evening';
  else if (hour >= 19 || hour < 5) timeOfDay = 'night';

  // SVGs for each time of day
  const svgIcons = {
    night: (
      <svg className="weather-svg-icon" viewBox="0 0 64 64">
        <circle cx="44" cy="24" r="16" fill="#f6e58d" opacity="0.7"/>
        <circle cx="48" cy="20" r="14" fill="#232946"/>
        {/* Stars */}
        <circle cx="20" cy="12" r="1.2" fill="#fff"/>
        <circle cx="30" cy="8" r="0.8" fill="#fff"/>
        <circle cx="18" cy="28" r="0.9" fill="#fff"/>
        <circle cx="54" cy="10" r="0.7" fill="#fff"/>
        <circle cx="40" cy="40" r="1" fill="#fff"/>
      </svg>
    ),
    morning: (
      <svg className="weather-svg-icon" viewBox="0 0 64 64">
        {/* Mountains */}
        <polygon points="0,64 20,40 40,64" fill="#a3cef1"/>
        <polygon points="24,64 36,48 56,64" fill="#5390d9"/>
        {/* Sun rising */}
        <circle cx="32" cy="44" r="10" fill="#ffd700"/>
      </svg>
    ),
    day: (
      <svg className="weather-svg-icon" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="14" fill="#ffd700"/>
        {/* Sun rays */}
        <g stroke="#ffd700" strokeWidth="2">
          <line x1="32" y1="4" x2="32" y2="18"/>
          <line x1="32" y1="46" x2="32" y2="60"/>
          <line x1="4" y1="32" x2="18" y2="32"/>
          <line x1="46" y1="32" x2="60" y2="32"/>
          <line x1="12" y1="12" x2="22" y2="22"/>
          <line x1="52" y1="12" x2="42" y2="22"/>
          <line x1="12" y1="52" x2="22" y2="42"/>
          <line x1="52" y1="52" x2="42" y2="42"/>
        </g>
      </svg>
    ),
    evening: (
      <svg className="weather-svg-icon" viewBox="0 0 64 64">
        {/* Mountains */}
        <polygon points="0,64 20,40 40,64" fill="#f7971e"/>
        <polygon points="24,64 36,48 56,64" fill="#ffd200"/>
        {/* Sun setting */}
        <circle cx="32" cy="54" r="10" fill="#ffb347"/>
      </svg>
    ),
    sunset: (
      <svg className="weather-svg-icon" viewBox="0 0 64 64">
        <rect x="0" y="40" width="64" height="24" fill="#fd746c"/>
        <circle cx="32" cy="48" r="12" fill="#ff9068"/>
      </svg>
    ),
  };

  if (loading) {
    return (
      <div className={`weather-card loading ${timeOfDay}`}>
        <div className="weather-loading">
          <i className="fas fa-spinner fa-spin"></i> Loading weather data...
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className={`weather-card ${timeOfDay}`}>
        <div className="weather-loading">
          Weather data not available
        </div>
      </div>
    );
  }

  // Weather theme for background color (seasonal)
  const getWeatherTheme = (code) => {
    if (code >= 2000 && code < 3000) return 'rainy';
    if (code >= 3000 && code < 4000) return 'snowy';
    if (code >= 4000 && code < 5000) return 'foggy';
    if (code >= 5000 && code < 6000) return 'cloudy';
    if (code >= 6000 && code < 7000) return 'stormy';
    if (code >= 7000 && code < 8000) return 'sunny';
    return 'sunny';
  };
  const theme = getWeatherTheme(weatherData.weatherCode);

  return (
    <div className={`weather-card ${timeOfDay} ${theme}`} style={{position:'relative'}}>
      <div className="weather-svg-bg">
        {/* Optionally, add animated SVG background here if needed */}
      </div>
      <div className="weather-card-content">
        <div className="weather-main">
          <div className="weather-svg-icon animate-float">
            {svgIcons[timeOfDay]}
          </div>
          <div className="weather-temp">
            {Math.round(weatherData.temperature)}°C
          </div>
        </div>
        <div className="weather-details">
          <div className="weather-detail-item">
            <div className="detail-icon">
              <i className="fas fa-tint"></i>
            </div>
            <div className="detail-value">
              {Math.round(weatherData.humidity)}%
            </div>
            <div className="detail-label">Humidity</div>
          </div>
          <div className="weather-detail-item">
            <div className="detail-icon">
              <i className="fas fa-wind"></i>
            </div>
            <div className="detail-value">
              {isNaN(weatherData.windSpeed) ? '--' : Math.round(weatherData.windSpeed)} km/h
            </div>
            <div className="detail-label">Wind</div>
          </div>
          <div className="weather-detail-item">
            <div className="detail-icon">
              <i className="fas fa-cloud-rain"></i>
            </div>
            <div className="detail-value">
              {Math.round(weatherData.precipitationProbability)}%
            </div>
            <div className="detail-label">Precipitation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubdistrictDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [subdistrict, setSubdistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [images, setImages] = useState([]);
  const [villages, setVillages] = useState([]);
  const [demographics, setDemographics] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [culture, setCulture] = useState(null);
  const [cultureLoading, setCultureLoading] = useState(true);
  const [cultureError, setCultureError] = useState(null);
  const [travelInfo, setTravelInfo] = useState([]);
  const [education, setEducation] = useState([]);
  const [healthcare, setHealthcare] = useState([]);
  const [weather, setWeather] = useState(null);
  const [showStoryView, setShowStoryView] = useState(false);
  const [storyImageIndex, setStoryImageIndex] = useState(0);

  // Fetch subdistrict data
  useEffect(() => {
    const fetchSubdistrict = async () => {
      try {
        setLoading(true);
        console.log('Fetching subdistrict details for slug:', slug);
        
        // Try regular subdistrict endpoint first
        let response;
        try {
          response = await axios.get(`http://localhost:5000/api/subdistricts/slug/${slug}`);
        } catch (err) {
          // If regular subdistrict not found, try territory subdistrict endpoint
          if (err.response?.status === 404) {
            console.log('Regular subdistrict not found, trying territory subdistrict...');
            response = await axios.get(`http://localhost:5000/api/territory-subdistricts/slug/${slug}`);
          } else {
            throw err;
          }
        }
        
        console.log('Subdistrict API response:', response.data);
        
        if (!response.data) {
          throw new Error('Subdistrict not found');
        }

        setSubdistrict(response.data);
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers
        });
        setError(err.message || 'Failed to load subdistrict details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubdistrict();
  }, [slug]);

  // Separate useEffect for fetching additional data
  useEffect(() => {
    if (!subdistrict?.id) return;

    const fetchAdditionalData = async () => {
      try {
        console.log('Fetching additional data for subdistrict:', subdistrict.id);
        await Promise.all([
          fetchImages(),
          fetchVillages(),
          fetchDemographics(),
          fetchAttractions(subdistrict),
          fetchCulture(),
          fetchTravelInfo(),
          fetchEducation(),
          fetchHealthcare(),
          fetchWeather()
        ]);
      } catch (err) {
        console.error('Error fetching additional data:', err);
      }
    };

    fetchAdditionalData();
  }, [subdistrict?.id]);

  // Fetch functions for each section
  const fetchImages = async () => {
    if (!subdistrict?.id) {
      console.log('No subdistrict ID available');
      return;
    }

    try {
      console.log('Fetching images for subdistrict:', {
        id: subdistrict.id,
        title: subdistrict.title,
        isTerritory: !!(subdistrict?.territory_id || subdistrict?.territory_district_id)
      });

      let response;
      if (subdistrict?.territory_id || subdistrict?.territory_district_id) {
        // For territory subdistricts
        console.log('Fetching territory subdistrict images...');
        response = await axios.get(`http://localhost:5000/api/territory-subdistrict-images/${subdistrict.id}`);
      } else {
        // For state subdistricts
        console.log('Fetching state subdistrict images...');
        response = await axios.get(`http://localhost:5000/api/subdistrict-images/${subdistrict.id}`);
      }

      console.log('Raw images API response:', response.data);
      
      // Process and validate image URLs
      const processedImages = response.data.map(img => {
        const imageUrl = img.image_path || img.image_url;
        console.log('Processing image:', {
          originalUrl: imageUrl,
          hasHttp: imageUrl?.startsWith('http'),
          hasUploads: imageUrl?.includes('uploads/')
        });
        
        let finalUrl = imageUrl;
        if (imageUrl && !imageUrl.startsWith('http')) {
          // Remove 'uploads/' if it's at the start of the path
          const cleanPath = imageUrl.replace(/^uploads\//, '');
          finalUrl = `http://localhost:5000/uploads/${cleanPath}`;
        }
        
        console.log('Final image URL:', finalUrl);
        return {
          ...img,
          image_url: finalUrl,
          caption: img.caption || img.alt_text || ''
        };
      });

      console.log('Processed images:', processedImages);
      setImages(processedImages);
      return processedImages;
    } catch (err) {
      console.error('Error fetching images:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        endpoint: err.config?.url
      });
      setImages([]);
      return null;
    }
  };

  const fetchVillages = async () => {
    try {
      console.log('Fetching villages for slug:', slug);
      const response = await axios.get(`http://localhost:5000/api/subdistrict-villages/${subdistrict.id}`);
      console.log('Villages API response:', response.data);
      setVillages(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching villages:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      return null;
    }
  };

  const fetchDemographics = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/subdistrict-demographics/${subdistrict.id}`);
      setDemographics(response.data);
    } catch (err) {
      console.error('Error fetching demographics:', err);
    }
  };

  const fetchAttractions = async (subdistrictObj) => {
    try {
      let response;
      if (subdistrictObj?.territory_id || subdistrictObj?.territory_district_id) {
        // Territory subdistrict
        response = await axios.get(`http://localhost:5000/api/territory-attractions/territory-subdistrict/${subdistrictObj.id}`);
      } else {
        // State subdistrict
        response = await axios.get(`http://localhost:5000/api/attractions/subdistrict/${subdistrictObj.id}`);
      }
      setAttractions(response.data);
    } catch (err) {
      console.error('Error fetching attractions:', err);
      setAttractions([]);
    }
  };

  const fetchCulture = async () => {
    if (!subdistrict?.id) {
      console.log('No subdistrict ID available');
      return;
    }

    try {
      setCultureLoading(true);
      setCultureError(null);
      console.log('Fetching culture for subdistrict ID:', subdistrict.id);
      
      let response;
      if (subdistrict.territory_id || subdistrict.territory_district_id) {
        console.log('Fetching territory culture...');
        response = await axios.get(`http://localhost:5000/api/territory-cultures/territory-subdistrict/${subdistrict.id}`);
      } else {
        console.log('Fetching state culture...');
        response = await axios.get(`http://localhost:5000/api/cultures/subdistrict/${subdistrict.id}`);
      }

      console.log('Culture API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setCulture(response.data);
      } else {
        console.error('Invalid culture data format:', response.data);
        setCulture([]);
      }
    } catch (err) {
      console.error('Error fetching culture:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setCultureError(err.message);
      setCulture([]);
    } finally {
      setCultureLoading(false);
    }
  };

  // Update useEffect to call fetchCulture when subdistrict changes
  useEffect(() => {
    if (subdistrict?.id) {
      fetchCulture();
    }
  }, [subdistrict?.id]);

  const fetchTravelInfo = async () => {
    if (!subdistrict?.id) {
      console.log('No subdistrict ID available');
      return;
    }

    try {
      console.log('Fetching travel info for subdistrict:', {
        id: subdistrict.id,
        title: subdistrict.title,
        isTerritory: !!(subdistrict?.territory_id || subdistrict?.territory_district_id)
      });

      let response;
      if (subdistrict.territory_id || subdistrict.territory_district_id) {
        // Territory subdistrict
        response = await axios.get(`http://localhost:5000/api/travel-info/territory/${subdistrict.id}`);
      } else {
        // State subdistrict
        response = await axios.get(`http://localhost:5000/api/travel-info/state/${subdistrict.id}`);
      }

      console.log('Travel info API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setTravelInfo(response.data);
      } else {
        console.error('Invalid travel info data format:', response.data);
        setTravelInfo([]);
      }
    } catch (err) {
      console.error('Error fetching travel info:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setTravelInfo([]);
    }
  };

  const fetchEducation = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/subdistrict-education/${subdistrict.id}`);
      if (response.data) {
        setEducation(response.data);
      }
    } catch (err) {
      console.error('Error fetching education:', err);
    }
  };

  const fetchHealthcare = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/subdistrict-healthcare/${subdistrict.id}`);
      if (response.data) {
        setHealthcare(response.data);
      }
    } catch (err) {
      console.error('Error fetching healthcare:', err);
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/weather/${subdistrict.id}`);
      setWeather(response.data.current);
    } catch (err) {
      setWeather(null);
      console.error('Error fetching weather:', err);
    }
  };

  // Story view handlers
  const openStoryView = (index) => {
    setStoryImageIndex(index);
    setShowStoryView(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeStoryView = () => {
    setShowStoryView(false);
    document.body.style.overflow = 'auto';
  };

  const handleStoryPrev = (e) => {
    e.stopPropagation();
    setStoryImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  };

  const handleStoryNext = (e) => {
    e.stopPropagation();
    setStoryImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
  };

  // Function to handle village click
  const handleVillageClick = (villageId) => {
    navigate(`/village/${villageId}`);
  };

  // Function to handle see all villages click
  const handleSeeAllVillages = () => {
    navigate(`/subdistrict/${slug}/villages`);
  };

  if (loading) return <div className="subdistrict-loading">Loading subdistrict details...</div>;
  if (error) return <div className="subdistrict-error">{error}</div>;
  if (!subdistrict) return <div className="subdistrict-error">Subdistrict not found</div>;

  return (
    <div className="subdistrict-detail">
      {/* Header with back button */}
      <div className="subdistrict-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{subdistrict.title}</h1>
      </div>

      {/* Image Gallery Section */}
      <section className="image-gallery-section">
        <div className="gallery-split-layout">
          {/* Left section - Main image */}
          <div className="gallery-main-image" onClick={() => images.length > 0 && openStoryView(0)}>
            {images.length > 0 ? (
              <img 
                src={images[0].image_url}
                alt={images[0].caption || subdistrict.title}
                onError={(e) => {
                  console.error('Main image failed to load:', images[0].image_url);
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : subdistrict.featured_image ? (
              <img 
                src={formatImageUrl(subdistrict.featured_image)}
                alt={subdistrict.title}
                onError={(e) => {
                  console.error('Featured image failed to load:', subdistrict.featured_image);
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="no-image-placeholder">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Right section - Grid of 4 images */}
          <div className="gallery-grid">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index} 
                className="gallery-grid-item"
                onClick={() => images.length > index + 1 && openStoryView(index + 1)}
              >
                {images.length > index + 1 ? (
                  <img 
                    src={images[index + 1].image_url}
                    alt={images[index + 1].caption || `${subdistrict.title} - Image ${index + 2}`}
                    onError={(e) => {
                      console.error('Grid image failed to load:', images[index + 1].image_url);
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>No Image Available</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Story View Modal */}
        {showStoryView && images.length > 0 && (
          <div className="story-view" onClick={closeStoryView}>
            <button className="story-close" onClick={closeStoryView}>×</button>
            <div className="story-content" onClick={e => e.stopPropagation()}>
              <button className="story-nav prev" onClick={handleStoryPrev}>❮</button>
              <div className="story-image-container">
                <img 
                  src={images[storyImageIndex].image_url}
                  alt={images[storyImageIndex].caption || `${subdistrict.title} - Image ${storyImageIndex + 1}`}
                  onError={(e) => {
                    console.error('Story view image failed to load:', images[storyImageIndex].image_url);
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                {images[storyImageIndex].caption && (
                  <div className="story-caption">
                    {images[storyImageIndex].caption}
                  </div>
                )}
              </div>
              <button className="story-nav next" onClick={handleStoryNext}>❯</button>
            </div>
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2>About {subdistrict.title}</h2>
        <div className="about-content">
          <div className="about-description">
            {subdistrict.description}
          </div>
          <div className="about-info-grid">
            <div className="info-card basic-info-card">
              <h3>Basic Information</h3>
              <div className="villages-table-container">
                <table className="villages-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sub-district (Tehsil) Name</th>
                      <th>Villages List</th>
                      <th>District Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>
                        <Link className="tehsil-link" to={`/subdistrict-detail/${subdistrict.slug}`}>{subdistrict.title}</Link>
                      </td>
                      <td>
                        <Link className="villages-list-link" to={`/subdistrict/${subdistrict.slug}/villages`}>See Villages List</Link>
                      </td>
                      <td>{subdistrict.district_name}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="info-card weather-card-container">
              <h3>Current Weather</h3>
              <WeatherCard 
                weatherData={weather} 
                loading={loading} 
              />
            </div>
            {demographics && (
              <div className="info-card">
                <h3>Demographics</h3>
                <table>
                  <tbody>
                    <tr>
                      <th>Population</th>
                      <td>{demographics.population}</td>
                    </tr>
                    <tr>
                      <th>Literacy Rate</th>
                      <td>{demographics.literacy_rate}%</td>
                    </tr>
                    <tr>
                      <th>Male Population</th>
                      <td>{demographics.male_population}</td>
                    </tr>
                    <tr>
                      <th>Female Population</th>
                      <td>{demographics.female_population}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tab Sections - now full width, each with card layout */}
      {/* Attractions Section */}
      <section className="tab-section full-width-section">
        <h2>Attractions</h2>
        {attractions.length > 0 ? (
          <div className="card-list attraction-list">
            {attractions.map(attraction => (
              <div key={attraction.id} className="attraction-card">
                {(attraction.featured_image || attraction.image_url) && (
                  <img
                    className="card-image"
                    src={(attraction.featured_image || attraction.image_url).startsWith('http') ?
                      (attraction.featured_image || attraction.image_url) :
                      `http://localhost:5000/${attraction.featured_image || attraction.image_url}`}
                    alt={attraction.title || attraction.name}
                  />
                )}
                <h3 className="card-title">{attraction.title || attraction.name}</h3>
                <p className="card-description">{formatDescription(attraction.description)}</p>
                <button
                  className="read-more-btn"
                  onClick={() => navigate(`/attraction/${attraction.slug}`)}
                >
                  Read More
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No attractions available</p>
        )}
      </section>

      {/* Culture Section */}
      <section className="tab-section full-width-section culture-section">
        <h2>Culture & Heritage</h2>
        {cultureLoading ? (
          <div className="culture-no-data">
            <p className="culture-no-data-text">Loading culture information...</p>
          </div>
        ) : cultureError ? (
          <div className="culture-no-data">
            <p className="culture-no-data-text">Error loading culture information: {cultureError}</p>
          </div>
        ) : culture && culture.length > 0 ? (
          <div className="culture-grid">
            {culture.map(item => (
              <div key={item.id} className="culture-card">
                <div className="culture-card-image">
                  {item.featured_image ? (
                    <img
                      src={formatImageUrl(item.featured_image)}
                      alt={item.title}
                      onError={(e) => {
                        console.error('Image failed to load:', item.featured_image);
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  ) : (
                    <div className="culture-no-image">
                      No Image Available
                    </div>
                  )}
                </div>
                <div className="culture-card-content">
                  <h3 className="culture-card-title">{item.title}</h3>
                  <div className="culture-card-description">
                    {formatDescription(item.description)}
                  </div>
                  <button
                    className="culture-read-more"
                    onClick={() => navigate(`/culture/${item.slug}`)}
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="culture-no-data">
            <p className="culture-no-data-text">No culture & heritage information available</p>
          </div>
        )}
      </section>

      {/* Travel Information Section */}
      <section className="tab-section full-width-section travel-section">
        <h2>Travel Information</h2>
        {travelInfo && travelInfo.length > 0 ? (
          <div className="travel-grid">
            {travelInfo.map(travel => (
              <TravelInfoCard key={travel.id} travel={travel} />
            ))}
          </div>
        ) : (
          <div className="travel-no-data">
            <p className="travel-no-data-text">No travel information available for this location.</p>
          </div>
        )}
      </section>

      {/* Education & Healthcare Section */}
      <section className="tab-section full-width-section">
        <h2>Seasonal Guides</h2>
        <div className="seasonal-guides-placeholder">
          <p>Explore the best times to visit, seasonal highlights, and tips for every season in this subdistrict.</p>
        </div>
      </section>
    </div>
  );
};

export default SubdistrictDetail; 