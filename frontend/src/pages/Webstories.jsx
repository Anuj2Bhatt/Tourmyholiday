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

  const openStory = (story) => {
    setSelectedStory(story);
    document.body.style.overflow = 'hidden';
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
          {stories.map(story => (
            <div 
              key={story.id} 
              className="story-card"
              onClick={() => openStory(story)}
            >
              <div className="story-image">
                <img src={story.featured_image} alt={story.title} />
                <div className="story-title-overlay">
                  <h3>{story.title}</h3>
                  <div className="view-story-button">View Story</div>
                </div>
              </div>
            </div>
          ))}
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