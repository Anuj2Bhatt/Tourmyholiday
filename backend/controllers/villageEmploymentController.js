const pool = require('../db');

// Get employment data for a state village
exports.getStateVillageEmployment = async (req, res) => {
    try {
        const { villageId } = req.params;
        
        // First check if village exists
        const [village] = await pool.query(
            'SELECT id, name FROM villages WHERE id = ?',
            [villageId]
        );

        if (village.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Village not found'
            });
        }

        // Get employment data
        const [results] = await pool.query(
            'SELECT * FROM state_village_employment WHERE village_id = ?',
            [villageId]
        );

        if (results.length === 0) {
            return res.json({
                success: true,
                data: {
                    village_id: villageId,
                    village_name: village[0].name,
                    working_population: null,
                    main_workers: null,
                    main_cultivators: null,
                    agri_labourers: null,
                    marginal_workers: null,
                    marginal_cultivators: null,
                    non_working: null,
                    non_working_males: null,
                    non_working_females: null
                }
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Error in getStateVillageEmployment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Update employment data for a state village
exports.updateStateVillageEmployment = async (req, res) => {
    try {
        const { villageId } = req.params;
        const {
            working_population,
            main_workers,
            main_cultivators,
            agri_labourers,
            marginal_workers,
            marginal_cultivators,
            non_working,
            non_working_males,
            non_working_females
        } = req.body;

        // Check if village exists
        const [village] = await pool.query(
            'SELECT id FROM villages WHERE id = ?',
            [villageId]
        );

        if (village.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Village not found'
            });
        }

        // Check if employment data exists
        const [existing] = await pool.query(
            'SELECT id FROM state_village_employment WHERE village_id = ?',
            [villageId]
        );

        if (existing.length > 0) {
            // Update existing data
            await pool.query(
                `UPDATE state_village_employment 
                SET working_population = ?,
                    main_workers = ?,
                    main_cultivators = ?,
                    agri_labourers = ?,
                    marginal_workers = ?,
                    marginal_cultivators = ?,
                    non_working = ?,
                    non_working_males = ?,
                    non_working_females = ?
                WHERE village_id = ?`,
                [
                    working_population,
                    main_workers,
                    main_cultivators,
                    agri_labourers,
                    marginal_workers,
                    marginal_cultivators,
                    non_working,
                    non_working_males,
                    non_working_females,
                    villageId
                ]
            );
        } else {
            // Insert new data
            await pool.query(
                `INSERT INTO state_village_employment 
                (village_id, working_population, main_workers, main_cultivators, 
                agri_labourers, marginal_workers, marginal_cultivators, 
                non_working, non_working_males, non_working_females)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    villageId,
                    working_population,
                    main_workers,
                    main_cultivators,
                    agri_labourers,
                    marginal_workers,
                    marginal_cultivators,
                    non_working,
                    non_working_males,
                    non_working_females
                ]
            );
        }

        res.json({
            success: true,
            message: 'Employment data updated successfully'
        });
    } catch (error) {
        console.error('Error in updateStateVillageEmployment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get employment data for a territory village
exports.getTerritoryVillageEmployment = async (req, res) => {
    try {
        const { villageId } = req.params;
        
        // First check if village exists
        const [village] = await pool.query(
            'SELECT id, name FROM villages WHERE id = ?',
            [villageId]
        );

        if (village.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Village not found'
            });
        }

        // Get employment data
        const [results] = await pool.query(
            'SELECT * FROM territory_village_employment WHERE village_id = ?',
            [villageId]
        );

        if (results.length === 0) {
            return res.json({
                success: true,
                data: {
                    village_id: villageId,
                    village_name: village[0].name,
                    working_population: null,
                    main_workers: null,
                    main_cultivators: null,
                    agri_labourers: null,
                    marginal_workers: null,
                    marginal_cultivators: null,
                    non_working: null,
                    non_working_males: null,
                    non_working_females: null
                }
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Error in getTerritoryVillageEmployment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Update employment data for a territory village
exports.updateTerritoryVillageEmployment = async (req, res) => {
    try {
        const { villageId } = req.params;
        const {
            working_population,
            main_workers,
            main_cultivators,
            agri_labourers,
            marginal_workers,
            marginal_cultivators,
            non_working,
            non_working_males,
            non_working_females
        } = req.body;

        // Check if village exists
        const [village] = await pool.query(
            'SELECT id FROM villages WHERE id = ?',
            [villageId]
        );

        if (village.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Village not found'
            });
        }

        // Check if employment data exists
        const [existing] = await pool.query(
            'SELECT id FROM territory_village_employment WHERE village_id = ?',
            [villageId]
        );

        if (existing.length > 0) {
            // Update existing data
            await pool.query(
                `UPDATE territory_village_employment 
                SET working_population = ?,
                    main_workers = ?,
                    main_cultivators = ?,
                    agri_labourers = ?,
                    marginal_workers = ?,
                    marginal_cultivators = ?,
                    non_working = ?,
                    non_working_males = ?,
                    non_working_females = ?
                WHERE village_id = ?`,
                [
                    working_population,
                    main_workers,
                    main_cultivators,
                    agri_labourers,
                    marginal_workers,
                    marginal_cultivators,
                    non_working,
                    non_working_males,
                    non_working_females,
                    villageId
                ]
            );
        } else {
            // Insert new data
            await pool.query(
                `INSERT INTO territory_village_employment 
                (village_id, working_population, main_workers, main_cultivators, 
                agri_labourers, marginal_workers, marginal_cultivators, 
                non_working, non_working_males, non_working_females)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    villageId,
                    working_population,
                    main_workers,
                    main_cultivators,
                    agri_labourers,
                    marginal_workers,
                    marginal_cultivators,
                    non_working,
                    non_working_males,
                    non_working_females
                ]
            );
        }

        res.json({
            success: true,
            message: 'Employment data updated successfully'
        });
    } catch (error) {
        console.error('Error in updateTerritoryVillageEmployment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}; 