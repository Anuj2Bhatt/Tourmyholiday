import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SeasonalPlaces.css';

const seasons = [
  { id: 'winter', name: 'Winter', icon: '❄️' },
  { id: 'summer', name: 'Summer', icon: '☀️' },
  { id: 'autumn', name: 'Autumn', icon: '🍂' },
  { id: 'spring', name: 'Spring', icon: '🌸' }
];

const VISIBLE_COUNT = 4;

const SeasonalPlaces = ({ stateId, stateName }) => {
  const [activeSeason, setActiveSeason] = useState('winter');
  const [seasonImages, setSeasonImages] = useState({
    winter: [],
    summer: [],
    autumn: [],
    spring: []
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const autoAdvanceRef = useRef();

  // Fetch images
  useEffect(() => {
    if (!stateId) return;
    setLoading(true);
    const fetchAllSeasons = async () => {
      const imagesBySeason = {};
      for (const season of seasons.map(s => s.id)) {
        try {
          const res = await axios.get(`http://localhost:5000/api/state-season-images/${stateId}/${season}`);
          imagesBySeason[season] = res.data.map(img => ({
            id: img.id,
            image: img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`,
            location: img.location || ''
          }));
        } catch (err) {
          imagesBySeason[season] = [];
        }
      }
      setSeasonImages(imagesBySeason);
      setLoading(false);
    };
    fetchAllSeasons();
  }, [stateId]);

  // Extract active season images length for useEffect dependency
  const activeSeasonImagesLength = seasonImages[activeSeason]?.length;

  // Reset page when season or images change
  useEffect(() => {
    setPage(0);
  }, [activeSeason, activeSeasonImagesLength]);

  // Auto-advance every 5 seconds if more than 4 images
  useEffect(() => {
    const images = seasonImages[activeSeason] || [];
    if (images.length <= VISIBLE_COUNT) return;
    autoAdvanceRef.current = setInterval(() => {
      setPage(prev => {
        const maxPage = Math.ceil(images.length / VISIBLE_COUNT) - 1;
        return prev === maxPage ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(autoAdvanceRef.current);
  }, [activeSeason, seasonImages]);

  // Get images for current page, always return 4 (repeat if needed)
  const getPageImages = () => {
    const images = seasonImages[activeSeason] || [];
    const start = page * VISIBLE_COUNT;
    let pageImages = images.slice(start, start + VISIBLE_COUNT);
    if (pageImages.length < VISIBLE_COUNT && images.length > 0) {
      // Repeat images to fill 4 slots
      let i = 0;
      while (pageImages.length < VISIBLE_COUNT) {
        pageImages.push(images[i % images.length]);
        i++;
      }
    }
    return pageImages;
  };

  // Navigation
  const images = seasonImages[activeSeason] || [];
  const maxPage = Math.ceil(images.length / VISIBLE_COUNT) - 1;
  const showArrows = images.length > VISIBLE_COUNT;

  return (
    <div className="seasons-section">
      <h2 className="seasons-title">Seasons of {stateName || 'Uttarakhand'}</h2>
      <div className="seasons-tabs">
        {seasons.map((season) => (
          <button
            key={season.id}
            className={`season-tab ${activeSeason === season.id ? 'active' : ''}`}
            onClick={() => setActiveSeason(season.id)}
          >
            <span>{season.icon} {season.name}</span>
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading images...</div>
      ) : (
        seasons.map((season) => (
          <div
            key={season.id}
            className={`season-content ${activeSeason === season.id ? 'active' : ''}`}
          >
            <div className="season-slider-wrapper">
              {showArrows && (
                <button
                  className="season-slider-arrow prev"
                  onClick={() => setPage(page === 0 ? maxPage : page - 1)}
                  aria-label="Previous"
                >
                  &#8592;
                </button>
              )}
              <div className="season-images">
                {getPageImages().length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', width: '100%' }}>No images for this season.</div>
                ) : (
                  getPageImages().map((place, idx) => (
                    <div key={place.id || idx} className="season-image-card">
                      <img src={place.image} alt={place.location || 'Season image'} />
                      <div className="season-image-overlay">
                        <div className="season-image-title">{place.location || 'Unknown Location'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {showArrows && (
                <button
                  className="season-slider-arrow next"
                  onClick={() => setPage(page === maxPage ? 0 : page + 1)}
                  aria-label="Next"
                >
                  &#8594;
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SeasonalPlaces; 