const express = require('express');
const router = express.Router();
const TerritoryDistrictStats = require('../models/TerritoryDistrictStats');
const { authenticateToken } = require('../src/middleware/auth');

// Get stats for a specific district
router.get('/district/:districtId', async (req, res) => {
  try {
    const stats = await TerritoryDistrictStats.getByDistrictId(req.params.districtId);
    if (!stats) {
      return res.status(404).json({ error: 'Statistics not found for this district' });
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch district statistics' });
  }
});

// Get stats for all districts in a territory
router.get('/territory/:territoryId', async (req, res) => {
  try {
    const stats = await TerritoryDistrictStats.getByTerritoryId(req.params.territoryId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch territory statistics' });
  }
});

// Get territory summary statistics
router.get('/territory/:territoryId/summary', async (req, res) => {
  try {
    const summary = await TerritoryDistrictStats.getTerritorySummary(req.params.territoryId);
    if (!summary) {
      return res.status(404).json({ error: 'Territory not found' });
    }
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch territory summary' });
  }
});

// Create or update district statistics
router.post('/district/:districtId', async function(req, res) {
  try {
    const districtId = req.params.districtId;
    const statsData = req.body;

    // Validate required fields
    const requiredFields = ['population', 'males', 'females', 'literacy', 'households', 'adults', 'children', 'old'];
    for (const field of requiredFields) {
      if (statsData[field] === undefined || statsData[field] === null) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Validate numeric fields
    const numericFields = ['population', 'males', 'females', 'households', 'adults', 'children', 'old'];
    for (const field of numericFields) {
      if (isNaN(statsData[field]) || statsData[field] < 0) {
        return res.status(400).json({ error: `${field} must be a positive number` });
      }
    }

    // Validate literacy percentage
    if (isNaN(statsData.literacy) || statsData.literacy < 0 || statsData.literacy > 100) {
      return res.status(400).json({ error: 'literacy must be a number between 0 and 100' });
    }

    const exists = await TerritoryDistrictStats.exists(districtId);
    let result;

    if (exists) {
      // Update existing stats
      result = await TerritoryDistrictStats.update(districtId, statsData);
      if (!result) {
        return res.status(404).json({ error: 'Failed to update statistics' });
      }
      res.json({ message: 'Statistics updated successfully' });
    } else {
      // Create new stats
      statsData.district_id = districtId;
      const newStatsId = await TerritoryDistrictStats.create(statsData);
      res.status(201).json({ 
        message: 'Statistics created successfully',
        id: newStatsId
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save district statistics' });
  }
});

// Delete district statistics
router.delete('/district/:districtId', authenticateToken, async function(req, res) {
  try {
    const result = await TerritoryDistrictStats.delete(req.params.districtId);
    if (!result) {
      return res.status(404).json({ error: 'Statistics not found for this district' });
    }
    res.json({ message: 'Statistics deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete district statistics' });
  }
});

module.exports = router; 