import React, { useState, useEffect } from 'react';
import './ManagePackages.css';
import PackageForm from './PackageForm';

const initialForm = {
  package_name: '',
  location: '',
  category: '',
  price: '',
  quad_price: '',
  double_price: '',
  slug: '',
  duration: '',
  description: '',
  featured_image: '',
  image1: '',
  image2: '',
  image3: '',
  image4: '',
  image5: '',
  itinerary_pdf: '',
  itinerary: [],
  hotels: '',
  sightseeing: '',
  meals: '',
  transfer: '',
  note: '',
  inclusion: '',
  exclusion: '',
  visa_requirement: '',
  faq: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  status: 'Public',
  state_id: '',
  district_id: ''
};

const categories = [
  'Adventure', 'Beach', 'Pilgrimage', 'Wildlife', 'Nature', 'Culture', 'Family', 'Romantic'
];

const seasons = [
  'Summer',
  'Monsoon',
  'Autumn',
  'Winter',
  'Spring'
];

const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
};

const ManagePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([null, null, null, null, null]);
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [activeTab, setActiveTab] = useState('packages');

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchPackages();
        await fetchStates();
      } catch (error) {
        setError(error.message);
      }
    };

    initializeData();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      setError(error.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/states`);
      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }
      const data = await response.json();
      setStates(data);
    } catch (err) {
      setError('Failed to fetch states. Please try again.');
    }
  };

  const fetchDistricts = async (stateId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/states/${stateId}/districts`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const data = await response.json();
      setDistricts(data);
    } catch (err) {
      }
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setFormData(prev => ({ ...prev, state_id: stateId }));
    if (stateId) {
      fetchDistricts(stateId);
    } else {
      setDistricts([]);
    }
  };

  const handleEdit = (e, pkg) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPackage(pkg);
    setFormData(pkg);
    setShowForm(true);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/packages/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete package');
        }

        await fetchPackages();
      } catch (err) {
        setError(err.message || 'Failed to delete package');
      }
    }
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingPackage(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'package_name') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: createSlug(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (index, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }

      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [`image${index + 1}`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (file) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('PDF size should be less than 10MB');
        return;
      }
      
      if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF file');
        return;
      }

      setPdfFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          itinerary_pdf: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);
    
    setFormData(prev => ({
      ...prev,
      [`image${index + 1}`]: ''
    }));
  };

  const removePdf = () => {
    setPdfFile(null);
    setFormData(prev => ({
      ...prev,
      itinerary_pdf: ''
    }));
  };

  const handleEditorChange = (field, content) => {
    setFormData(prev => ({ ...prev, [field]: content }));
  };

  const handleStatusToggle = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'Public' ? 'Draft' : 'Public'
    }));
  };

  const handleFeaturedImageChange = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Featured image size should be less than 5MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }

      setFeaturedImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          featured_image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFeaturedImage = () => {
    setFeaturedImageFile(null);
    setFormData(prev => ({
      ...prev,
      featured_image: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image1' && key !== 'image2' && key !== 'image3' && 
            key !== 'image4' && key !== 'image5' && key !== 'featured_image' && 
            key !== 'itinerary_pdf') {
          // Handle itinerary data
          if (key === 'itinerary') {
            // Ensure itinerary is an array and properly formatted
            let itineraryData = formData[key];
            if (!Array.isArray(itineraryData)) {
              try {
                // Try to parse if it's a string
                if (typeof itineraryData === 'string') {
                  itineraryData = JSON.parse(itineraryData);
                } else {
                  itineraryData = [];
                }
              } catch (e) {
                itineraryData = [];
              }
            }
            // Ensure each day has the required properties
            itineraryData = itineraryData.map(day => ({
              dayNumber: parseInt(day.dayNumber) || 0,
              title: day.title || '',
              description: day.description || ''
            }));
            formDataToSend.append(key, JSON.stringify(itineraryData));
            } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      
      // Add images
      imageFiles.forEach((file, index) => {
        if (file) {
          formDataToSend.append(`image${index + 1}`, file);
        }
      });

      // Add featured image if exists
      if (featuredImageFile) {
        formDataToSend.append('featured_image', featuredImageFile);
      }

      // Add PDF if exists
      if (pdfFile) {
        formDataToSend.append('itinerary_pdf', pdfFile);
      }
      
      const url = editingPackage 
          ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/packages/${editingPackage.id}`
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/packages`;
        
      const method = editingPackage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingPackage ? 'update' : 'create'} package`);
      }

      const result = await response.json();
      setFormData(initialForm);
      setImageFiles([null, null, null, null, null]);
      setFeaturedImageFile(null);
      setPdfFile(null);
      setShowForm(false);
      
      await fetchPackages();
      
      alert(`Package ${editingPackage ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="manage-packages-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-packages-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="manage-packages-container">
      {!showForm && (
        <div className="manage-packages-tabs">
          <button 
            className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            Packages
          </button>
        </div>
      )}

      {showForm ? (
        <div className="package-form-wrapper">
          <h2>{editingPackage ? 'Edit Package' : 'Add New Package'}</h2>
          <PackageForm
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
            handlePdfChange={handlePdfChange}
            handleEditorChange={handleEditorChange}
            handleStatusToggle={handleStatusToggle}
            handleStateChange={handleStateChange}
            handleFeaturedImageChange={handleFeaturedImageChange}
            removeImage={removeImage}
            removePdf={removePdf}
            removeFeaturedImage={removeFeaturedImage}
            states={states}
            districts={districts}
            editingPackage={editingPackage}
            categories={categories}
          />
          <div className="form-actions">
            <button type="submit" className="save-btn" onClick={handleSubmit}>
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="manage-packages-header">
            <h2>Manage Packages</h2>
            <button className="add-new-btn" onClick={handleAddNew}>
              + Add New
            </button>
          </div>
          <div className="packages-table">
            {packages.length === 0 ? (
              <div className="no-packages">
                <p>No packages found. Click "Add New" to create your first package.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Featured Image</th>
                    <th>Status</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg, index) => (
                    <tr key={pkg.id}>
                      <td>{index + 1}.</td>
                      <td>{pkg.package_name}</td>
                      <td>{pkg.category}</td>
                      <td className="package-images-cell">
                        {pkg.featured_image ? (
                          <div className="package-image-item">
                            <img
                              src={pkg.featured_image}
                              alt="Featured"
                              className="package-thumbnail"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/placeholder.jpg';
                              }}
                            />
                          </div>
                        ) : (
                          <span className="no-image">No Featured Image</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${pkg.status.toLowerCase()}`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="edit-btn" 
                          onClick={(e) => handleEdit(e, pkg)}
                          type="button"
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button 
                          className="delete-btn" 
                          onClick={(e) => handleDelete(e, pkg.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ManagePackages; 