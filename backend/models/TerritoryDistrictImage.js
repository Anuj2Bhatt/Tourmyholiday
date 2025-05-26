const pool = require('../db');

class TerritoryDistrictImage {
    // Get all images for a district
    static async getImagesByDistrictId(districtId) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM territory_district_images WHERE district_id = ? ORDER BY created_at DESC',
                [districtId]
            );
            return rows;
        } catch (error) {
            console.error('Error in getImagesByDistrictId:', error);
            throw error;
        }
    }

    // Add new image
    static async addImage(imageData) {
        try {
            const [result] = await pool.query(
                'INSERT INTO territory_district_images (district_id, image_url, caption, alt_text) VALUES (?, ?, ?, ?)',
                [imageData.district_id, imageData.image_url, imageData.caption, imageData.alt_text]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error in addImage:', error);
            throw error;
        }
    }

    // Delete image
    static async deleteImage(imageId) {
        try {
            const [result] = await pool.query(
                'DELETE FROM territory_district_images WHERE id = ?',
                [imageId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in deleteImage:', error);
            throw error;
        }
    }

    // Get single image
    static async getImageById(imageId) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM territory_district_images WHERE id = ?',
                [imageId]
            );
            return rows[0];
        } catch (error) {
            console.error('Error in getImageById:', error);
            throw error;
        }
    }
}

module.exports = TerritoryDistrictImage; 