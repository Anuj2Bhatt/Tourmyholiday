import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Amenities.css';

const Amenities = () => {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchAmenities();
    }, []);

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/amenities`);
            setAmenities(response.data);
            setError(null);
        } catch (error) {
            setError('Failed to load amenities. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingAmenity(null);
        setFormData({ name: '', description: '' });
        setShowModal(true);
    };

    const handleEditClick = (amenity) => {
        if (amenity.name.toLowerCase() === 'bonfire') {
            alert('Bonfire amenity cannot be edited as it is a default amenity.');
            return;
        }

        setEditingAmenity(amenity);
        setFormData({
            name: amenity.name,
            description: amenity.description
        });
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        const amenityToDelete = amenities.find(a => a.id === id);
        if (amenityToDelete && amenityToDelete.name.toLowerCase() === 'bonfire') {
            alert('Bonfire amenity cannot be deleted as it is a default amenity.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this amenity?')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/amenities/${id}`);
                fetchAmenities();
            } catch (error) {
                setError('Failed to delete amenity. Please try again.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAmenity) {
                await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/amenities/${editingAmenity.id}`, formData);
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/amenities`, formData);
            }
            setShowModal(false);
            fetchAmenities();
        } catch (error) {
            setError('Failed to save amenity. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) return <div className="loading">Loading amenities...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="amenities-container">
            <div className="amenities-header">
                <h2>Manage Amenities</h2>
                <button onClick={handleAddClick} className="add-amenity-btn">
                    Add New Amenity
                </button>
            </div>

            <div className="amenities-grid">
                {amenities.map(amenity => (
                    <div key={amenity.id} className={`amenity-card ${amenity.name.toLowerCase() === 'bonfire' ? 'default-amenity' : ''}`}>
                        <div className="amenity-name">
                            {amenity.name}
                            {amenity.name.toLowerCase() === 'bonfire' && <span className="default-badge">Default</span>}
                        </div>
                        <div className="amenity-description">{amenity.description}</div>
                        <div className="amenity-actions">
                            {amenity.name.toLowerCase() !== 'bonfire' && (
                                <>
                                    <button
                                        onClick={() => handleEditClick(amenity)}
                                        className="edit-btn"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(amenity.id)}
                                        className="delete-btn"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}</h3>
                            <button onClick={() => setShowModal(false)} className="close-btn">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingAmenity ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Amenities; 