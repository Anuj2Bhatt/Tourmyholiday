const express = require('express');
const router = express.Router();
const villagePopulationController = require('../controllers/villagePopulationController');

// Get population data for a village
router.get('/village/:villageId', villagePopulationController.getVillagePopulation);

// Get population data for a territory village
router.get('/territory-village/:territoryVillageId', villagePopulationController.getTerritoryVillagePopulation);

// Update population data for a village
router.put('/village/:villageId', villagePopulationController.updateVillagePopulation);

// Update population data for a territory village
router.put('/territory-village/:territoryVillageId', villagePopulationController.updateTerritoryVillagePopulation);

module.exports = router; 