import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HotelForm from './HotelForm';
import ManageBookings from './ManageBookings';
import './ManageHotels.css';

const ManageHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [selectedType, setSelectedType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('hotels'); // 'hotels' or 'bookings'
    const [editingHotel, setEditingHotel] = useState(null);

    const accommodationTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'hotel', label: 'Hotel' },
        { value: 'tent', label: 'Tent' },
        { value: 'resort', label: 'Resort' },
        { value: 'homestay', label: 'Homestay' },
        { value: 'hostel', label: 'Hostel' },
        { value: 'guesthouse', label: 'Guesthouse' },
        { value: 'cottage', label: 'Cottage' }
    ];

    useEffect(() => {
        if (activeTab === 'hotels') {
            fetchHotels();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedType === 'all') {
            setHotels(prevHotels => prevHotels);
        } else {
            setHotels(prevHotels => prevHotels.filter(hotel => hotel.accommodation_type === selectedType));
        }
    }, [selectedType]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/hotels`, {
                params: {
                    include_state: true
                }
            });
            
            const hotelsWithState = response.data.map(hotel => ({
                ...hotel,
                state_name: hotel.state_name || 'N/A'
            }));
            setHotels(hotelsWithState);
            setError(null);
        } catch (error) {
            setError('Failed to fetch hotels');
        } finally {
            setLoading(false);
        }
    };

    const handleAddHotel = () => {
        setShowForm(true);
        setEditingHotel(null);
    };

    const handleEditHotel = async (hotel) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/hotels/${hotel.id}`);
            setEditingHotel(response.data);
            setShowForm(true);
        } catch (err) {
            alert('Failed to fetch hotel details. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this hotel?')) {
            try {
                const response = await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/hotels/${id}`);
                if (response.data.message === 'Hotel deleted successfully') {
                    // Show success message
                    alert('Hotel deleted successfully');
                    // Refresh the hotels list
                    fetchHotels();
                } else {
                    throw new Error('Failed to delete hotel');
                }
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting hotel. Please try again.');
            }
        }
    };

    const handleFormSuccess = async (data) => {
        setShowForm(false);
        setEditingHotel(null);
        await fetchHotels(); // Refresh the hotels list
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingHotel(null);
    };

    if (loading && activeTab === 'hotels') return <div className="loading">We Are Working On It...</div>;
    if (error && activeTab === 'hotels') return <div className="error-message">{error}</div>;

    return (
        <div className="manage-hotels-container">
            <div className="tabs">
                <button 
                    className={`tab-button ${activeTab === 'hotels' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hotels')}
                >
                    Hotels
                </button>
                <button 
                    className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Bookings
                </button>
            </div>

            {activeTab === 'hotels' ? (
                <>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">Manage Accommodation</h1>
                            <div className="flex items-center gap-4">
                                <select 
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="type-filter-select"
                                >
                                    {accommodationTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddHotel}
                                    className="add-hotel-btn"
                                >
                                    <i className="fas fa-plus"></i> Add New
                                </button>
                            </div>
                        </div>

                        {showForm ? (
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                <HotelForm
                                    onSuccess={handleFormSuccess}
                                    onCancel={handleFormCancel}
                                    editingHotel={editingHotel}
                                />
                            </div>
                        ) : (
                            <div className="hotels-list">
                                <div className="hotels-table-container">
                                    <table className="hotels-table">
                                        <thead>
                                            <tr>
                                                <th>SR.No</th>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Type</th>
                                                <th>State</th>
                                                <th>Price/Night</th>
                                                <th>Rooms</th>
                                                <th>Rating</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hotels.map((hotel, index) => {
                                                return (
                                                    <tr key={hotel.id}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <div className="hotel-image" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <img 
                                                                    src={hotel.featured_image ? hotel.featured_image : '/placeholder.jpg'} 
                                                                    alt={hotel.name}
                                                                    className="hotel-thumbnail hotel-featured-image"
                                                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = '/placeholder.jpg';
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td>{hotel.name}</td>
                                                        <td>
                                                            <span className={`hotel-type ${hotel.accommodation_type}`}>
                                                                {hotel.accommodation_type.charAt(0).toUpperCase() + hotel.accommodation_type.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td>{hotel.state_name || 'N/A'}</td>
                                                        <td>₹{hotel.price_per_night}</td>
                                                        <td>
                                                            {hotel.available_rooms}/{hotel.total_rooms}
                                                        </td>
                                                        <td>
                                                            <div className="star-rating">
                                                                {hotel.star_rating} ★
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button 
                                                                    onClick={() => handleEditHotel(hotel)}
                                                                    className="edit-btn"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(hotel.id)}
                                                                    className="delete-btn"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <ManageBookings />
            )}
        </div>
    );
};

export default ManageHotels;
