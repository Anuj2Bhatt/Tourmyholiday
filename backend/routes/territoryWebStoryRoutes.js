const express = require('express');
const router = express.Router();
const territoryWebStoryController = require('./../controllers/territoryWebStoryController.js');
const fileUpload = require('express-fileupload');

// Apply fileUpload middleware
router.use(fileUpload());

// Get all web stories for a territory
router.get('/territory/:territory_id', territoryWebStoryController.getTerritoryWebStories);

// Get single web story
router.get('/:id', territoryWebStoryController.getTerritoryWebStory);

// Create new web story
router.post('/', territoryWebStoryController.createTerritoryWebStory);

// Update web story
router.put('/:id', territoryWebStoryController.updateTerritoryWebStory);

// Delete web story
router.delete('/:id', territoryWebStoryController.deleteTerritoryWebStory);

// Get story schema
router.get('/:id/schema', territoryWebStoryController.getTerritoryWebStorySchema);

module.exports = router; 