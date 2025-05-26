import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ManageGallery from '../../components/admin/ManageGallery';
import ManageStats from '../../components/admin/ManageStats';
import ManageWebStories from '../../components/admin/ManageWebStories';
import './DistrictManagement.css';

const DistrictManagement = () => {
    const { districtId } = useParams();
    const [activeTab, setActiveTab] = useState('gallery');

    const tabs = [
        { id: 'gallery', label: 'Gallery' },
        { id: 'stats', label: 'Stats' },
        { id: 'web-stories', label: 'Web Stories' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'gallery':
                return <ManageGallery districtId={districtId} />;
            case 'stats':
                return <ManageStats districtId={districtId} />;
            case 'web-stories':
                return <ManageWebStories districtId={districtId} />;
            default:
                return null;
        }
    };

    return (
        <div className="district-management">
            <div className="tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default DistrictManagement; 