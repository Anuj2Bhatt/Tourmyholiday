const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db'); // Your MySQL connection

// Create attractions table if it doesn't exist
const createAttractionsTable = `
CREATE TABLE IF NOT EXISTS attractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subdistrict_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    featured_image VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description VARCHAR(255),
    meta_keywords VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subdistrict_id) REFERENCES subdistricts(id) ON DELETE CASCADE
);
`;

// Use async/await with promises
(async () => {
  try {
    await db.query(createAttractionsTable);
  } catch (err) {
    }
})();

// Multer config: all images in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, ''));
  }
});
const upload = multer({ storage });

// CREATE
router.post('/', upload.single('featured_image'), async (req, res) => {
  try {
    const { subdistrict_id, title, slug, description, meta_title, meta_description, meta_keywords } = req.body;
    const featured_image = req.file ? req.file.path.replace(/\\/g, '/') : null;
    
    const [result] = await db.query(
      `INSERT INTO attractions (subdistrict_id, title, slug, description, featured_image, meta_title, meta_description, meta_keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [subdistrict_id, title, slug, description, featured_image, meta_title, meta_description, meta_keywords]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', upload.single('featured_image'), async (req, res) => {
  try {
    const { title, slug, description, meta_title, meta_description, meta_keywords } = req.body;
    let sql = `UPDATE attractions SET title=?, slug=?, description=?, meta_title=?, meta_description=?, meta_keywords=?`;
    const params = [title, slug, description, meta_title, meta_description, meta_keywords];
    
    if (req.file) {
      sql += `, featured_image=?`;
      params.push(req.file.path.replace(/\\/g, '/'));
    }
    
    sql += ` WHERE id=?`;
    params.push(req.params.id);
    
    await db.query(sql, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL for a subdistrict
router.get('/subdistrict/:subdistrict_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM attractions WHERE subdistrict_id=? ORDER BY id DESC`,
      [req.params.subdistrict_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONE
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM attractions WHERE id=?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      `DELETE FROM attractions WHERE id=?`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MULTIPLE ATTRACTIONS with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subdistrict_id,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Base query
    let query = 'SELECT * FROM attractions';
    let countQuery = 'SELECT COUNT(*) as total FROM attractions';
    let whereConditions = [];
    let queryParams = [];

    // Add filters if provided
    if (subdistrict_id) {
      whereConditions.push('subdistrict_id = ?');
      queryParams.push(subdistrict_id);
    }

    if (search) {
      whereConditions.push('(title LIKE ? OR description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Add sorting
    const allowedSortFields = ['created_at', 'title', 'id'];
    const allowedSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const finalSortOrder = allowedSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'DESC';
    
    query += ` ORDER BY ${finalSortBy} ${finalSortOrder}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    // Execute both queries
    const [attractions, totalCount] = await Promise.all([
      db.query(query, queryParams),
      db.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    // Calculate pagination info
    const total = totalCount[0][0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      attractions: attractions[0],
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next_page: page < totalPages,
        has_prev_page: page > 1
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 