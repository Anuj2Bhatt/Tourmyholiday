const db = require('../config/database');
const path = require('path');
const fs = require('fs');

const territoryWebStoryController = {
    // Get all web stories for a territory district
    getTerritoryWebStories: async (req, res) => {
        res.json({ message: 'Test endpoint' });
    }
};

module.exports = territoryWebStoryController; 