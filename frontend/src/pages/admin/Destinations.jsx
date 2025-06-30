import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DestinationForm from '../../components/admin/DestinationForm';
import { getDestinations, createDestination, updateDestination, deleteDestination } from '../../services/destinationService';
import './Destinations.css';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const navigate = useNavigate();

  // Fetch destinations on component mount
  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setIsLoading(true);
      const data = await getDestinations();
      setDestinations(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch destinations. Please try again.');
      
    } finally {
      setIsLoading(false);  
    }
  };

  const handleAddNew = () => {
    setSelectedDestination(null);
    setShowForm(true);
  };

  const handleEdit = (destination) => {
    setSelectedDestination(destination);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        await deleteDestination(id);
        await fetchDestinations();
      } catch (err) {
        setError('Failed to delete destination. Please try again.');
        
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedDestination) {
        await updateDestination(selectedDestination._id, formData);
      } else {
        await createDestination(formData);
      }
      await fetchDestinations();
      setShowForm(false);
    } catch (err) {
      setError('Failed to save destination. Please try again.');
        
      throw err;
    }
  };

  const handleView = (slug) => {
    navigate(`/destinations/${slug}`);
  };

  if (showForm) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h1>{selectedDestination ? 'Edit Destination' : 'Add New Destination'}</h1>
          <button className="back-btn" onClick={() => setShowForm(false)}>
            Back to List
          </button>
        </div>
        <DestinationForm
          destination={selectedDestination}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Destinations</h1>
        <button className="add-btn" onClick={handleAddNew}>
          Add New Destination
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading destinations...</div>
      ) : (
        <div className="destinations-grid">
          {destinations.map(destination => (
            <div key={destination._id} className="destination-card">
              <div className="card-image">
                <img src={destination.featuredImage} alt={destination.title} />
                <div className="card-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(destination)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(destination._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="action-btn view"
                    onClick={() => handleView(destination.slug)}
                  >
                    View
                  </button>
                </div>
              </div>
              <div className="card-content">
                <h3>{destination.title}</h3>
                <p className="location">{destination.destination}</p>
                <div className="card-meta">
                  <span className="status" data-status={destination.status.toLowerCase()}>
                    {destination.status}
                  </span>
                  <span className="trending-score">
                    Trending: {destination.trendingScore}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Destinations; 