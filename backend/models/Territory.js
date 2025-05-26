const db = require('../config/database');

class Territory {
    static async findAll() {
        try {
            const [rows] = await db.query('SELECT * FROM territories ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            throw new Error('Error fetching territories: ' + error.message);
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM territories WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw new Error('Error fetching territory: ' + error.message);
        }
    }

    static async findBySlug(slug) {
        try {
            const [rows] = await db.query('SELECT * FROM territories WHERE slug = ?', [slug]);
            return rows[0];
        } catch (error) {
            throw new Error('Error checking slug: ' + error.message);
        }
    }

    static async create(territoryData) {
        try {
            const [result] = await db.query(
                'INSERT INTO territories (title, slug, capital, famous_for, preview_image, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    territoryData.title,
                    territoryData.slug,
                    territoryData.capital,
                    territoryData.famous_for,
                    territoryData.preview_image,
                    territoryData.meta_title,
                    territoryData.meta_description,
                    territoryData.meta_keywords
                ]
            );
            
            if (result.insertId) {
                return this.findById(result.insertId);
            }
            throw new Error('Failed to create territory');
        } catch (error) {
            throw new Error('Error creating territory: ' + error.message);
        }
    }

    static async update(id, territoryData) {
        try {
            const [result] = await db.query(
                'UPDATE territories SET title = ?, slug = ?, capital = ?, famous_for = ?, preview_image = ?, meta_title = ?, meta_description = ?, meta_keywords = ? WHERE id = ?',
                [
                    territoryData.title,
                    territoryData.slug,
                    territoryData.capital,
                    territoryData.famous_for,
                    territoryData.preview_image,
                    territoryData.meta_title,
                    territoryData.meta_description,
                    territoryData.meta_keywords,
                    id
                ]
            );

            if (result.affectedRows === 0) {
                throw new Error('Territory not found');
            }

            return this.findById(id);
        } catch (error) {
            throw new Error('Error updating territory: ' + error.message);
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM territories WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                throw new Error('Territory not found');
            }
            
            return true;
        } catch (error) {
            throw new Error('Error deleting territory: ' + error.message);
        }
    }

    static async checkSlugExists(slug, excludeId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM territories WHERE slug = ?';
            const params = [slug];

            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }

            const [result] = await db.query(query, params);
            return result[0].count > 0;
        } catch (error) {
            throw new Error('Error checking slug existence: ' + error.message);
        }
    }
}

module.exports = Territory;