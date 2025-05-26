const express = require('express');
const router = express.Router();
const villageEducationController = require('../controllers/villageEducationController');

// State village education routes
router.get('/state/village/:villageId', villageEducationController.getStateVillageEducation);
router.put('/state/village/:villageId', villageEducationController.updateStateVillageEducation);

// Territory village education routes
router.get('/territory/village/:villageId', villageEducationController.getTerritoryVillageEducation);
router.put('/territory/village/:villageId', villageEducationController.updateTerritoryVillageEducation);

module.exports = router; 