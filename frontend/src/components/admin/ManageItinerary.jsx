import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ManageItinerary.css';

const ManageItinerary = ({ itinerary = [], onSave }) => {
  // Ensure days is always an array and parse if it's a string
  const parseItinerary = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parsing itinerary:', e);
        return [];
      }
    }
    return [];
  };

  const [days, setDays] = useState(parseItinerary(itinerary));
  const [activeTab, setActiveTab] = useState('view'); // Default to view tab
  const [newDay, setNewDay] = useState({
    dayNumber: '',
    title: '',
    description: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDay, setEditingDay] = useState(null);

  // Update days when itinerary prop changes
  useEffect(() => {
    const parsedDays = parseItinerary(itinerary);
    const sortedDays = [...parsedDays].sort((a, b) => a.dayNumber - b.dayNumber);
    setDays(sortedDays);
  }, [itinerary]);

  const handleAddDay = () => {
    if (newDay.dayNumber && newDay.title && newDay.description) {
      const dayContent = {
        dayNumber: parseInt(newDay.dayNumber),
        title: newDay.title,
        description: newDay.description
      };
      const updatedDays = [...days, dayContent];
      setDays(updatedDays);
      onSave(updatedDays); // Save immediately after adding
      setNewDay({
        dayNumber: '',
        title: '',
        description: ''
      });
      setShowAddForm(false);
    }
  };

  const handleEditDay = (index) => {
    const dayToEdit = days[index];
    if (dayToEdit) {
      setEditingDay({
        index,
        ...dayToEdit
      });
      setNewDay({
        dayNumber: dayToEdit.dayNumber.toString(),
        title: dayToEdit.title || '',
        description: dayToEdit.description || ''
      });
      setShowAddForm(true);
    }
  };

  const handleUpdateDay = () => {
    if (editingDay && newDay.dayNumber && newDay.title && newDay.description) {
      const updatedDays = [...days];
      updatedDays[editingDay.index] = {
        dayNumber: parseInt(newDay.dayNumber),
        title: newDay.title,
        description: newDay.description
      };
      setDays(updatedDays);
      onSave(updatedDays); // Save immediately after updating
      setEditingDay(null);
      setNewDay({
        dayNumber: '',
        title: '',
        description: ''
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveDay = (index) => {
    const updatedDays = days.filter((_, i) => i !== index);
    setDays(updatedDays);
    onSave(updatedDays); // Save immediately after removing
  };

  return (
    <div className="manage-itinerary">
      <div className="itinerary-header">
        <h3>Manage Itinerary</h3>
        <div className="header-actions">
          <button 
            className="add-day-btn"
            onClick={() => {
              setActiveTab('add');
              setShowAddForm(true);
            }}
          >
            + Add New Day
          </button>
          <button className="save-itinerary-btn" onClick={() => onSave(days)}>
            Save Itinerary
          </button>
        </div>
      </div>

      <div className="itinerary-tabs">
        <button 
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add Day
        </button>
        <button 
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Days ({days.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'add' && (
          <div className="add-day-section">
            {showAddForm ? (
              <div className="day-form">
                <div className="form-group">
                  <label>Day Number</label>
                  <input
                    type="number"
                    value={newDay.dayNumber}
                    onChange={(e) => setNewDay({...newDay, dayNumber: e.target.value})}
                    placeholder="Enter day number"
                    className="day-input"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newDay.title}
                    onChange={(e) => setNewDay({...newDay, title: e.target.value})}
                    placeholder="Enter day title (e.g., Arrival in Delhi)"
                    className="day-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <ReactQuill
                    value={newDay.description}
                    onChange={(content) => setNewDay({...newDay, description: content})}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="save-day-btn"
                    onClick={editingDay ? handleUpdateDay : handleAddDay}
                  >
                    {editingDay ? 'Update Day' : 'Add Day'}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingDay(null);
                      setNewDay({ dayNumber: '', title: '', description: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-form-message">
                Click "Add New Day" to start adding your itinerary days.
              </div>
            )}
          </div>
        )}

        {activeTab === 'view' && (
          <div className="days-list">
            {days.length > 0 ? (
              days.map((day, index) => (
                <div key={index} className="day-item">
                  <div className="day-header">
                    <div className="day-number">Day {day.dayNumber}</div>
                    <div className="day-title">{day.title}</div>
                    <div className="day-actions">
                      <button
                        onClick={() => handleEditDay(index)}
                        className="edit-day-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveDay(index)}
                        className="remove-day-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="day-description">
                    <div dangerouslySetInnerHTML={{ __html: day.description }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="no-days-message">
                No days added yet. Click "Add New Day" to start creating your itinerary.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageItinerary; 