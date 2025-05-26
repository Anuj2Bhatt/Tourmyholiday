import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './ManageBookings.css';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedHotel, setSelectedHotel] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        fetchBookings();
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/hotels');
            if (response.data) {
                setHotels(response.data);
            }
        } catch (error) {
            console.error('Error fetching hotels:', error);
            setError('Failed to load hotels. Please try again later.');
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            let url = 'http://localhost:5000/api/room-bookings';
            
            // Add filters if selected
            if (selectedHotel) {
                url = `http://localhost:5000/api/room-bookings/hotel/${selectedHotel}`;
            } else if (dateRange.startDate && dateRange.endDate) {
                url = `http://localhost:5000/api/room-bookings/date-range?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`;
            }

            const response = await axios.get(url);
            if (response.data) {
                setBookings(response.data);
            } else {
                setBookings([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            if (error.response) {
                setError(`Error: ${error.response.data.message || 'Failed to fetch bookings'}`);
            } else if (error.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('Error setting up the request. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            setError(null);
            const response = await axios.put(`http://localhost:5000/api/room-bookings/${bookingId}/status`, {
                booking_status: newStatus,
                payment_status: newStatus === 'confirmed' ? 'paid' : 'pending'
            });
            if (response.data) {
                fetchBookings(); // Refresh the list
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError('Failed to update booking status. Please try again.');
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            setError(null);
            const response = await axios.put(`http://localhost:5000/api/room-bookings/${bookingId}/cancel`);
            if (response.data) {
                fetchBookings(); // Refresh the list
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            setError('Failed to cancel booking. Please try again.');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'hotel') {
            setSelectedHotel(value);
            setDateRange({ startDate: '', endDate: '' });
        } else {
            setDateRange(prev => ({
                ...prev,
                [name]: value
            }));
            setSelectedHotel('');
        }
    };

    const applyFilters = () => {
        fetchBookings();
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'status-confirmed';
            case 'pending':
                return 'status-pending';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    if (loading) return <div className="loading">Loading bookings...</div>;
    if (error) return (
        <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={fetchBookings} className="retry-button">
                Retry
            </button>
        </div>
    );

    return (
        <div className="manage-bookings-container">
            <div className="bookings-header">
                <h2>Manage Bookings</h2>
                <div className="filters">
                    <select 
                        name="hotel" 
                        value={selectedHotel}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Hotels</option>
                        {hotels.map(hotel => (
                            <option key={hotel.id} value={hotel.id}>
                                {hotel.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleFilterChange}
                        className="date-input"
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleFilterChange}
                        className="date-input"
                    />
                    <button onClick={applyFilters} className="apply-filters-btn">
                        Apply Filters
                    </button>
                </div>
            </div>

            <div className="bookings-table-container">
                {bookings.length === 0 ? (
                    <div className="no-bookings">No bookings found</div>
                ) : (
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Hotel</th>
                                <th>Room Type</th>
                                <th>Customer</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Total Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td>#{booking.id}</td>
                                    <td>{booking.hotel_name}</td>
                                    <td>{booking.room_type_name}</td>
                                    <td>
                                        <div className="customer-info">
                                            <div>{booking.customer_name}</div>
                                            <div className="customer-contact">
                                                {booking.customer_email}<br/>
                                                {booking.customer_phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</td>
                                    <td>{format(new Date(booking.check_out_date), 'MMM dd, yyyy')}</td>
                                    <td>₹{booking.total_price}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(booking.booking_status)}`}>
                                            {booking.booking_status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {booking.booking_status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                        className="btn-confirm"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="btn-cancel"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {booking.booking_status === 'confirmed' && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="btn-cancel"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ManageBookings; 