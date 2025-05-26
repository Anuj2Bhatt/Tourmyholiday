import React, { useState, useEffect } from 'react';
// import EventForm from './EventForm'; // (Banana hoga)

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch {
      setError('Failed to delete event');
    }
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="manage-events-container">
      {/* {showForm ? (
        <EventForm
          editingEvent={editingEvent}
          onSuccess={() => {
            setShowForm(false);
            fetchEvents();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : ( */}
        <>
          <div className="manage-events-header">
            <h2>Manage Events</h2>
            <button className="add-new-btn" onClick={handleAddNew}>+ Add New</button>
          </div>
          <div className="events-table">
            {events.length === 0 ? (
              <div>No events found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <tr key={event.id}>
                      <td>{idx + 1}</td>
                      <td>{event.name}</td>
                      <td>{event.date}</td>
                      <td>{event.location}</td>
                      <td>
                        <button onClick={() => handleEdit(event)}>Edit</button>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(event.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      {/* )} */}
    </div>
  );
};

export default ManageEvents;
