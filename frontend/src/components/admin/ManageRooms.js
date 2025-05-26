import React, { useState, useEffect } from 'react';
import './ManageRooms.css';

const ROOM_TYPES = [
  { id: 'standard', name: 'Standard Room', description: 'Basic room with essential amenities' },
  { id: 'superior', name: 'Superior Room', description: 'Larger room with enhanced amenities' },
  { id: 'deluxe', name: 'Deluxe Room', description: 'Premium room with luxury amenities' },
  { id: 'suite', name: 'Suite', description: 'Spacious room with separate living area' },
  { id: 'family', name: 'Family Room', description: 'Large room suitable for families' },
  { id: 'presidential', name: 'Presidential Suite', description: 'Luxury suite with premium services' }
];

const ManageRooms = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    type: '',
    total_rooms: 0,
    available_rooms: 0,
    peak_season_price: '',
    off_season_price: ''
  });

  // Fetch hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  // Fetch rooms when hotel is selected
  useEffect(() => {
    if (selectedHotel) {
      fetchRooms(selectedHotel);
    }
  }, [selectedHotel]);

  const fetchHotels = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hotels');
      const data = await response.json();
      setHotels(data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const fetchRooms = async (hotelId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms`);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleHotelChange = (e) => {
    setSelectedHotel(e.target.value);
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setNewRoom(prev => ({
      ...prev,
      [name]: value,
      // When total rooms changes, update available rooms
      ...(name === 'total_rooms' && { available_rooms: value })
    }));
  };

  const handleAddRoom = async () => {
    if (!selectedHotel || !newRoom.type || !newRoom.total_rooms) return;

    try {
      const response = await fetch(`http://localhost:5000/api/hotels/${selectedHotel}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoom),
      });

      if (response.ok) {
        // Refresh rooms list
        fetchRooms(selectedHotel);
        // Reset form
        setNewRoom({
          type: '',
          total_rooms: 0,
          available_rooms: 0,
          peak_season_price: '',
          off_season_price: ''
        });
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const handleRemoveRoom = async (roomId) => {
    if (!selectedHotel) return;

    try {
      const response = await fetch(`http://localhost:5000/api/hotels/${selectedHotel}/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh rooms list
        fetchRooms(selectedHotel);
      }
    } catch (error) {
      console.error('Error removing room:', error);
    }
  };

  return (
    <div className="manage-rooms-container">
      <h2 className="manage-rooms-title">Manage Hotel Rooms</h2>

      <div className="manage-rooms-hotel-select">
        <label>Select Hotel</label>
        <select 
          value={selectedHotel} 
          onChange={handleHotelChange}
          className="manage-rooms-select"
        >
          <option value="">Choose a hotel</option>
          {hotels.map(hotel => (
            <option key={hotel.id} value={hotel.id}>
              {hotel.name}
            </option>
          ))}
        </select>
      </div>

      {selectedHotel && (
        <>
          <div className="manage-rooms-table-wrap">
            <table className="manage-rooms-table">
              <thead>
                <tr>
                  <th>Room Type</th>
                  <th>Total Rooms</th>
                  <th>Available Rooms</th>
                  <th>Peak Season Price (₹)</th>
                  <th>Off Season Price (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, idx) => (
                  <tr key={idx}>
                    <td>{room.type}</td>
                    <td>{room.total_rooms}</td>
                    <td>{room.available_rooms}</td>
                    <td>₹{room.peak_season_price}</td>
                    <td>₹{room.off_season_price}</td>
                    <td>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRoom(room.id)} 
                        className="manage-rooms-remove-btn"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <select
                      name="type"
                      value={newRoom.type}
                      onChange={handleRoomChange}
                      className="manage-rooms-input"
                    >
                      <option value="">Select Room Type</option>
                      {ROOM_TYPES.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="total_rooms"
                      value={newRoom.total_rooms}
                      onChange={handleRoomChange}
                      min="0"
                      className="manage-rooms-input"
                      placeholder="Total Rooms"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="available_rooms"
                      value={newRoom.available_rooms}
                      onChange={handleRoomChange}
                      min="0"
                      max={newRoom.total_rooms}
                      className="manage-rooms-input"
                      placeholder="Available"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="peak_season_price"
                      value={newRoom.peak_season_price}
                      onChange={handleRoomChange}
                      min="0"
                      className="manage-rooms-input"
                      placeholder="Peak Price"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="off_season_price"
                      value={newRoom.off_season_price}
                      onChange={handleRoomChange}
                      min="0"
                      className="manage-rooms-input"
                      placeholder="Off Price"
                    />
                  </td>
                  <td>
                    <button 
                      type="button" 
                      onClick={handleAddRoom} 
                      className="manage-rooms-add-btn"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageRooms; 