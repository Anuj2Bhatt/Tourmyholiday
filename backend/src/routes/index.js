const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./auth');
const uploadRoutes = require('./upload');
const articlesRouter = require('./articles');
const galleryRouter = require('./gallery');
const stateRoutes = require('./states');
const stateHistoryRoutes = require('./stateHistory');
const districtsRouter = require('./districts');
const subdistrictsRouter = require('./subdistricts');
const placesRouter = require('./places');
const packagesRouter = require('./packages');
const stateImagesRouter = require('./stateImages');
const enquiryRouter = require('./enquiry');
const teamRoutes = require('./team');
const stateSeasonImagesRoutes = require('./stateSeasonImages');
const webStoriesRouter = require('./webStories');
const seasonsRouter = require('./seasons');
const seasonImagesRouter = require('./seasonImages');
const videosRouter = require('./videos');
const hotelCategoriesRouter = require('./hotelCategories');
const territoryRoutes = require('./territoryRoutes');
const hotelsRouter = require('./hotels');

// Register all routes
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/articles', articlesRouter);
router.use('/gallery', galleryRouter);
router.use('/states', stateRoutes);
router.use('/state-history', stateHistoryRoutes);
router.use('/districts', districtsRouter);
router.use('/subdistricts', subdistrictsRouter);
router.use('/places', placesRouter);
router.use('/packages', packagesRouter);
router.use('/state-images', stateImagesRouter);
router.use('/enquiry', enquiryRouter);
router.use('/team', teamRoutes);
router.use('/state-season-images', stateSeasonImagesRoutes);
router.use('/web-stories', webStoriesRouter);
router.use('/seasons', seasonsRouter);
router.use('/season-images', seasonImagesRouter);
router.use('/videos', videosRouter);
router.use('/hotel-categories', hotelCategoriesRouter);
router.use('/hotels', hotelsRouter);
router.use('/territories', territoryRoutes);

module.exports = router; 