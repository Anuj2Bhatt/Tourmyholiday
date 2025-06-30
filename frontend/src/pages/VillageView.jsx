import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaStar, FaUsers, FaHome, FaTree, FaRupeeSign, FaClock, FaArrowLeft, FaTemperatureHigh, FaCloudRain, FaWind, FaSun, FaMoon, FaLanguage, FaUtensils, FaHotel, FaBus, FaPlane, FaTrain, FaCar, FaPhone, FaEnvelope, FaGlobe, FaHeart, FaShare, FaBookmark } from 'react-icons/fa';
import './VillageView.css';

const VillageView = () => {
    const { id } = useParams();
    const [village, setVillage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Population');
    const [galleryStart, setGalleryStart] = useState(0);
    const imagesPerRow = 4;

    // Dummy data for a village 
    const dummyVillageData = {
        id: 1,
        name: "Majuli Island Village",
        state: "Assam",
        region: "Northeast",
        type: "Cultural",
        description: "Majuli is the world's largest river island and a hub of Assamese culture. Known for its unique mask-making art, traditional dance forms, and ancient monasteries called Satras, this island village offers an immersive experience into Assam's rich cultural heritage.",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
        gallery: [
            "https://images.unsplash.com/photo-1587474260584-136574528ed5",
            "https://images.unsplash.com/photo-1599669454699-248893623440",
            "https://images.unsplash.com/photo-1585409677983-0f6c41f9a05b",
            "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944"
        ],
        highlights: [
            "World's largest river island",
            "UNESCO World Heritage Site",
            "Traditional mask-making art",
            "Ancient Satras (monasteries)",
            "Rich cultural heritage"
        ],
        bestTimeToVisit: "October to March",
        weather: {
            summer: "25°C - 35°C",
            winter: "10°C - 25°C",
            monsoon: "Heavy rainfall"
        },
        population: "1,67,304",
        area: "880 sq km",
        languages: ["Assamese", "Mising", "Deori"],
        festivals: [
            "Raas Leela",
            "Ali-Ai-Ligang",
            "Bihu Festival"
        ],
        attractions: [
            {
                name: "Kamalabari Satra",
                description: "One of the most prominent Satras known for its cultural activities",
                image: "https://images.unsplash.com/photo-1587474260584-136574528ed5"
            },
            {
                name: "Dakhinpat Satra",
                description: "Famous for its traditional dance and music",
                image: "https://images.unsplash.com/photo-1599669454699-248893623440"
            },
            {
                name: "Auniati Satra",
                description: "Known for its mask-making art and cultural heritage",
                image: "https://images.unsplash.com/photo-1585409677983-0f6c41f9a05b"
            }
        ],
        localCuisine: [
            {
                name: "Khaar",
                description: "Traditional Assamese dish made with raw papaya",
                image: "https://images.unsplash.com/photo-1587474260584-136574528ed5"
            },
            {
                name: "Masor Tenga",
                description: "Sour fish curry, a specialty of Assam",
                image: "https://images.unsplash.com/photo-1599669454699-248893623440"
            }
        ],
        homestays: [
            {
                name: "Majuli Homestay",
                price: "₹1,500",
                rating: 4.5,
                image: "https://images.unsplash.com/photo-1587474260584-136574528ed5",
                amenities: ["Traditional Food", "Cultural Activities", "River View"]
            },
            {
                name: "Satras Homestay",
                price: "₹2,000",
                rating: 4.8,
                image: "https://images.unsplash.com/photo-1599669454699-248893623440",
                amenities: ["Cultural Shows", "Bicycle Rental", "Local Guide"]
            }
        ],
        travelTips: [
            "Best visited during the dry season (October to March)",
            "Carry cash as ATMs are limited",
            "Book homestays in advance during festivals",
            "Respect local customs and traditions",
            "Try to learn a few basic Assamese phrases"
        ]
    };

    // Dummy data for other tabs
    const employmentData = [
        { label: 'Main Workers', value: '1,200' },
        { label: 'Marginal Workers', value: '300' },
        { label: 'Non-Workers', value: '2,000' },
        { label: 'Cultivators', value: '800' },
        { label: 'Agricultural Labourers', value: '400' },
    ];
    const educationData = [
        { label: 'Primary Schools', value: '5' },
        { label: 'Middle Schools', value: '2' },
        { label: 'Secondary Schools', value: '1' },
        { label: 'Colleges', value: '0' },
    ];
    const healthData = [
        { label: 'Primary Health Centre', value: 'Yes' },
        { label: 'Sub Centre', value: 'No' },
        { label: 'Hospital', value: 'No' },
        { label: 'Nearest Hospital', value: 'Almora (25km)' },
    ];

    // Administrative details for Majuli Island Village
    const adminDetails = [
        { label: 'Tehsil', value: 'Majuli' },
        { label: 'Block', value: 'Majuli' },
        { label: 'Gram Panchayat', value: 'Majuli' },
        { label: 'District', value: 'Majuli' },
        { label: 'Nearest Statutory Town', value: 'Jorhat / 20kms' },
        { label: 'Area', value: '880 sq km' },
    ];

    useEffect(() => {
        // Optimize loading with requestAnimationFrame
        const loadData = () => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    setVillage(dummyVillageData);
                    setLoading(false);
                }, 500);
            });
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="village-view-loading">
                <div className="loading-spinner"></div>
                <p>Loading village details...</p>
            </div>
        );
    }

    if (!village) {
        return (
            <div className="village-view-error">
                <h2>Village not found</h2>
                <Link to="/" className="back-button">
                    <FaArrowLeft /> Back to Home
                </Link>
            </div>
        );
    }

    // Table content for each tab
    const renderTable = () => {
        if (activeTab === 'Population') {
            return (
                <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px'}}>
                    <tbody>
                        <tr><th>State</th><td>{village.state}</td></tr>
                        <tr><th>Region</th><td>{village.region}</td></tr>
                        <tr><th>Type</th><td>{village.type}</td></tr>
                        <tr><th>Population</th><td>{village.population}</td></tr>
                        <tr><th>Area</th><td>{village.area}</td></tr>
                        <tr><th>Languages</th><td>{village.languages.join(', ')}</td></tr>
                        <tr><th>Best Time to Visit</th><td>{village.bestTimeToVisit}</td></tr>
                        <tr><th>Weather (Summer)</th><td>{village.weather.summer}</td></tr>
                        <tr><th>Weather (Winter)</th><td>{village.weather.winter}</td></tr>
                        <tr><th>Weather (Monsoon)</th><td>{village.weather.monsoon}</td></tr>
                        <tr><th>Festivals</th><td>{village.festivals.join(', ')}</td></tr>
                        <tr><th>Popular Attractions</th><td>{village.attractions.length}</td></tr>
                        <tr><th>Local Cuisine Dishes</th><td>{village.localCuisine.length}</td></tr>
                        <tr><th>Homestays</th><td>{village.homestays.length}</td></tr>
                    </tbody>
                </table>
            );
        } else if (activeTab === 'Employment') {
            return (
                <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px'}}>
                    <tbody>
                        {employmentData.map((row, idx) => (
                            <tr key={idx}><th>{row.label}</th><td>{row.value}</td></tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (activeTab === 'Education') {
            return (
                <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px'}}>
                    <tbody>
                        {educationData.map((row, idx) => (
                            <tr key={idx}><th>{row.label}</th><td>{row.value}</td></tr>
                        ))}
                    </tbody>
                </table>
            );
        } else if (activeTab === 'Health') {
            return (
                <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px'}}>
                    <tbody>
                        {healthData.map((row, idx) => (
                            <tr key={idx}><th>{row.label}</th><td>{row.value}</td></tr>
                        ))}
                    </tbody>
                </table>
            );
        }
    };

    // Gallery navigation handlers for 4-image carousel
    const handlePrevGallery = () => {
        setGalleryStart((prev) => (prev - imagesPerRow < 0 ? Math.max(0, village.gallery.length - imagesPerRow) : prev - imagesPerRow));
    };
    const handleNextGallery = () => {
        setGalleryStart((prev) => (prev + imagesPerRow >= village.gallery.length ? 0 : prev + imagesPerRow));
    };

    return (
        <div className="village-view">
            {/* Hero Section */}
            <section className="village-hero">
                <div className="hero-content">
                    <div className="hero-text-content">
                        <h1>{village.name}</h1>
                        <div className="village-meta">
                            <span className="meta-item">
                                <FaMapMarkerAlt />
                                <div className="meta-content">
                                    <span className="meta-label">Location</span>
                                    <span className="meta-value">{village.state}, {village.region}</span>
                                </div>
                            </span>
                            <span className="meta-item">
                                <FaCalendarAlt />
                                <div className="meta-content">
                                    <span className="meta-label">Best Time to Visit</span>
                                    <span className="meta-value">{village.bestTimeToVisit}</span>
                                </div>
                            </span>
                            <span className="meta-item">
                                <FaTemperatureHigh />
                                <div className="meta-content">
                                    <span className="meta-label">Current Weather</span>
                                    <span className="meta-value">{village.weather.summer}</span>
                                </div>
                            </span>
                        </div>
                        <div className="hero-description">
                            <p>
                                Discover the magic of {village.name}, a unique destination in {village.state} that blends natural beauty with vibrant traditions. Experience the world's largest river island, explore ancient monasteries, and immerse yourself in local festivals, art, and cuisine. Perfect for travelers seeking authentic culture and unforgettable landscapes.
                            </p>
                            <div className="hero-highlights">
                                {village.highlights.slice(0, 3).map((highlight, index) => (
                                    <span key={index} className="highlight-tag">
                                        <FaStar /> {highlight}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-image">
                    <img src={village.image} alt={village.name} />
                </div>
            </section>

            {/* Village Information Table (single, clean) with About section above table */}
            <section className="village-info-tables">
                <div className="info-table-container">
                    <h2>Village Information</h2>
                    {/* Administrative Details Section as 2-column, 3-row grid */}
                    <div className="admin-details-section">
                        <h3>Administrative details of {village.name}</h3>
                        <div className="admin-details-grid">
                            {adminDetails.map((item, idx) => (
                                <div className="admin-details-cell" key={idx}>
                                    <span className="admin-label">{item.label}:</span> <span className="admin-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* About description and highlights moved here */}
                    <div className="about-village-desc" style={{marginTop: 24}}>
                        Majuli is the world's largest river island and a hub of Assamese culture. Known for its unique mask-making art, traditional dance forms, and ancient monasteries called Satras, this island village offers an immersive experience into Assam's rich cultural heritage.
                    </div>
                    <div className="about-highlights">
                        <h3>Highlights</h3>
                        <ul className="about-highlights-list">
                            {village.highlights.map((highlight, idx) => (
                                <li key={idx} className="about-highlight-item">{highlight}</li>
                            ))}
                        </ul>
                    </div>
                    {/* Add gap between highlights and table */}
                    <div style={{height: 32}}></div>
                    {/* Tabs for tables */}
                    <div className="info-tabs">
                        {['Population', 'Employment', 'Education', 'Health'].map(tab => (
                            <button
                                key={tab}
                                className={`info-tab-btn${activeTab === tab ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {/* Table for active tab */}
                    <div className="info-tables-grid">
                        <div className="info-table" style={{width: '100%'}}>
                            {renderTable()}
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section - 4 images per row with arrows */}
            <section className="village-gallery-grid-carousel">
                <button className="gallery-arrow left" onClick={handlePrevGallery} aria-label="Previous Images">&#8592;</button>
                <div className="gallery-card-grid-carousel">
                    {village.gallery.slice(galleryStart, galleryStart + imagesPerRow).map((image, idx) => (
                        <div className="gallery-card-large" key={galleryStart + idx}>
                            <img
                                src={image}
                                alt={`${village.name} - ${galleryStart + idx + 1}`}
                                className="gallery-card-image-large"
                            />
                        </div>
                    ))}
                </div>
                <button className="gallery-arrow right" onClick={handleNextGallery} aria-label="Next Images">&#8594;</button>
            </section>

            {/* Attractions Section */}
            <section className="village-attractions">
                <h2>Popular Attractions</h2>
                <div className="attractions-grid">
                    {village.attractions.map((attraction, index) => (
                        <div key={index} className="attraction-card">
                            <div className="attraction-image">
                                <img 
                                    src={attraction.image} 
                                    alt={attraction.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                    }}
                                    onLoad={(e) => {
                                        e.target.classList.add('loaded');
                                    }}
                                />
                            </div>
                            <div className="attraction-content">
                                <h3>{attraction.name}</h3>
                                <p>{attraction.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Local Cuisine Section - Modern Card Layout */}
            <section className="local-cuisine">
                <h2>Local Cuisine</h2>
                <div className="cuisine-grid-modern">
                    {village.localCuisine.map((dish, index) => (
                        <div key={index} className="cuisine-card-modern">
                            <div className="cuisine-image-modern">
                                <img src={dish.image} alt={dish.name} />
                            </div>
                            <div className="cuisine-content-modern">
                                <h3>{dish.name}</h3>
                                <p>{dish.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Homestays Section - Modern Card Layout */}
            <section className="homestays-section">
                <h2>Local Homestays</h2>
                <div className="homestays-grid-modern">
                    {village.homestays.map((homestay, index) => (
                        <div key={index} className="homestay-card-modern">
                            <div className="homestay-image-modern">
                                <img src={homestay.image} alt={homestay.name} />
                            </div>
                            <div className="homestay-content-modern">
                                <h3>{homestay.name}</h3>
                                <div className="homestay-meta-modern">
                                    <span className="price"><FaRupeeSign />{homestay.price}/night</span>
                                    <span className="rating"><FaStar />{homestay.rating}</span>
                                </div>
                                <div className="amenities-modern">
                                    {homestay.amenities.map((amenity, idx) => (
                                        <span key={idx} className="amenity-modern">{amenity}</span>
                                    ))}
                                </div>
                                <button className="book-button-modern">Book Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Travel Tips Section - Modern Card Layout */}
            <section className="travel-tips">
                <h2>Travel Tips</h2>
                <div className="tips-grid-modern">
                    {village.travelTips.map((tip, index) => (
                        <div key={index} className="tip-card-modern">
                            <FaClock className="tip-icon-modern" />
                            <p>{tip}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default VillageView; 