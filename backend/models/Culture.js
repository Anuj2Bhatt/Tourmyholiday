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
      const result = await db.query(query, values);

      // Check if result is valid and has insertId
      if (!result || !result.insertId) {
        throw new Error('Failed to create culture: Invalid database response');
      }

      const insertId = result.insertId;
      return insertId;
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
    try {
      // Get the full records
      const query = 'SELECT * FROM cultures WHERE subdistrict_id = ? ORDER BY id ASC';

      const result = await db.query(query, [parseInt(subdistrictId)]);
      const rows = result[0]; // Get the first element of the result array
      
      // Ensure we return an array
      if (!Array.isArray(rows)) {
        return [];
      }

      return rows;

    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    const query = 'SELECT * FROM cultures WHERE id = ?';
    try {
      // Execute query with explicit type conversion
      const [rows] = await db.query(query, [parseInt(id)]);
      
      // Handle both array and object responses
      if (rows && typeof rows === 'object') {
        // If rows is an object with id property, it's a single row
        if (rows.id) {
          return rows;
        }
        // If rows is an array-like object, get the first item
        if (Object.keys(rows).length > 0) {
          return rows;
        }
      }
      
      // If no valid data found, return null
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async getBySlug(slug) {
    const query = 'SELECT * FROM cultures WHERE slug = ?';
    try {
      const [rows] = await db.query(query, [slug]);
      
      if (rows && rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async checkSlugExists(slug, excludeId = null) {
    let query = `
      SELECT EXISTS(
        SELECT 1 
        FROM cultures 
        WHERE slug = ? 
        ${excludeId ? 'AND id != ?' : ''}
      ) as exists_flag
    `;
    const values = [slug];
    if (excludeId) {
      values.push(excludeId);
    }
    
    try {
      const [rows] = await db.query(query, values);
      return rows[0]?.exists_flag === 1;
    } catch (error) {
      throw new Error('Failed to check if slug exists');
    }
  }
}

module.exports = Culture; 