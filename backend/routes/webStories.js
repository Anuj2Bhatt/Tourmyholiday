const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you have a database connection
const multer = require('multer');
const path = require('path');
const fsPromises = require('fs').promises;
const fs = require('fs'); // Add this for sync operations

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// GET all web stories
router.get('/', async (req, res) => {
  try {
    const [stories] = await db.query(`
      SELECT ws.*, d.name as district_name 
      FROM district_web_stories ws
      LEFT JOIN districts d ON ws.district_id = d.id
      ORDER BY ws.created_at DESC
    `);
    res.json(stories);
  } catch (err) {
    console.error('Error fetching web stories:', err);
    res.status(500).json({ error: 'Failed to fetch web stories.' });
  }
});

// GET single web story with images
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the web story
    const [stories] = await db.query(`
      SELECT ws.*, d.name as district_name 
      FROM district_web_stories ws
      LEFT JOIN districts d ON ws.district_id = d.id
      WHERE ws.id = ?
    `, [id]);

    if (stories.length === 0) {
      return res.status(404).json({ error: 'Web story not found.' });
    }

    const story = stories[0];

    // Get the story images
    const [images] = await db.query(`
      SELECT * FROM web_story_images 
      WHERE story_id = ? 
      ORDER BY \`order\` ASC
    `, [id]);

    // Format image URLs
    story.images = images.map(img => ({
      ...img,
      image_url: img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000/${img.image_url}`
    }));

    // Generate schema
    const schema = await generateStorySchema(story);
    
    // Add schema to story response
    story.schema = schema;

    res.json(story);
  } catch (err) {
    console.error('Error fetching web story:', err);
    res.status(500).json({ error: 'Failed to fetch web story.' });
  }
});

// GET all web stories for a district
router.get('/districts/:districtId', async (req, res) => {
  const { districtId } = req.params;
  try {
    const [stories] = await db.query('SELECT * FROM district_web_stories WHERE district_id = ?', [districtId]);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch web stories.' });
  }
});

// POST a new web story
router.post('/', upload.any(), async (req, res) => {
  try {
    const { district_id, title, slug, meta_title, meta_description, meta_keywords } = req.body;
    
    if (!district_id || !title || !slug || !meta_title || !meta_description || !meta_keywords) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let featured_image = null;
    if (req.files && req.files.length > 0) {
      const featured = req.files.find(f => f.fieldname === 'featured_image');
      if (featured) {
        featured_image = featured.path;
      }
    }

    const [result] = await db.query(
      'INSERT INTO district_web_stories (district_id, title, slug, featured_image, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [district_id, title, slug, featured_image, meta_title, meta_description, meta_keywords]
    );

    // Handle story images if any
    if (req.files) {
      const storyImages = req.files.filter(f => f.fieldname === 'images');
      const altTexts = req.body.alt_texts ? req.body.alt_texts.split(',') : [];
      const descriptions = req.body.descriptions ? req.body.descriptions.split(',') : [];

      for (let i = 0; i < storyImages.length; i++) {
        await db.query(
          'INSERT INTO web_story_images (story_id, image_url, alt_text, description, `order`) VALUES (?, ?, ?, ?, ?)',
          [result.insertId, storyImages[i].path, altTexts[i] || '', descriptions[i] || '', i]
        );
      }
    }

    res.status(201).json({ id: result.insertId, message: 'Web story created successfully.' });
  } catch (err) {
    console.error('Error creating web story:', err);
    res.status(500).json({ error: 'Failed to create web story.' });
  }
});

// PUT (update) a web story
router.put('/:storyId', upload.any(), async (req, res) => {
  try {
    const { storyId } = req.params;
    const { title, slug, meta_title, meta_description, meta_keywords, existing_image_ids } = req.body;

    let featured_image = null;
    if (req.files && req.files.length > 0) {
      const featured = req.files.find(f => f.fieldname === 'featured_image');
      if (featured) {
        featured_image = featured.path;
      }
    }

    const updateFields = [];
    const updateValues = [];

    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (slug) {
      updateFields.push('slug = ?');
      updateValues.push(slug);
    }
    if (meta_title) {
      updateFields.push('meta_title = ?');
      updateValues.push(meta_title);
    }
    if (meta_description) {
      updateFields.push('meta_description = ?');
      updateValues.push(meta_description);
    }
    if (meta_keywords) {
      updateFields.push('meta_keywords = ?');
      updateValues.push(meta_keywords);
    }
    if (featured_image) {
      updateFields.push('featured_image = ?');
      updateValues.push(featured_image);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    updateValues.push(storyId);

    await db.query(
      `UPDATE district_web_stories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Handle story images
    const altTexts = req.body.alt_texts ? req.body.alt_texts.split(',') : [];
    const descriptions = req.body.descriptions ? req.body.descriptions.split(',') : [];
    const imageOrders = req.body.image_orders ? req.body.image_orders.split(',').map(Number) : [];

    // Get existing image IDs that should be kept
    const existingIds = existing_image_ids ? existing_image_ids.split(',').map(Number) : [];

    // Delete images that are not in the existingIds list
    if (existingIds.length > 0) {
      await db.query(
        'DELETE FROM web_story_images WHERE story_id = ? AND id NOT IN (?)',
        [storyId, existingIds]
      );
    } else {
      // If no existing IDs provided, delete all images
      await db.query('DELETE FROM web_story_images WHERE story_id = ?', [storyId]);
    }

    // Update existing images
    if (existingIds.length > 0) {
      for (let i = 0; i < existingIds.length; i++) {
        await db.query(
          'UPDATE web_story_images SET alt_text = ?, description = ?, `order` = ? WHERE id = ? AND story_id = ?',
          [altTexts[i] || '', descriptions[i] || '', imageOrders[i] || i, existingIds[i], storyId]
        );
      }
    }

    // Add new images
    if (req.files) {
      const storyImages = req.files.filter(f => f.fieldname === 'images');
      for (let i = 0; i < storyImages.length; i++) {
        const orderIndex = existingIds.length + i;
        await db.query(
          'INSERT INTO web_story_images (story_id, image_url, alt_text, description, `order`) VALUES (?, ?, ?, ?, ?)',
          [storyId, storyImages[i].path, altTexts[orderIndex] || '', descriptions[orderIndex] || '', imageOrders[orderIndex] || orderIndex]
        );
      }
    }

    // Get updated story with images
    const [updatedStory] = await db.query(`
      SELECT ws.*, d.name as district_name 
      FROM district_web_stories ws
      LEFT JOIN districts d ON ws.district_id = d.id
      WHERE ws.id = ?
    `, [storyId]);

    const [images] = await db.query(`
      SELECT * FROM web_story_images 
      WHERE story_id = ? 
      ORDER BY \`order\` ASC
    `, [storyId]);

    updatedStory[0].images = images.map(img => ({
      ...img,
      image_url: img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000/${img.image_url}`
    }));

    // Generate schema
    const schema = await generateStorySchema(updatedStory[0]);
    
    // Add schema to story response
    updatedStory[0].schema = schema;

    res.json(updatedStory[0]);
  } catch (err) {
    console.error('Error updating web story:', err);
    res.status(500).json({ error: 'Failed to update web story.' });
  }
});

// DELETE a web story
router.delete('/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    await db.query('DELETE FROM district_web_stories WHERE id = ?', [storyId]);
    res.json({ message: 'Web story deleted successfully.' });
  } catch (err) {
    console.error('Error deleting web story:', err);
    res.status(500).json({ error: 'Failed to delete web story.' });
  }
});

// POST an image to a web story
router.post('/districts/:districtId/web-stories/:storyId/images', async (req, res) => {
  const { districtId, storyId } = req.params;
  const { image_url, alt_text, description, order } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO web_story_images (story_id, image_url, alt_text, description, `order`) VALUES (?, ?, ?, ?, ?)',
      [storyId, image_url, alt_text, description, order]
    );
    res.status(201).json({ id: result.insertId, message: 'Image added successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add image.' });
  }
});

// DELETE an image from a web story
router.delete('/districts/:districtId/web-stories/:storyId/images/:imageId', async (req, res) => {
  const { districtId, storyId, imageId } = req.params;
  try {
    await db.query('DELETE FROM web_story_images WHERE id = ? AND story_id = ?', [imageId, storyId]);
    res.json({ message: 'Image deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete image.' });
  }
});

// GET comments for a web story
router.get('/districts/:districtId/web-stories/:storyId/comments', async (req, res) => {
  const { districtId, storyId } = req.params;
  try {
    const comments = await db.query('SELECT * FROM web_story_comments WHERE story_id = ?', [storyId]);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// POST a comment to a web story
router.post('/districts/:districtId/web-stories/:storyId/comments', async (req, res) => {
  const { districtId, storyId } = req.params;
  const { comment_text } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO web_story_comments (story_id, comment_text) VALUES (?, ?)',
      [storyId, comment_text]
    );
    res.status(201).json({ id: result.insertId, message: 'Comment added successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// DELETE a comment
router.delete('/districts/:districtId/web-stories/:storyId/comments/:commentId', async (req, res) => {
  const { districtId, storyId, commentId } = req.params;
  try {
    await db.query('DELETE FROM web_story_comments WHERE id = ? AND story_id = ?', [commentId, storyId]);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

// GET analytics for a web story
router.get('/districts/:districtId/web-stories/:storyId/analytics', async (req, res) => {
  const { districtId, storyId } = req.params;
  try {
    const analytics = await db.query('SELECT * FROM web_story_analytics WHERE story_id = ?', [storyId]);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// POST to increment view count
router.post('/districts/:districtId/web-stories/:storyId/analytics/view', async (req, res) => {
  const { districtId, storyId } = req.params;
  try {
    await db.query('UPDATE web_story_analytics SET views = views + 1 WHERE story_id = ?', [storyId]);
    res.json({ message: 'View count incremented.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment view count.' });
  }
});

// POST to increment like count
router.post('/districts/:districtId/web-stories/:storyId/analytics/like', async (req, res) => {
  const { districtId, storyId } = req.params;
  try {
    await db.query('UPDATE web_story_analytics SET likes = likes + 1 WHERE story_id = ?', [storyId]);
    res.json({ message: 'Like count incremented.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment like count.' });
  }
});

// POST to increment share count
router.post('/districts/:districtId/web-stories/:storyId/analytics/share', async (req, res) => {
  const { districtId, storyId } = req.params;
  try {
    await db.query('UPDATE web_story_analytics SET shares = shares + 1 WHERE story_id = ?', [storyId]);
    res.json({ message: 'Share count incremented.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment share count.' });
  }
});

// Modify the logo upload route
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }

    const logoPath = `uploads/logos/${req.file.filename}`;
    
    // Create logos directory if it doesn't exist
    const logoDir = path.join(__dirname, '../uploads/logos');
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }

    // Move the uploaded file to logos directory
    await fsPromises.rename(req.file.path, path.join(__dirname, '../', logoPath));

    // Store logo path in database
    const [result] = await db.query(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['site_logo', logoPath, logoPath]
    );

    res.json({ 
      message: 'Logo uploaded successfully',
      logoUrl: `http://localhost:5000/${logoPath}`
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Add a new route to get the current logo
router.get('/site-logo', async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['site_logo']
    );

    if (settings.length > 0) {
      const logoPath = settings[0].setting_value;
      res.json({ 
        logoUrl: `http://localhost:5000/${logoPath}`
      });
    } else {
      res.json({ 
        logoUrl: null
      });
    }
  } catch (error) {
    console.error('Error fetching logo:', error);
    res.status(500).json({ error: 'Failed to fetch logo' });
  }
});

// Modify the generateStorySchema function
const generateStorySchema = async (story) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  // Get the current logo from database
  const [settings] = await db.query(
    'SELECT setting_value FROM site_settings WHERE setting_key = ?',
    ['site_logo']
  );
  
  const logoPath = settings.length > 0 ? settings[0].setting_value : 'uploads/logos/default-logo.png';
  
  // Rest of the schema generation code...
  const images = [];
  if (story.featured_image) {
    images.push({
      "@type": "ImageObject",
      "url": story.featured_image.startsWith('http') ? story.featured_image : `${baseUrl}/${story.featured_image}`,
      "width": "1200",
      "height": "630"
    });
  }
  
  // Add story images if they exist
  if (story.images && story.images.length > 0) {
    story.images.forEach(img => {
      if (img.image_url) {
        images.push({
          "@type": "ImageObject",
          "url": img.image_url.startsWith('http') ? img.image_url : `${baseUrl}/${img.image_url}`,
          "width": "1200",
          "height": "630"
        });
      }
    });
  }

  // Create schema object
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/web-stories/${story.slug || story.id}`
    },
    "headline": story.title || "Web Story",
    "image": images.length > 0 ? images : [{
      "@type": "ImageObject",
      "url": `${baseUrl}/images/default-story.jpg`,
      "width": "1200",
      "height": "630"
    }],
    "datePublished": story.created_at || new Date().toISOString(),
    "dateModified": story.updated_at || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": "Anuj Bhatt",
      "url": baseUrl,
      "image": {
        "@type": "ImageObject",
        "url": `${baseUrl}/${logoPath}`,
        "width": "600",
        "height": "60"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Tour My Holiday",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/${logoPath}`,
        "width": "600",
        "height": "60"
      }
    },
    "description": story.meta_description || story.description || "",
    "keywords": story.meta_keywords || "",
    "articleBody": story.description || "",
    "articleSection": "Travel",
    "about": {
      "@type": "Place",
      "name": story.district_name || "",
      "containedInPlace": {
        "@type": "Place",
        "name": story.location_name || "",
        "additionalType": story.location_type || ""
      }
    }
  };

  return schema;
};

