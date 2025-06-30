import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WebStories.css';
import StoryViewer from '../components/StoryViewer';

const WebStories = () => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-stories');
      setStories(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch stories');
      setLoading(false);
    }
  };

  const openStory = async (story) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/web-stories/${story.id}`);
      const completeStory = response.data;

      if (!completeStory.images || !Array.isArray(completeStory.images)) {
        return;
      }

      if (completeStory.images.length === 0) {
        return;
      }

      const transformedStory = {
        ...completeStory,
        pages: completeStory.images.map(image => {
          if (!image.image_url) {
            return null;
          }
          return {
            image: image.image_url,
            title: image.description || completeStory.title,
            description: image.description || ''
          };
        }).filter(Boolean) 
      };

      if (!transformedStory.pages || transformedStory.pages.length === 0) {
        return;
      }

      setSelectedStory(transformedStory);
    document.body.style.overflow = 'hidden';
    } catch (err) {
      setError('Failed to open story');
    }
  };

  const closeStory = () => {
    setSelectedStory(null);
    document.body.style.overflow = 'auto';
  };

  if (loading) return <div className="loading">Loading stories...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="webstories-container">
      <div className="webstories-header">
        <h1>Travel Web Stories</h1>
        <p>Experience immersive visual stories about incredible Indian destinations</p>
      </div>

      <div className="trending-stories">
        <h2>Trending Stories</h2>
        <div className="stories-grid">
          {stories.map(story => {   
            const imageUrl = story.images && story.images.length > 0 
              ? story.images[0].image_url
              : story.featured_image 
                ? (story.featured_image.startsWith('http') 
                  ? story.featured_image 
                  : `http://localhost:5000/${story.featured_image}`)
                : 'https://via.placeholder.com/400x600?text=No+Image';

            return (
              <div key={story.id} className="story-card" onClick={() => openStory(story)}>
              <div className="story-image">
                  <img 
                    src={imageUrl} 
                    alt={story.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
                    }}
                  />
                </div>
                <div className="story-title-overlay">
                  <h3>{story.title}</h3>
                  <div className="view-story-button">View Story</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedStory && (
        <StoryViewer 
          story={selectedStory} 
          onClose={closeStory} 
        />
      )}
    </div>
  );
};

export default WebStories; 