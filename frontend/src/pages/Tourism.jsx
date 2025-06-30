import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Tourism.css';

// Define API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Tourism = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('All Seasons');
  const [showTrendingDetails, setShowTrendingDetails] = useState(null);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [showVirtualTour, setShowVirtualTour] = useState(null);
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch trending destinations
  useEffect(() => {
    const fetchTrendingDestinations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/tourism`, {
          params: {
            is_featured: true,
            is_active: true,
            status: 'published',
            limit: 4
          }
        });

        if (response.data.success) {
          // Transform the data to match our card structure
          const destinations = response.data.data.map(destination => {
            return {
              id: destination.id,
              name: destination.name,
              location: destination.location_name,
              description: destination.short_description,
              image: destination.featured_image, // Keep the original image path
              price: destination.price,
              slug: destination.slug,
              budget_range_min: destination.budget_range_min,
              budget_range_max: destination.budget_range_max,
              // Add a random discount between 10-15%
              specialOffer: {
                discount: Math.floor(Math.random() * (15 - 10 + 1)) + 10
              }
            };
          });
          setTrendingDestinations(destinations);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingDestinations();
  }, []);

  // Add new TrendingDestinationCard component
  const TrendingDestinationCard = ({ destination }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleBookNow = () => {
      navigate(`/tourism/${destination.slug}`);
    };

    // Get the full image URL
    const getImageUrl = (imagePath) => {
      if (!imagePath) return `${API_URL}/images/placeholder.jpg`;
      if (imagePath.startsWith('http')) return imagePath;
      
      // Remove /uploads/ from the start if it exists
      const cleanPath = imagePath.replace(/^\/uploads\//, '');
      return `${API_URL}/uploads/${cleanPath}`;
    };

    return (
      <div className="trending-card enhanced">
        <div className="trending-image">
          <img 
            src={getImageUrl(destination.image)} 
            alt={destination.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
          
          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
            <button className="share-btn">↗️</button>
          </div>

          {/* Special Offer Badge */}
          {destination.specialOffer && (
            <div className="special-offer-badge">
              {destination.specialOffer.discount}% OFF
            </div>
          )}
        </div>

        <div className="trending-content">
          <h3>{destination.name}</h3>
          <p className="location">{destination.location}</p>
          <p className="description">{destination.description}</p>
          
          <div className="price-info">
            <span className="price">₹{destination.price?.toLocaleString()}</span>
            {destination.budget_range_min && destination.budget_range_max && (
              <span className="budget-range">
                Budget: ₹{destination.budget_range_min.toLocaleString()} - ₹{destination.budget_range_max.toLocaleString()}
              </span>
            )}
          </div>

          <div className="card-actions">
            <button 
              className="book-now-btn"
              onClick={handleBookNow}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            <TrendingDestinationCard 
              key={destination.id} 
              destination={destination} 
            />
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