import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HotelSelector.css';

const HotelSelector = ({ selectedHotels = [], onHotelsChange }) => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState([]);

  const accommodationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'tent', label: 'Tent' },
    { value: 'resort', label: 'Resort' },
    { value: 'homestay', label: 'Homestay' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'guesthouse', label: 'Guesthouse' },
    { value: 'cottage', label: 'Cottage' }
  ];

  useEffect(() => {
    fetchHotels();
    fetchStates();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/hotels');
      setHotels(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/states');
      setStates(response.data);
    } catch (err) {
      }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || hotel.accommodation_type === selectedType;
    const matchesState = !selectedState || hotel.state_id === parseInt(selectedState);
    const matchesPrice = (!priceRange.min || hotel.price_per_night >= priceRange.min) &&
                        (!priceRange.max || hotel.price_per_night <= priceRange.max);
    
    return matchesSearch && matchesType && matchesState && matchesPrice;
  });

  const handleHotelSelect = (hotel) => {
    const isSelected = selectedHotels.some(h => h.id === hotel.id);
    let newSelectedHotels;
    
    if (isSelected) {
      newSelectedHotels = selectedHotels.filter(h => h.id !== hotel.id);
    } else {
      newSelectedHotels = [...selectedHotels, hotel];
    }
    
    onHotelsChange(newSelectedHotels);
  };

  const handleRemoveHotel = (hotelId) => {
    const newSelectedHotels = selectedHotels.filter(h => h.id !== hotelId);
    onHotelsChange(newSelectedHotels);
  };

  const getAmenitiesArray = (amenities) => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    if (typeof amenities === 'string') {
      try {
        const parsed = JSON.parse(amenities);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return amenities.split(',').map(a => a.trim()).filter(a => a);
      }
    }
    return [];
  };

  if (loading) return <div className="hotel-selector-loading">Loading hotels...</div>;
  if (error) return <div className="hotel-selector-error">{error}</div>;

  return (
    <div className="hotel-selector">
      <div className="hotel-selector-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search hotels by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hotel-search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="hotel-type-filter"
          >
            {accommodationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="hotel-state-filter"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          <div className="price-range-filter">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="price-input"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="price-input"
            />
          </div>
        </div>
      </div>

      <div className="hotel-selector-content">
        <div className="selected-hotels">
          <h3>Selected Hotels ({selectedHotels.length})</h3>
          {selectedHotels.length === 0 ? (
            <p className="no-hotels-message">No hotels selected</p>
          ) : (
            <div className="selected-hotels-list">
              {selectedHotels.map(hotel => (
                <div key={hotel.id} className="selected-hotel-card">
                  <img 
                    src={hotel.featured_image || '/images/placeholder.jpg'} 
                    alt={hotel.name}
                    className="selected-hotel-image"
                  />
                  <div className="selected-hotel-info">
                    <h4>{hotel.name}</h4>
                    <p>{hotel.location}</p>
                    <p>₹{hotel.price_per_night}/night</p>
                  </div>
                  <button
                    onClick={() => handleRemoveHotel(hotel.id)}
                    className="remove-hotel-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="available-hotels">
          <h3>Available Hotels</h3>
          <div className="hotels-grid">
            {filteredHotels.map(hotel => (
              <div
                key={hotel.id}
                className={`hotel-card ${selectedHotels.some(h => h.id === hotel.id) ? 'selected' : ''}`}
                onClick={() => handleHotelSelect(hotel)}
              >
                <img
                  src={hotel.featured_image || '/images/placeholder.jpg'}
                  alt={hotel.name}
                  className="hotel-image"
                />
                <div className="hotel-info">
                  <h4>{hotel.name}</h4>
                  <p className="hotel-location">{hotel.location}</p>
                  <div className="hotel-details">
                    <span className="hotel-type">{hotel.accommodation_type}</span>
                    <span className="hotel-price">₹{hotel.price_per_night}/night</span>
                  </div>
                  <div className="hotel-amenities">
                    {getAmenitiesArray(hotel.amenities).slice(0, 3).map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSelector; 