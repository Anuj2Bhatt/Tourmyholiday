const db = require('../config/database');

class Culture {
  static async create(cultureData) {
    const { subdistrict_id, title, slug, description, featured_image, meta_title, meta_description, meta_keywords } = cultureData;
    const query = `
      INSERT INTO cultures (
        subdistrict_id, title, slug, description, featured_image, 
        meta_title, meta_description, meta_keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [subdistrict_id, title, slug, description, featured_image, meta_title, meta_description, meta_keywords];
    
    try {
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, cultureData) {
    const { title, slug, description, featured_image, meta_title, meta_description, meta_keywords } = cultureData;
    const query = `
      UPDATE cultures 
      SET title = ?, slug = ?, description = ?, featured_image = ?,
          meta_title = ?, meta_description = ?, meta_keywords = ?
      WHERE id = ?
    `;
    const values = [title, slug, description, featured_image, meta_title, meta_description, meta_keywords, id];
    
    try {
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM cultures WHERE id = ?';
    try {
      const [result] = await db.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getBySubdistrict(subdistrictId) {
    const query = 'SELECT * FROM cultures WHERE subdistrict_id = ?';
    try {
      const [rows] = await db.query(query, [subdistrictId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    const query = 'SELECT * FROM cultures WHERE id = ?';
    try {
      const [rows] = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async checkSlugExists(slug, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM cultures WHERE slug = ?';
    const values = [slug];
    
    if (excludeId) {
      query += ' AND id != ?';
      values.push(excludeId);
    }
    
    try {
      const [rows] = await db.query(query, values);
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Culture; 