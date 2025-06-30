import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './SearchResults.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SearchResults = () => {
    const [searchResults, setSearchResults] = useState({
        states: [],
        territories: [],
        packages: [],
        districts: [],
        subdistricts: []
    });
    const [totalResults, setTotalResults] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                
                
                if (!response.ok) {
                    throw new Error(data.message || 'Search failed');
                }
                
                if (data.success) {
                    setSearchResults(data.results);
                    setTotalResults(data.totalResults);
                } else {
                    throw new Error(data.message || 'Search failed');
                }
            } catch (err) {
                setError(err.message);
                setSearchResults({
                    states: [],
                    territories: [],
                    packages: [],
                    districts: [],
                    subdistricts: []
                });
                setTotalResults(0);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    const handleImageError = (e) => {
        e.target.onerror = null; 
        e.target.parentNode.classList.add('image-error');
        e.target.style.display = 'none';
        
        // Create and add placeholder div if it doesn't exist
        if (!e.target.parentNode.querySelector('.image-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = `
                <div class="placeholder-content">
                    <span class="placeholder-icon">🏞️</span>
                    <span class="placeholder-text">Image Not Available</span>
                </div>
            `;
            e.target.parentNode.appendChild(placeholder);
        }
    };

    const getDetailPath = (type, slug) => {
        // Normalize type to singular
        if (type === 'states') type = 'state';
        if (type === 'districts') type = 'district';
        if (type === 'subdistricts') type = 'subdistrict';
    
        switch (type) {
            case 'state':
                return `${slug}`; // ✅ This is what you want
            case 'packages':
                return `/packages/${slug}`;
            case 'attraction':
                return `/attractions/${slug}`;
            case 'hotel':
                return `/hotels/${slug}`;
            case 'territory':
                return `/territories/${slug}`;
            case 'district':
                return `/district/${slug}`;
            case 'subdistrict':
                return `/subdistrict-detail/${slug}`;
            default:
                return '#';
        }
    };

    const renderHotelDetails = (item) => {
        if (item.type !== 'hotel') return null;
        return (
            <>
                {item.state_name && (
                    <div className="search-card-state">
                        <span className="search-card-label">State:</span> {item.state_name}
                    </div>
                )}
                {item.location && (
                    <div className="search-card-location">
                        <span className="search-card-label">Location:</span> {item.location}
                    </div>
                )}
                {item.star_rating_display && (
                    <div className="search-card-rating">
                        <span className="search-card-label">Rating:</span> {item.star_rating_display}
                    </div>
                )}
                {item.formatted_price && (
                    <div className="search-card-price">
                        <span className="search-card-label">Price:</span> {item.formatted_price}
                    </div>
                )}
                {item.amenities && item.amenities.length > 0 && (
                    <div className="search-card-amenities">
                        <span className="search-card-label">Amenities:</span>
                        <div className="amenities-list">
                            {item.amenities.map((amenity, index) => (
                                <span key={index} className="amenity-tag">{amenity}</span>
                            ))}
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderTerritoryDetails = (item) => {
        if (item.type !== 'territory') return null;
        return (
            <>
                {item.state_name && (
                    <div className="search-card-state">
                        <span className="search-card-label">State:</span> {item.state_name}
                    </div>
                )}
                {item.capital && (
                    <div className="search-card-capital">
                        <span className="search-card-label">Capital:</span> {item.capital}
                    </div>
                )}
                {item.famous_for && (
                    <div className="search-card-famous">
                        <span className="search-card-label">Famous For:</span> {item.famous_for}
                    </div>
                )}
            </>
        );
    };

    const renderCard = (item) => (
        <Link to={getDetailPath(item.type, item.slug)} className="search-card" key={item.id}>
            <div className="search-card-image-container">
                <img
                    src={item.image}
                    alt={item.name || item.title}
                    className="search-card-image"
                    onError={handleImageError}
                />
                <div className="search-card-type-container">
                    <span className={`search-card-type ${item.type}`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                </div>
            </div>
            <div className="search-card-content">
                <h3 className="search-card-title">{item.name || item.title}</h3>
                {item.description && (
                    <p className="search-card-description">{item.description}</p>
                )}
                {renderHotelDetails(item)}
                {renderTerritoryDetails(item)}
            </div>
        </Link>
    );

    if (loading) {
        return <div className="loading">Searching...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    // Combine all results into a single array
    const allResults = [
        ...searchResults.states,
        ...searchResults.territories,
        ...searchResults.packages,
        ...searchResults.districts,
        ...searchResults.subdistricts
    ];

    if (totalResults === 0) {
        return (
            <div className="no-results">
                <h2>No results found for "{query}"</h2>
                <p>Try different keywords or check your spelling.</p>
            </div>
        );
    }

    return (
        <div className="search-results">
            <h1>Search Results for "{query}"</h1>
            <div className="search-results-stats">
                Found {totalResults} results
            </div>
            <div className="search-results-grid">
                {allResults.map(renderCard)}
            </div>
        </div>
    );
};

export default SearchResults; 