// Update the schema endpoint to handle async generateStorySchema
router.get('/:id/schema', async (req, res) => {
  try {
    const storyId = req.params.id;
    
    // First get the story details
    const [story] = await db.query(`
      SELECT 
        ws.*,
        d.name as district_name,
        CASE 
          WHEN d.district_type = 'state' THEN s.name 
          WHEN d.district_type = 'territory' THEN t.title 
        END as location_name,
        d.district_type as location_type
      FROM district_web_stories ws
      LEFT JOIN districts d ON ws.district_id = d.id
      LEFT JOIN states s ON d.state_name = s.name AND d.district_type = 'state'
      LEFT JOIN territories t ON d.territory_id = t.id AND d.district_type = 'territory'
      WHERE ws.id = ?
    `, [storyId]);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Then get the images separately
    const [images] = await db.query(`
      SELECT 
        id,
        image_url,
        alt_text,
        description,
        \`order\`
      FROM web_story_images 
      WHERE story_id = ? 
      ORDER BY \`order\` ASC
    `, [storyId]);

    // Add images to story object
    story.images = images.map(img => ({
      ...img,
      image_url: img.image_url.startsWith('http') ? 
        img.image_url : 
        `http://localhost:5000/${img.image_url}`
    }));

    // Format featured image URL
    if (story.featured_image) {
      story.featured_image = story.featured_image.startsWith('http') ? 
        story.featured_image : 
        `http://localhost:5000/${story.featured_image}`;
    }

    // Generate schema (now async)
    const schema = await generateStorySchema(story);

    // Add schema to response headers for Google
    res.set('Content-Type', 'application/ld+json');
    res.json(schema);

  } catch (error) {
    console.error('Error generating schema:', error);
    res.status(500).json({ 
      error: 'Failed to generate schema',
      details: error.message 
    });
  }
});

module.exports = router; 