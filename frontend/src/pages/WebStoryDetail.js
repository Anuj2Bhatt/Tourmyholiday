import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import WebStoryInteraction from '../components/WebStoryInteraction';
import './WebStoryDetail.css';

const WebStoryDetail = () => {
    const { slug } = useParams();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        // Get user email from localStorage or your auth system
        const email = localStorage.getItem('userEmail');
        setUserEmail(email);

        const fetchStory = async () => {
            try {
                const response = await axios.get(`/api/web-stories/${slug}`);
                setStory(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load web story');
                setLoading(false);
            }
        };

        fetchStory();
    }, [slug]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!story) return <div className="error">Story not found</div>;

    return (
        <div className="web-story-detail">
            <div className="story-header">
                <h1>{story.title}</h1>
                <div className="story-meta">
                    <span className="story-date">
                        {new Date(story.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="story-content">
                <div className="story-image">
                    <img src={story.image_url} alt={story.alt_text} />
                </div>
                <div className="story-description">
                    <p>{story.description}</p>
                </div>
            </div>

            <WebStoryInteraction 
                storyId={story.id} 
                userEmail={userEmail}
            />

            {/* Add schema.org markup for Google Web Stories */}
            <script type="application/ld+json">
                {JSON.stringify(story.schema_json)}
            </script>
        </div>
    );
};

export default WebStoryDetail; 