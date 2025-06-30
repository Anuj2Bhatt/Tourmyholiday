import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import slugify from 'slugify';
import './ManageVillages.css';
import { toast } from 'react-hot-toast';

const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const ManageVillages = () => {
  
  
  
  // Tab state
  const [mainTab, setMainTab] = useState('Manage Village');
  const [tableTab, setTableTab] = useState('Population');

  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    location: '',
    population: '',
    main_occupation: '',
    cultural_significance: '',
    attractions: '',
    how_to_reach: '',
    best_time_to_visit: '',
    featured_image: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    highlights: ''
  });
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [states, setStates] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const [metaErrors, setMetaErrors] = useState({
    title: '',
    description: '',
    keywords: ''
  });

  // Add new state for multiple images
  const [multipleImages, setMultipleImages] = useState([]);

  // Add new state for population data
  const [populationData, setPopulationData] = useState({
    total_population: null,
    male_population: null,
    female_population: null,
    rural_population: null,
    urban_population: null,
    literacy_rate: null,
    male_literacy_rate: null,
    female_literacy_rate: null,
    scheduled_caste_population: null,
    scheduled_tribe_population: null,
    other_backward_classes_population: null,
    muslim_population: null,
    christian_population: null,
    sikh_population: null,
    buddhist_population: null,
    jain_population: null,
    other_religions_population: null,
    not_stated_population: null
  });

  // Add new state for employment data
  const [employmentData, setEmploymentData] = useState({
    working_population: null,
    main_workers: null,
    main_cultivators: null,
    agri_labourers: null,
    marginal_workers: null,
    marginal_cultivators: null,
    non_working: null,
    non_working_males: null,
    non_working_females: null
  });

  // Add new state for education employment data
  const [educationEmploymentData, setEducationEmploymentData] = useState({
    working_population: null,
    main_workers: null,
    main_cultivators: null,
    agri_labourers: null,
    marginal_workers: null,
    marginal_cultivators: null,
    non_working: null,
    non_working_males: null,
    non_working_females: null
  });

  // Add new state for education data
  const [educationData, setEducationData] = useState({
    primary_schools_govt: null,
    middle_schools_govt: null,
    secondary_schools_govt: null,
    senior_secondary_schools_govt: null,
    nearest_arts_college: '',
    nearest_engg_college: '',
    nearest_medical_college: '',
    nearest_polytechnic: '',
    nearest_vocational_iti: ''
  });

  // Add new state for health data
  const [healthData, setHealthData] = useState({
    nearest_community_health_centre: '',
    nearest_primary_health_centre: '',
    nearest_maternity_centre: '',
    nearest_hospital_allopathic: '',
    nearest_dispensary: '',
    nearest_mobile_clinic: '',
    nearest_family_welfare_centre: ''
  });

  const [imageGalleryKey, setImageGalleryKey] = useState(0);

  useEffect(() => {
    fetchStates();
    fetchTerritories();
  }, []);

  // Add new useEffect to fetch villages when selections change
  useEffect(() => {
    if (selectedState || selectedTerritory) {
      fetchVillages();
    } else {
      setVillages([]); // Clear villages when no selection
    }
  }, [selectedState, selectedTerritory, selectedDistrict, selectedSubdistrict]);

  const fetchVillages = async (subdistrictId) => {
    try {
      setLoading(true);
      let url = '';
      
      // If subdistrictId is provided, use the subdistrict endpoint
      if (subdistrictId) {
        url = `${API_URL}/api/villages/subdistrict/${subdistrictId}`;
      } else {
        // Use the existing logic for state/territory based fetching
        if (selectedState) {
          url = `${API_URL}/api/villages`;
        } else if (selectedTerritory) {
          url = `${API_URL}/api/territory-villages`;
        }
      
        // Add query parameters based on selections
        const params = new URLSearchParams();
        if (selectedState) {
          params.append('state_id', selectedState);
          if (selectedDistrict) params.append('district_id', selectedDistrict);
          if (selectedSubdistrict) params.append('subdistrict_id', selectedSubdistrict);
        } else if (selectedTerritory) {
          params.append('territory_id', selectedTerritory);
          if (selectedDistrict) params.append('territory_district_id', selectedDistrict);
          if (selectedSubdistrict) params.append('territory_subdistrict_id', selectedSubdistrict);
        }
      
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      
      const response = await axios.get(url);
      
      if (!response.data) {
        setVillages([]);
        setError('Empty response from server');
        return;
      }

      if (!response.data.success) {
        setVillages([]);
        setError(response.data.message || 'Error from server');
        return;
      }

      const villagesData = Array.isArray(response.data.data) ? response.data.data : [];
      
      setVillages(villagesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch villages: ' + (err.response?.data?.message || err.message));
      setVillages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/states`);
      setStates(Array.isArray(response.data) ? response.data : (response.data.states || []));
    } catch (err) {
      }
  };

  const fetchTerritories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/territories`);
      setTerritories(
        Array.isArray(response.data)
          ? response.data
          : (response.data.data || response.data.territories || [])
      );
    } catch (err) {
      }
  };

  const fetchDistricts = async (parentId, type) => {
    try {
      let url = '';

      if (type === 'state') {
        // For state districts, use the state name endpoint
        const stateResponse = await axios.get(`${API_URL}/api/states/${parentId}`);
        
        const stateName = stateResponse.data.name;
        url = `${API_URL}/api/districts/state/${encodeURIComponent(stateName)}`;
      } else if (type === 'territory') {
        url = `${API_URL}/api/territory-districts/territory/${parentId}`;
      }
      
      const response = await axios.get(url);
      
      // Handle different response formats
      let districts = [];
      if (type === 'state') {
        // State districts should be an array directly
        districts = Array.isArray(response.data) ? response.data : [];
      } else {
        // Territory districts might be nested or direct array
        if (Array.isArray(response.data)) {
          districts = response.data;
        } else if (Array.isArray(response.data.districts)) {
          districts = response.data.districts;
        } else {
          districts = [];
        }
      }
      
      if (districts.length === 0) {
      }
      
      setDistricts(districts);
    } catch (err) {
      setDistricts([]);
    }
  };

  const fetchSubdistricts = async (districtId) => {
    try {
      if (!districtId) {
        setSubdistricts([]);
        setSelectedSubdistrict('');
        return;
      }

      let url;
      
      if (selectedState) {
        url = `${API_URL}/api/subdistricts/district/${districtId}`;
      } else if (selectedTerritory) {
        url = `${API_URL}/api/territory-subdistricts/district/${districtId}`;
      }

      const response = await axios.get(url);
      
      // Format the subdistricts data
      let subdistricts = [];
      if (Array.isArray(response.data)) {
        subdistricts = response.data;
      } else if (Array.isArray(response.data.subdistricts)) {
        subdistricts = response.data.subdistricts;
      } else if (response.data && typeof response.data === 'object') {
        // Sometimes backend returns an object with keys as subdistricts
        subdistricts = Object.values(response.data).filter(item => typeof item === 'object');
      } else {
        subdistricts = [];
      }
      const formattedSubdistricts = subdistricts.map(subdistrict => ({
        ...subdistrict,
        name: subdistrict.title || subdistrict.name, // Map title to name for consistency
        featured_image: subdistrict.featured_image ? 
          (subdistrict.featured_image.startsWith('http') ? 
            subdistrict.featured_image : 
            `${API_URL}/${subdistrict.featured_image}`) : 
          null
      }));
      setSubdistricts(formattedSubdistricts);
    } catch (error) {
      setError('Failed to fetch subdistricts');
      setSubdistricts([]);
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    
    setSelectedState(stateId);
    setSelectedTerritory('');
    setSelectedDistrict('');
    setSelectedSubdistrict('');
    setDistricts([]);
    setSubdistricts([]);
    
    if (stateId) {
      await fetchDistricts(stateId, 'state');
    }
  };

  const handleTerritoryChange = (e) => {
    const territoryId = e.target.value;
    setSelectedTerritory(territoryId);
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedSubdistrict('');
    setDistricts([]);
    setSubdistricts([]);
    if (territoryId) {
      fetchDistricts(territoryId, 'territory');
    }
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedSubdistrict('');
      fetchSubdistricts(districtId);
  };

  const handleSubdistrictChange = async (e) => {
    const subdistrictId = e.target.value;
    setSelectedSubdistrict(subdistrictId);
    setSelectedVillage(null); // Reset selected village
    if (subdistrictId) {
      await fetchVillages(subdistrictId);
    } else {
      setVillages([]);
    }
  };

  // Add this new function for manual slug generation
  const generateSlug = (name) => {
    return slugify(name, {
      lower: true,
      strict: true,
      trim: true
    });
  };

  // Update handleInputChange to auto-generate slug when name changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Auto-generate slug when name changes
      if (name === 'name' && value) {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleRichTextChange = (name) => (content) => {
    setFormData(prev => ({
      ...prev,
      [name]: content
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        featured_image: preview,
        image_alt_texts: { ...(prev.image_alt_texts || {}), 0: '' } // Initialize image_alt_texts if undefined
      }));
      setImagePreviews([{
      file,
        preview,
        isFeatured: true
      }]);
    }
  };

  const handleImageAltTextChange = (index, altText) => {
    setFormData(prev => ({
      ...prev,
      image_alt_texts: {
        ...prev.image_alt_texts,
        [index]: altText
      }
    }));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Validation functions
  const validateMetaTitle = (title) => {
    if (!title) return 'Meta title is required';
    if (title.length < 50 || title.length > 60) {
      return `Meta title must be between 50-60 characters (${title.length}/60)`;
    }
    return '';
  };

  const validateMetaDescription = (description) => {
    if (!description) return 'Meta description is required';
    if (description.length < 150 || description.length > 160) {
      return `Meta description must be between 150-160 characters (${description.length}/160)`;
    }
    return '';
  };

  const validateMetaKeywords = (keywords) => {
    if (!keywords) return 'Meta keywords are required';
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywordArray.length < 8) {
      return `Minimum 8 keywords required (${keywordArray.length}/8)`;
    }
    return '';
  };

  // Handle meta field changes with validation
  const handleMetaFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    let error = '';
    switch (field) {
      case 'meta_title':
        error = validateMetaTitle(value);
        break;
      case 'meta_description':
        error = validateMetaDescription(value);
        break;
      case 'meta_keywords':
        error = validateMetaKeywords(value);
        break;
      default:
        break;
    }

    setMetaErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Validate all meta fields before submission
  const validateMetaFields = () => {
    const titleError = validateMetaTitle(formData.meta_title);
    const descriptionError = validateMetaDescription(formData.meta_description);
    const keywordsError = validateMetaKeywords(formData.meta_keywords);

    setMetaErrors({
      title: titleError,
      description: descriptionError,
      keywords: keywordsError
    });

    return !titleError && !descriptionError && !keywordsError;
  };

  // Update the formatImageUrl helper function
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return `${API_URL}/uploads/default-image.jpg`;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // If it starts with /uploads/, prepend API_URL if missing
    if (imagePath.startsWith('/uploads/')) return `${API_URL}${imagePath}`;
    // If it's just a filename, prepend /uploads/
    return `${API_URL}/uploads/${imagePath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateMetaFields()) {
      toast.error('Please fix the meta field errors before submitting');
      return;
    }

    try {
      let featuredImagePath = null;

      // Upload featured image if it's a new file
      if (imagePreviews.length > 0 && imagePreviews[0].file) {
        
        const formDataObj = new FormData();
        formDataObj.append('featured_image', imagePreviews[0].file);

        try {
          const uploadResponse = await axios.post(`${API_URL}/api/upload`, formDataObj, {
            headers: { 
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (uploadResponse.data.images && uploadResponse.data.images.length > 0) {
            featuredImagePath = uploadResponse.data.images[0];
          } else {
            toast.error('Failed to upload image: No path received');
            return;
          }
        } catch (uploadError) {
          toast.error('Failed to upload image: ' + (uploadError.response?.data?.message || uploadError.message));
          return;
        }
      } else if (formData.featured_image) {
        // If it's an existing image, extract just the filename
        const imageUrl = formData.featured_image;
        if (imageUrl.startsWith('http')) {
          // Extract filename from URL
          const urlParts = imageUrl.split('/');
          featuredImagePath = urlParts[urlParts.length - 1];
        } else {
          featuredImagePath = imageUrl;
        }
      }

      // Always ensure slug is set before sending
      let slugToSend = formData.slug;
      if (!slugToSend && formData.name) {
        slugToSend = generateSlug(formData.name);
      }
      // Always send only the filename for featured_image
      let featuredImageToSend = featuredImagePath; // Use uploaded image if available
      if (!featuredImageToSend && formData.featured_image) {
        const parts = formData.featured_image.split('/');
        featuredImageToSend = parts[parts.length - 1];
      }
      // FINAL strict check
      if (
        !featuredImageToSend ||
        featuredImageToSend === 'undefined' ||
        featuredImageToSend.startsWith('undefined/') ||
        featuredImageToSend.includes('undefined/')
      ) {
        featuredImageToSend = null;
      }
      // Create village data with the featured image path
      const villageData = {
        ...formData,
        slug: slugToSend,
        featured_image: featuredImageToSend,
      };

      // Add appropriate IDs based on selection
      if (selectedState) {
        villageData.state_id = selectedState;
        villageData.district_id = selectedDistrict;
        villageData.subdistrict_id = selectedSubdistrict;
        villageData.village_type = 'state';
        let url = '';
        let response;
        if (selectedVillage) {
          url = `${API_URL}/api/villages/${selectedVillage.id}`;
          response = await axios.put(url, villageData);
        } else {
          url = `${API_URL}/api/villages`;
          response = await axios.post(url, villageData);
        }
        if (response.data.success) {
          setShowForm(false);
          setFormData({
            name: '',
            slug: '',
            description: '',
            location: '',
            population: '',
            main_occupation: '',
            cultural_significance: '',
            attractions: '',
            how_to_reach: '',
            best_time_to_visit: '',
            featured_image: '',
            status: 'draft',
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
            highlights: ''
          });
          setImagePreviews([]);
          setSelectedVillage(null);
          fetchVillages();
          toast.success(selectedVillage ? 'State village updated successfully' : 'State village created successfully');
        } else {
          throw new Error(response.data.message || 'Failed to save village');
        }
      } else if (selectedTerritory) {
        villageData.territory_id = selectedTerritory;
        villageData.territory_district_id = selectedDistrict;
        villageData.territory_subdistrict_id = selectedSubdistrict;
        villageData.village_type = 'territory';
        let url = '';
        let response;
        if (selectedVillage) {
          url = `${API_URL}/api/territory-villages/${selectedVillage.id}`;
          response = await axios.put(url, villageData);
        } else {
          url = `${API_URL}/api/territory-villages`;
          response = await axios.post(url, villageData);
        }
        if (response.data.success) {
          setShowForm(false);
          setFormData({
            name: '',
            slug: '',
            description: '',
            location: '',
            population: '',
            main_occupation: '',
            cultural_significance: '',
            attractions: '',
            how_to_reach: '',
            best_time_to_visit: '',
            featured_image: '',
            status: 'draft',
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
            highlights: ''
          });
          setImagePreviews([]);
          setSelectedVillage(null);
          fetchVillages();
          toast.success(selectedVillage ? 'Territory village updated successfully' : 'Territory village created successfully');
        } else {
          throw new Error(response.data.message || 'Failed to save village');
        }
      }

      // For state villages
      let url = '';
      let response;
      
      if (selectedVillage) {
        url = `${API_URL}/api/villages/${selectedVillage.id}`;
        response = await axios.put(url, villageData);
      } else {
        url = `${API_URL}/api/villages`;
        response = await axios.post(url, villageData);
      }

      if (response.data.success) {
        setShowForm(false);
        setFormData({
          name: '',
          slug: '',
          description: '',
          location: '',
          population: '',
          main_occupation: '',
          cultural_significance: '',
          attractions: '',
          how_to_reach: '',
          best_time_to_visit: '',
          featured_image: '',
          status: 'draft',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          highlights: ''
        });
        setImagePreviews([]);
        setSelectedVillage(null);
        fetchVillages();
        toast.success(selectedVillage ? 'State village updated successfully' : 'State village created successfully');
      } else {
        throw new Error(response.data.message || 'Failed to save village');
      }
    } catch (err) {
      toast.error('Failed to save village: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (village) => {
    setSelectedVillage(village);
    setFormData({
      ...village,
      featured_image: village.featured_image, // Use raw value, not formatImageUrl
      slug: village.slug || generateSlug(village.name || '')
    });
    // Set image preview for featured image
    if (village.featured_image && village.featured_image !== 'undefined' && village.featured_image !== '') {
      const previewUrl = formatImageUrl(village.featured_image);
      setImagePreviews([{
        preview: previewUrl,
        file: null,
        isFeatured: true
      }]);
    } else {
      setImagePreviews([]);
    }
    setSelectedState(village.state_id);
    setSelectedDistrict(village.district_id);
    setSelectedSubdistrict(village.subdistrict_id);
    if (village.state_id) {
      fetchDistricts(village.state_id, 'state');
    }
    if (village.district_id) {
      fetchSubdistricts(village.district_id);
    }
    setShowForm(true);
  };

  const handleDelete = async (villageId) => {
    if (window.confirm('Are you sure you want to delete this village?')) {
      try {
        const url = selectedState 
          ? `${API_URL}/api/villages/${villageId}`
          : `${API_URL}/api/territory-villages/${villageId}`;
        await axios.delete(url);
        fetchVillages();
      } catch (err) {
        alert('Failed to delete village: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Add new function to handle multiple image uploads
  const handleMultipleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
      }
      
      return isValidType && isValidSize;
    });

    // Create preview URLs for valid files
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      altText: '',
      description: ''
    }));

    // Update state with new images
    setMultipleImages(prev => {
      const updatedImages = [...prev, ...newImages];
      // Limit to 10 images
      if (updatedImages.length > 10) {
        toast.error('Maximum 10 images allowed');
        return updatedImages.slice(0, 10);
      }
      return updatedImages;
    });
  };

  // Add function to remove an image
  const removeMultipleImage = (index) => {
    setMultipleImages(prev => prev.filter((_, i) => i !== index));
  };

  // Add function to update image details
  const updateImageDetails = (index, field, value) => {
    setMultipleImages(prev => prev.map((img, i) => 
      i === index ? { ...img, [field]: value } : img
    ));
  };

  // Update handleMultipleImageSubmit function
  const handleMultipleImageSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedVillage) {
      toast.error('Please select a village first');
      return;
    }

    if (multipleImages.length === 0) {
      toast.error('Please select at least one image to upload');
      return;
    }

    try {
      const formData = new FormData();
      
      // Add each image to formData
      multipleImages.forEach((image, index) => {
        if (image.file) {
          formData.append('images', image.file);
          formData.append(`display_orders[${index}]`, index + 1);
        }
      });

      // Use the correct endpoint for state_village_images
      const endpoint = `${API_URL}/api/state-village-images`;
      formData.append('village_id', selectedVillage.id);

      const response = await axios.post(endpoint, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload images');
      }

      toast.success('Images uploaded successfully');
      setShowForm(false);
      setMultipleImages([]);
      fetchVillages(); // Refresh to show new images
    } catch (err) {
      toast.error('Failed to upload images: ' + (err.response?.data?.message || err.message));
    }
  };

  // Update the VillageImageGallery component
  const VillageImageGallery = ({ village }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredImage, setHoveredImage] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const handleDeleteImage = async (imageId) => {

      if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;
      try {
        let endpoint = '';
        if (village.state_id) {
          endpoint = `${API_URL}/api/state-village-images/${imageId}`;
        } else if (village.territory_id) {
          endpoint = `${API_URL}/api/territory-village-images/${imageId}`;
        } else {
          toast.error('No village type selected');
          return;
        }
        const response = await axios.delete(endpoint);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to delete image');
        }
        toast.success('Image deleted successfully');
        setImages(prev => prev.filter(img => img.id !== imageId));
      } catch (err) {
        toast.error('Failed to delete image: ' + (err.response?.data?.message || err.message));
      }
    };

    const handleImageSelect = (imageId) => {
      setSelectedImages(prev => {
        if (prev.includes(imageId)) {
          return prev.filter(id => id !== imageId);
        } else {
          return [...prev, imageId];
        }
      });
    };

    const handleCutSelected = async () => {
      if (selectedImages.length === 0) {
        toast.warning('Please select images to cut');
        return;
      }
      
      if (!window.confirm(`Are you sure you want to delete ${selectedImages.length} selected image(s)? This action cannot be undone.`)) return;
      
      try {
        let successCount = 0;
        let failCount = 0;
        
        for (const imageId of selectedImages) {
          try {
            let endpoint = '';
            if (village.state_id) {
              endpoint = `${API_URL}/api/state-village-images/${imageId}`;
            } else if (village.territory_id) {
              endpoint = `${API_URL}/api/territory-village-images/${imageId}`;
            }
            
            const response = await axios.delete(endpoint);
            if (response.data.success) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            failCount++;
            }
        }
        
        if (successCount > 0) {
          toast.success(`Successfully deleted ${successCount} image(s)`);
          setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
          setSelectedImages([]);
          setIsSelectionMode(false);
        }
        
        if (failCount > 0) {
          toast.error(`Failed to delete ${failCount} image(s)`);
        }
      } catch (err) {
        toast.error('Error occurred during bulk delete');
      }
    };

    const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      if (isSelectionMode) {
        setSelectedImages([]);
      }
    };

    useEffect(() => {
      const loadImages = async () => {
        try {
          setLoading(true);
          const endpoint = `${API_URL}/api/state-village-images/${village.id}`;

          const response = await axios.get(endpoint);
          
          if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch village images');
          }

          setImages(response.data.data || []);
        } catch (err) {
          toast.error('Failed to fetch village images: ' + (err.response?.data?.message || err.message));
          setImages([]);
        } finally {
          setLoading(false);
        }
      };

      if (village && village.id) {
        loadImages();
      }
    }, [village.id]);

    if (loading) {
      return (
        <div className="image-gallery-loading">
          <div className="loading-spinner"></div>
          <p>Loading images...</p>
        </div>
      );
    }

    return (
      <div className="village-image-gallery">
        {/* Gallery Header with Cut Option */}
        <div className="gallery-header">
          <div className="gallery-info">
            <h4>Village Images ({images.length})</h4>
            {isSelectionMode && (
              <span className="selection-info">
                {selectedImages.length} image(s) selected
              </span>
            )}
          </div>
          <div className="gallery-actions">
            <button
              className={`selection-toggle-btn ${isSelectionMode ? 'active' : ''}`}
              onClick={toggleSelectionMode}
              title={isSelectionMode ? 'Exit Selection Mode' : 'Enter Selection Mode'}
            >
              <i className="fas fa-check-square"></i>
              {isSelectionMode ? ' Exit Selection' : ' Select Images'}
            </button>
            {isSelectionMode && selectedImages.length > 0 && (
              <button
                className="cut-selected-btn"
                onClick={handleCutSelected}
                title={`Delete ${selectedImages.length} selected image(s)`}
              >
                <i className="fas fa-cut"></i>
                Cut Selected ({selectedImages.length})
              </button>
            )}
          </div>
        </div>

        {images.length > 0 ? (
          <div className="mv-gallery-image-grid">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className={`mv-gallery-image-container ${isSelectionMode && selectedImages.includes(image.id) ? 'selected' : ''}`}
                onMouseEnter={() => {
                  setHoveredImage(image.id);
                }}
                onMouseLeave={() => {
                  setHoveredImage(null);
                }}
                onClick={() => isSelectionMode && handleImageSelect(image.id)}
              >
                {isSelectionMode && (
                  <div className="selection-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => handleImageSelect(image.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <img
                  src={formatImageUrl(image.image_path)}
                  alt={image.alt_text || `${village.name} image ${index + 1}`}
                  className="mv-gallery-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${API_URL}/uploads/no-image.png`;
                  }}
                />
                {hoveredImage === image.id && !isSelectionMode && (
                  <div className="image-overlay">
                    <div className="image-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setSelectedVillage(village);
                          setShowForm(true);
                          setMultipleImages([{
                            id: image.id,
                            preview: formatImageUrl(image.image_path),
                            file: null,
                            altText: image.alt_text || '',
                            description: image.description || ''
                          }]);
                        }}
                        title="Edit Image Details"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteImage(image.id)}
                        title="Delete Image"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-images-message">
            <i className="fas fa-images"></i>
            <p>No images available for this village</p>
            <small>Click "Add New Image" to upload images</small>
          </div>
        )}
      </div>
    );
  };

  // Update the VillageImageCard component to remove duplicate button
  const VillageImageCard = ({ village }) => {
    return (
      <div className="village-image-card">
        <div className="village-header">
          <h3>{village.name}</h3>
          <div className="village-image-stats">
            <span className="image-count">
              <i className="fas fa-images"></i>
              <span id="image-count">Loading...</span> images
            </span>
          </div>
        </div>
        <VillageImageGallery village={village} />
      </div>
    );
  };

  // Add village change handler
  const handleVillageSelect = (e) => {
    const villageId = parseInt(e.target.value);
    const village = villages.find(v => v.id === villageId);
    setSelectedVillage(village || null);
    if (village) {
      fetchPopulationData(village.id);
      fetchEmploymentData(village.id);
      fetchEducationData(village.id);
    } else {
      setPopulationData({
        total_population: null,
        male_population: null,
        female_population: null,
        rural_population: null,
        urban_population: null,
        literacy_rate: null,
        male_literacy_rate: null,
        female_literacy_rate: null,
        scheduled_caste_population: null,
        scheduled_tribe_population: null,
        other_backward_classes_population: null,
        muslim_population: null,
        christian_population: null,
        sikh_population: null,
        buddhist_population: null,
        jain_population: null,
        other_religions_population: null,
        not_stated_population: null
      });
      setEmploymentData({
        working_population: null,
        main_workers: null,
        main_cultivators: null,
        agri_labourers: null,
        marginal_workers: null,
        marginal_cultivators: null,
        non_working: null,
        non_working_males: null,
        non_working_females: null
      });
      setEducationData({
        primary_schools_govt: null,
        middle_schools_govt: null,
        secondary_schools_govt: null,
        senior_secondary_schools_govt: null,
        nearest_arts_college: '',
        nearest_engg_college: '',
        nearest_medical_college: '',
        nearest_polytechnic: '',
        nearest_vocational_iti: ''
      });
    }
  };

  // Add function to handle population data changes
  const handlePopulationChange = (field, value) => {
    setPopulationData(prev => ({
      ...prev,
      [field]: value ? parseInt(value) : null
    }));
  };

  // Add function to save population data
  const handleSavePopulation = async () => {
    if (!selectedVillage?.id) {
      toast.error('Please select a village first');
      return;
    }

    try {
      const url = `${API_URL}/api/village-population/village/${selectedVillage.id}`;
      const response = await axios.put(url, populationData);

      if (response.data.success) {
        toast.success('Population data saved successfully');
        // Refresh population data after save
        fetchPopulationData(selectedVillage.id);
      } else {
        throw new Error(response.data.message || 'Failed to save population data');
      }
    } catch (error) {
      toast.error('Failed to save population data: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add function to fetch population data
  const fetchPopulationData = async (villageId) => {
    try {
      const url = `${API_URL}/api/village-population/village/${villageId}`;
      const response = await axios.get(url);

      if (response.data.success) {
        setPopulationData(response.data.data || {
          total_population: null,
          male_population: null,
          female_population: null,
          rural_population: null,
          urban_population: null,
          literacy_rate: null,
          male_literacy_rate: null,
          female_literacy_rate: null,
          scheduled_caste_population: null,
          scheduled_tribe_population: null,
          other_backward_classes_population: null,
          muslim_population: null,
          christian_population: null,
          sikh_population: null,
          buddhist_population: null,
          jain_population: null,
          other_religions_population: null,
          not_stated_population: null
        });
      }
    } catch (error) {
      toast.error('Failed to fetch population data: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add useEffect to fetch population data when village is selected
  useEffect(() => {
    if (selectedVillage?.id) {
      fetchPopulationData(selectedVillage.id);
    }
  }, [selectedVillage]);

  // Add function to fetch employment data
  const fetchEmploymentData = async (villageId) => {
    try {
      const response = await axios.get(`${API_URL}/api/village-employment/state/village/${villageId}`);
      if (response.data.success) {
        setEmploymentData(response.data.data || {
          working_population: null,
          main_workers: null,
          main_cultivators: null,
          agri_labourers: null,
          marginal_workers: null,
          marginal_cultivators: null,
          non_working: null,
          non_working_males: null,
          non_working_females: null
        });
      }
    } catch (error) {
      toast.error('Failed to fetch employment data');
    }
  };

  // Add function to handle employment data changes
  const handleEmploymentChange = (field, value) => {
    setEmploymentData(prev => ({
      ...prev,
      [field]: value ? parseInt(value) : null
    }));
  };

  // Add function to save employment data
  const handleSaveEmployment = async () => {
    if (!selectedVillage?.id) {
      toast.error('Please select a village first');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/village-employment/state/village/${selectedVillage.id}`,
        employmentData
      );

      if (response.data.success) {
        toast.success('Employment data saved successfully');
        // Refresh employment data after save
        await fetchEmploymentData(selectedVillage.id);
      } else {
        throw new Error(response.data.message || 'Failed to save employment data');
      }
    } catch (error) {
      toast.error('Failed to save employment data: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add function to handle education employment data changes
  const handleEducationEmploymentChange = (field, value) => {
    setEducationEmploymentData(prev => ({
      ...prev,
      [field]: value ? parseInt(value) : null
    }));
  };

  // Add function to fetch education employment data
  const fetchEducationEmploymentData = async (villageId) => {
    try {
      const response = await axios.get(`${API_URL}/api/village-education-employment/state/village/${villageId}`);
      if (response.data.success) {
        setEducationEmploymentData(response.data.data || {
          working_population: null,
          main_workers: null,
          main_cultivators: null,
          agri_labourers: null,
          marginal_workers: null,
          marginal_cultivators: null,
          non_working: null,
          non_working_males: null,
          non_working_females: null
        });
      }
    } catch (error) {
      toast.error('Failed to fetch education employment data');
    }
  };

  // Add function to save education employment data
  const handleSaveEducationEmployment = async () => {
    if (!selectedVillage?.id) {
      toast.error('Please select a village first');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/village-education-employment/state/village/${selectedVillage.id}`,
        educationEmploymentData
      );

      if (response.data.success) {
        toast.success('Education employment data saved successfully');
        await fetchEducationEmploymentData(selectedVillage.id);
      } else {
        throw new Error(response.data.message || 'Failed to save education employment data');
      }
    } catch (error) {
      toast.error('Failed to save education employment data: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update the fetchEducationData function
  const fetchEducationData = async (villageId) => {
    try {
      // Determine if it's a state or territory village
      const endpoint = selectedState 
        ? `${API_URL}/api/village-education/state/village/${villageId}`
        : `${API_URL}/api/village-education/territory/village/${villageId}`;

      const response = await axios.get(endpoint);

      if (response.data.success) {
        setEducationData(response.data.data || {
          primary_schools_govt: null,
          middle_schools_govt: null,
          secondary_schools_govt: null,
          senior_secondary_schools_govt: null,
          nearest_arts_college: '',
          nearest_engg_college: '',
          nearest_medical_college: '',
          nearest_polytechnic: '',
          nearest_vocational_iti: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch education data');
      }
    } catch (error) {
      toast.error('Failed to fetch education data: ' + (error.response?.data?.message || error.message));
      // Set default empty values on error
      setEducationData({
        primary_schools_govt: null,
        middle_schools_govt: null,
        secondary_schools_govt: null,
        senior_secondary_schools_govt: null,
        nearest_arts_college: '',
        nearest_engg_college: '',
        nearest_medical_college: '',
        nearest_polytechnic: '',
        nearest_vocational_iti: ''
      });
    }
  };

  // Update the handleSaveEducation function
  const handleSaveEducation = async () => {
    if (!selectedVillage?.id) {
      toast.error('Please select a village first');
      return;
    }

    try {
      // Determine if it's a state or territory village
      const endpoint = selectedState 
        ? `${API_URL}/api/village-education/state/village/${selectedVillage.id}`
        : `${API_URL}/api/village-education/territory/village/${selectedVillage.id}`;

      const response = await axios.put(endpoint, educationData);

      if (response.data.success) {
        toast.success('Education data saved successfully');
        await fetchEducationData(selectedVillage.id);
      } else {
        throw new Error(response.data.message || 'Failed to save education data');
      }
    } catch (error) {
      toast.error('Failed to save education data: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update the handleEducationChange function to handle both number and text inputs
  const handleEducationChange = (field, value) => {
    // For numeric fields, convert to number or null
    const numericFields = [
      'primary_schools_govt',
      'middle_schools_govt',
      'secondary_schools_govt',
      'senior_secondary_schools_govt'
    ];

    setEducationData(prev => ({
      ...prev,
      [field]: numericFields.includes(field) 
        ? (value === '' ? null : parseInt(value))
        : value
    }));
  };

  // Add function to handle health data changes
  const handleHealthChange = (field, value) => {
    setHealthData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add function to save health data
  const handleSaveHealth = async () => {
    if (!selectedVillage?.id) {
      toast.error('Please select a village first');
      return;
    }

    try {
      // Determine if it's a state or territory village
      const endpoint = selectedState 
        ? `${API_URL}/api/village-health/state/village/${selectedVillage.id}`
        : `${API_URL}/api/village-health/territory/village/${selectedVillage.id}`;

      const response = await axios.put(endpoint, healthData);

      if (response.data.success) {
        toast.success('Health data saved successfully');
        await fetchHealthData(selectedVillage.id);
      } else {
        throw new Error(response.data.message || 'Failed to save health data');
      }
    } catch (error) {
      toast.error('Failed to save health data: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add function to fetch health data
  const fetchHealthData = async (villageId) => {
    try {
      // Determine if it's a state or territory village
      const endpoint = selectedState 
        ? `${API_URL}/api/village-health/state/village/${villageId}`
        : `${API_URL}/api/village-health/territory/village/${villageId}`;

      const response = await axios.get(endpoint);

      if (response.data.success) {
        setHealthData(response.data.data || {
          nearest_community_health_centre: '',
          nearest_primary_health_centre: '',
          nearest_maternity_centre: '',
          nearest_hospital_allopathic: '',
          nearest_dispensary: '',
          nearest_mobile_clinic: '',
          nearest_family_welfare_centre: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch health data');
      }
    } catch (error) {
      toast.error('Failed to fetch health data: ' + (error.response?.data?.message || error.message));
      // Set default empty values on error
      setHealthData({
        nearest_community_health_centre: '',
        nearest_primary_health_centre: '',
        nearest_maternity_centre: '',
        nearest_hospital_allopathic: '',
        nearest_dispensary: '',
        nearest_mobile_clinic: '',
        nearest_family_welfare_centre: ''
      });
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="manage-villages">
      {/* Top-level Tabs */}
      <div className="admin-tabs">
        {['Manage Village', 'Village Image', 'Manage Table'].map(tab => (
          <button
            key={tab}
            className={`admin-tab-btn${mainTab === tab ? ' active' : ''}`}
            onClick={() => setMainTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {mainTab === 'Manage Village' && (
        <>
          <div className="section-header mv-header-flex">
            <div className="mv-dropdowns mv-dropdowns-row">
              <select value={selectedState} onChange={handleStateChange}>
                <option value="">Select State</option>
                {(states || []).map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              <select value={selectedTerritory} onChange={handleTerritoryChange}>
                <option value="">Select Territory</option>
                {(territories || []).map(territory => (
                  <option key={territory.id} value={territory.id}>{territory.title}</option>
                ))}
              </select>
              { (selectedState || selectedTerritory) && (
                <select value={selectedDistrict} onChange={handleDistrictChange}>
                  <option value="">Select District</option>
                  {(districts || []).map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              )}
              { selectedDistrict && (
                <select value={selectedSubdistrict} onChange={handleSubdistrictChange}>
                  <option value="">Select Subdistrict</option>
                  {(subdistricts || []).map(subdistrict => (
                    <option key={subdistrict.id} value={subdistrict.id}>{subdistrict.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="mv-header-right">
            {selectedSubdistrict && (
              <button className="add-new-btn" onClick={() => {
                setShowForm(true);
                setSelectedVillage(null);
                setFormData({
                  name: '',
                    slug: '',
                  description: '',
                  location: '',
                  population: '',
                  main_occupation: '',
                  cultural_significance: '',
                  attractions: '',
                  how_to_reach: '',
                  best_time_to_visit: '',
                    featured_image: '',
                    status: 'draft',
                    meta_title: '',
                    meta_description: '',
                    meta_keywords: '',
                    highlights: ''
                });
                setImagePreviews([]);
              }}>
                <i className="fas fa-plus"></i> Add New Village
              </button>
            )}
            </div>
          </div>

          {showForm && (
            <div className="village-form-container">
              <form onSubmit={handleSubmit} className="village-form">
                <div className="form-row">
                <div className="form-group">
                  <label>Village Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                  </div>
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label>Slug</label>
                    <div className="slug-input-group">
                  <input
                    type="text"
                        name="slug"
                        value={formData.slug}
                    onChange={handleInputChange}
                    required
                  />
                      <button 
                        type="button" 
                        className="generate-slug-btn"
                        onClick={() => {
                          if (formData.name) {
                            setFormData(prev => ({
                              ...prev,
                              slug: generateSlug(formData.name)
                            }));
                          }
                        }}
                        title="Generate slug from name"
                      >
                        <i className="fas fa-sync-alt" />
                      </button>
                </div>
                  </div>
                <div className="form-group">
                  <label>Population</label>
                  <input
                    type="number"
                    name="population"
                    value={formData.population}
                    onChange={handleInputChange}
                    required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <ReactQuill
                    value={formData.description}
                    onChange={handleRichTextChange('description')}
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

                <div className="form-group">
                  <label>Main Occupation</label>
                  <input
                    type="text"
                    name="main_occupation"
                    value={formData.main_occupation}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cultural Significance</label>
                  <ReactQuill
                    value={formData.cultural_significance}
                    onChange={handleRichTextChange('cultural_significance')}
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

                <div className="form-group">
                  <label>Attractions</label>
                  <ReactQuill
                    value={formData.attractions}
                    onChange={handleRichTextChange('attractions')}
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

                <div className="form-group">
                  <label>How to Reach</label>
                  <ReactQuill
                    value={formData.how_to_reach}
                    onChange={handleRichTextChange('how_to_reach')}
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

                <div className="form-group">
                  <label>Best Time to Visit</label>
                  <input
                    type="text"
                    name="best_time_to_visit"
                    value={formData.best_time_to_visit}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Highlights</label>
                  <ReactQuill
                    value={formData.highlights}
                    onChange={handleRichTextChange('highlights')}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                    placeholder="Enter village highlights..."
                  />
                </div>

                <div className="form-group">
                  <label>Featured Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="image-previews">
                    {Array.isArray(imagePreviews) && imagePreviews.map((preview, index) => {
                      if (!preview || typeof preview !== 'object') {
                        return null;
                      }
                      
                      return (
                        <div key={index} className="image-preview featured">
                          <img 
                            src={preview.preview || ''} 
                            alt="Featured preview"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${API_URL}/uploads/default-image.jpg`;
                            }}
                          />
                          <div className="image-preview-controls">
                            <input
                              type="text"
                              placeholder="Alt Text"
                              value={(formData.image_alt_texts && formData.image_alt_texts[index]) || ''}
                              onChange={(e) => handleImageAltTextChange(index, e.target.value)}
                            />
                            <button type="button" onClick={() => {
                              setImagePreviews([]);
                              setFormData(prev => ({ 
                                ...prev, 
                                featured_image: '',
                                image_alt_texts: {} 
                              }));
                            }}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Meta Information Section */}
                <div className="meta-section">
                  <h3>Meta Information</h3>
                  <div className="form-group">
                    <label htmlFor="meta_title">
                      Meta Title <span className="required">*</span>
                      <span className="char-count">{formData.meta_title?.length || 0}/60</span>
                    </label>
                    <input
                      type="text"
                      id="meta_title"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => handleMetaFieldChange('meta_title', e.target.value)}
                      className={metaErrors.title ? 'error' : ''}
                      placeholder="Enter meta title (50-60 characters)"
                    />
                    {metaErrors.title && <div className="error-message">{metaErrors.title}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="meta_description">
                      Meta Description <span className="required">*</span>
                      <span className="char-count">{formData.meta_description?.length || 0}/160</span>
                    </label>
                    <textarea
                      id="meta_description"
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => handleMetaFieldChange('meta_description', e.target.value)}
                      className={metaErrors.description ? 'error' : ''}
                      placeholder="Enter meta description (150-160 characters)"
                      rows="3"
                    />
                    {metaErrors.description && <div className="error-message">{metaErrors.description}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="meta_keywords">
                      Meta Keywords <span className="required">*</span>
                      <span className="keyword-count">
                        {formData.meta_keywords ? formData.meta_keywords.split(',').filter(k => k.trim()).length : 0}/8 keywords
                      </span>
                    </label>
                    <textarea
                      id="meta_keywords"
                      name="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => handleMetaFieldChange('meta_keywords', e.target.value)}
                      className={metaErrors.keywords ? 'error' : ''}
                      placeholder="Enter keywords separated by commas (minimum 8 keywords)"
                      rows="3"
                    />
                    {metaErrors.keywords && <div className="error-message">{metaErrors.keywords}</div>}
                    <div className="help-text">Enter at least 8 keywords separated by commas (e.g., village tourism, rural tourism, cultural heritage, local traditions, authentic experiences, village life, rural India, cultural tourism)</div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {selectedVillage ? 'Update Village' : 'Save Village'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {selectedSubdistrict && (
            <div className="villages-table-container">
              {loading ? (
                <div className="loading">Loading villages...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : !Array.isArray(villages) ? (
                <div className="error-message">Invalid data format received from server</div>
              ) : villages.length === 0 ? (
                <div className="no-data">No villages found</div>
              ) : (
              <table className="villages-table">
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Featured Image</th>
                    <th>Actions</th>
                      <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                    {villages.map((village, idx) => {
                      // Validate village object
                      if (!village || typeof village !== 'object') {
                        return null;
                      }
                      
                      // Format the image URL
                      const imageUrl = village.featured_image ? formatImageUrl(village.featured_image) : null;
                      
                      return (
                        <tr key={village.id || `village-${idx}`}>
                      <td>{idx + 1}</td>
                          <td>
                            <div className="village-title-cell">
                              <span>{village.name || 'Unnamed Village'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="village-description">
                              {stripHtml(village.description || '').substring(0, 100)}
                              {village.description && village.description.length > 100 ? '...' : ''}
                            </div>
                          </td>
                      <td>
                        {village.featured_image ? (
                              <div className="village-image-cell" style={{ position: 'relative' }}>
                                <img
                                  src={formatImageUrl(village.featured_image)}
                                  alt={`${village.name || 'Village'} featured image`}
                                  className="village-featured-image"
                                  style={{ maxWidth: 80, maxHeight: 80, marginBottom: 4 }}
                                  onError={e => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <div style={{
                                  fontSize: 10,
                                  color: '#c00',
                                  wordBreak: 'break-all',
                                  background: '#fffbe6',
                                  border: '1px solid #ffe58f',
                                  padding: 2,
                                  borderRadius: 2,
                                  marginTop: 2
                                }}>
                                  <div><b>URL:</b> {formatImageUrl(village.featured_image)}</div>
                                  <div><b>Raw:</b> {village.featured_image}</div>
                                </div>
                              </div>
                            ) : null}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(village)}
                          >
                                <i className="fas fa-edit" />
                                <span>Edit</span>
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(village.id)}
                          >
                                <i className="fas fa-trash-alt" />
                                <span>Delete</span>
                          </button>
                        </div>
                      </td>
                          <td>
                            <span className={`status-badge ${village.status || 'draft'}`}>
                              {village.status || 'draft'}
                            </span>
                      </td>
                    </tr>
                      );
                    })}
                </tbody>
              </table>
              )}
            </div>
          )}
        </>
      )}

      {mainTab === 'Village Image' && (
        <div className="village-image-tab">
          <div className="section-header mv-header-flex">
            <div className="mv-dropdowns mv-dropdowns-row">
              <select value={selectedState} onChange={handleStateChange}>
                <option value="">Select State</option>
                {(states || []).map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              <select value={selectedTerritory} onChange={handleTerritoryChange}>
                <option value="">Select Territory</option>
                {(territories || []).map(territory => (
                  <option key={territory.id} value={territory.id}>{territory.title}</option>
                ))}
              </select>
              {(selectedState || selectedTerritory) && (
                <select value={selectedDistrict} onChange={handleDistrictChange}>
                  <option value="">Select District</option>
                  {(districts || []).map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              )}
              {selectedDistrict && (
                <select value={selectedSubdistrict} onChange={handleSubdistrictChange}>
                  <option value="">Select Subdistrict</option>
                  {(subdistricts || []).map(subdistrict => (
                    <option key={subdistrict.id} value={subdistrict.id}>{subdistrict.name}</option>
                  ))}
                </select>
              )}
              {/* Add Village Dropdown */}
              {selectedSubdistrict && (
                <select 
                  value={selectedVillage?.id || ''} 
                  onChange={handleVillageSelect}
                >
                  <option value="">Select Village</option>
                  {(villages || []).map(village => (
                    <option key={village.id} value={village.id}>{village.name}</option>
                  ))}
                </select>
              )}
        </div>
            <div className="mv-header-right">
              {/* Only show Add New Image button when a village is selected */}
              {selectedVillage && (
                <button 
                  className="add-new-btn" 
                  onClick={() => {
                    setShowForm(true);
                    setMultipleImages([]);
                  }}
                >
                  <i className="fas fa-plus"></i> Add New Image
                </button>
              )}
            </div>
          </div>

          {/* Only show village images when a village is selected */}
          {selectedVillage ? (
            <div className="villages-container">
              {loading ? (
                <div className="loading">Loading village images...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : (
                <VillageImageCard village={selectedVillage} />
              )}
            </div>
          ) : selectedSubdistrict ? (
            <div className="no-selection-message">
              Please select a village to view or manage its images
            </div>
          ) : null}

          {/* Image Upload Modal */}
          {showForm && selectedVillage && (
            <div className="village-modal-overlay">
              <div className="village-modal-content">
                <form onSubmit={handleMultipleImageSubmit} className="image-upload-form">
                  <div className="form-header">
                    <h2>Upload Images for {selectedVillage.name}</h2>
                    <button type="button" className="close-btn" onClick={() => {
                      setShowForm(false);
                      setMultipleImages([]);
                    }}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Select Images</label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleImageChange}
                        className="file-input"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="file-upload-label">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Click to select images or drag and drop</span>
                      </label>
                    </div>
                    <p className="help-text">You can select multiple images at once</p>
                  </div>

                  <div className="multiple-images-grid">
                    {multipleImages.map((image, index) => (
                      <div key={index} className="image-upload-card">
                        <div className="image-preview">
                          <img src={image.preview} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeMultipleImage(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="image-details">
                          <div className="form-group">
                            <label>Alt Text</label>
                            <input
                              type="text"
                              value={image.altText}
                              onChange={(e) => updateImageDetails(index, 'altText', e.target.value)}
                              placeholder="Enter alt text for image"
                            />
                          </div>
                          <div className="form-group">
                            <label>Description</label>
                            <textarea
                              value={image.description}
                              onChange={(e) => updateImageDetails(index, 'description', e.target.value)}
                              placeholder="Enter description for image"
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {multipleImages.length > 0 && (
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="save-btn">
                        Upload Images
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {mainTab === 'Manage Table' && (
        <div className="manage-table-tab">
          <div className="section-header mv-header-flex">
            <div className="mv-dropdowns mv-dropdowns-row">
              <select value={selectedState} onChange={handleStateChange}>
                <option value="">Select State</option>
                {(states || []).map(state => (
                  <option key={state.id} value={state.id}>{state.name}</option>
                ))}
              </select>
              <select value={selectedTerritory} onChange={handleTerritoryChange}>
                <option value="">Select Territory</option>
                {(territories || []).map(territory => (
                  <option key={territory.id} value={territory.id}>{territory.title}</option>
                ))}
              </select>
              {(selectedState || selectedTerritory) && (
                <select value={selectedDistrict} onChange={handleDistrictChange}>
                  <option value="">Select District</option>
                  {(districts || []).map(district => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
              )}
              {selectedDistrict && (
                <select value={selectedSubdistrict} onChange={handleSubdistrictChange}>
                  <option value="">Select Subdistrict</option>
                  {(subdistricts || []).map(subdistrict => (
                    <option key={subdistrict.id} value={subdistrict.id}>{subdistrict.name}</option>
                  ))}
                </select>
              )}
              {/* Add Village Dropdown */}
              {selectedSubdistrict && (
                <select 
                  value={selectedVillage?.id || ''} 
                  onChange={handleVillageSelect}
                >
                  <option value="">Select Village</option>
                  {(villages || []).map(village => (
                    <option key={village.id} value={village.id}>{village.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {!selectedVillage ? (
            <div className="no-selection-message">
              <i className="fas fa-info-circle"></i>
              <p>Please select a village to manage its data tables</p>
            </div>
          ) : (
            <>
              {/* Sub-tabs for Manage Table - Only show when village is selected */}
          <div className="table-tabs">
            {['Population', 'Employment', 'Education', 'Health'].map(tab => (
              <button
                key={tab}
                className={`table-tab-btn${tableTab === tab ? ' active' : ''}`}
                onClick={() => setTableTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Sub-tab Content */}
          <div className="table-tab-content">
                {tableTab === 'Population' && (
                  <div className="table-data-container">
                    <div className="population-table-wrapper">
                      <table className="population-data-table">
                        <thead>
                          <tr>
                            <th>Population</th>
                            <th>Males</th>
                            <th>Females</th>
                            <th>Rural</th>
                            <th>Urban</th>
                            <th>Literacy Rate (%)</th>
                            <th>Male Literacy (%)</th>
                            <th>Female Literacy (%)</th>
                            <th>SC Population</th>
                            <th>ST Population</th>
                            <th>OBC Population</th>
                            <th>Muslim</th>
                            <th>Christian</th>
                            <th>Sikh</th>
                            <th>Buddhist</th>
                            <th>Jain</th>
                            <th>Other Religions</th>
                            <th>Not Stated</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.total_population || ''}
                                onChange={(e) => handlePopulationChange('total_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.male_population || ''}
                                onChange={(e) => handlePopulationChange('male_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.female_population || ''}
                                onChange={(e) => handlePopulationChange('female_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.rural_population || ''}
                                onChange={(e) => handlePopulationChange('rural_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.urban_population || ''}
                                onChange={(e) => handlePopulationChange('urban_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                step="0.01"
                                value={populationData.literacy_rate || ''}
                                onChange={(e) => handlePopulationChange('literacy_rate', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                step="0.01"
                                value={populationData.male_literacy_rate || ''}
                                onChange={(e) => handlePopulationChange('male_literacy_rate', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                step="0.01"
                                value={populationData.female_literacy_rate || ''}
                                onChange={(e) => handlePopulationChange('female_literacy_rate', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.scheduled_caste_population || ''}
                                onChange={(e) => handlePopulationChange('scheduled_caste_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.scheduled_tribe_population || ''}
                                onChange={(e) => handlePopulationChange('scheduled_tribe_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.other_backward_classes_population || ''}
                                onChange={(e) => handlePopulationChange('other_backward_classes_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.muslim_population || ''}
                                onChange={(e) => handlePopulationChange('muslim_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.christian_population || ''}
                                onChange={(e) => handlePopulationChange('christian_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.sikh_population || ''}
                                onChange={(e) => handlePopulationChange('sikh_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.buddhist_population || ''}
                                onChange={(e) => handlePopulationChange('buddhist_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.jain_population || ''}
                                onChange={(e) => handlePopulationChange('jain_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.other_religions_population || ''}
                                onChange={(e) => handlePopulationChange('other_religions_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={populationData.not_stated_population || ''}
                                onChange={(e) => handlePopulationChange('not_stated_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <button className="save-btn" onClick={handleSavePopulation}>Save</button>
                              <button 
                                className="reset-btn" 
                                onClick={() => fetchPopulationData(selectedVillage.id)}
                              >
                                Reset
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
          </div>
                  </div>
                )}
                {tableTab === 'Employment' && (
                  <div className="table-data-container">
                    <div className="employment-table-wrapper">
                      <table className="employment-data-table">
                        <thead>
                          <tr>
                            <th>Working Population</th>
                            <th>Main Workers</th>
                            <th>Main Cultivators</th>
                            <th>Agricultural Labourers</th>
                            <th>Marginal Workers</th>
                            <th>Marginal Cultivators</th>
                            <th>Non-Working</th>
                            <th>Non-Working Males</th>
                            <th>Non-Working Females</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.working_population || ''}
                                onChange={(e) => handleEmploymentChange('working_population', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.main_workers || ''}
                                onChange={(e) => handleEmploymentChange('main_workers', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.main_cultivators || ''}
                                onChange={(e) => handleEmploymentChange('main_cultivators', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.agri_labourers || ''}
                                onChange={(e) => handleEmploymentChange('agri_labourers', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.marginal_workers || ''}
                                onChange={(e) => handleEmploymentChange('marginal_workers', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.marginal_cultivators || ''}
                                onChange={(e) => handleEmploymentChange('marginal_cultivators', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.non_working || ''}
                                onChange={(e) => handleEmploymentChange('non_working', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.non_working_males || ''}
                                onChange={(e) => handleEmploymentChange('non_working_males', e.target.value)}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0"
                                value={employmentData.non_working_females || ''}
                                onChange={(e) => handleEmploymentChange('non_working_females', e.target.value)}
                              />
                            </td>
                            <td>
                              <button className="save-btn" onClick={handleSaveEmployment}>Save</button>
                              <button 
                                className="reset-btn" 
                                onClick={() => fetchEmploymentData(selectedVillage.id)}
                              >
                                Reset
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {tableTab === 'Education' && (
                  <div className="table-data-container">
                    <div className="education-table-wrapper">
                      <div className="table-header">
                        <h3>Education Facilities in {selectedVillage.name}</h3>
                        <p className="table-description">Enter the number of government schools and details of nearest higher education institutions</p>
                      </div>
                      <table className="education-data-table">
                        <thead>
                          <tr>
                            <th title="Number of government primary schools in the village">Primary Schools (Govt)</th>
                            <th title="Number of government middle schools in the village">Middle Schools (Govt)</th>
                            <th title="Number of government secondary schools in the village">Secondary Schools (Govt)</th>
                            <th title="Number of government senior secondary schools in the village">Senior Secondary Schools (Govt)</th>
                            <th title="Name and distance of nearest arts/science college">Nearest Arts/Science College</th>
                            <th title="Name and distance of nearest engineering college">Nearest Engineering College</th>
                            <th title="Name and distance of nearest medical college">Nearest Medical College</th>
                            <th title="Name and distance of nearest polytechnic">Nearest Polytechnic</th>
                            <th title="Name and distance of nearest vocational/ITI">Nearest Vocational/ITI</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <div className="input-wrapper">
                                <input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  value={educationData.primary_schools_govt || ''}
                                  onChange={(e) => handleEducationChange('primary_schools_govt', e.target.value)}
                                  placeholder="0"
                                  className="number-input"
                                  title="Enter number of government primary schools"
                                />
                                <span className="input-label">schools</span>
                              </div>
                            </td>
                            <td>
                              <div className="input-wrapper">
                                <input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  value={educationData.middle_schools_govt || ''}
                                  onChange={(e) => handleEducationChange('middle_schools_govt', e.target.value)}
                                  placeholder="0"
                                  className="number-input"
                                  title="Enter number of government middle schools"
                                />
                                <span className="input-label">schools</span>
                              </div>
                            </td>
                            <td>
                              <div className="input-wrapper">
                                <input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  value={educationData.secondary_schools_govt || ''}
                                  onChange={(e) => handleEducationChange('secondary_schools_govt', e.target.value)}
                                  placeholder="0"
                                  className="number-input"
                                  title="Enter number of government secondary schools"
                                />
                                <span className="input-label">schools</span>
                              </div>
                            </td>
                            <td>
                              <div className="input-wrapper">
                                <input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  value={educationData.senior_secondary_schools_govt || ''}
                                  onChange={(e) => handleEducationChange('senior_secondary_schools_govt', e.target.value)}
                                  placeholder="0"
                                  className="number-input"
                                  title="Enter number of government senior secondary schools"
                                />
                                <span className="input-label">schools</span>
                              </div>
                            </td>
                            <td>
                              <textarea
                                value={educationData.nearest_arts_college || ''}
                                onChange={(e) => handleEducationChange('nearest_arts_college', e.target.value)}
                                placeholder="Enter college name, location and distance (e.g., ABC College, City Name - 10 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest arts/science college"
                              />
                            </td>
                            <td>
                              <textarea
                                value={educationData.nearest_engg_college || ''}
                                onChange={(e) => handleEducationChange('nearest_engg_college', e.target.value)}
                                placeholder="Enter college name, location and distance (e.g., XYZ Engineering College, City Name - 15 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest engineering college"
                              />
                            </td>
                            <td>
                              <textarea
                                value={educationData.nearest_medical_college || ''}
                                onChange={(e) => handleEducationChange('nearest_medical_college', e.target.value)}
                                placeholder="Enter college name, location and distance (e.g., PQR Medical College, City Name - 20 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest medical college"
                              />
                            </td>
                            <td>
                              <textarea
                                value={educationData.nearest_polytechnic || ''}
                                onChange={(e) => handleEducationChange('nearest_polytechnic', e.target.value)}
                                placeholder="Enter institute name, location and distance (e.g., LMN Polytechnic, City Name - 12 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest polytechnic"
                              />
                            </td>
                            <td>
                              <textarea
                                value={educationData.nearest_vocational_iti || ''}
                                onChange={(e) => handleEducationChange('nearest_vocational_iti', e.target.value)}
                                placeholder="Enter institute name, location and distance (e.g., RST ITI, City Name - 8 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest vocational/ITI"
                              />
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="save-btn" 
                                  onClick={handleSaveEducation}
                                  title="Save education data"
                                >
                                  <i className="fas fa-save"></i> Save
                                </button>
                                <button 
                                  className="reset-btn" 
                                  onClick={() => fetchEducationData(selectedVillage.id)}
                                  title="Reset to last saved data"
                                >
                                  <i className="fas fa-undo"></i> Reset
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {tableTab === 'Health' && (
                  <div className="table-data-container">
                    <div className="health-table-wrapper">
                      <div className="table-header">
                        <h3>Health Facilities in {selectedVillage.name}</h3>
                        <p className="table-description">Enter details of nearest health facilities and their distances</p>
                      </div>
                      <table className="health-data-table">
                        <thead>
                          <tr>
                            <th title="Name and distance of nearest community health centre">Nearest Community Health Centre</th>
                            <th title="Name and distance of nearest primary health centre">Nearest Primary Health Centre</th>
                            <th title="Name and distance of nearest maternity centre">Nearest Maternity Centre</th>
                            <th title="Name and distance of nearest allopathic hospital">Nearest Hospital - Allopathic</th>
                            <th title="Name and distance of nearest dispensary">Nearest Dispensary</th>
                            <th title="Name and distance of nearest mobile clinic">Nearest Mobile Clinic</th>
                            <th title="Name and distance of nearest family welfare centre">Nearest Family Welfare Centre</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <textarea
                                value={healthData.nearest_community_health_centre || ''}
                                onChange={(e) => handleHealthChange('nearest_community_health_centre', e.target.value)}
                                placeholder="Enter facility name, location and distance (e.g., ABC Health Centre, City Name - 10 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest community health centre"
                              />
                            </td>
                            <td>
                              <textarea
                                value={healthData.nearest_primary_health_centre || ''}
                                onChange={(e) => handleHealthChange('nearest_primary_health_centre', e.target.value)}
                                placeholder="Enter facility name, location and distance (e.g., XYZ Primary Health Centre, City Name - 8 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest primary health centre"
                              />
                            </td>
                            <td>
                              <textarea
                                value={healthData.nearest_maternity_centre || ''}
                                onChange={(e) => handleHealthChange('nearest_maternity_centre', e.target.value)}
                                placeholder="Enter facility name, location and distance (e.g., PQR Maternity Centre, City Name - 12 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest maternity centre"
                              />
                            </td>
                            <td>
                              <textarea
                                value={healthData.nearest_hospital_allopathic || ''}
                                onChange={(e) => handleHealthChange('nearest_hospital_allopathic', e.target.value)}
                                placeholder="Enter hospital name, location and distance (e.g., ABC Hospital, City Name - 15 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest allopathic hospital"
                              />
                            </td>
                            <td>
                              <textarea
                                value={healthData.nearest_dispensary || ''}
                                onChange={(e) => handleHealthChange('nearest_dispensary', e.target.value)}
                                placeholder="Enter dispensary name, location and distance (e.g., XYZ Dispensary, City Name - 5 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest dispensary"
                              />
                            </td>
                            <td>
                              <textarea
                                value={healthData.nearest_mobile_clinic || ''}
                                onChange={(e) => handleHealthChange('nearest_mobile_clinic', e.target.value)}
                                placeholder="Enter clinic name, location and distance (e.g., Mobile Health Unit, City Name - 7 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest mobile clinic"
                              />
                            </td>
                            <td>
                              <textarea
                                value={healthData.nearest_family_welfare_centre || ''}
                                onChange={(e) => handleHealthChange('nearest_family_welfare_centre', e.target.value)}
                                placeholder="Enter centre name, location and distance (e.g., Family Welfare Centre, City Name - 9 km)"
                                className="location-textarea"
                                rows="2"
                                title="Enter name, location and distance of nearest family welfare centre"
                              />
                            </td>
                            <td>
                              <button className="save-btn" onClick={handleSaveHealth}>Save</button>
                              <button 
                                className="reset-btn" 
                                onClick={() => fetchHealthData(selectedVillage.id)}
                              >
                                Reset
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                                </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageVillages; 