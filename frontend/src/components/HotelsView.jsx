import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import './HotelsView.css';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const ACCOMMODATION_TYPES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'tent', label: 'Tent' },
  { value: 'resort', label: 'Resort' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'guesthouse', label: 'Guesthouse' },
  { value: 'cottage', label: 'Cottage' }
];

const FILTERABLE_AMENITIES = [
  { key: 'Bonfire', label: 'Bonfire' },
  { key: 'DJ Night', label: 'DJ Night' },
  { key: 'Pool', label: 'Swimming Pool' },
  { key: 'Restaurant', label: 'Restaurant' },
  { key: 'Room Service', label: 'Room Service' },
  { key: 'Outdoor Activities', label: 'Outdoor Activities' }
];

const DESTINATION_CATEGORIES = [
  { key: 'beach', label: 'Beach' },
  { key: 'culture', label: 'Culture' },
  { key: 'ski', label: 'Ski' },
  { key: 'family', label: 'Family' },
  { key: 'wellness', label: 'Wellness and Relaxation' },
];

const DESTINATIONS = {
  beach: [
    {
      id: 1,
      name: 'Ballena',
      location: 'Puntarenas Province, Costa Rica',
      price: 12105,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      name: 'Bangkok',
      location: 'Bangkok Province, Thailand',
      price: 7250,
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      name: 'Mumbai',
      location: 'Maharashtra, India',
      price: 6511,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 4,
      name: 'Ban Ta Khun',
      location: 'Surat Thani Province, Thailand',
      price: 8713,
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 5,
      name: 'Kauai',
      location: 'Western Hawaii, USA',
      price: 11000,
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
    },
  ],
  culture: [
    // ... add mock data for other categories ...
  ],
  ski: [],
  family: [],
  wellness: [],
};

const ACCOMMODATION_TYPE_TABS = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'tent', label: 'Tent' },
  { value: 'resort', label: 'Resort' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'guesthouse', label: 'Guesthouse' },
  { value: 'cottage', label: 'Cottage' },
];

