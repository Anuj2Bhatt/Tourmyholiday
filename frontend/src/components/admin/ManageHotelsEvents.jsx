import React, { useState } from 'react';
import ManageHotels from './ManageHotels';
import ManageEvents from './ManageEvents';
import ManageCategories from './ManageCategories';
import './ManageHotelsEvents.css';

const ManageHotelsEvents = () => {
  const [activeTab, setActiveTab] = useState('hotels');

  return (
    <div>
      <div className="hotels-events-tabs">
        <button
          className={activeTab === 'hotels' ? 'active' : ''}
          onClick={() => setActiveTab('hotels')}
        >
          Manage Hotels
        </button>
        <button
          className={activeTab === 'events' ? 'active' : ''}
          onClick={() => setActiveTab('events')}
        >
          Manage Events
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Manage Categories
        </button>
      </div>
      <div className="hotels-events-content">
        {activeTab === 'hotels' && <ManageHotels />}
        {activeTab === 'events' && <ManageEvents />}
        {activeTab === 'categories' && <ManageCategories />}
      </div>
    </div>
  );
};

export default ManageHotelsEvents;
