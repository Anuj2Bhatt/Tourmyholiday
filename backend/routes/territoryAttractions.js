const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db'); // Your MySQL connection

// Create territory_attractions table if it doesn't exist
const createTerritoryAttractionsTable = `
CREATE TABLE IF NOT EXISTS territory_attractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    territory_subdistrict_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    featured_image VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description VARCHAR(255),
    meta_keywords VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (territory_subdistrict_id) REFERENCES territory_subdistricts(id) ON DELETE CASCADE
);
`;

// Use async/await with promises
(async () => {
  try {
    await db.query(createTerritoryAttractionsTable);
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
    const { territory_subdistrict_id, title, slug, description, meta_title, meta_description, meta_keywords } = req.body;
    const featured_image = req.file ? req.file.path.replace(/\\/g, '/') : null;
    
    const [result] = await db.query(
      `INSERT INTO territory_attractions (territory_subdistrict_id, title, slug, description, featured_image, meta_title, meta_description, meta_keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [territory_subdistrict_id, title, slug, description, featured_image, meta_title, meta_description, meta_keywords]
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
    let sql = `UPDATE territory_attractions SET title=?, slug=?, description=?, meta_title=?, meta_description=?, meta_keywords=?`;
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

// GET ALL for a territory subdistrict
router.get('/territory-subdistrict/:territory_subdistrict_id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM territory_attractions WHERE territory_subdistrict_id=? ORDER BY id DESC`,
      [req.params.territory_subdistrict_id]
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
      `SELECT * FROM territory_attractions WHERE id=?`,
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
      `DELETE FROM territory_attractions WHERE id=?`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 