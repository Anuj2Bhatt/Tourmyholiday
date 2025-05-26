const db = require('../config/database');

class StateEducationInstitution {
  static async create(institution) {
    const {
      state_id, district_id, subdistrict_id, name, type, description,
      address, contact_number, email, website, established_year,
      accreditation, facilities, courses_offered, admission_process,
      fee_structure, featured_image, gallery_images, meta_title,
      meta_description, meta_keywords, status
    } = institution;

    const query = `
      INSERT INTO state_education_institutions (
        state_id, district_id, subdistrict_id, name, type, description,
        address, contact_number, email, website, established_year,
        accreditation, facilities, courses_offered, admission_process,
        fee_structure, featured_image, gallery_images, meta_title,
        meta_description, meta_keywords, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      state_id, district_id, subdistrict_id, name, type, description,
      address, contact_number, email, website, established_year,
      accreditation, facilities, courses_offered, admission_process,
      fee_structure, featured_image, JSON.stringify(gallery_images),
      meta_title, meta_description, meta_keywords, status
    ];

    try {
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, institution) {
    const {
      name, type, description, address, contact_number, email,
      website, established_year, accreditation, facilities,
      courses_offered, admission_process, fee_structure,
      featured_image, gallery_images, meta_title, meta_description,
      meta_keywords, status
    } = institution;

    const query = `
      UPDATE state_education_institutions
      SET name = ?, type = ?, description = ?, address = ?,
          contact_number = ?, email = ?, website = ?, established_year = ?,
          accreditation = ?, facilities = ?, courses_offered = ?,
          admission_process = ?, fee_structure = ?, featured_image = ?,
          gallery_images = ?, meta_title = ?, meta_description = ?,
          meta_keywords = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const values = [
      name, type, description, address, contact_number, email,
      website, established_year, accreditation, facilities,
      courses_offered, admission_process, fee_structure,
      featured_image, JSON.stringify(gallery_images), meta_title,
      meta_description, meta_keywords, status, id
    ];

    try {
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM state_education_institutions WHERE id = ?';
    try {
      const [result] = await db.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM state_education_institutions WHERE id = ?';
    try {
      const [rows] = await db.query(query, [id]);
      if (rows.length > 0) {
        const institution = rows[0];
        institution.gallery_images = JSON.parse(institution.gallery_images);
        return institution;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async findBySubdistrict(subdistrictId) {
    const query = 'SELECT * FROM state_education_institutions WHERE subdistrict_id = ?';
    try {
      const [rows] = await db.query(query, [subdistrictId]);
      return rows.map(row => ({
        ...row,
        gallery_images: JSON.parse(row.gallery_images)
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StateEducationInstitution; 