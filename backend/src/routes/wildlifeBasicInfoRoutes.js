const express = require('express');
const router = express.Router();

const wildlifeBasicInfoController = require('../../controllers/wildlifeBasicInfoController');

// Get all basic info records
router.get('/', (req, res) => {
  wildlifeBasicInfoController.getAllBasicInfo(req, res);
});

// Get basic info by sanctuary ID
router.get('/sanctuary/:sanctuaryId', wildlifeBasicInfoController.getBasicInfoBySanctuary);

// Get single basic info record by ID
router.get('/:id', wildlifeBasicInfoController.getBasicInfoById);

// Create new basic info record
router.post('/', wildlifeBasicInfoController.createBasicInfo);

// Update basic info record
router.put('/:id', wildlifeBasicInfoController.updateBasicInfo);

// Delete basic info record
router.delete('/:id', wildlifeBasicInfoController.deleteBasicInfo);

// Get basic info by sanctuary name (search)
router.get('/search/:sanctuaryName', wildlifeBasicInfoController.searchBasicInfoByName);

module.exports = router; 