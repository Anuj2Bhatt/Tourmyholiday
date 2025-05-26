import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tourism.css';

const Tourism = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('All Seasons');
  const [showTrendingDetails, setShowTrendingDetails] = useState(null);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [showVirtualTour, setShowVirtualTour] = useState(null);

  const categories = [
    'All',
    'Adventure',
    'Religious',
    'Cultural',
    'Wildlife',
    'Heritage'
  ];

  const seasons = [
    'All Seasons',
    'Summer',
    'Monsoon',
    'Winter',
    'Spring'
  ];

  // Trending destinations with trending score
  const trendingDestinations = [
    {
      id: 101,
      name: 'Leh Ladakh',
      image: 'https://static.toiimg.com/photo/48230811.cms',
      description: 'Experience the breathtaking landscapes and unique culture of Ladakh, now open after winter closure.',
      trendingFactor: 'Recently opened after winter, booking surge for summer travel',
      trendingScore: 98,
      season: 'Summer',
      category: 'Adventure'
    },
    {
      id: 102,
      name: 'Kashmir Valley',
      image: 'https://www.tourmyindia.com/blog//wp-content/uploads/2022/04/Best-Places-to-Visit-in-Kashmir-Srinagar-Dal-Lake.jpg',
      description: 'Visit the paradise on earth with blooming tulip gardens and pleasant weather.',
      trendingFactor: 'Tulip season and improved tourism infrastructure',
      trendingScore: 95,
      season: 'Spring',
      category: 'Cultural'
    },
    {
      id: 103,
      name: 'Coorg Coffee Plantations',
      image: 'https://www.holidify.com/images/cmsuploads/compressed/5877728133_c261bfe168_b_20180302140149.jpg',
      description: 'Discover the coffee culture and misty hills of Karnataka\'s coffee country.',
      trendingFactor: 'Workation trend and coffee harvesting season',
      trendingScore: 92,
      season: 'Winter',
      category: 'Cultural'
    },
    {
      id: 104,
      name: 'Rann of Kutch Festival',
      image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/78/fb/c5/photo5jpg.jpg?w=1200&h=-1&s=1',
      description: 'Experience the vibrant cultural festival against the backdrop of white salt desert.',
      trendingFactor: 'Ongoing cultural festival with international visitors',
      trendingScore: 90,
      season: 'Winter',
      category: 'Cultural'
    }
  ];

  const tourismSpots = [
    {
      id: 1,
      name: 'Rafting in Rishikesh',
      location: 'Uttarakhand',
      image: '/images/gallery/rafting-in-uttarakhand-1.jpg',
      description: 'Experience thrilling white water rafting in the adventure capital of India.',
      category: 'Adventure',
      season: 'Summer',
      route: '/tourism/rishikesh-rafting',
      popularity: 85
    },
    {
      id: 2,
      name: 'Char Dham Yatra',
      location: 'Uttarakhand',
      image: '/images/gallery/Chardham-Yatra-by-Helicopter-1.webp',
      description: 'Embark on a spiritual journey to the four sacred shrines of Uttarakhand.',
      category: 'Religious',
      season: 'Summer',
      route: '/tourism/char-dham',
      popularity: 88
    },
    {
      id: 3,
      name: 'Taj Mahal',
      location: 'Uttar Pradesh',
      image: 'https://cdn.britannica.com/86/170586-050-AB7FEFAE/Taj-Mahal-Agra-India.jpg',
      description: 'Visit the iconic monument of love, one of the seven wonders of the world.',
      category: 'Heritage',
      season: 'Winter',
      route: '/tourism/taj-mahal',
      popularity: 95
    },
    {
      id: 4,
      name: 'Backwaters of Kerala',
      location: 'Kerala',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Houseboats_in_Kumarakom%2C_Kerala.jpg',
      description: 'Cruise through the serene backwaters of God\'s Own Country.',
      category: 'Cultural',
      season: 'Winter',
      route: '/tourism/kerala-backwaters',
      popularity: 92
    },
    {
      id: 5,
      name: 'Jim Corbett National Park',
      location: 'Uttarakhand',
      image: 'https://www.corbettnationalpark.in/assets/img/bg/2.jpg',
      description: 'Explore India\'s oldest national park and spot majestic tigers in their natural habitat.',
      category: 'Wildlife',
      season: 'Winter',
      route: '/tourism/jim-corbett',
      popularity: 84
    },
    {
      id: 6,
      name: 'Goa Beaches',
      location: 'Goa',
      image: 'https://lp-cms-production.imgix.net/2025-01/shutterstock2542346155-cropped.jpg',
      description: 'Relax on the pristine beaches and enjoy the vibrant nightlife of Goa.',
      category: 'Adventure',
      season: 'Winter',
      route: '/tourism/goa-beaches',
      popularity: 91
    },
    {
      id: 7,
      name: 'Golden Temple',
      location: 'Punjab',
      image: 'https://www.holidify.com/images/cmsuploads/compressed/shutterstock_1346587517_20200218173012.jpg',
      description: 'Experience the spiritual aura at the holiest shrine of Sikhism.',
      category: 'Religious',
      season: 'Winter',
      route: '/tourism/golden-temple',
      popularity: 89
    },
    {
      id: 8,
      name: 'Khajuraho Temples',
      location: 'Madhya Pradesh',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Khajuraho_Vishvanath_Temple.jpg',
      description: 'Marvel at the intricate carvings on these UNESCO World Heritage temples.',
      category: 'Heritage',
      season: 'Winter',
      route: '/tourism/khajuraho',
      popularity: 87
    },
    {
      id: 9,
      name: 'Valley of Flowers',
      location: 'Uttarakhand',
      image: '/images/gallery/xccxcxc.webp',
      description: 'Trek through the stunning valley filled with endemic alpine flowers and rare wildlife.',
      category: 'Adventure',
      season: 'Spring',
      route: '/tourism/valley-of-flowers',
      popularity: 86
    },
    {
      id: 10,
      name: 'Kaziranga National Park',
      location: 'Assam',
      image: 'https://upload.wikimedia.org/wikipedia/commons/9/99/One-horned_Rhinoceros_in_Kaziranga.jpg',
      description: 'Home to the largest population of one-horned rhinoceros in the world.',
      category: 'Wildlife',
      season: 'Winter',
      route: '/tourism/kaziranga',
      popularity: 85
    },
    {
      id: 11,
      name: 'Ajanta and Ellora Caves',
      location: 'Maharashtra',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Ajanta_Cave_1_entrance.jpg',
      description: 'Explore ancient rock-cut caves featuring Buddhist, Hindu and Jain monuments.',
      category: 'Heritage',
      season: 'Winter',
      route: '/tourism/ajanta-ellora',
      popularity: 84
    },
    {
      id: 12,
      name: 'Mysore Palace',
      location: 'Karnataka',
      image: 'https://www.holidify.com/images/cmsuploads/compressed/attr_2233_20190329133840.jpg',
      description: 'Experience the royal grandeur of one of India\'s most beautiful palaces.',
      category: 'Heritage',
      season: 'Winter',
      route: '/tourism/mysore-palace',
      popularity: 87
    }
  ];

  // Current season-based recommendation
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 10) return 'Monsoon';
    return 'Winter';
  };

  const filterSpots = () => {
    let filtered = tourismSpots;
    
    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(spot => spot.category === activeCategory);
    }
    
    // Filter by season
    if (selectedSeason !== 'All Seasons') {
      filtered = filtered.filter(spot => spot.season === selectedSeason);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(spot => 
        spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleCardClick = (route) => {
    navigate(route);
  };

  // Add array of hero background images
  const heroBackgroundImages = [
    'https://img.traveltriangle.com/blog/wp-content/uploads/2018/03/rgb.jpg',
    'https://static.toiimg.com/photo/48230811.cms',
    'https://www.tourmyindia.com/blog//wp-content/uploads/2022/04/Best-Places-to-Visit-in-Kashmir-Srinagar-Dal-Lake.jpg',
    'https://cdn.britannica.com/86/170586-050-AB7FEFAE/Taj-Mahal-Agra-India.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/3d/Houseboats_in_Kumarakom%2C_Kerala.jpg',
    'https://www.holidify.com/images/cmsuploads/compressed/shutterstock_1346587517_20200218173012.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c0/Khajuraho_Vishvanath_Temple.jpg',
    'https://s7ap1.scene7.com/is/image/incredibleindia/dashashwamedh-ghat-varanasi-uttar-pradesh-city-hero?qlt=82&ts=1726649273578',
    'https://www.holidify.com/images/cmsuploads/compressed/attr_2233_20190329133840.jpg',
    'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/78/fb/c5/photo5jpg.jpg?w=1200&h=-1&s=1'
  ];

  // Updated virtual tours with actual 360 tour links
  const virtualTours = [
    { 
      id: 1, 
      name: 'Taj Mahal 360° Tour', 
      image: 'https://cdn.britannica.com/86/170586-050-AB7FEFAE/Taj-Mahal-Agra-India.jpg', 
      url: 'https://www.google.com/maps/embed?pb=!4v1658823306541!6m8!1m7!1sCAoSLEFGMVFpcE9Fb1JrdWJyV2ZqOUdvRmVtUG5zaENSOWpONlZFTmpqRFpZNzFU!2m2!1d27.17519907766143!2d78.04265887353259!3f20!4f0!5f0.7820865974627469',
      description: 'Explore the iconic monument of love in Agra with this immersive 360° experience.'
    },
    { 
      id: 2, 
      name: 'Hampi Ruins Walkthrough', 
      image: 'https://www.holidify.com/images/compressed/attractions/attr_1799.jpg', 
      url: 'https://www.google.com/maps/embed?pb=!4v1658824213329!6m8!1m7!1sCAoSLEFGMVFpcE1oTXUwQ0lsVTdRc0hTZEo0QXpEalBScXcxVEN1MG5aclhZbHQx!2m2!1d15.3351351!2d76.4612368!3f0!4f0!5f0.7820865974627469',
      description: 'Walk through the ancient ruins of Hampi, a UNESCO World Heritage site.'
    },
    { 
      id: 3, 
      name: 'Varanasi Ghats Experience', 
      image: 'https://s7ap1.scene7.com/is/image/incredibleindia/dashashwamedh-ghat-varanasi-uttar-pradesh-city-hero?qlt=82&ts=1726649273578', 
      url: 'https://www.google.com/maps/embed?pb=!4v1658824384009!6m8!1m7!1sCAoSLEFGMVFpcE9yLXVTWHdqWUhBSGpMYnJCX0I0WmJzM2RwMGc4aFZ0VzJJMWxV!2m2!1d25.3053767!2d83.0182111!3f340!4f0!5f0.7820865974627469',
      description: 'Experience the spiritual aura of the sacred Ganges and ancient ghats of Varanasi.'
    }
  ];

  // Add effect for hero image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => 
        (prev + 1) % heroBackgroundImages.length
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroBackgroundImages.length]);

  // Add this function to handle virtual tour click
  const openVirtualTour = (tour) => {
    setShowVirtualTour(tour);
  };

  // Close virtual tour modal
  const closeVirtualTour = () => {
    setShowVirtualTour(null);
  };

  // Testimonials
  const testimonials = [
    { id: 1, name: 'Rahul Sharma', location: 'Delhi', review: 'The Kashmir trip organized was exceptional! Every detail was perfectly arranged.', rating: 5, image: 'https://randomuser.me/api/portraits/men/42.jpg' },
    { id: 2, name: 'Anjali Patel', location: 'Mumbai', review: 'Uttarakhand was breathtaking. The guides were knowledgeable and friendly.', rating: 4, image: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { id: 3, name: 'Nikhil Verma', location: 'Bangalore', review: 'Kerala backwaters experience was serene and relaxing. Highly recommended!', rating: 5, image: 'https://randomuser.me/api/portraits/men/15.jpg' }
  ];

  return (
    <div className="tourism-container">
      <div 
        className="tourism-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${heroBackgroundImages[currentHeroImage]}')`
        }}
      >
        <div className="hero-background-indicator">
          {heroBackgroundImages.map((_, index) => (
            <span 
              key={index} 
              className={`indicator-dot ${currentHeroImage === index ? 'active' : ''}`}
              onClick={() => setCurrentHeroImage(index)}
            ></span>
          ))}
        </div>
        <div className="hero-content">
          <h1>Experience Incredible India</h1>
          <p>Discover the diversity of Indian tourism - from serene mountains to vibrant beaches, ancient temples to modern cities.</p>
          <div className="hero-search">
            <input 
              type="text" 
              placeholder="Search destinations, activities, or locations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button>Explore</button>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll to discover more</span>
          <div className="arrow">↓</div>
        </div>
      </div>

      {/* Trending Now Section */}
      <div className="trending-section">
        <h2>Trending Destinations <span className="trending-badge">Hot Right Now!</span></h2>
        <p className="trending-subtitle">Discover where everyone's heading this season</p>
        
        <div className="trending-carousel">
          {trendingDestinations.map(destination => (
            <div key={destination.id} className="trending-card enhanced">
              <div className="trending-image">
                <img src={destination.image} alt={destination.name} />
                <div className="trending-score">
                  <span>{destination.trendingScore}%</span>
                  <div className="trend-meter" style={{width: `${destination.trendingScore}%`}}></div>
                </div>
                <div className="trending-overlay">
                  <button className="view-details-btn">View Details</button>
                </div>
              </div>
              <div className="trending-content">
                <h3>{destination.name}</h3>
                <p>{destination.description}</p>
                <div className="trending-meta">
                  <span className="trending-season">{destination.season}</span>
                  <span className="trending-category">{destination.category}</span>
                </div>
                <button 
                  className="trending-info-btn"
                  onClick={() => setShowTrendingDetails(showTrendingDetails === destination.id ? null : destination.id)}
                >
                  {showTrendingDetails === destination.id ? 'Hide Details' : 'Why Trending?'}
                </button>
                {showTrendingDetails === destination.id && (
                  <div className="trending-details">
                    <p>{destination.trendingFactor}</p>
                  </div>
                )}
              </div>
              <div className="card-corner-fold"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="tourism-filter-section">
        <div className="filter-container">
          <div className="category-filter">
            <h3>Filter by Category</h3>
            <div className="category-buttons">
              {categories.map(category => (
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
          
          <div className="season-filter">
            <h3>Best Time to Visit</h3>
            <div className="season-buttons">
              {seasons.map(season => (
                <button 
                  key={season} 
                  className={`season-btn ${selectedSeason === season ? 'active' : ''}`}
                  onClick={() => setSelectedSeason(season)}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="seasonal-recommendation">
        <div className="season-badge">{getCurrentSeason()} Special</div>
        <h3>Best Destinations for {getCurrentSeason()}</h3>
        <p>We recommend these destinations based on the current season for the best experience</p>
      </div>

      <div className="tourism-spots">
        <div className="spots-grid">
          {filterSpots().map(spot => (
            <div 
              key={spot.id} 
              className="tourism-card"
              onClick={() => handleCardClick(spot.route)}
            >
              <div className="tourism-card-image">
                <img src={spot.image} alt={spot.name} />
                <div className="tourism-category-tag">{spot.category}</div>
                {spot.popularity >= 90 && (
                  <div className="popularity-badge">
                    Top Rated
                  </div>
                )}
              </div>
              <div className="tourism-card-content">
                <h3>{spot.name}</h3>
                <p className="location"><i className="location-icon">📍</i> {spot.location}</p>
                <p className="description">{spot.description}</p>
                <div className="season-info">
                  <span>Best Time: {spot.season}</span>
                  <div className="popularity-meter">
                    <div className="meter-fill" style={{width: `${spot.popularity}%`}}></div>
                  </div>
                </div>
                <button className="explore-spot-btn">Explore More</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Tours Section */}
      <div className="virtual-tours-section">
        <h2>Experience Virtual Tours</h2>
        <p>Can't travel right now? Explore these immersive 360° virtual experiences</p>
        
        <div className="virtual-tours-grid">
          {virtualTours.map(tour => (
            <div key={tour.id} className="virtual-tour-card">
              <div className="virtual-tour-image">
                <img src={tour.image} alt={tour.name} />
                <div className="virtual-overlay" onClick={() => openVirtualTour(tour)}>
                  <span className="virtual-icon">🔍</span>
                  <span>360° View</span>
                </div>
              </div>
              <h3>{tour.name}</h3>
              <button className="virtual-tour-btn" onClick={() => openVirtualTour(tour)}>
                Start Tour
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="testimonials-section">
        <h2>Traveler Stories</h2>
        <div className="testimonials-container">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <img src={testimonial.image} alt={testimonial.name} className="testimonial-avatar" />
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.location}</p>
                  <div className="rating">
                    {"★".repeat(testimonial.rating)}{"☆".repeat(5-testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="testimonial-text">"{testimonial.review}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Virtual Tour Modal */}
      {showVirtualTour && (
        <div className="virtual-tour-modal" onClick={closeVirtualTour}>
          <div className="virtual-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeVirtualTour}>×</button>
            <h3>{showVirtualTour.name}</h3>
            <p>{showVirtualTour.description}</p>
            <div className="virtual-iframe-container">
              <iframe 
                src={showVirtualTour.url} 
                title={showVirtualTour.name}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <div className="tourism-cta">
        <div className="cta-content">
          <h2>Plan Your Perfect Trip</h2>
          <p>Let us help you create unforgettable experiences across incredible destinations in India.</p>
          <div className="cta-buttons">
            <button onClick={() => navigate('/contact')} className="primary-btn">Contact Us</button>
            <button onClick={() => navigate('/packages')} className="secondary-btn">View Packages</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tourism; 