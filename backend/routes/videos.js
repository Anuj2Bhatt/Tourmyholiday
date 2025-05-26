const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your MySQL pool/connection

// Helper: Extract YouTube video ID from URL
function extractYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

// Add a new video
router.post('/', async (req, res) => {
  const { youtube_url, entity_type, entity_id } = req.body;
  if (!youtube_url || !entity_type || !entity_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const youtube_id = extractYouTubeId(youtube_url);
  if (!youtube_id) return res.status(400).json({ error: 'Invalid YouTube URL' });
  try {
    await pool.query(
      'INSERT INTO videos (youtube_url, youtube_id, entity_type, entity_id) VALUES (?, ?, ?, ?)',
      [youtube_url, youtube_id, entity_type, entity_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get videos (optionally filter by entity)
router.get('/', async (req, res) => {
  const { entity_type, entity_id } = req.query;
  let sql = 'SELECT * FROM videos';
  let params = [];
  if (entity_type && entity_id) {
    sql += ' WHERE entity_type = ? AND entity_id = ?';
    params = [entity_type, entity_id];
  }
  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete video
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM videos WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router; 