const HotelsView = () => {
  const [location, setLocation] = useState('Dehradun, Uttarakhand, India');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [travellers, setTravellers] = useState('2 travellers, 1 room');
  const [hotelTypes, setHotelTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('hotel');
  const [typeHotels, setTypeHotels] = useState([]);
  const [loadingTypeHotels, setLoadingTypeHotels] = useState(false);
  const [selectedCityCategory, setSelectedCityCategory] = useState('beach');
  const [selectedAmenity, setSelectedAmenity] = useState('Bonfire');
  const [amenityHotels, setAmenityHotels] = useState([]);
  const [loadingAmenityHotels, setLoadingAmenityHotels] = useState(false);
  const amenitiesScrollRef = useRef(null);
  const popularScrollRef = useRef(null);
  const cityScrollRef = useRef(null);
  const typesScrollRef = useRef(null);
  const [states, setStates] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [selectedDestinationCategory, setSelectedDestinationCategory] = useState('beach');
  const destinationScrollRef = useRef(null);
  const [selectedAccomTab, setSelectedAccomTab] = useState('hotel');
  const [accomTabHotels, setAccomTabHotels] = useState([]);
  const [loadingAccomTabHotels, setLoadingAccomTabHotels] = useState(false);
  const accomTabScrollRef = useRef(null);

  const heroBgUrl = "http://localhost:5000/uploads/village_near_alps_lake_around_mountain_panorama_switzerland_hd_travel.jpg";

  useEffect(() => {
    fetchHotelTypes();
    fetchStates();
  }, []);

  const fetchHotelTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/hotel-categories`);
      const categoriesWithImages = response.data.map(category => ({
        ...category,
        image: category.image ? `${API_URL}/${category.image}` : '/placeholder.jpg'
      }));
      setHotelTypes(categoriesWithImages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hotel types:', error);
      setError('Failed to load hotel types');
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const response = await axios.get(`${API_URL}/api/states`);
      setStates(response.data);
      setLoadingStates(false);
    } catch (error) {
      console.error('Error fetching states:', error);
      setError('Failed to load states');
      setLoadingStates(false);
    }
  };

  // Fetch hotels for selected type
  useEffect(() => {
    const fetchTypeHotels = async () => {
      setLoadingTypeHotels(true);
      try {
        const res = await axios.get(`${API_URL}/api/hotels?type=${selectedType}`);
        setTypeHotels(res.data);
      } catch (err) {
        setTypeHotels([]);
      }
      setLoadingTypeHotels(false);
    };
    fetchTypeHotels();
  }, [selectedType]);

  // Fetch hotels for selected amenity
  useEffect(() => {
    const fetchAmenityHotels = async () => {
      if (!selectedAmenity) {
        setAmenityHotels([]);
        return;
      }
      setLoadingAmenityHotels(true);
      try {
        // Use the new endpoint to get hotels by amenity
        const response = await axios.get(`${API_URL}/api/hotels/amenity/${selectedAmenity}`);
        console.log('Hotels with amenity:', selectedAmenity, response.data);
        setAmenityHotels(response.data);
      } catch (err) {
        console.error('Error fetching amenity hotels:', err);
        setAmenityHotels([]);
      }
      setLoadingAmenityHotels(false);
    };

    fetchAmenityHotels();
  }, [selectedAmenity]);

  useEffect(() => {
    const fetchAccomTabHotels = async () => {
      setLoadingAccomTabHotels(true);
      try {
        const res = await axios.get(`${API_URL}/api/hotels?type=${selectedAccomTab}`);
        setAccomTabHotels(res.data);
      } catch (err) {
        setAccomTabHotels([]);
      }
      setLoadingAccomTabHotels(false);
    };
    fetchAccomTabHotels();
  }, [selectedAccomTab]);

  const handleScroll = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = 300; // Adjust this value to control scroll distance
      const currentScroll = ref.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      ref.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="hotels-view-page">
      {/* Hero Search Section */}
      <section className="hotels-hero-search">
        <div
          className="hotels-hero-bg"
          style={{
            backgroundImage: `url('${heroBgUrl}')`,
          }}
        >
          <div className="hotels-hero-overlay"></div>
          <div className="hotels-hero-content">
            <h1 className="hotels-hero-title">Where to next?</h1>
            <form className="hotels-search-bar" onSubmit={e => e.preventDefault()}>
              <div className="hotels-search-field">
                <label>Where to?</label>
                <input
                  type="text"
                  placeholder="Dehradun, Uttarakhand, India"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <div className="hotels-search-field">
                <label>Dates</label>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={([start, end]) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  minDate={new Date()}
                  placeholderText="Select dates"
                  dateFormat="dd MMM, yyyy"
                  isClearable={true}
                  className="hotels-datepicker"
                />
              </div>
              <div className="hotels-search-field">
                <label>Travellers</label>
                <input  
                  type="text"
                  placeholder="2 travellers, 1 room"
                  value={travellers}
                  onChange={e => setTravellers(e.target.value)}
                />
              </div>
              <button className="hotels-search-btn" type="submit">Search</button>
            </form>
          </div>
        </div>
      </section>

      {/* Hotel Types Section */}
      <section className="hotel-types-section">
        <h2 className="hotel-types-title">Discover your new favourite stay</h2>
        {loading ? (
          <div className="loading">Loading hotel types...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="scroll-container">
            <button 
              className="scroll-nav-btn left"
              onClick={() => handleScroll('left', typesScrollRef)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="hotel-types-row" ref={typesScrollRef}>
              {hotelTypes.map((type) => (
                <div className="hotel-type-card" key={type.id}>
                  <img 
                    src={type.image} 
                    alt={type.name} 
                    className="hotel-type-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="hotel-type-name">{type.name}</div>
                </div>
              ))}
            </div>
            <button 
              className="scroll-nav-btn right"
              onClick={() => handleScroll('right', typesScrollRef)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* --- Popular Destinations Section (now dynamic by type) --- */}
      <section className="popular-destinations-section">
        <h2 className="popular-destinations-title" style={{textAlign: 'left'}}>Find Your Ideal Stay</h2>
        <p className="popular-destinations-description" style={{textAlign: 'left', maxWidth: 600, marginBottom: 24}}>
          Select an accommodation type to explore the best options for your next trip.
        </p>
        <div className="popular-destinations-tabs">
          {DESTINATION_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`popular-tab-btn${selectedDestinationCategory === cat.key ? ' active' : ''}`}
              onClick={() => setSelectedDestinationCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="scroll-container">
          <button 
            className="scroll-nav-btn left"
            onClick={() => handleScroll('left', destinationScrollRef)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="popular-destinations-cards-row" ref={destinationScrollRef}>
            {(DESTINATIONS[selectedDestinationCategory] || []).length === 0 ? (
              <div className="error">No destinations found for this category.</div>
            ) : (
              DESTINATIONS[selectedDestinationCategory].map(dest => (
                <div className="popular-destination-card" key={dest.id}>
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="popular-destination-img"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="popular-destination-info">
                    <div className="popular-destination-name">{dest.name}</div>
                    <div className="popular-destination-location">{dest.location}</div>
                    <div className="popular-destination-price">
                      ₹{dest.price?.toLocaleString?.() || dest.price}
                    </div>
                    <div className="popular-destination-price-label">avg. nightly price</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            className="scroll-nav-btn right"
            onClick={() => handleScroll('right', destinationScrollRef)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      <section className="nearest-states-section">
        <h2 className="nearest-states-title">Search Hotels from Your Nearest</h2>
        <p className="nearest-states-subtitle">Discover amazing stays across India's most beautiful states</p>
        <div className="scroll-container">
          <button 
            className="scroll-nav-btn left"
            onClick={() => handleScroll('left', cityScrollRef)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="nearest-states-row" ref={cityScrollRef}>
            {loadingStates ? (
              <div className="loading">Loading states...</div>
            ) : states.length === 0 ? (
              <div className="error">No states available.</div>
            ) : (
              states.map(state => (
                <div className="state-card" key={state.id}>
                  <div className="state-card-overlay"></div>
                  <img 
                    src={state.image || '/placeholder.jpg'} 
                    alt={state.name} 
                    className="state-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="state-card-content">
                    <h3 className="state-card-name">{state.name}</h3>
                    <button 
                      className="state-explore-btn"
                    >
                      Explore Accommodation
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            className="scroll-nav-btn right"
            onClick={() => handleScroll('right', cityScrollRef)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="amenities-filter-section">
        <h2 className="amenities-filter-title">Filter by Amenities</h2>
        <div className="amenities-filter-buttons">
          {FILTERABLE_AMENITIES.map(amenity => (
            <button
              key={amenity.key}
              className={`amenity-filter-btn${selectedAmenity === amenity.key ? ' active' : ''}`}
              onClick={() => setSelectedAmenity(selectedAmenity === amenity.key ? null : amenity.key)}
            >
              {amenity.label}
            </button>
          ))}
        </div>
        {selectedAmenity && (
          <div className="amenities-hotels-section">
            <h3 className="amenities-hotels-title">
              {selectedAmenity} Available at:
            </h3>
            <div className="scroll-container">
              <button 
                className="scroll-nav-btn left"
                onClick={() => handleScroll('left', amenitiesScrollRef)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="amenities-hotels-row" ref={amenitiesScrollRef}>
                {loadingAmenityHotels ? (
                  <div className="loading">Loading accommodations...</div>
                ) : amenityHotels.length === 0 ? (
                  <div className="no-hotels">No accommodations found with {selectedAmenity}.</div>
                ) : (
                  amenityHotels.map(hotel => (
                    <div className="amenity-hotel-card" key={hotel.id}>
                      <img
                        src={hotel.featured_image || '/placeholder.jpg'}
                        alt={hotel.name}
                        className="amenity-hotel-img"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      <div className="amenity-hotel-info">
                        <div className="amenity-hotel-name">{hotel.name}</div>
                        <div className="amenity-hotel-location">{hotel.location}</div>
                        <div className="amenity-hotel-price">
                          ₹{hotel.price_per_night?.toLocaleString?.() || hotel.price_per_night}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button 
                className="scroll-nav-btn right"
                onClick={() => handleScroll('right', amenitiesScrollRef)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="popular-destinations-section">
        <h2 className="popular-destinations-title">Explore stays in popular destinations</h2>
        <div className="popular-destinations-tabs">
          {ACCOMMODATION_TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              className={`popular-tab-btn${selectedAccomTab === tab.value ? ' active' : ''}`}
              onClick={() => setSelectedAccomTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="scroll-container">
          <button 
            className="scroll-nav-btn left"
            onClick={() => handleScroll('left', accomTabScrollRef)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="popular-destinations-cards-row" ref={accomTabScrollRef}>
            {loadingAccomTabHotels ? (
              <div className="loading">Loading...</div>
            ) : accomTabHotels.length === 0 ? (
              <div className="error">No accommodations found for this type.</div>
            ) : (
              accomTabHotels.map(hotel => (
                <div className="popular-destination-card" key={hotel.id}>
                  <img
                    src={hotel.featured_image || '/placeholder.jpg'}
                    alt={hotel.name}
                    className="popular-destination-img"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="popular-destination-info">
                    <div className="popular-destination-name">{hotel.name}</div>
                    <div className="popular-destination-location">{hotel.location}</div>
                    <div className="popular-destination-price">
                      ₹{hotel.price_per_night?.toLocaleString?.() || hotel.price_per_night}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            className="scroll-nav-btn right"
            onClick={() => handleScroll('right', accomTabScrollRef)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HotelsView; 