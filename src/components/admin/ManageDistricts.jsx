const ManageDistricts = () => {
  // ... existing state declarations ...

  // ... other existing functions ...

  const handleEditWebStory = async (story) => {
    try {
      // Fetch the full story details including images
      const endpoint = story.district_type === 'territory' 
        ? `http://localhost:5000/api/territory-web-stories/${story.id}`
        : `http://localhost:5000/api/web-stories/${story.id}`;
      
      const response = await axios.get(endpoint);
      const storyData = response.data;

      // Transform the story data for the form
      setWebStoryForm({
        title: storyData.title,
        slug: storyData.slug,
        images: storyData.images ? storyData.images.map(img => ({
          id: img.id,
          preview: img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000/${img.image_url}`,
          alt: img.alt_text || '',
          desc: img.description || '',
          order: img.image_order || 0
        })) : [],
        featured_image: storyData.featured_image,
        featured_image_preview: storyData.featured_image ? 
          (storyData.featured_image.startsWith('http') ? 
            storyData.featured_image : 
            `http://localhost:5000/${storyData.featured_image}`) : null,
        meta_title: storyData.meta_title || '',
        meta_description: storyData.meta_description || '',
        meta_keywords: storyData.meta_keywords ? storyData.meta_keywords.split(',').map(k => k.trim()) : [],
        meta_keyword_input: ''
      });

      setEditingWebStory(story);
      setShowWebStoryModal(true);
    } catch (error) {
      console.error('Error fetching story details:', error);
      setError('Failed to fetch story details');
    }
  };

  const handleWebStorySubmit = async (e) => {
    e.preventDefault();
    console.log('=== Starting handleWebStorySubmit ===');
    
    // Validate required fields
    if (!selectedDistrict) {
      console.error('No district selected');
      setError('Please select a district first');
      return;
    }

    // Additional validation for territory stories
    if (selectedTerritory && !selectedTerritory.id) {
      console.error('Invalid territory selected');
      setError('Please select a valid territory');
      return;
    }

    if (!webStoryForm.title || !webStoryForm.slug) {
      console.error('Missing required fields:', { 
        title: webStoryForm.title, 
        slug: webStoryForm.slug 
      });
      setError('Title and slug are required');
      return;
    }

    try {
      const formData = new FormData();
      
      // Debug logs for initial state
      console.log('Initial State:', {
        selectedDistrict,
        selectedTerritory,
        editingWebStory,
        webStoryForm
      });

      // For territory web stories, we only need to check if we're in territory mode
      const isTerritoryStory = Boolean(selectedTerritory);
      console.log('Story Type:', { isTerritoryStory, selectedTerritory });

      // Set endpoint based on story type - only use territory endpoint for territory stories
      const endpoint = isTerritoryStory
        ? (editingWebStory?.id 
            ? `http://localhost:5000/api/territory-web-stories/${editingWebStory.id}`
            : 'http://localhost:5000/api/territory-web-stories')
        : (editingWebStory?.id
            ? `http://localhost:5000/api/web-stories/${editingWebStory.id}`
            : 'http://localhost:5000/api/web-stories');

      console.log('Using endpoint:', endpoint);

      // Add district/territory information - ensure territory data is only added for territory stories
      if (isTerritoryStory) {
        if (!selectedTerritory?.id) {
          throw new Error('Territory ID is required for territory web stories');
        }
        console.log('Adding territory data:', { 
          territory_district_id: selectedDistrict,
          territory_id: selectedTerritory.id
        });
        formData.append('territory_district_id', selectedDistrict);
        formData.append('territory_id', selectedTerritory.id);
      } else {
        console.log('Adding state data:', { 
          district_id: selectedDistrict,
          district_type: 'state'
        });
        formData.append('district_id', selectedDistrict);
        formData.append('district_type', 'state');
      }

      // Add basic story data
      const storyData = {
        title: webStoryForm.title,
        slug: webStoryForm.slug,
        description: webStoryForm.description || '',
        meta_title: webStoryForm.meta_title,
        meta_description: webStoryForm.meta_description,
        meta_keywords: webStoryForm.meta_keywords.join(',')
      };
      console.log('Adding story data:', storyData);

      Object.entries(storyData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Handle featured image
      if (webStoryForm.featured_image instanceof File) {
        console.log('Adding new featured image:', webStoryForm.featured_image.name);
        formData.append('featured_image', webStoryForm.featured_image);
      } else if (webStoryForm.featured_image && editingWebStory && editingWebStory.id) {
        console.log('Using existing featured image:', webStoryForm.featured_image);
        formData.append('existing_featured_image', webStoryForm.featured_image);
      }

      // Handle story images
      const imageData = {
        altTexts: [],
        descriptions: [],
        existingImageIds: [],
        imageOrders: []
      };

      webStoryForm.images.forEach((img, idx) => {
        if (img.file) {
          console.log('Adding new image:', img.file.name);
          formData.append('images', img.file);
          imageData.altTexts.push(img.alt || '');
          imageData.descriptions.push(img.desc || '');
          imageData.imageOrders.push(idx);
        } else if (img.id) {
          console.log('Keeping existing image:', img.id);
          imageData.existingImageIds.push(img.id);
          imageData.altTexts.push(img.alt || '');
          imageData.descriptions.push(img.desc || '');
          imageData.imageOrders.push(img.order || idx);
        }
      });

      // Add image metadata
      formData.append('existing_image_ids', imageData.existingImageIds.join(','));
      formData.append('image_orders', imageData.imageOrders.join(','));
      formData.append('alt_texts', imageData.altTexts.join(','));
      formData.append('descriptions', imageData.descriptions.join(','));

      // Log final form data
      console.log('Final form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      // Make the API request
      console.log('Making API request to:', endpoint);
      const response = await axios({
        method: editingWebStory?.id ? 'put' : 'post',
        url: endpoint,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Server response:', response.data);

      if (response.data) {
        // Reset form and state
        setWebStoryForm({
          title: '',
          slug: '',
          description: '',
          images: [],
          featured_image: null,
          featured_image_preview: null,
          meta_title: '',
          meta_description: '',
          meta_keywords: [],
          meta_keyword_input: ''
        });
        setEditingWebStory(null);
        setShowWebStoryModal(false);
        await fetchWebStories();
        console.log('Web story saved successfully');
      }
    } catch (err) {
      console.error('Error in handleWebStorySubmit:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });
      setError(err.response?.data?.error || 'Error saving web story');
    }
  };

  const handleCreateNewWebStory = () => {
    console.log('=== Starting handleCreateNewWebStory ===');
    // Reset the form and editing state
    setWebStoryForm({
      title: '',
      slug: '',
      description: '',
      images: [],
      featured_image: null,
      featured_image_preview: null,
      meta_title: '',
      meta_description: '',
      meta_keywords: [],
      meta_keyword_input: ''
    });
    // Explicitly set editingWebStory to null for new story
    setEditingWebStory(null);
    setShowWebStoryModal(true);
    console.log('Web story form reset and modal opened for new story');
  };

  // ... rest of the component code ...

  return (
    // ... component JSX ...
    {showWebStoryModal && (
      <div className="modal">
        <div className="modal-content">
          <h2>{editingWebStory ? 'Edit Web Story' : 'Add New Story'}</h2>
          <form onSubmit={handleWebStorySubmit}>
            <div className="form-section">
              <label>Title</label>
              <input
                type="text"
                value={webStoryForm.title}
                onChange={e => {
                  const val = e.target.value;
                  setWebStoryForm(f => ({ 
                    ...f, 
                    title: val, 
                    slug: generateSlug(val).slice(0, 60) 
                  }));
                }}
                required
              />
            </div>
            // ... rest of the form content ...
          </form>
        </div>
      </div>
    )}
  );
};

export default ManageDistricts; 