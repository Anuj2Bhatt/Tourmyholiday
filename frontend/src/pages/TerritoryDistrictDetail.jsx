import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TerritoryDistrictDetail.css';
import TerritoryDistrictGallery from '../components/TerritoryDistrictGallery';
import WebStoryViewer from '../components/WebStoryViewer';

const TerritoryDistrictDetail = ({ slug: propSlug }) => {
  const { slug: urlSlug } = useParams();
  const slug = propSlug || urlSlug;
  const navigate = useNavigate();
  const [district, setDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [webStories, setWebStories] = useState([]);
  const [webStoriesLoading, setWebStoriesLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [visibleStories, setVisibleStories] = useState(3);
  const [subdistricts, setSubdistricts] = useState([]);
  const [subdistrictsLoading, setSubdistrictsLoading] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonImages, setSeasonImages] = useState({});
  const [seasonsLoading, setSeasonsLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);  
  const [videoIndex, setVideoIndex] = useState(0);
  const [districtImages, setDistrictImages] = useState([]);
  const [districtImagesLoading, setDistrictImagesLoading] = useState(false);
  useEffect(() => {
    const fetchDistrict = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/territory-districts/slug/${slug}`);
        if (!response.data) {
          throw new Error("No district data received");
        }
        const districtData = response.data;
        setDistrict(districtData);
        
        // Fetch district images immediately after getting district data
        setDistrictImagesLoading(true);
        try {
          const imagesResponse = await axios.get(`http://localhost:5000/api/territory-district-images/district/${districtData.id}/images`);
          if (imagesResponse.data) {
            // Transform image URLs to include full path if needed
            const imagesWithFullUrls = imagesResponse.data.map(image => ({
              ...image,
              image_url: image.image_url.startsWith('http') ? 
                image.image_url : 
                `http://localhost:5000${image.image_url}`
            }));
            setDistrictImages(imagesWithFullUrls);
          }
        } catch (err) {
          console.error('Error fetching district images:', err);
          setError('Failed to load district images');
        } finally {
          setDistrictImagesLoading(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching district:", err);
        setError(err.message || "Failed to load district details");
        setLoading(false);
      }
    };
    fetchDistrict();
  }, [slug]);

  useEffect(() => {
    if (district && district.id) {
      // Fetch stats
      setStatsLoading(true);
      axios.get(`http://localhost:5000/api/territory-district-stats/district/${district.id}`)
        .then(res => {
          setStats(res.data);
          setStatsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching district stats:', err);
          setStatsLoading(false);
        });

      // Fetch web stories
      setWebStoriesLoading(true);
      axios.get(`http://localhost:5000/api/territory-web-stories/territory/${district.territory_id}`)
        .then(res => {
          setWebStories(res.data);
          setWebStoriesLoading(false);
        })
        .catch(err => {
          console.error('Error fetching web stories:', err);
          setWebStoriesLoading(false);
        });

      // Update subdistricts fetching to use territory-subdistricts endpoint
      setSubdistrictsLoading(true);
      axios.get(`http://localhost:5000/api/territory-subdistricts/district/${district.id}`)
        .then(res => {
          // Transform image URLs to include full path if needed
          const subdistrictsWithFullUrls = res.data.map(subdistrict => ({
            ...subdistrict,
            featured_image: subdistrict.featured_image ? 
              (subdistrict.featured_image.startsWith('http') ? 
                subdistrict.featured_image : 
                `http://localhost:5000/${subdistrict.featured_image}`) : 
              null
          }));
          setSubdistricts(subdistrictsWithFullUrls);
          setSubdistrictsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching subdistricts:', err);
          setSubdistrictsLoading(false);
        });

      // Fetch seasons
      setSeasonsLoading(true);
      axios.get(`http://localhost:5000/api/territory-seasons/district/${district.id}`)
        .then(res => {
          setSeasons(res.data);
          if (res.data.length > 0) {
            setSelectedSeason(res.data[0]);
          }
          setSeasonsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching seasons:', err);
          setSeasonsLoading(false);
        });

      // Fetch videos
      setVideosLoading(true);
      axios.get(`http://localhost:5000/api/videos`, {
        params: {
          entity_type: 'territory_district',
          entity_id: district.id
        }
      })
      .then(res => {
        setVideos(res.data);
        setVideosLoading(false);
      })
      .catch(err => {
        console.error('Error fetching videos:', err);
        setVideosLoading(false);
      });
    }
  }, [district]);

  useEffect(() => {
    if (selectedSeason) {
      // Update endpoint to use territory season images
      axios.get(`http://localhost:5000/api/territory-season-images/season/${selectedSeason.id}`)
        .then(res => {
          setSeasonImages(prev => ({
            ...prev,
            [selectedSeason.id]: res.data.map(img => ({
              ...img,
              image_url: img.image_url.startsWith('http') ? 
                img.image_url : 
                `http://localhost:5000/${img.image_url}`
            }))
          }));
        })
        .catch(err => {
          console.error('Error fetching season images:', err);
        });
    }
  }, [selectedSeason]);

  useEffect(() => {
    if (!seasonImages[selectedSeason?.id] || seasonImages[selectedSeason.id].length <= 4) return;
    if (isCarouselHovered) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => {
        const N = seasonImages[selectedSeason.id].length;
        return (prev + 1) % N;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedSeason, seasonImages, isCarouselHovered]);

  const handleStoryClick = async (story) => {
    setStoryLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/web-stories/${story.id}`);
      setSelectedStory(response.data);
    } catch (err) {
      console.error('Error fetching story details:', err);
    } finally {
      setStoryLoading(false);
    }
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
  };

  const handleLoadMore = () => {
    setVisibleStories(prev => Math.min(prev + 3, webStories.length));
  };

  const handleShowLess = () => {
    setVisibleStories(3);
  };

  const handleSubdistrictClick = (subdistrictSlug) => {
    navigate(`/subdistrict-detail/${subdistrictSlug}`);
  };

  const handleCarouselLeft = () => {
    setCarouselIndex((carouselIndex - 1 + seasonImages[selectedSeason.id].length) % seasonImages[selectedSeason.id].length);
  };

  const handleCarouselRight = () => {
    setCarouselIndex((carouselIndex + 1) % seasonImages[selectedSeason.id].length);
  };

  if (loading) return <div className="tdd-loading">Loading district details...</div>;
  if (error) return <div className="tdd-error">{error}</div>;
  if (!district) return <div className="tdd-error">District not found</div>;

  return (
    <div className="tdd-container" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: propSlug ? '0' : '1rem' }}>
      {!propSlug && (
        <div className="tdd-header">
          <button className="tdd-back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      )}
      <TerritoryDistrictGallery 
        images={districtImages} 
        loading={districtImagesLoading} 
        error={error}
      />
      <div className="tdd-content" style={{ padding: propSlug ? '1rem' : '2rem' }}>
        <div className="tdd-info">
          <h2>{district.name}</h2>
          <p>{district.description}</p>
          
          {/* Stats and Web Stories Section */}
          <div className="tdd-stats-stories-container">
            {/* Stats Section */}
            <div className="tdd-stats-section">
              {statsLoading ? (
                <div className="tdd-loading">Loading stats...</div>
              ) : stats ? (
                <div className="tdd-stats-table-wrap">
                  <h4 className="tdd-stats-table-heading">District Statistics</h4>
                  <table className="tdd-stats-table">
                    <tbody>
                      <tr><th>Population</th><td>{stats.population}</td></tr>
                      <tr><th>Males</th><td>{stats.males}</td></tr>
                      <tr><th>Females</th><td>{stats.females}</td></tr>
                      <tr><th>Literacy</th><td>{stats.literacy}</td></tr>
                      <tr><th>Households</th><td>{stats.households}</td></tr>
                      <tr><th>Adults</th><td>{stats.adults}</td></tr>
                      <tr><th>Children</th><td>{stats.children}</td></tr>
                      <tr><th>Old</th><td>{stats.old}</td></tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="tdd-no-stats">No statistics available for this district.</div>
              )}
            </div>

            {/* Web Stories Section */}
            <div className="tdd-web-stories-dashboard">
              <h3 className="tdd-web-stories-heading">Web Stories</h3>
              {webStoriesLoading ? (
                <div className="tdd-loading">Loading stories...</div>
              ) : webStories.length > 0 ? (
                <div className="tdd-web-stories-dashboard-grid">
                  {webStories.map(story => (
                    <div key={story.id} className="tdd-web-stories-dashboard-card">
                      <div className="tdd-web-stories-dashboard-image-wrap">
                        {story.featured_image ? (
                          <img
                            src={story.featured_image.startsWith('http') ? story.featured_image : `http://localhost:5000/${story.featured_image}`}
                            alt={story.title}
                            className="tdd-web-stories-dashboard-image"
                          />
                        ) : (
                          <div className="tdd-no-image">No Image</div>
                        )}
                      </div>
                      <div className="tdd-web-stories-dashboard-caption">
                        <div className="tdd-web-stories-dashboard-title" style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.25rem', margin: '1rem 0 0.5rem 0' }}>{story.title}</div>
                        <div className="tdd-web-stories-dashboard-desc" style={{ textAlign: 'center', color: '#555', minHeight: '48px', marginBottom: '1.2rem' }}>
                          {story.meta_description.length > 120
                            ? `${story.meta_description.substring(0, 120)}...`
                            : story.meta_description}
                        </div>
                        <button className="tdd-read-more-btn" style={{ width: '90%', margin: '0 auto', display: 'block', background: '#3498ff', color: '#fff', fontWeight: 700, fontSize: '1.1rem', borderRadius: '10px', padding: '0.8rem 0', border: 'none', cursor: 'pointer', letterSpacing: '0.02em' }} onClick={() => handleStoryClick(story)}>
                          READ STORY &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tdd-no-stories">No web stories available for this district.</div>
              )}
              {/* Modal placeholder for dashboard view on card click */}
              {/* TODO: Implement modal/dashboard view here */}
            </div>
          </div>

          {/* Subdistricts Section */}
          <div className="tdd-subdistricts-section">
            <h2 className="tdd-subdistricts-heading">Explore Subdistricts</h2>
            {subdistrictsLoading ? (
              <div className="tdd-loading">Loading subdistricts...</div>
            ) : subdistricts.length > 0 ? (
              <div className="tdd-subdistricts-grid">
                {subdistricts.map(subdistrict => (
                  <div key={subdistrict.id} className="tdd-subdistrict-card" onClick={() => handleSubdistrictClick(subdistrict.slug)}>
                    <div className="tdd-subdistrict-image-container">
                      {subdistrict.featured_image ? (
                        <img 
                          src={subdistrict.featured_image.startsWith('http') ? subdistrict.featured_image : `http://localhost:5000/${subdistrict.featured_image}`}
                          alt={subdistrict.title}
                          className="tdd-subdistrict-image"
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image failed to load:', subdistrict.featured_image);
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      ) : (
                        <div className="tdd-no-image">
                          <span className="tdd-no-image-icon">🏞️</span>
                          <span className="tdd-no-image-text">No Image Available</span>
                        </div>
                      )}
                      <div className="tdd-subdistrict-overlay">
                        <button 
                          className="tdd-view-subdistrict-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubdistrictClick(subdistrict.slug);
                          }}
                        >
                          Explore Now
                        </button>
                      </div>
                    </div>
                    <div className="tdd-subdistrict-content">
                      <h3 className="tdd-subdistrict-title">{subdistrict.title}</h3>
                      <p className="tdd-subdistrict-description">
                        {subdistrict.description ? (
                          subdistrict.description.length > 120 
                            ? `${subdistrict.description.substring(0, 120)}...` 
                            : subdistrict.description
                        ) : (
                          <span className="tdd-no-description">No description available</span>
                        )}
                      </p>
                      <div className="tdd-subdistrict-footer">
                        <span className="tdd-subdistrict-status">
                          {subdistrict.status === 'publish' ? 'Published' : 'Draft'}
                        </span>
                        <button 
                          className="tdd-read-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubdistrictClick(subdistrict.slug);
                          }}
                        >
                          Read More →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tdd-no-subdistricts">
                <div className="tdd-no-subdistricts-icon">🏘️</div>
                <p>No subdistricts available for this district.</p>
                <p className="tdd-no-subdistricts-subtext">Check back later for updates!</p>
              </div>
            )}
          </div>

          {/* Seasons Section */}
          <div className="tdd-seasons-section">
            <h2 className="tdd-seasons-heading">Seasons of {district.name}</h2>
            {seasonsLoading ? (
              <div className="tdd-loading">Loading seasons...</div>
            ) : seasons.length > 0 ? (
              <>
                <div className="tdd-seasons-tabs">
                  {seasons.map(season => {
                    let emoji = '';
                    if (season.season_name.toLowerCase().includes('summer')) emoji = '☀️';
                    else if (season.season_name.toLowerCase().includes('winter')) emoji = '❄️';
                    else if (season.season_name.toLowerCase().includes('monsoon')) emoji = '🌧️';
                    else if (season.season_name.toLowerCase().includes('spring')) emoji = '🌸';
                    else if (season.season_name.toLowerCase().includes('autumn')) emoji = '🍂';
                    return (
                      <button
                        type="button"
                        key={season.id}
                        className={`tdd-season-tab ${selectedSeason?.id === season.id ? 'active' : ''}`}
                        onClick={() => setSelectedSeason(season)}
                      >
                        {emoji} {season.season_name}
                      </button>
                    );
                  })}
                </div>

                {selectedSeason && (
                  <div
                    className="tdd-season-images-carousel-wrap"
                    onMouseEnter={() => setIsCarouselHovered(true)}
                    onMouseLeave={() => setIsCarouselHovered(false)}
                  >
                    {seasonImages[selectedSeason.id]?.length > 4 && (
                      <button className="tdd-carousel-btn left" onClick={handleCarouselLeft} aria-label="Previous images">&#8592;</button>
                    )}
                    <div className="tdd-season-images-grid">
                      {seasonImages[selectedSeason.id] && seasonImages[selectedSeason.id].length > 0 ? (
                        (() => {
                          const images = seasonImages[selectedSeason.id];
                          const N = images.length;
                          if (N <= 4) {
                            return images.map(image => (
                              <div key={image.id} className="tdd-season-image-card">
                                <div className="tdd-season-image-wrapper">
                                  <img 
                                    src={image.image_url.startsWith('http') ? 
                                      image.image_url : 
                                      `http://localhost:5000/${image.image_url}`} 
                                    alt={image.alt_text || selectedSeason.season_name}
                                  />
                                  <div className="tdd-season-image-overlay">
                                    <div className="tdd-season-image-location">
                                      {image.location || 'No location specified'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ));
                          } else {
                            return [...Array(4)].map((_, i) => {
                              const imgIdx = (carouselIndex + i) % N;
                              const image = images[imgIdx];
                              return (
                                <div key={image.id} className="tdd-season-image-card">
                                  <div className="tdd-season-image-wrapper">
                                    <img 
                                      src={image.image_url.startsWith('http') ? 
                                        image.image_url : 
                                        `http://localhost:5000/${image.image_url}`} 
                                      alt={image.alt_text || selectedSeason.season_name}
                                    />
                                    <div className="tdd-season-image-overlay">
                                      <div className="tdd-season-image-location">
                                        {image.location || 'No location specified'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          }
                        })()
                      ) : (
                        <div className="tdd-no-images">No images available for this season.</div>
                      )}
                    </div>
                    {seasonImages[selectedSeason.id]?.length > 4 && (
                      <button className="tdd-carousel-btn right" onClick={handleCarouselRight} aria-label="Next images">&#8594;</button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="tdd-no-seasons">No seasons available for this district.</div>
            )}
          </div>

          {/* Videos Section */}
          <div className="tdd-videos-section">
            <h2 className="tdd-videos-heading">Videos of {district.name}</h2>
            {videosLoading ? (
              <div className="tdd-loading">Loading videos...</div>
            ) : videos.length > 0 ? (
              <div className="tdd-videos-carousel-wrap">
                {videos.length > 3 && (
                  <button 
                    className="tdd-video-carousel-btn left"
                    onClick={() => setVideoIndex(prev => (prev - 3 + videos.length) % videos.length)}
                    aria-label="Previous videos"
                  >
                    &#8592;
                  </button>
                )}
                <div className="tdd-videos-grid">
                  {[...Array(3)].map((_, i) => {
                    const currentIndex = (videoIndex + i) % videos.length;
                    const video = videos[currentIndex];
                    return (
                      <div key={video.id} className="tdd-video-card">
                        <div className="tdd-video-wrapper">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${video.youtube_id}`}
                            title={video.title || 'District Video'}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {videos.length > 3 && (
                  <button 
                    className="tdd-video-carousel-btn right"
                    onClick={() => setVideoIndex(prev => (prev + 3) % videos.length)}
                    aria-label="Next videos"
                  >
                    &#8594;
                  </button>
                )}
              </div>
            ) : (
              <div className="tdd-no-videos">No videos available for this district.</div>
            )}
          </div>
        </div>
      </div>

      {storyLoading && (
        <div className="tdd-story-loading-overlay">
          <div className="tdd-story-loading-spinner">Loading story...</div>
        </div>
      )}
      
      {selectedStory && !storyLoading && (
        <WebStoryViewer 
          story={selectedStory} 
          onClose={handleCloseStory}
        />
      )}
    </div>
  );
};

export default TerritoryDistrictDetail; 