import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DistrictDetail.css';
import DistrictGallery from '../components/DistrictGallery';
import WebStoryViewer from '../components/WebStoryViewer';

const DistrictDetail = () => {
  const { slug } = useParams();
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

  useEffect(() => {
    const fetchDistrict = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/districts/slug/${slug}`);
        setDistrict(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load district details');
        setLoading(false);
      }
    };
    fetchDistrict();
  }, [slug]);

  useEffect(() => {
    if (district && district.id) {
      // Fetch stats
      setStatsLoading(true);
      axios.get(`http://localhost:5000/api/districts/${district.id}/stats`)
        .then(res => {
          setStats(res.data);
          setStatsLoading(false);
        })
        .catch(() => setStatsLoading(false));

      // Fetch web stories - Only state stories
      setWebStoriesLoading(true);
      axios.get(`http://localhost:5000/api/web-stories?district_id=${district.id}&district_type=state`)
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            setWebStories(res.data);
          } else {
            setWebStories([]);
          }
          setWebStoriesLoading(false);
        })
        .catch(err => {
          console.error('Error fetching web stories:', err);
          setWebStoriesLoading(false);
          setWebStories([]);
        });

      // Fetch subdistricts
      setSubdistrictsLoading(true);
      axios.get(`http://localhost:5000/api/subdistricts/district/${district.id}`)
        .then(res => {
          setSubdistricts(res.data);
          setSubdistrictsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching subdistricts:', err);
          setSubdistrictsLoading(false);
        });

      // Fetch seasons
      setSeasonsLoading(true);
      axios.get(`http://localhost:5000/api/seasons/district/${district.id}`)
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
          entity_type: 'district',
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
      axios.get(`http://localhost:5000/api/season-images/season/${selectedSeason.id}`)
        .then(res => {
          setSeasonImages(prev => ({
            ...prev,
            [selectedSeason.id]: res.data
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
    }, 5000); // 5 seconds
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

  // Handler for Load More/Show Less
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!district) return <div className="error">District not found</div>;

  return (
    <div className="district-detail-container">
      <div className="district-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        {/* <h1>{district.name}</h1> */}
      </div>
      <DistrictGallery slug={slug} />
      <div className="district-content">
        <div className="district-info">
          <h2>About {district.name}</h2>
          <p>{district.description}</p>
          
          <div className="stats-and-stories">
            <div className="stats-section">
              {statsLoading ? (
                <div className="loading">Loading stats...</div>
              ) : stats ? (
                <div className="district-stats-table-wrap">
                  <div className="district-stats-table-heading">District Statistics</div>
                  <table className="district-stats-table">
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
              ) : null}
            </div>

            <div className="web-stories-section">
              <div className="web-stories-heading">Web Stories</div>
              {webStoriesLoading ? (
                <div className="loading">Loading stories...</div>
              ) : webStories.length > 0 ? (
                <>
                  <div className="web-stories-grid">
                    {webStories.slice(0, visibleStories).map(story => (
                      <div key={story.id} className="web-story-card">
                        <div className="web-story-image">
                          {story.featured_image ? (
                            <img 
                              src={story.featured_image.startsWith('http') ? story.featured_image : `http://localhost:5000/${story.featured_image}`} 
                              alt={story.title}
                            />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </div>
                        <div className="web-story-content">
                          <h3>{story.title}</h3>
                          <p className="story-description">
                            {story.meta_description.length > 120 
                              ? `${story.meta_description.substring(0, 120)}...` 
                              : story.meta_description}
                          </p>
                          <button 
                            className="read-more-btn"
                            onClick={() => handleStoryClick(story)}
                          >
                            Read Story
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {visibleStories < webStories.length && (
                    <button className="load-more-btn" onClick={handleLoadMore}>
                      Load More
                    </button>
                  )}
                  {visibleStories > 3 && (
                    <button className="show-less-btn" onClick={handleShowLess}>
                      Show Less
                    </button>
                  )}
                </>
              ) : (
                <div className="no-stories">No web stories available for this district.</div>
              )}
            </div>
          </div>

          {/* Subdistricts Section */}
          <div className="subdistricts-section">
            <div className="subdistricts-heading">Subdistricts</div>
            {subdistrictsLoading ? (
              <div className="loading">Loading subdistricts...</div>
            ) : subdistricts.length > 0 ? (
              <div className="subdistricts-grid">
                {subdistricts.map(subdistrict => (
                  <div key={subdistrict.id} className="subdistrict-card" onClick={() => handleSubdistrictClick(subdistrict.slug)}>
                    <div className="subdistrict-image">
                      {subdistrict.featured_image ? (
                        <img 
                          src={subdistrict.featured_image.startsWith('http') ? subdistrict.featured_image : `http://localhost:5000/${subdistrict.featured_image}`} 
                          alt={subdistrict.title}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="subdistrict-content">
                      <h3>{subdistrict.title}</h3>
                      <p className="subdistrict-description">
                        {subdistrict.description && subdistrict.description.length > 100 
                          ? `${subdistrict.description.substring(0, 100)}...` 
                          : subdistrict.description}
                      </p>
                      <button 
                        className="view-subdistrict-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubdistrictClick(subdistrict.slug);
                        }}
                      >
                        View Subdistrict
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-subdistricts">No subdistricts available for this district.</div>
            )}
          </div>

          {/* Add Seasons Section after Subdistricts */}
          <div className="dd-seasons-section">
            <div className="dd-seasons-heading">Seasons of {district.name}</div>
            {seasonsLoading ? (
              <div className="loading">Loading seasons...</div>
            ) : seasons.length > 0 ? (
              <>
                <div className="dd-seasons-tabs">
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
                        className={`dd-season-tab ${selectedSeason?.id === season.id ? 'active' : ''}`}
                        onClick={() => setSelectedSeason(season)}
                      >
                        {emoji} {season.season_name}
                      </button>
                    );
                  })}
                </div>

                {selectedSeason && (
                  <div
                    className="dd-season-images-carousel-wrap"
                    onMouseEnter={() => setIsCarouselHovered(true)}
                    onMouseLeave={() => setIsCarouselHovered(false)}
                  >
                    {seasonImages[selectedSeason.id]?.length > 4 && (
                      <button className="dd-carousel-btn left" onClick={handleCarouselLeft} aria-label="Previous images">&#8592;</button>
                    )}
                    <div className="dd-season-images-grid">
                      {seasonImages[selectedSeason.id] && seasonImages[selectedSeason.id].length > 0 ? (
                        (() => {
                          const images = seasonImages[selectedSeason.id];
                          const N = images.length;
                          if (N <= 4) {
                            return images.map(image => (
                              <div key={image.id} className="dd-season-image-card">
                                <div className="dd-season-image-wrapper">
                                  <img 
                                    src={image.image_url.startsWith('http') ? 
                                      image.image_url : 
                                      `http://localhost:5000/${image.image_url}`} 
                                    alt={image.alt_text || selectedSeason.season_name}
                                  />
                                  <div className="dd-season-image-overlay">
                                    <div className="dd-season-image-location">
                                      {image.location || 'No location specified'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ));
                          } else {
                            // Carousel logic: only show 4 images at a time
                            return [...Array(4)].map((_, i) => {
                              const imgIdx = (carouselIndex + i) % N;
                              const image = images[imgIdx];
                              return (
                                <div key={image.id} className="dd-season-image-card">
                                  <div className="dd-season-image-wrapper">
                                    <img 
                                      src={image.image_url.startsWith('http') ? 
                                        image.image_url : 
                                        `http://localhost:5000/${image.image_url}`} 
                                      alt={image.alt_text || selectedSeason.season_name}
                                    />
                                    <div className="dd-season-image-overlay">
                                      <div className="dd-season-image-location">
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
                        <div className="dd-no-images">No images available for this season.</div>
                      )}
                    </div>
                    {seasonImages[selectedSeason.id]?.length > 4 && (
                      <button className="dd-carousel-btn right" onClick={handleCarouselRight} aria-label="Next images">&#8594;</button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="dd-no-seasons">No seasons available for this district.</div>
            )}
          </div>

          {/* Add Videos Section after Seasons */}
          <div className="dd-videos-section">
            <div className="dd-videos-heading">Videos of {district.name}</div>
            {videosLoading ? (
              <div className="loading">Loading videos...</div>
            ) : videos.length > 0 ? (
              <div className="dd-videos-carousel-wrap">
                {videos.length > 3 && (
                  <button 
                    className="dd-video-carousel-btn left"
                    onClick={() => setVideoIndex(prev => (prev - 3 + videos.length) % videos.length)}
                    aria-label="Previous videos"
                  >
                    &#8592;
                  </button>
                )}
                <div className="dd-videos-grid">
                  {[...Array(3)].map((_, i) => {
                    const currentIndex = (videoIndex + i) % videos.length;
                    const video = videos[currentIndex];
                    return (
                      <div key={video.id} className="dd-video-card">
                        <div className="dd-video-wrapper">
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
                    className="dd-video-carousel-btn right"
                    onClick={() => setVideoIndex(prev => (prev + 3) % videos.length)}
                    aria-label="Next videos"
                  >
                    &#8594;
                  </button>
                )}
              </div>
            ) : (
              <div className="dd-no-videos">No videos available for this district.</div>
            )}
          </div>
        </div>
      </div>

      {storyLoading && (
        <div className="story-loading-overlay">
          <div className="story-loading-spinner">Loading story...</div>
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

export default DistrictDetail; 