import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import wildlifeFloraService from '../../services/wildlifeFloraService';
import './WildlifeFloraForm.css';

const WildlifeFloraForm = ({ onCancel, onSuccess, editingData = null, sanctuaryId = null, sanctuaryName = '' }) => {
  const [formData, setFormData] = useState({
    sanctuary_id: sanctuaryId || '',
    sanctuaryName: editingData?.sanctuary_name || sanctuaryName || '',

    
    // Dynamic arrays for multiple items
    mammals: editingData?.mammals || [],
    birds: editingData?.birds || [],
    reptiles: editingData?.reptiles || [],
    amphibians: editingData?.amphibians || [],
    fish: editingData?.fish || [],
    insects: editingData?.insects || [],
    butterflies: editingData?.butterflies || [],
    flowers: editingData?.flowers || [],
    trees: editingData?.trees || [],
    herbs: editingData?.herbs || [],
    grasses: editingData?.grasses || [],
    flora: editingData?.flora || [],
    endangered_species: editingData?.endangered_species || [],
    rare_species: editingData?.rare_species || [],
    migratory_birds: editingData?.migratory_birds || [],
    aquatic_life: editingData?.aquatic_life || [],
    
    // Additional Information
    bestTimeForWildlife: editingData?.best_time_for_wildlife || '',
    wildlifeBehavior: editingData?.wildlife_behavior || '',
    conservationStatus: editingData?.conservation_status || '',
    researchPrograms: editingData?.research_programs || '',
    visitorGuidelines: editingData?.visitor_guidelines || '',
    photographyTips: editingData?.photography_tips || ''
  });

  const [loading, setLoading] = useState(false);
  const [submittingItems, setSubmittingItems] = useState({});

  // Load existing data if editing
  useEffect(() => {
    if (editingData && sanctuaryId) {
      loadExistingData();
    }
  }, [editingData, sanctuaryId]);

  // Load existing wildlife flora data
  const loadExistingData = async () => {
    try {
      setLoading(true);
      const items = await wildlifeFloraService.getItemsBySanctuary(sanctuaryId);
      
      // Group items by category
      const groupedItems = {
        mammals: [],
        birds: [],
        reptiles: [],
        amphibians: [],
        fish: [],
        insects: [],
        butterflies: [],
        flowers: [],
        trees: [],
        herbs: [],
        grasses: [],
        flora: [],
        endangered_species: [],
        rare_species: [],
        migratory_birds: [],
        aquatic_life: []
      };

      items.forEach(item => {
        if (groupedItems[item.category]) {
          groupedItems[item.category].push({
            id: item.id,
            name: item.name,
            description: item.description,
            imagePreview: item.image_path ? `http://localhost:5000/uploads/${item.image_path}` : null,
            existingImage: item.image_path
          });
        }
      });

      setFormData(prev => ({
        ...prev,
        ...groupedItems
      }));
    } catch (error) {
      toast.error('Failed to load existing data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add new item to a category
  const addItem = (category) => {
    const newItem = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      description: '',
      image: null,
      imagePreview: null
    };
    
    setFormData(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }));
  };

  // Helper function to remove item from a category
  const removeItem = (category, itemId) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== itemId)
    }));
  };

  // Helper function to update item in a category
  const updateItem = (category, itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  // Helper function to handle image upload for specific item
  const handleItemImageChange = (category, itemId, e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      updateItem(category, itemId, 'image', file);
      updateItem(category, itemId, 'imagePreview', URL.createObjectURL(file));
      toast.success('Image uploaded successfully!');
    }
  };

  // Helper function to remove image from specific item
  const removeItemImage = (category, itemId) => {
    updateItem(category, itemId, 'image', null);
    updateItem(category, itemId, 'imagePreview', null);
    toast.info('Image removed');
  };

  // Helper function to view image in full size
  const viewImage = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  // Save individual item
  const saveItem = async (category, item) => {
    if (!item.name.trim()) {
      toast.error('Please enter a name for this item');
      return;
    }

    if (!formData.sanctuary_id) {
      toast.error('Please select a sanctuary');
      return;
    }

    setSubmittingItems(prev => ({ ...prev, [item.id]: true }));

    try {
      const itemData = {
        sanctuary_id: parseInt(formData.sanctuary_id),
        category: category,
        name: item.name,
        description: item.description || '',
        sort_order: 0,
        is_active: true
      };

      const formDataToSend = wildlifeFloraService.prepareFormData(itemData, item.image);

      let result;
      // Check if item exists in database (has numeric ID and not a temporary ID)
      if (item.id && typeof item.id === 'number' && item.id > 0 && !item.id.toString().includes('temp_')) {
        // Update existing item - include is_active and sort_order from existing item
        const updateData = {
          ...itemData,
          is_active: item.is_active !== undefined ? item.is_active : true,
          sort_order: item.sort_order || 0
        };
        const formDataToSend = wildlifeFloraService.prepareFormData(updateData, item.image);
        result = await wildlifeFloraService.updateItem(item.id, formDataToSend);
        toast.success(`${item.name} updated successfully!`);
      } else {
        // Create new item
        result = await wildlifeFloraService.createItem(formDataToSend);
        toast.success(`${item.name} created successfully!`);
        
        // Update the item ID with the new one from server
        updateItem(category, item.id, 'id', result.id);
      }

      // Clear the image after successful save
      updateItem(category, item.id, 'image', null);
      
    } catch (error) {
      toast.error(`Failed to save ${item.name}`);
    } finally {
      setSubmittingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  // Delete item from server
  const deleteItem = async (category, item) => {
    // Check if item exists in database (has numeric ID)
    if (!item.id || typeof item.id !== 'number' || item.id <= 0) {
      // Item not saved to server yet, just remove from local state
      removeItem(category, item.id);
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await wildlifeFloraService.deleteItem(item.id);
        removeItem(category, item.id);
        toast.success(`${item.name} deleted successfully!`);
      } catch (error) {
        toast.error(`Failed to delete ${item.name}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save additional information
  const saveAdditionalInfo = async () => {
    if (!formData.sanctuary_id) {
      toast.error('Please select a sanctuary');
      return;
    }

    try {
      // Get the first item to update with additional info
      const allItems = [
        ...formData.mammals,
        ...formData.birds,
        ...formData.reptiles,
        ...formData.insects,
        ...formData.flowers,
        ...formData.herbs,
        ...formData.rare_species,
        ...formData.flora,
        ...formData.endangered_species
      ];

      if (allItems.length === 0) {
        toast.error('Please add at least one wildlife item first');
        return;
      }

      const firstItem = allItems.find(item => item.id && typeof item.id === 'number' && item.id > 0);
      
      if (!firstItem) {
        toast.error('Please save at least one wildlife item first');
        return;
      }

      const additionalInfoData = {
        sanctuary_id: parseInt(formData.sanctuary_id),
        category: firstItem.category || 'mammals',
        name: firstItem.name,
        description: firstItem.description || '',
        sort_order: firstItem.sort_order || 0,
        is_active: firstItem.is_active !== undefined ? firstItem.is_active : true,
        best_time_for_wildlife: formData.bestTimeForWildlife,
        wildlife_behavior: formData.wildlifeBehavior,
        conservation_status: formData.conservationStatus,
        research_programs: formData.researchPrograms,
        visitor_guidelines: formData.visitorGuidelines,
        photography_tips: formData.photographyTips
      };

      const formDataToSend = wildlifeFloraService.prepareFormData(additionalInfoData, null);
      await wildlifeFloraService.updateItem(firstItem.id, formDataToSend);
      
      toast.success('Additional information saved successfully!');
    } catch (error) {
      toast.error('Failed to save additional information');
    }
  };

  // Render dynamic item fields
  const renderItemFields = (category, categoryName, categoryIcon) => (
    <div className="form-section">
      <div className="section-header">
        <h4>{categoryIcon} {categoryName}</h4>
        <button 
          type="button" 
          onClick={() => addItem(category)}
          className="add-item-btn"
        >
          <i className="fas fa-plus"></i> Add {categoryName.slice(0, -1)}
        </button>
      </div>
      
      {formData[category].map((item, index) => (
        <div key={item.id} className="item-container">
          <div className="item-header">
            <h5>{categoryName.slice(0, -1)} #{index + 1}</h5>
            <div className="item-actions">
              <button 
                type="button" 
                onClick={() => saveItem(category, item)}
                disabled={submittingItems[item.id]}
                className="save-item-btn"
              >
                {submittingItems[item.id] ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-save"></i>
                )}
                {submittingItems[item.id] ? 'Saving...' : 'Save'}
              </button>
              <button 
                type="button" 
                onClick={() => deleteItem(category, item)}
                className="remove-item-btn"
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(category, item.id, 'name', e.target.value)}
                placeholder={`Enter ${categoryName.slice(0, -1).toLowerCase()} name`}
              />
            </div>
            <div className="form-group">
              <label>Image</label>
              {!item.imagePreview ? (
                <div className="wildlife-image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleItemImageChange(category, item.id, e)}
                  />
                  <div className="upload-text">Click to upload image</div>
                  <div className="upload-hint">Supports: JPG, PNG, GIF (Max: 5MB)</div>
                </div>
              ) : (
                <div className="wildlife-image-preview">
                  <div className="image-container">
                    <img 
                      src={item.imagePreview} 
                      alt={`${item.name || categoryName} Preview`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeItemImage(category, item.id)}
                      className="remove-image-btn"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => viewImage(item.imagePreview)}
                      className="view-image-btn"
                    >
                      <i className="fas fa-expand"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(category, item.id, 'description', e.target.value)}
              placeholder={`Enter description for ${item.name || categoryName.slice(0, -1).toLowerCase()}`}
              rows="3"
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="wildlife-flora-form">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading wildlife flora data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wildlife-flora-form">
      <div className="form-header">
        <h3>🦁 Wildlife & Flora Management</h3>
        <p>Add and manage wildlife and flora information for the sanctuary</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Sanctuary Selection */}
        <div className="form-section">
          <h4>🏞️ Sanctuary Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Sanctuary ID *</label>
              <input
                type="number"
                name="sanctuary_id"
                value={formData.sanctuary_id}
                onChange={handleInputChange}
                placeholder="Enter sanctuary ID"
                required
              />
            </div>
            <div className="form-group">
              <label>Sanctuary Name</label>
              <input
                type="text"
                name="sanctuaryName"
                value={formData.sanctuaryName}
                onChange={handleInputChange}
                placeholder="Enter sanctuary name"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Wildlife Categories */}
        {renderItemFields('mammals', 'Mammals', '🦁')}
        {renderItemFields('birds', 'Birds', '🦅')}
        {renderItemFields('reptiles', 'Reptiles', '🐍')}
        {renderItemFields('insects', 'Insects', '🦗')}
        {renderItemFields('flowers', 'Flowers', '🌸')}
        {renderItemFields('herbs', 'Herbs', '🌿')}
        {renderItemFields('rare_species', 'Rare Species', '🦄')}
        {renderItemFields('flora', 'Flora', '🌿')}
        {renderItemFields('endangered_species', 'Endangered Species', '🦏')}

        {/* Additional Information Section */}
        <div className="form-section">
          <h4>📋 Additional Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Best Time for Wildlife Viewing</label>
              <input
                type="text"
                name="bestTimeForWildlife"
                value={formData.bestTimeForWildlife}
                onChange={handleInputChange}
                placeholder="e.g., Early morning and evening"
              />
            </div>
            <div className="form-group">
              <label>Wildlife Behavior</label>
              <input
                type="text"
                name="wildlifeBehavior"
                value={formData.wildlifeBehavior}
                onChange={handleInputChange}
                placeholder="e.g., Nocturnal, Diurnal, etc."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Conservation Status</label>
              <textarea
                name="conservationStatus"
                value={formData.conservationStatus}
                onChange={handleInputChange}
                placeholder="Describe the conservation status of wildlife in this sanctuary"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Research Programs</label>
              <textarea
                name="researchPrograms"
                value={formData.researchPrograms}
                onChange={handleInputChange}
                placeholder="Describe ongoing research programs"
                rows="3"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Visitor Guidelines for Wildlife</label>
            <textarea
              name="visitorGuidelines"
              value={formData.visitorGuidelines}
              onChange={handleInputChange}
              placeholder="Provide guidelines for visitors regarding wildlife interaction"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Wildlife Photography Tips</label>
            <textarea
              name="photographyTips"
              value={formData.photographyTips}
              onChange={handleInputChange}
              placeholder="Provide tips for wildlife photography in this sanctuary"
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={saveAdditionalInfo} 
              className="save-additional-info-btn"
            >
              <i className="fas fa-save"></i> Save Additional Information
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            <i className="fas fa-times"></i> Cancel
          </button>
          <button type="button" onClick={onSuccess} className="done-btn">
            <i className="fas fa-check"></i> Done
          </button>
        </div>
      </form>
    </div>
  );
};

export default WildlifeFloraForm; 