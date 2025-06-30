const { pool } = require('../config/database');

// Get all master data
exports.getAllMasterData = async (req, res) => {
    try {
        // Get package types
        const [packageTypes] = await pool.query(
            'SELECT id, name, description FROM package_types ORDER BY name'
        );

        // Get trip styles
        const [tripStyles] = await pool.query(
            'SELECT id, name, description FROM trip_styles ORDER BY name'
        );

        // Get seasons
        const [seasons] = await pool.query(
            'SELECT id, name, description FROM seasons_tour ORDER BY name'
        );

        // Get budget categories
        const [budgetCategories] = await pool.query(
            'SELECT id, name, description, min_budget, max_budget FROM budget_categories ORDER BY min_budget'
        );

        res.json({
            success: true,
            data: {
                packageTypes,
                tripStyles,
                seasons,
                budgetCategories
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching master data',
            error: error.message
        });
    }
}; 