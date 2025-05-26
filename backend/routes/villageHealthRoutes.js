const express = require('express');
const router = express.Router();
const villageHealthController = require('../controllers/villageHealthController');

// State village health routes
router.get('/state/village/:villageId', villageHealthController.getStateVillageHealth);
router.put('/state/village/:villageId', villageHealthController.updateStateVillageHealth);

// Territory village health routes
router.get('/territory/village/:villageId', villageHealthController.getTerritoryVillageHealth);
router.put('/territory/village/:villageId', villageHealthController.updateTerritoryVillageHealth);

module.exports = router; 