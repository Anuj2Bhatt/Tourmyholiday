const db = require('../config/database');
const path = require('path');
const fs = require('fs');

const testController = {
    getTerritoryWebStories: async (req, res) => {
        res.json({ message: 'Test endpoint working' });
    }
};

module.exports = testController; 