import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare } from 'react-icons/fa';
import axios from 'axios';
import './WebStoryInteraction.css';

const WebStoryInteraction = ({ storyId, userEmail }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (userEmail) {
            fetchLikeStatus();
        }
        fetchLikesCount();
        fetchComments();
        fetchShareUrl();
    }, [storyId, userEmail]);

    const fetchLikeStatus = async () => {
        try {
            const response = await axios.get(`/api/web-stories/${storyId}/like-status?userEmail=${userEmail}`);
            setLiked(response.data.liked);
        } catch (error) {
            }
    };

    const fetchLikesCount = async () => {
        try {
            const response = await axios.get(`/api/web-stories/${storyId}/likes`);
            setLikesCount(response.data.likes);
        } catch (error) {
            }
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/web-stories/${storyId}/comments`);
            setComments(response.data);
        } catch (error) {
            }
    };

    const fetchShareUrl = async () => {
        try {
            const response = await axios.get(`/api/web-stories/${storyId}/share-url`);
            setShareUrl(response.data.shareUrl);
        } catch (error) {
            }
    };

    const handleLike = async () => {
        if (!userEmail) {
            alert('Please sign in to like this story');
            return;
        }

        try {
            const response = await axios.post(`/api/web-stories/${storyId}/like`, { userEmail });
            setLiked(response.data.liked);
            fetchLikesCount();
        } catch (error) {
            }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!userEmail) {
            alert('Please sign in to comment');
            return;
        }

        if (!newComment.trim()) return;

        try {
            await axios.post(`/api/web-stories/${storyId}/comments`, {
                userEmail,
                comment: newComment
            });
            setNewComment('');
            fetchComments();
        } catch (error) {
            }
    };

    const handleShare = async () => {
        if (shareUrl) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Share link copied to clipboard!');
            } catch (error) {
                }
        }
    };

    return (
        <div className="web-story-interaction">
            <div className="interaction-buttons">
                <button 
                    className={`like-button ${liked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {liked ? <FaHeart /> : <FaRegHeart />}
                    <span>{likesCount}</span>
                </button>

                <button 
                    className="comment-button"
                    onClick={() => setShowComments(!showComments)}
                >
                    <FaComment />
                    <span>{comments.length}</span>
                </button>

                <button 
                    className="share-button"
                    onClick={handleShare}
                >
                    <FaShare />
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    <form onSubmit={handleComment} className="comment-form">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="comment-input"
                        />
                        <button type="submit" className="comment-submit">
                            Post
                        </button>
                    </form>

                    <div className="comments-list">
                        {comments.map((comment) => (
                            <div key={comment.id} className="comment">
                                <div className="comment-header">
                                    <span className="comment-user">{comment.user_email}</span>
                                    <span className="comment-date">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="comment-text">{comment.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebStoryInteraction; 