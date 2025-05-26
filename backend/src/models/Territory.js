const db = require('../../db');

class Territory {
    static async create(territoryData) {
        const query = `
            INSERT INTO territories (
                title, slug, capital, famous_for, 
                preview_image, meta_title, meta_description, meta_keywords,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const values = [
            territoryData.title,
            territoryData.slug,
            territoryData.capital,
            territoryData.famous_for,
            territoryData.preview_image,
            territoryData.meta_title,
            territoryData.meta_description,
            territoryData.meta_keywords
        ];

        try {
            const [result] = await db.query(query, values);
            return { id: result.insertId, ...territoryData };
        } catch (error) {
            throw error;
        }
    }

    static async getAll() {
        const query = `
            SELECT t.*, 
                   GROUP_CONCAT(ti.id) as image_ids,
                   GROUP_CONCAT(ti.image_url) as image_urls,
                   GROUP_CONCAT(ti.is_featured) as featured_statuses
            FROM territories t
            LEFT JOIN territory_images ti ON t.id = ti.territory_id
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `;
        
        try {
            const [territories] = await db.query(query);
            return territories.map(territory => ({
                ...territory,
                images: territory.image_ids ? territory.image_ids.split(',').map((id, index) => ({
                    id: parseInt(id),
                    image_url: territory.image_urls.split(',')[index],
                    is_featured: territory.featured_statuses.split(',')[index] === '1'
                })) : []
            }));
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        const query = `
            SELECT t.*, 
                   GROUP_CONCAT(ti.id) as image_ids,
                   GROUP_CONCAT(ti.image_url) as image_urls,
                   GROUP_CONCAT(ti.is_featured) as featured_statuses
            FROM territories t
            LEFT JOIN territory_images ti ON t.id = ti.territory_id
            WHERE t.id = ?
            GROUP BY t.id
        `;
        
        try {
            const [territories] = await db.query(query, [id]);
            if (territories.length === 0) return null;
            
            const territory = territories[0];
            return {
                ...territory,
                images: territory.image_ids ? territory.image_ids.split(',').map((id, index) => ({
                    id: parseInt(id),
                    image_url: territory.image_urls.split(',')[index],
                    is_featured: territory.featured_statuses.split(',')[index] === '1'
                })) : []
            };
        } catch (error) {
            throw error;
        }
    }

    static async getBySlug(slug) {
        const query = `
            SELECT t.*, 
                   GROUP_CONCAT(ti.id) as image_ids,
                   GROUP_CONCAT(ti.image_url) as image_urls,
                   GROUP_CONCAT(ti.is_featured) as featured_statuses
            FROM territories t
            LEFT JOIN territory_images ti ON t.id = ti.territory_id
            WHERE t.slug = ?
            GROUP BY t.id
        `;
        
        try {
            const [territories] = await db.query(query, [slug]);
            if (territories.length === 0) return null;
            
            const territory = territories[0];
            return {
                ...territory,
                images: territory.image_ids ? territory.image_ids.split(',').map((id, index) => ({
                    id: parseInt(id),
                    image_url: territory.image_urls.split(',')[index],
                    is_featured: territory.featured_statuses.split(',')[index] === '1'
                })) : []
            };
        } catch (error) {
            throw error;
        }
    }

    static async update(id, territoryData) {
        const query = `
            UPDATE territories 
            SET title = ?,
                slug = ?,
                capital = ?,
                famous_for = ?,
                preview_image = ?,
                meta_title = ?,
                meta_description = ?,
                meta_keywords = ?,
                updated_at = NOW()
            WHERE id = ?
        `;
        
        const values = [
            territoryData.title,
            territoryData.slug,
            territoryData.capital,
            territoryData.famous_for,
            territoryData.preview_image,
            territoryData.meta_title,
            territoryData.meta_description,
            territoryData.meta_keywords,
            id
        ];

        try {
            const [result] = await db.query(query, values);
            if (result.affectedRows === 0) {
                throw new Error('Territory not found');
            }
            return { id, ...territoryData };
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM territories WHERE id = ?';
        
        try {
            const [result] = await db.query(query, [id]);
            if (result.affectedRows === 0) {
                throw new Error('Territory not found');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async checkSlugExists(slug, excludeId = null) {
        const query = `
            SELECT COUNT(*) as count 
            FROM territories 
            WHERE slug = ? ${excludeId ? 'AND id != ?' : ''}
        `;
        
        const values = excludeId ? [slug, excludeId] : [slug];
        
        try {
            const [rows] = await db.query(query, values);
            return rows[0].count > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Territory; 