const pool = require('../src/db');
const { validationResult } = require('express-validator');

// Get population data for a village
exports.getVillagePopulation = async (req, res) => {
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

        // Then get population data
        const query = `
            SELECT 
                vp.*,
                v.name as village_name,
                s.name as state_name
            FROM village_population vp
            JOIN villages v ON vp.village_id = v.id
            JOIN states s ON v.state_id = s.id
            WHERE vp.village_id = ?
        `;

        const [results] = await pool.query(query, [villageId]);

        if (results.length === 0) {
            // Return empty population data structure if no data exists
            return res.json({
                success: true,
                data: {
                    village_id: villageId,
                    village_name: village[0].name,
                    total_population: null,
                    male_population: null,
                    female_population: null,
                    rural_population: null,
                    urban_population: null,
                    literacy_rate: null,
                    male_literacy_rate: null,
                    female_literacy_rate: null,
                    scheduled_caste_population: null,
                    scheduled_tribe_population: null,
                    other_backward_classes_population: null,
                    muslim_population: null,
                    christian_population: null,
                    sikh_population: null,
                    buddhist_population: null,
                    jain_population: null,
                    other_religions_population: null,
                    not_stated_population: null
                }
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Error in getVillagePopulation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get population data for a territory village
exports.getTerritoryVillagePopulation = async (req, res) => {
    try {
        const { territoryVillageId } = req.params;
        
        const query = `
            SELECT 
                tvp.*,
                tv.name as village_name,
                t.name as territory_name
            FROM territory_village_population tvp
            JOIN territory_villages tv ON tvp.territory_village_id = tv.id
            JOIN territories t ON tv.territory_id = t.id
            WHERE tvp.territory_village_id = ?
        `;

        const [results] = await pool.query(query, [territoryVillageId]);

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Population data not found for this territory village' 
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    } catch (error) {
        console.error('Error in getTerritoryVillagePopulation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Update population data for a village
exports.updateVillagePopulation = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { villageId } = req.params;
        const {
            total_population,
            male_population,
            female_population,
            rural_population,
            urban_population,
            literacy_rate,
            male_literacy_rate,
            female_literacy_rate,
            scheduled_caste_population,
            scheduled_tribe_population,
            other_backward_classes_population,
            muslim_population,
            christian_population,
            sikh_population,
            buddhist_population,
            jain_population,
            other_religions_population,
            not_stated_population
        } = req.body;

        // Check if record exists
        const checkQuery = 'SELECT id FROM village_population WHERE village_id = ?';
        const [checkResults] = await pool.query(checkQuery, [villageId]);

        let query;
        let params;

        if (checkResults.length === 0) {
            // Insert new record
            query = `
                INSERT INTO village_population (
                    village_id, total_population, male_population, female_population,
                    rural_population, urban_population, literacy_rate, male_literacy_rate,
                    female_literacy_rate, scheduled_caste_population, scheduled_tribe_population,
                    other_backward_classes_population, muslim_population, christian_population,
                    sikh_population, buddhist_population, jain_population,
                    other_religions_population, not_stated_population
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            params = [
                villageId, total_population, male_population, female_population,
                rural_population, urban_population, literacy_rate, male_literacy_rate,
                female_literacy_rate, scheduled_caste_population, scheduled_tribe_population,
                other_backward_classes_population, muslim_population, christian_population,
                sikh_population, buddhist_population, jain_population,
                other_religions_population, not_stated_population
            ];
        } else {
            // Update existing record
            query = `
                UPDATE village_population 
                SET 
                    total_population = ?,
                    male_population = ?,
                    female_population = ?,
                    rural_population = ?,
                    urban_population = ?,
                    literacy_rate = ?,
                    male_literacy_rate = ?,
                    female_literacy_rate = ?,
                    scheduled_caste_population = ?,
                    scheduled_tribe_population = ?,
                    other_backward_classes_population = ?,
                    muslim_population = ?,
                    christian_population = ?,
                    sikh_population = ?,
                    buddhist_population = ?,
                    jain_population = ?,
                    other_religions_population = ?,
                    not_stated_population = ?
                WHERE village_id = ?
            `;
            params = [
                total_population, male_population, female_population,
                rural_population, urban_population, literacy_rate, male_literacy_rate,
                female_literacy_rate, scheduled_caste_population, scheduled_tribe_population,
                other_backward_classes_population, muslim_population, christian_population,
                sikh_population, buddhist_population, jain_population,
                other_religions_population, not_stated_population, villageId
            ];
        }

        const [updateResults] = await pool.query(query, params);

        res.json({
            success: true,
            message: 'Village population data updated successfully',
            data: {
                village_id: villageId,
                ...req.body
            }
        });
    } catch (error) {
        console.error('Error in updateVillagePopulation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Update population data for a territory village
exports.updateTerritoryVillagePopulation = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { territoryVillageId } = req.params;
        const {
            total_population,
            male_population,
            female_population,
            rural_population,
            urban_population,
            literacy_rate,
            male_literacy_rate,
            female_literacy_rate,
            scheduled_caste_population,
            scheduled_tribe_population,
            other_backward_classes_population,
            muslim_population,
            christian_population,
            sikh_population,
            buddhist_population,
            jain_population,
            other_religions_population,
            not_stated_population
        } = req.body;

        // Check if record exists
        const checkQuery = 'SELECT id FROM territory_village_population WHERE territory_village_id = ?';
        const [checkResults] = await pool.query(checkQuery, [territoryVillageId]);

        let query;
        let params;

        if (checkResults.length === 0) {
            // Insert new record
            query = `
                INSERT INTO territory_village_population (
                    territory_village_id, total_population, male_population, female_population,
                    rural_population, urban_population, literacy_rate, male_literacy_rate,
                    female_literacy_rate, scheduled_caste_population, scheduled_tribe_population,
                    other_backward_classes_population, muslim_population, christian_population,
                    sikh_population, buddhist_population, jain_population,
                    other_religions_population, not_stated_population
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            params = [
                territoryVillageId, total_population, male_population, female_population,
                rural_population, urban_population, literacy_rate, male_literacy_rate,
                female_literacy_rate, scheduled_caste_population, scheduled_tribe_population,
                other_backward_classes_population, muslim_population, christian_population,
                sikh_population, buddhist_population, jain_population,
                other_religions_population, not_stated_population
            ];
        } else {
            // Update existing record
            query = `
                UPDATE territory_village_population 
                SET 
                    total_population = ?,
                    male_population = ?,
                    female_population = ?,
                    rural_population = ?,
                    urban_population = ?,
                    literacy_rate = ?,
                    male_literacy_rate = ?,
                    female_literacy_rate = ?,
                    scheduled_caste_population = ?,
                    scheduled_tribe_population = ?,
                    other_backward_classes_population = ?,
                    muslim_population = ?,
                    christian_population = ?,
                    sikh_population = ?,
                    buddhist_population = ?,
                    jain_population = ?,
                    other_religions_population = ?,
                    not_stated_population = ?
                WHERE territory_village_id = ?
            `;
            params = [
                total_population, male_population, female_population,
                rural_population, urban_population, literacy_rate, male_literacy_rate,
                female_literacy_rate, scheduled_caste_population, scheduled_tribe_population,
                other_backward_classes_population, muslim_population, christian_population,
                sikh_population, buddhist_population, jain_population,
                other_religions_population, not_stated_population, territoryVillageId
            ];
        }

        const [updateResults] = await pool.query(query, params);

        res.json({
            success: true,
            message: 'Territory village population data updated successfully',
            data: {
                territory_village_id: territoryVillageId,
                ...req.body
            }
        });
    } catch (error) {
        console.error('Error in updateTerritoryVillagePopulation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}; 