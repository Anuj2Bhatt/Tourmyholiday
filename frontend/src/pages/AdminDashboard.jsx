import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import HomePageGalleryManager from '../components/admin/HomePageGalleryManager';
import ManageArticles from '../components/admin/ManageArticles.jsx';
import ManagePackages from '../components/admin/ManagePackages.js';
import ManageDistricts from '../components/admin/ManageDistricts';
import ManageStates from '../components/admin/ManageStates';
import ManageTerritory from '../components/admin/ManageTerritory';
import ManageStateSliders from '../components/admin/ManageStateSliders';
import ManageStateHistory from '../components/admin/ManageStateHistory';
import ManagePlacesToVisit from '../components/admin/ManagePlacesToVisit';
import ManageMeetOurTeam from '../components/admin/ManageMeetOurTeam';
import ManageSubdistricts from '../components/admin/ManageSubdistricts';
import ManageVideos from '../components/admin/ManageVideos';
import ManageHotelsEvents from '../components/admin/ManageHotelsEvents';
import ManageVillages from '../components/admin/ManageVillages.jsx';


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('homePageGallery');

  const handleLogout = () => {
    // Clear all authentication-related items from localStorage
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    
    // Force a page reload to clear any in-memory state
    window.location.href = '/admin-login';
  };

  // Render the appropriate component based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'homePageGallery':
        return <HomePageGalleryManager />;
      case 'districts':
        return <ManageDistricts />;
      case 'articles':
        return <ManageArticles />;
      case 'packages':
        return <ManagePackages />;
      case 'states':
        return <ManageStates />;
      case 'territory':
        return <ManageTerritory />;
      case 'stateSliders':
        return <ManageStateSliders />;
      case 'stateHistory':
        return <ManageStateHistory />;
      case 'placesToVisit':
        return <ManagePlacesToVisit />;
      case 'meetOurTeam':
        return <ManageMeetOurTeam />;
      case 'subdistricts':
        return <ManageSubdistricts />;
      case 'manageVideos':
        return <ManageVideos />;
      case 'manageHotelsEvents':
        return <ManageHotelsEvents />;
      case 'manageVillages':
        return <ManageVillages />;
      default:
        return (
          <div className="placeholder-content">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')} Management</h2>
            <p>This section is under development. Check back soon for updates!</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>Tour My Holiday</h2>
        </div>
        <div className="dashboard-nav">
          <button
            className={`nav-item ${activeTab === 'homePageGallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('homePageGallery')}
          >
            <span className="nav-icon">🖼️</span>
            Manage Home Page Gallery
          </button>
          <button
            className={`nav-item ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            <span className="nav-icon">📦</span>
            Manage Packages
          </button>
          <button
            className={`nav-item ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            <span className="nav-icon">📝</span>
            Manage Articles
          </button>
          <button
            className={`nav-item ${activeTab === 'districts' ? 'active' : ''}`}
            onClick={() => setActiveTab('districts')}
          >
            <span className="nav-icon">🏘️</span>
            Manage Districts
          </button>
          <button
            className={`nav-item ${activeTab === 'states' ? 'active' : ''}`}
            onClick={() => setActiveTab('states')}
          >
            <span className="nav-icon">🌏</span>
            Manage States
          </button>
          <button
            className={`nav-item ${activeTab === 'territory' ? 'active' : ''}`}
            onClick={() => setActiveTab('territory')}
          >
            <span className="nav-icon">🗺️</span>
            Manage Territory
          </button>
          <button
            className={`nav-item ${activeTab === 'stateSliders' ? 'active' : ''}`}
            onClick={() => setActiveTab('stateSliders')}
          >
            <span className="nav-icon">🖼️</span>
            Manage State Sliders
          </button>
          <button
            className={`nav-item ${activeTab === 'stateHistory' ? 'active' : ''}`}
            onClick={() => setActiveTab('stateHistory')}
          >
            <span className="nav-icon">📜</span>
            Manage State History
          </button>
          <button
            className={`nav-item ${activeTab === 'placesToVisit' ? 'active' : ''}`}
            onClick={() => setActiveTab('placesToVisit')}
          >
            <span className="nav-icon">🏞️</span>
            Manage Places to Visit
          </button>
          <button
            className={`nav-item ${activeTab === 'meetOurTeam' ? 'active' : ''}`}
            onClick={() => setActiveTab('meetOurTeam')}
          >
            <span className="nav-icon">👥</span>
            Manage Meet Our Team
          </button>
          <button
            className={`nav-item ${activeTab === 'subdistricts' ? 'active' : ''}`}
            onClick={() => setActiveTab('subdistricts')}
          >
            <span className="nav-icon">🏞️</span>
            Manage Subdistrict
          </button>
          <button
            className={`nav-item ${activeTab === 'manageVideos' ? 'active' : ''}`}
            onClick={() => setActiveTab('manageVideos')}
          >
            <span className="nav-icon">🎬</span>
            Manage Video
          </button>
          <button
            className={`nav-item ${activeTab === 'manageHotelsEvents' ? 'active' : ''}`}
            onClick={() => setActiveTab('manageHotelsEvents')}
          >
            <span className="nav-icon">🏨</span>
            Manage Hotels / Events
          </button>
          <button
            className={`nav-item ${activeTab === 'manageVillages' ? 'active' : ''}`}
            onClick={() => setActiveTab('manageVillages')}
          >
            <span className="nav-icon">🏘️</span>
            Manage Villages
          </button>
        </div>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>{activeTab === 'homePageGallery' ? 'Manage Home Page Gallery' :
            activeTab === 'packages' ? 'Manage Packages' :
              activeTab === 'articles' ? 'Manage Articles' :
                activeTab === 'districts' ? 'Manage Districts' :
                  activeTab === 'states' ? 'Manage States' :
                    activeTab === 'territory' ? 'Manage Territory' :
                      activeTab === 'stateSliders' ? 'Manage State Sliders' :
                        activeTab === 'stateHistory' ? 'Manage State History' :
                          activeTab === 'placesToVisit' ? 'Manage Places to Visit' :
                            activeTab === 'manageVillages' ? 'Manage Villages' :
                              'Dashboard'}</h1>
          <div className="admin-info">
            <span className="admin-name">Admin User</span>
            <div className="admin-avatar">A</div>
          </div>
        </div>

        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 