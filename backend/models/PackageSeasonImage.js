const { pool } = require('../config/database');
const db = require('../db');

class PackageSeasonImage {
    static async create(imageData) {
        const { package_id, season, image_path, alt_text, description } = imageData;
        const query = `
            INSERT INTO package_season_images 
            (package_id, season, image_path, alt_text, description) 
            VALUES (?, ?, ?, ?, ?)
        `;
        try {
            const [result] = await pool.query(query, [
                package_id,
                season,
                image_path,
                alt_text,
                description
            ]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(imageData) {
        const { id, package_id, image_path, alt_text, description } = imageData;
        const query = `
            UPDATE package_season_images 
            SET image_path = ?,
                alt_text = ?,
                description = ?
            WHERE id = ? AND package_id = ?
        `;
        try {
            const [result] = await pool.query(query, [
                image_path,
                alt_text,
                description,
                id,
                package_id
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getByPackageId(packageId) {
        try {
            const [images] = await db.query(
                'SELECT * FROM package_season_images WHERE package_id = ? ORDER BY created_at DESC',
                [packageId]
            );
            return images;
        } catch (error) {
            console.error('Error getting package season images:', error);
            throw error;
        }
    }

    static async getByPackageAndSeason(packageId, season) {
        const query = `
            SELECT * FROM package_season_images 
            WHERE package_id = ? AND season = ?
            ORDER BY created_at
        `;
        try {
            const [rows] = await pool.query(query, [packageId, season]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id, packageId) {
        const query = `
            SELECT * FROM package_season_images 
            WHERE id = ? AND package_id = ?
        `;
        try {
            const [rows] = await pool.query(query, [id, packageId]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(id, packageId) {
        const query = `
            DELETE FROM package_season_images 
            WHERE id = ? AND package_id = ?
        `;
        try {
            const [result] = await pool.query(query, [id, packageId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async deleteByPackageAndSeason(packageId, season) {
        const query = `
            DELETE FROM package_season_images 
            WHERE package_id = ? AND season = ?
        `;
        try {
            const [result] = await pool.query(query, [packageId, season]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async getImageCountBySeason(packageId) {
        const query = `
            SELECT season, COUNT(*) as image_count
            FROM package_season_images 
            WHERE package_id = ?
            GROUP BY season
        `;
        try {
            const [rows] = await pool.query(query, [packageId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PackageSeasonImage; 