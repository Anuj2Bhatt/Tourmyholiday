import React, { useState, useEffect } from 'react';
import './ManageTerritory.css';
import TerritoryForm from './TerritoryForm';
import TerritoryImageForm from './TerritoryImageForm';
import { territoryService } from '../../services/territoryService';
import { territoryImageService } from '../../services/territoryImageService';
import { toast } from 'react-toastify';
import path from 'path-browserify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get filename from path
const getFilename = (filepath) => {
    if (!filepath) return null;
    // Handle both forward and backward slashes
    const parts = filepath.split(/[\/\\]/);
    return parts[parts.length - 1];
};

const ManageTerritory = () => {
  const [territories, setTerritories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImageFormOpen, setIsImageFormOpen] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedTerritoryImages, setSelectedTerritoryImages] = useState([]);
  const [activeTab, setActiveTab] = useState('territories'); // 'territories' or 'images'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch territories on component mount
  useEffect(() => {
    fetchTerritories();
  }, []);

  const fetchTerritories = async () => {
    try {
      setLoading(true);
      console.log('Fetching territories...');
      const response = await territoryService.getAllTerritories();
      console.log('Territories response:', response);

      if (response.success) {
        const territoriesData = Array.isArray(response.data) ? response.data : [];
        console.log('Territories data:', territoriesData);
        
        // Use the exact image path from backend
        const territoriesWithFullUrls = territoriesData.map(territory => {
          console.log('Processing territory:', territory);
          let previewImageUrl = null;
          
          if (territory.preview_image) {
            // Use the exact path from backend
            previewImageUrl = `${API_URL}/uploads/${getFilename(territory.preview_image)}`;
          }

          return {
          ...territory,
            title: territory.title || territory.name,
            capital: territory.capital || territory.state_name,
            preview_image: previewImageUrl || `${API_URL}/uploads/placeholder.jpg`
          };
        });
        console.log('Processed territories:', territoriesWithFullUrls);
        setTerritories(territoriesWithFullUrls);
      } else {
        console.error('Failed to fetch territories:', response);
        setError('Failed to fetch territories');
        toast.error('Failed to fetch territories');
      }
    } catch (error) {
      console.error('Error in fetchTerritories:', error);
      setError(error.message || 'Error fetching territories');
      toast.error(error.message || 'Error fetching territories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerritory = () => {
    setSelectedTerritory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (territory) => {
    console.log('Editing territory:', territory);
    let previewImageUrl = null;
    
    if (territory.preview_image) {
      // Use the exact path from backend
      previewImageUrl = `${API_URL}/uploads/${getFilename(territory.preview_image)}`;
    }

    const territoryWithFullUrls = {
      ...territory,
      title: territory.title || territory.name,
      capital: territory.capital || territory.state_name,
      preview_image: previewImageUrl || `${API_URL}/uploads/placeholder.jpg`
    };
    console.log('Setting territory for edit:', territoryWithFullUrls);
    setSelectedTerritory(territoryWithFullUrls);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this territory?')) {
      try {
        const response = await territoryService.deleteTerritory(id);
        if (response.success) {
          setTerritories(prev => prev.filter(territory => territory.id !== id));
          toast.success('Territory deleted successfully');
        }
      } catch (error) {
        toast.error(error.message || 'Error deleting territory');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Log the actual FormData contents
      console.log('Form data entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      let response;
      if (selectedTerritory) {
        // For update, we need to ensure all fields are included
        const territoryData = new FormData();
        
        // Always include the territory ID
        territoryData.append('id', selectedTerritory.id);

        // Add all form fields
        const fieldsToInclude = [
          'title', 'slug', 'capital', 'famous_for', 
          'meta_title', 'meta_description', 'meta_keywords'
        ];

        // Add all text fields
        fieldsToInclude.forEach(field => {
          const value = formData.get(field);
          if (value !== null && value !== undefined) {
            console.log(`Adding field ${field}:`, value);
            territoryData.append(field, value);
          }
        });

        // Add image files if they exist
        const previewImage = formData.get('preview_image');
        if (previewImage instanceof File) {
          console.log('Adding preview image:', previewImage.name);
          territoryData.append('preview_image', previewImage);
        }

        // Log the exact data being sent
        console.log('Update data being sent:');
        for (let pair of territoryData.entries()) {
          console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }

        response = await territoryService.updateTerritory(selectedTerritory.id, territoryData);
      } else {
        // For create, we can send FormData directly
        response = await territoryService.createTerritory(formData);
      }

        if (response.success) {
        // After successful update/create, refresh the territories list
        await fetchTerritories();
        
        // Show success message
        if (selectedTerritory) {
          toast.success('Territory updated successfully');
        } else {
          toast.success('Territory created successfully');
        }
        
        // Close the form
        setIsFormOpen(false);
        setSelectedTerritory(null);
      } else {
        // Handle validation errors
        if (response.errors) {
          const fieldErrors = {};
          response.errors.forEach(err => {
            const fieldName = err.path || err.param;
            if (!fieldErrors[fieldName]) {
              fieldErrors[fieldName] = [];
            }
            fieldErrors[fieldName].push(err.msg || err.message);
          });

          // Show each field's errors
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages.join(', ')}`);
          });

          // Pass errors to form component
          if (selectedTerritory) {
            setSelectedTerritory(prev => ({
              ...prev,
              errors: fieldErrors
            }));
          }
        } else {
          toast.error('Failed to save territory');
        }
      }
    } catch (error) {
      console.error('Error saving territory:', error);
      
      // Handle validation errors
      if (error.errors && Array.isArray(error.errors)) {
        // Group errors by field
        const fieldErrors = {};
        error.errors.forEach(err => {
          const fieldName = err.path || err.param;
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = [];
          }
          fieldErrors[fieldName].push(err.msg || err.message);
        });

        // Show each field's errors
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(', ')}`);
        });

        // Pass errors to form component
        if (selectedTerritory) {
          setSelectedTerritory(prev => ({
            ...prev,
            errors: fieldErrors
          }));
        }
      } else if (error.response?.data?.errors) {
        // Handle backend validation errors
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          const fieldName = err.path || err.param;
          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = [];
          }
          fieldErrors[fieldName].push(err.msg || err.message);
        });

        // Show each field's errors
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(', ')}`);
        });

        // Pass errors to form component
        if (selectedTerritory) {
          setSelectedTerritory(prev => ({
            ...prev,
            errors: fieldErrors
          }));
        }
      } else {
        // Handle other errors
      toast.error(error.message || 'Error saving territory');
      }
    }
  };

  const handleManageImages = async (territory) => {
    try {
      setLoading(true);
      const response = await territoryImageService.getTerritoryImages(territory.id);
      if (response.success) {
        // Add full URL to image_urls
        const imagesWithFullUrls = response.data.map(image => ({
          ...image,
          image_url: image.image_url.startsWith('http') 
            ? image.image_url 
            : `${API_URL}${image.image_url}`
        }));
        setSelectedTerritoryImages(imagesWithFullUrls);
        setSelectedTerritory(territory);
        setActiveTab('images');
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching territory images');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    setIsImageFormOpen(true);
  };

  const handleImageFormSubmit = async (formData) => {
    try {
      // Append territory_id to the FormData
      formData.append('territory_id', selectedTerritory.id);
      const response = await territoryImageService.addTerritoryImage(formData);
      
      if (response.success) {
        const newImage = {
          ...response.data,
          image_url: response.data.image_url.startsWith('http') 
            ? response.data.image_url 
            : `${API_URL}${response.data.image_url}`
        };
        setSelectedTerritoryImages(prev => [...prev, newImage]);
        toast.success('Image added successfully');
        setIsImageFormOpen(false);
      }
    } catch (error) {
      toast.error(error.message || 'Error adding image');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await territoryImageService.deleteTerritoryImage(imageId);
        if (response.success) {
          setSelectedTerritoryImages(prev => 
            prev.filter(image => image.id !== imageId)
          );
          toast.success('Image deleted successfully');
        }
      } catch (error) {
        toast.error(error.message || 'Error deleting image');
      }
    }
  };

  const handleToggleFeatured = async (imageId) => {
    try {
      const response = await territoryImageService.toggleFeatured(imageId);
      if (response.success) {
        setSelectedTerritoryImages(prev => 
          prev.map(image => 
            image.id === imageId 
              ? { ...image, is_featured: !image.is_featured }
              : image
          )
        );
        toast.success('Featured status updated successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating featured status');
    }
  };

  if (loading) {
    return <div className="territory-loading">Loading territories...</div>;
  }

  if (error) {
    return <div className="territory-error">{error}</div>;
  }

  return (
    <div className="territory-manage-wrapper">
      <div className="territory-manage-container">
        <div className="territory-manage-header">
          <div className="territory-tabs">
            <button 
              className={`territory-tab ${activeTab === 'territories' ? 'active' : ''}`}
              onClick={() => setActiveTab('territories')}
            >
              Manage Territories
            </button>
            {selectedTerritory && (
              <button 
                className={`territory-tab ${activeTab === 'images' ? 'active' : ''}`}
                onClick={() => setActiveTab('images')}
              >
                Manage Images - {selectedTerritory.title}
              </button>
            )}
          </div>
          
          {activeTab === 'territories' ? (
            <button 
              className="territory-add-btn"
              onClick={handleAddTerritory}
            >
              Add New Territory
            </button>
          ) : (
            <button 
              className="territory-add-btn"
              onClick={handleAddImage}
            >
              Add New Image
            </button>
          )}
        </div>

        {activeTab === 'territories' ? (
          <div className="territory-table-container">
            <table className="territory-table">
              <thead className="territory-table-header">
                <tr>
                  <th className="territory-th">Sr. No.</th>
                  <th className="territory-th">Thumbnail</th>
                  <th className="territory-th">Territory Title</th>
                  <th className="territory-th">Capital</th>
                  <th className="territory-th">Actions</th>
                </tr>
              </thead>
              <tbody className="territory-table-body">
                {territories.length === 0 ? (
                  <tr className="territory-table-row">
                    <td colSpan="5" className="territory-no-data">
                      No territories added yet
                    </td>
                  </tr>
                ) : (
                  territories.map((territory, index) => (
                    <tr key={territory.id} className="territory-table-row">
                      <td className="territory-td">{index + 1}</td>
                      <td className="territory-td territory-images">
                        <div className="territory-image-container">
                        <img 
                            src={territory.preview_image || `${API_URL}/uploads/placeholder.jpg`}
                            alt={`${territory.title} Preview`}
                          className="territory-thumbnail"
                            onError={(e) => {
                              if (e.target.src !== `${API_URL}/uploads/placeholder.jpg`) {
                                console.log('Image failed to load, using placeholder:', territory.preview_image);
                                e.target.src = `${API_URL}/uploads/placeholder.jpg`;
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="territory-td">{territory.title}</td>
                      <td className="territory-td">{territory.capital}</td>
                      <td className="territory-td territory-actions">
                        <button 
                          className="territory-edit-btn"
                          onClick={() => handleEdit(territory)}
                        >
                          Edit
                        </button>
                        <button 
                          className="territory-images-btn"
                          onClick={() => handleManageImages(territory)}
                        >
                          Manage Images
                        </button>
                        <button 
                          className="territory-delete-btn"
                          onClick={() => handleDelete(territory.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="territory-images-container">
            {selectedTerritoryImages.length === 0 ? (
              <div className="territory-no-images">
                No images added yet for this territory
              </div>
            ) : (
              <div className="territory-images-grid">
                {selectedTerritoryImages.map((image) => (
                  <div key={image.id} className="territory-image-card">
                    <div className="territory-image-wrapper">
                      <img 
                        src={image.image_url} 
                        alt={image.alt_text}
                        className="territory-image"
                      />
                      {image.is_featured && (
                        <div className="territory-featured-badge">Featured</div>
                      )}
                    </div>
                    <div className="territory-image-details">
                      <p className="territory-image-alt">{image.alt_text}</p>
                      <p className="territory-image-desc">{image.description}</p>
                    </div>
                    <div className="territory-image-actions">
                      <button 
                        className={`territory-feature-btn ${image.is_featured ? 'featured' : ''}`}
                        onClick={() => handleToggleFeatured(image.id)}
                      >
                        {image.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button 
                        className="territory-delete-btn"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <TerritoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        territory={selectedTerritory}
        onSubmit={handleFormSubmit}
      />

      <TerritoryImageForm
        isOpen={isImageFormOpen}
        onClose={() => setIsImageFormOpen(false)}
        onSubmit={handleImageFormSubmit}
      />
    </div>
  );
};

export default ManageTerritory; 