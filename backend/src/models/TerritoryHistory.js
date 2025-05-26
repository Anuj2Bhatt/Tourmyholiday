const db = require('../../db');

class TerritoryHistory {
    static async create(historyData) {
        const query = `
            INSERT INTO territory_history (
                territory_id, title, content, image, 
                slug, status, meta_title, meta_description, 
                meta_keywords, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const values = [
            historyData.territory_id,
            historyData.title,
            historyData.content,
            historyData.image,
            historyData.slug,
            historyData.status || 'Draft',
            historyData.meta_title,
            historyData.meta_description,
            historyData.meta_keywords
        ];

        try {
            const [result] = await db.query(query, values);
            return { id: result.insertId, ...historyData };
        } catch (error) {
            throw error;
        }
    }

    static async getAll(params = {}) {
        let query = `
            SELECT th.*, t.title as territory_title
            FROM territory_history th
            LEFT JOIN territories t ON th.territory_id = t.id
            WHERE 1=1
        `;
        
        const values = [];

        // Add territory_id filter if provided
        if (params.territory_id) {
            query += ' AND th.territory_id = ?';
            values.push(params.territory_id);
        }

        // Add sorting
        query += ' ORDER BY th.created_at DESC';

        try {
            const [history] = await db.query(query, values);
            return history;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        const query = `
            SELECT th.*, t.title as territory_title
            FROM territory_history th
            LEFT JOIN territories t ON th.territory_id = t.id
            WHERE th.id = ?
        `;
        
        try {
            const [history] = await db.query(query, [id]);
            return history[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async getBySlug(slug) {
        const query = `
            SELECT th.*, t.title as territory_title
            FROM territory_history th
            LEFT JOIN territories t ON th.territory_id = t.id
            WHERE th.slug = ?
        `;
        
        try {
            const [history] = await db.query(query, [slug]);
            return history[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, historyData) {
        const query = `
            UPDATE territory_history 
            SET title = ?,
                content = ?,
                image = ?,
                slug = ?,
                status = ?,
                meta_title = ?,
                meta_description = ?,
                meta_keywords = ?,
                updated_at = NOW()
            WHERE id = ?
        `;
        
        const values = [
            historyData.title,
            historyData.content,
            historyData.image,
            historyData.slug,
            historyData.status,
            historyData.meta_title,
            historyData.meta_description,
            historyData.meta_keywords,
            id
        ];

        try {
            const [result] = await db.query(query, values);
            if (result.affectedRows === 0) {
                throw new Error('Territory history not found');
            }
            return { id, ...historyData };
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM territory_history WHERE id = ?';
        
        try {
            const [result] = await db.query(query, [id]);
            if (result.affectedRows === 0) {
                throw new Error('Territory history not found');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async checkSlugExists(slug, excludeId = null) {
        const query = `
            SELECT COUNT(*) as count 
            FROM territory_history 
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

module.exports = TerritoryHistory; 