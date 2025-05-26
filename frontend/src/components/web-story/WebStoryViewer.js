import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaComment, FaShare, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './WebStoryViewer.css';

const WebStoryViewer = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchStory();
    }, [slug]);

    const fetchStory = async () => {
        try {
            const response = await axios.get(`/api/web-stories/${slug}`);
            setStory(response.data);
            setLikes(response.data.likes || 0);
            fetchComments();
            setLoading(false);
        } catch (error) {
            console.error('Error fetching story:', error);
            setError('Failed to fetch web story');
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/web-stories/${slug}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleLike = async () => {
        try {
            await axios.post(`/api/web-stories/${slug}/like`);
            setLiked(!liked);
            setLikes(prev => liked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error('Error liking story:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await axios.post(`/api/web-stories/${slug}/comments`, {
                content: newComment
            });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: story.title,
                text: story.description,
                url: window.location.href
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleNext = () => {
        if (currentPage < story.images.length - 1) {
            setCurrentPage(prev => prev + 1);
        } else {
            // Navigate to next story or close
            navigate(-1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    if (loading) return <div className="loading">Loading story...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!story) return <div className="error">Story not found</div>;

    return (
        <div className="web-story-viewer">
            <div className="story-progress">
                {story.images.map((_, index) => (
                    <div 
                        key={index}
                        className={`progress-bar ${index === currentPage ? 'active' : ''}`}
                    />
                ))}
            </div>

            <div className="story-content">
                <img 
                    src={story.images[currentPage].image_path} 
                    alt={story.images[currentPage].alt_text}
                />
                <div className="story-text">
                    <h2>{story.title}</h2>
                    <p>{story.images[currentPage].description}</p>
                </div>
            </div>

            <div className="story-controls">
                <button className="nav-btn prev" onClick={handlePrevious}>
                    <FaArrowLeft />
                </button>
                <div className="interaction-buttons">
                    <button 
                        className={`like-btn ${liked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        <FaHeart /> {likes}
                    </button>
                    <button 
                        className="comment-btn"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <FaComment />
                    </button>
                    <button className="share-btn" onClick={handleShare}>
                        <FaShare />
                    </button>
                </div>
                <button className="nav-btn next" onClick={handleNext}>
                    <FaArrowRight />
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    <h3>Comments</h3>
                    <form onSubmit={handleComment}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        <button type="submit">Post</button>
                    </form>
                    <div className="comments-list">
                        {comments.map(comment => (
                            <div key={comment.id} className="comment">
                                <strong>{comment.user_name}</strong>
                                <p>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebStoryViewer; 