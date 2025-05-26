const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Helper function to clean image path
const cleanImagePath = (file) => {
  if (!file) return 'uploads/default-article.jpg';
  // Always return path with uploads/ prefix
  return `uploads/${file.filename}`;
};

// Helper function to generate unique slug
const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const [rows] = await db.query('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  return slug;
};

// Get all articles
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all articles...');
    const [rows] = await db.query('SELECT * FROM articles ORDER BY created_at DESC');
    console.log(`Found ${rows.length} articles`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Failed to fetch articles', error: error.message });
  }
});

// Get article by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('Fetching article with slug:', slug);
    const [rows] = await db.query('SELECT * FROM articles WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      console.log('Article not found with slug:', slug);
      return res.status(404).json({ message: 'Article not found' });
    }
    console.log('Found article:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Failed to fetch article', error: error.message });
  }
});

// Get article by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching article with ID:', id);
    const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (rows.length === 0) {
      console.log('Article not found with ID:', id);
      return res.status(404).json({ message: 'Article not found' });
    }
    console.log('Found article:', rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Failed to fetch article', error: error.message });
  }
});

// Create new article
router.post('/', upload.single('featured_image'), async (req, res) => {
  try {
    console.log('Received request:');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    // Validate required fields
    const requiredFields = ['title', 'slug', 'content', 'description', 'category_id', 'author', 'meta_title', 'meta_description'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    const {
      title,
      slug: baseSlug,
      content,
      description,
      category_id,
      status = 'published',
      featured = false,
      meta_title,
      meta_description,
      meta_keywords,
      author,
      packages_id
    } = req.body;

    // Fetch category name from categories table
    let category = null;
    if (category_id) {
      const [catRows] = await db.query('SELECT name FROM categories WHERE id = ?', [category_id]);
      if (catRows.length > 0) {
        category = catRows[0].name;
      }
    }

    const featured_image = req.file ? cleanImagePath(req.file) : 'uploads/default-article.jpg';
    const slug = await generateUniqueSlug(baseSlug);

    console.log('Prepared data for insert:', {
      title, slug, content, description, featured_image,
      category, category_id, status, featured,
      meta_title, meta_description, meta_keywords, author, packages_id
    });

    const [result] = await db.query(
      `INSERT INTO articles (
        title, slug, content, description, featured_image,
        category, category_id, status, featured,
        meta_title, meta_description, meta_keywords, author, packages_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, slug, content, description, featured_image,
        category, category_id, status, featured,
        meta_title, meta_description, meta_keywords, author, packages_id
      ]
    );

    const [newArticle] = await db.query('SELECT * FROM articles WHERE id = ?', [result.insertId]);
    res.status(201).json(newArticle[0]);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ 
      message: 'Failed to create article', 
      error: error.message,
      details: error.sqlMessage 
    });
  }
});

// Update article
router.put('/:id', upload.single('featured_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      description,
      category_id,
      status,
      featured,
      meta_title,
      meta_description,
      meta_keywords,
      author,
      packages_id
    } = req.body;

    // Fetch category name from categories table
    let category = null;
    if (category_id) {
      const [catRows] = await db.query('SELECT name FROM categories WHERE id = ?', [category_id]);
      if (catRows.length > 0) {
        category = catRows[0].name;
      }
    }

    // Get current article data
    const [currentArticle] = await db.query('SELECT featured_image FROM articles WHERE id = ?', [id]);
    let featured_image;
    if (req.file) {
      featured_image = cleanImagePath(req.file);
    } else if (req.body.featured_image) {
      featured_image = req.body.featured_image;
    } else {
      featured_image = currentArticle[0]?.featured_image || 'uploads/default-article.jpg';
    }

    const [result] = await db.query(
      `UPDATE articles SET 
        title = ?, slug = ?, content = ?, description = ?, 
        featured_image = ?, category = ?, category_id = ?, status = ?, featured = ?, 
        meta_title = ?, meta_description = ?, meta_keywords = ?, author = ?, packages_id = ?
      WHERE id = ?`,
      [
        title, slug, content, description, featured_image,
        category, category_id, status, featured,
        meta_title, meta_description, meta_keywords, author, packages_id, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const [updatedArticle] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    res.json({ id, ...req.body, featured_image, category });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Failed to update article', error: error.message });
  }
});

// Delete article
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting article with ID:', id);
    const [result] = await db.query('DELETE FROM articles WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      console.log('Article not found with ID:', id);
      return res.status(404).json({ message: 'Article not found' });
    }
    console.log('Article deleted successfully');
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Failed to delete article', error: error.message });
  }
});

module.exports = router; 