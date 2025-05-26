import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './States.css';
import { Helmet } from 'react-helmet';

const States = () => {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use useMemo for defaultStates to avoid recreation on each render
  const defaultStates = useMemo(() => [
    {
      id: 1,
      name: "Uttarakhand",
      emoji: "🏔️",
      image: "/images/gallery/pasted-image.jpg",
      description: "The Land of Gods, known for its spiritual significance and natural beauty.",
      route: "/uttarakhand",
      link: "/uttarakhand",
      capital: "Dehradun",
      famousFor: [
        { emoji: "🕉", text: "Char Dham" },
        { emoji: "🏔️", text: "Trekking" },
        { emoji: "🎭", text: "Culture" },
        { emoji: "🏔️", text: "Adventure Sports" },
      ],
    },
    {
      id: 2,
      name: "Himachal Pradesh",
      emoji: "⛰️",
      image: "https://lp-cms-production.imgix.net/2019-06/GettyImages-149353949_high.jpg",
      description: "Experience the beauty of snow-capped mountains, lush valleys, and adventure sports",
      capital: "Shimla",
      famousFor: [
        { emoji: "🚂", text: "Shimla" },
        { emoji: "🏂", text: "Manali" },
        { emoji: "🏔️", text: "Dharamshala" },
        { emoji: "⛷️", text: "Skiing" }
      ],
      route: "/states/himachal-pradesh"
    },
    {
      id: 3,
      name: "Rajasthan",
      emoji: "🏰",
      image: "https://s7ap1.scene7.com/is/image/incredibleindia/hawa-mahal-jaipur-rajasthan-city-1-hero?qlt=82&ts=1726660605161",
      description: "The Land of Kings - Rich in culture, heritage, and royal palaces",
      capital: "Jaipur",
      famousFor: [
        { emoji: "🏯", text: "Forts" },
        { emoji: "🐪", text: "Desert Safari" },
        { emoji: "👑", text: "Palace Hotels" },
        { emoji: "🎭", text: "Culture" }
      ],
      route: "/states/rajasthan"
    },
    {
      id: 4,
      name: "Kerala",
      emoji: "🌴",
      image: "https://imgcdn.flamingotravels.co.in/Images/Country/Kerala%20State.JPG",
      description: "God's Own Country - Backwaters, beaches, and ayurveda",
      capital: "Thiruvananthapuram",
      famousFor: [
        { emoji: "🚣", text: "Backwaters" },
        { emoji: "🏖️", text: "Beaches" },
        { emoji: "💆", text: "Ayurveda" },
        { emoji: "🍵", text: "Tea Gardens" }
      ],
      route: "/states/kerala"
    },
    {
      id: 5,
      name: "Goa",
      emoji: "🏖️",
      image: "https://lp-cms-production.imgix.net/2025-01/shutterstock2542346155-cropped.jpg?auto=format,compress&q=72&w=1440&h=810&fit=crop",
      description: "Pearl of the Orient - Famous for beaches, nightlife, and Portuguese heritage",
      capital: "Panaji",
      famousFor: [
        { emoji: "🏊", text: "Beaches" },
        { emoji: "⛪", text: "Churches" },
        { emoji: "🌙", text: "Nightlife" },
        { emoji: "🏄", text: "Water Sports" }
      ],
      route: "/states/goa"
    },
    {
      id: 6,
      name: "Maharashtra",
      emoji: "🌇",
      image: "https://s7ap1.scene7.com/is/image/incredibleindia/1-pratapgarh-fort-mahabaleshwar-maharashtra-2-city-hero?qlt=82&ts=1726668937680",
      description: "Gateway to the Heart of India - Rich history and vibrant culture",
      capital: "Mumbai",
      famousFor: [
        { emoji: "🌆", text: "Mumbai" },
        { emoji: "🏛️", text: "Ajanta Caves" },
        { emoji: "🗿", text: "Ellora Caves" },
        { emoji: "🏖️", text: "Beaches" }
      ],
      route: "/states/maharashtra"
    },
    {
      id: 7,
      name: "Gujarat",
      emoji: "🦁",
      image: "images/gallery/2-pavagadh-temple-gujarat-state-hero2.jpeg",
      description: "The Jewel of Western India - Heritage sites and wildlife sanctuaries",
      capital: "Gandhinagar",
      famousFor: [
        { emoji: "🌅", text: "Rann of Kutch" },
        { emoji: "🦁", text: "Gir Forest" },
        { emoji: "🕉️", text: "Temples" },
        { emoji: "🎨", text: "Handicrafts" }
      ],
      route: "/states/gujarat"
    },
    {
      id: 8,
      name: "Tamil Nadu",
      emoji: "🕉️",
      image: "https://s7ap1.scene7.com/is/image/incredibleindia/1-rameswaram-temple-rameswaram-tamilnadu-hero-1?qlt=82&ts=1727162277643",
      description: "Land of Temples - Rich in culture, tradition, and architecture",
      capital: "Chennai",
      famousFor: [
        { emoji: "🛕", text: "Temples" },
        { emoji: "🏖️", text: "Beaches" },
        { emoji: "⛰️", text: "Hill Stations" },
        { emoji: "🎭", text: "Culture" }
      ],
      route: "/states/tamil-nadu"
    },
    {
      id: 9,
      name: "Karnataka",
      emoji: "🏛️",
      image: "https://cdn.britannica.com/38/10638-050-10CB2DFB/Jog-Falls-Karnataka-India.jpg",
      description: "One State Many Worlds - Heritage sites and tech hub",
      capital: "Bengaluru",
      famousFor: [
        { emoji: "👑", text: "Mysore Palace" },
        { emoji: "🏛️", text: "Hampi" },
        { emoji: "☕", text: "Coorg" },
        { emoji: "💻", text: "Bangalore" }
      ],
      route: "/states/karnataka"
    },
    {
      id: 10,
      name: "Madhya Pradesh",
      emoji: "🐯",
      image: "https://s7ap1.scene7.com/is/image/incredibleindia/chaturbhuj-temple-orchha-madhya-pradesh-2-attr-hero?qlt=82&ts=1726670981334",
      description: "The Heart of Incredible India - Wildlife and heritage",
      capital: "Bhopal",
      famousFor: [
        { emoji: "🏛️", text: "Khajuraho" },
        { emoji: "🐯", text: "National Parks" },
        { emoji: "🕉️", text: "Temples" },
        { emoji: "🏰", text: "Forts" }
      ],
      route: "/states/madhya-pradesh"
    },
    {
      id: 11,
      name: "West Bengal",
      emoji: "🐯",
      image: "https://siliguritourism.com/wp-content/uploads/2024/01/Darjeeling-West-Bengal.jpg",
      description: "Bengal - The Sweetest Part of India",
      capital: "Kolkata",
      famousFor: [
        { emoji: "🐯", text: "Sundarbans" },
        { emoji: "🚂", text: "Darjeeling" },
        { emoji: "🎭", text: "Culture" },
        { emoji: "🍜", text: "Food" }
      ],
      route: "/states/west-bengal"
    },
    {
      id: 12,
      name: "Sikkim",
      emoji: "🗻",
      image: "https://s7ap1.scene7.com/is/image/incredibleindia/lachung-monastery-1-state-hero?qlt=82&ts=1726655949596",
      description: "Small but Beautiful - Northeast paradise",
      capital: "Gangtok",
      famousFor: [
        { emoji: "🏔️", text: "Mountains" },
        { emoji: "🛕", text: "Monasteries" },
        { emoji: "🥾", text: "Trekking" },
        { emoji: "🎭", text: "Culture" }
      ],
      route: "/states/sikkim"
    },
    {
      id: 13,
      name: "Andhra Pradesh",
      emoji: "🛕",
      image: "https://etimg.etb2bimg.com/photo/89314482.cms",
      description: "Land of Ancient Temples and Rich Heritage - Famous for spiritual tourism and beaches",
      capital: "Amaravati",
      famousFor: [
        { emoji: "🕉️", text: "Tirupati Temple" },
        { emoji: "🏖️", text: "Vizag Beaches" },
        { emoji: "🚣", text: "Godavari River" },
        { emoji: "🍚", text: "Cuisine" }
      ],
      route: "/states/andhra-pradesh"
    }
  ], []);

  useEffect(() => {
    setLoading(true);
    try {
      const savedStates = localStorage.getItem('tourMyHolidayStates');
      if (savedStates) {
        const parsedStates = JSON.parse(savedStates);
        
        // Normalize the states to ensure consistent structure
        const normalizedStates = parsedStates.map(state => ({
          id: state.id,
          name: state.name,
          emoji: state.emoji || '🏞️',
          image: state.image || '',
          description: state.description || `Explore the beauty of ${state.name}`,
          route: state.route || `/states/${state.name.toLowerCase().replace(/\s+/g, '-')}`,
          link: state.link || '',
          capital: state.capital || (state.details && state.details.capital) || '',
          famousFor: Array.isArray(state.famousFor) ? state.famousFor : [],
        }));
        
        setStates(normalizedStates);
      } else {
        setStates(defaultStates);
      }
    } catch (err) {
      console.error('Error loading states:', err);
      setStates(defaultStates);
    } finally {
      setLoading(false);
    }
  }, [defaultStates]);

  // Handle card click to navigate to the state page
  const handleCardClick = (state) => {
    // Use the custom link if available, otherwise use the route
    const stateLink = state.link || state.route;
    // Format the link if it doesn't start with a slash
    const formattedLink = stateLink.startsWith('/') 
      ? stateLink 
      : `/${stateLink}`;
    navigate(formattedLink);
  };

  // Improved image error handling
  const handleImageError = useCallback((e) => {
    console.error('Failed to load image:', e.target.src);
    e.target.onerror = null; // Prevent infinite fallback loop
    
    // Use a colored placeholder background with text instead of relying on external resources
    e.target.parentNode.classList.add('image-error');
    e.target.style.display = 'none';
    
    // Add a text placeholder
    const textPlaceholder = document.createElement('div');
    textPlaceholder.className = 'image-placeholder';
    textPlaceholder.textContent = 'Image Not Available';
    
    // Only add if it doesn't already exist
    if (!e.target.parentNode.querySelector('.image-placeholder')) {
      e.target.parentNode.appendChild(textPlaceholder);
    }
  }, []);

  if (loading) {
    return <div className="loading">Loading states...</div>;
  }

  return (
    <div className="states-page">
      <Helmet>
        <title>Explore Indian States | Tour My Holiday</title>
        <meta name="description" content="Discover the beauty and diversity of Indian states with Tour My Holiday." />
        <meta name="keywords" content="Indian states, tourism, travel India, state tourism" />
      </Helmet>

      <div className="states-header">
        <h1>Explore Indian States</h1>
        <p>Discover the rich diversity and unique cultural heritage of Indian states</p>
      </div>
      <div className="states-grid">
        {loading ? (
          <div className="loading-container">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <p>Loading states...</p>
          </div>
        ) : (
          states.map((state) => (
            <div
              key={state.id}
              className="state-card hover-scale"
              onClick={() => handleCardClick(state)}
            >
              <div className="state-image">
                {state.image ? (
                  <img
                    src={state.image}
                    alt={state.name}
                    onError={handleImageError}
                    loading="lazy"
                  />
                ) : (
                  <div className="placeholder-image">
                    <span>{state.emoji || '🏞️'}</span>
                  </div>
                )}
              </div>
              <div className="state-content">
                <div className="state-header">
                  <h3>{state.emoji} {state.name}</h3>
                </div>
                <p className="state-description" title={state.description}>{state.description}</p>
                <div className="state-details">
                  <p><strong>🏛️ Capital:</strong> {state.capital || (state.details && state.details.capital) || 'Unknown'}</p>
                  <div className="famous-for">
                    <strong>✨ Famous For:</strong>
                    <div className="tags">
                      {state.famousFor && state.famousFor.length > 0 ? (
                        state.famousFor.map((item, index) => (
                          <span key={index} className="tag" title={item.text}>
                            {item.emoji} {item.text}
                          </span>
                        ))
                      ) : (
                        <span className="tag">✨ Tourism</span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="explore-btn">
                  <span className="btn-text">Explore {state.name}</span>
                  <span className="btn-icon">🔍</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default States; 