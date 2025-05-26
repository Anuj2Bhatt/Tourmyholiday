const { pool } = require('../config/database');

class PackageSeason {
    static async create(seasonData) {
        const { package_id, season, season_description, best_time_to_visit, weather_conditions, special_attractions, is_active } = seasonData;
        const query = `
            INSERT INTO package_seasons 
            (package_id, season, season_description, best_time_to_visit, weather_conditions, special_attractions, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        try {
            const [result] = await pool.query(query, [
                package_id, 
                season, 
                season_description, 
                best_time_to_visit, 
                weather_conditions, 
                special_attractions, 
                is_active
            ]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(seasonData) {
        const { package_id, season, season_description, best_time_to_visit, weather_conditions, special_attractions, is_active } = seasonData;
        const query = `
            UPDATE package_seasons 
            SET season_description = ?,
                best_time_to_visit = ?,
                weather_conditions = ?,
                special_attractions = ?,
                is_active = ?
            WHERE package_id = ? AND season = ?
        `;
        try {
            const [result] = await pool.query(query, [
                season_description,
                best_time_to_visit,
                weather_conditions,
                special_attractions,
                is_active,
                package_id,
                season
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getByPackageId(packageId) {
        const query = `
            SELECT * FROM package_seasons 
            WHERE package_id = ? 
            ORDER BY 
                CASE season
                    WHEN 'Summer' THEN 1
                    WHEN 'Monsoon' THEN 2
                    WHEN 'Autumn' THEN 3
                    WHEN 'Winter' THEN 4
                    WHEN 'Spring' THEN 5
                END
        `;
        try {
            const [rows] = await pool.query(query, [packageId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getByPackageAndSeason(packageId, season) {
        const query = `
            SELECT * FROM package_seasons 
            WHERE package_id = ? AND season = ?
        `;
        try {
            const [rows] = await pool.query(query, [packageId, season]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(packageId, season) {
        const query = `
            DELETE FROM package_seasons 
            WHERE package_id = ? AND season = ?
        `;
        try {
            const [result] = await pool.query(query, [packageId, season]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async toggleActive(packageId, season) {
        const query = `
            UPDATE package_seasons 
            SET is_active = NOT is_active 
            WHERE package_id = ? AND season = ?
        `;
        try {
            const [result] = await pool.query(query, [packageId, season]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PackageSeason; 