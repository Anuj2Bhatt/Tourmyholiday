const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

// Get all master data
router.get('/', masterDataController.getAllMasterData);

module.exports = router; 