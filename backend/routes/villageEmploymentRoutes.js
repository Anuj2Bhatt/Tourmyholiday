const express = require('express');
const router = express.Router();
const villageEmploymentController = require('../controllers/villageEmploymentController');

// State Village Employment Routes
router.get('/state/village/:villageId', villageEmploymentController.getStateVillageEmployment);
router.put('/state/village/:villageId', villageEmploymentController.updateStateVillageEmployment);

// Territory Village Employment Routes
router.get('/territory/village/:villageId', villageEmploymentController.getTerritoryVillageEmployment);
router.put('/territory/village/:villageId', villageEmploymentController.updateTerritoryVillageEmployment);

module.exports = router; 