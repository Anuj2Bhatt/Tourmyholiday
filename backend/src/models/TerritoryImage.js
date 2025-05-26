const db = require('../../db');

class TerritoryImage {
    static async create(imageData) {
        const query = `
            INSERT INTO territory_images (
                territory_id, image_url, alt_text, description,
                is_featured, display_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const values = [
            imageData.territory_id,
            imageData.image_url,
            imageData.alt_text,
            imageData.description,
            imageData.is_featured || false,
            imageData.display_order || 0
        ];

        try {
            const [result] = await db.query(query, values);
            return { id: result.insertId, ...imageData };
        } catch (error) {
            throw error;
        }
    }

    static async getByTerritoryId(territoryId) {
        const query = `
            SELECT * FROM territory_images 
            WHERE territory_id = ?
            ORDER BY display_order ASC, created_at DESC
        `;
        
        try {
            const [images] = await db.query(query, [territoryId]);
            return images;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        const query = `
            SELECT * FROM territory_images 
            WHERE id = ?
        `;
        
        try {
            const [images] = await db.query(query, [id]);
            return images[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id, imageData) {
        const query = `
            UPDATE territory_images 
            SET image_url = ?,
                alt_text = ?,
                description = ?,
                is_featured = ?,
                display_order = ?,
                updated_at = NOW()
            WHERE id = ?
        `;
        
        const values = [
            imageData.image_url,
            imageData.alt_text,
            imageData.description,
            imageData.is_featured,
            imageData.display_order,
            id
        ];

        try {
            const [result] = await db.query(query, values);
            if (result.affectedRows === 0) {
                throw new Error('Image not found');
            }
            return { id, ...imageData };
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        const query = `
            DELETE FROM territory_images 
            WHERE id = ?
        `;
        
        try {
            const [result] = await db.query(query, [id]);
            if (result.affectedRows === 0) {
                throw new Error('Image not found');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async toggleFeatured(id) {
        const query = `
            UPDATE territory_images 
            SET is_featured = NOT is_featured,
                updated_at = NOW()
            WHERE id = ?
        `;
        
        try {
            const [result] = await db.query(query, [id]);
            if (result.affectedRows === 0) {
                throw new Error('Image not found');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async updateDisplayOrder(id, displayOrder) {
        const query = `
            UPDATE territory_images 
            SET display_order = ?,
                updated_at = NOW()
            WHERE id = ?
        `;
        
        try {
            const [result] = await db.query(query, [displayOrder, id]);
            if (result.affectedRows === 0) {
                throw new Error('Image not found');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TerritoryImage; 