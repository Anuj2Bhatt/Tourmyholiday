const express = require('express');
const router = express.Router();
const territoryWebStoryController = require('../controllers/territoryWebStoryController');
const fileUpload = require('express-fileupload');

// Apply fileUpload middleware
router.use(fileUpload());

// Upload image for a web story
router.post('/:storyId', territoryWebStoryController.uploadTerritoryWebStoryImage);

// Delete image from a web story
router.delete('/:storyId/:imageId', territoryWebStoryController.deleteTerritoryWebStoryImage);

// Update image details (alt text, description, order)
router.put('/:storyId/:imageId', territoryWebStoryController.updateTerritoryWebStoryImage);

// Reorder images
router.put('/:storyId/reorder', territoryWebStoryController.reorderTerritoryWebStoryImages);

module.exports = router; 