const express = require('express');
const router = express.Router();
const {
  getAllCultureInfo,
  getCultureInfoById,
  createCultureInfo,
  updateCultureInfo,
  deleteCultureInfo,
  getCultureInfoByCultureId
} = require('../controllers/indiaCultureInfoController');

// Get all culture information
router.get('/', getAllCultureInfo);

// Get culture information by ID
router.get('/:id', getCultureInfoById);

// Get culture information by culture ID
router.get('/culture/:cultureId', getCultureInfoByCultureId);

// Create new culture information
router.post('/', createCultureInfo);

// Update culture information
router.put('/:id', updateCultureInfo);

// Delete culture information
router.delete('/:id', deleteCultureInfo);

module.exports = router; 