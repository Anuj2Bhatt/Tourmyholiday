const express = require('express');
const router = express.Router();
const territoryVillageEducationController = require('../controllers/territoryVillageEducationController');

// Territory village education routes
router.get('/village/:villageId', territoryVillageEducationController.getTerritoryVillageEducation);
router.put('/village/:villageId', territoryVillageEducationController.updateTerritoryVillageEducation);

module.exports = router; 