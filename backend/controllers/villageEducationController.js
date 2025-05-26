const pool = require('../src/db');

const villageEducationController = {
  // Get state village education data
  getStateVillageEducation: async (req, res) => {
    try {
      const { villageId } = req.params;
      
      const [education] = await pool.query(
        `SELECT * FROM state_village_education WHERE village_id = ?`,
        [villageId]
      );

      if (!education || education.length === 0) {
        // Return empty data structure if no record exists
        return res.json({
          success: true,
          data: {
            primary_schools_govt: null,
            middle_schools_govt: null,
            secondary_schools_govt: null,
            senior_secondary_schools_govt: null,
            nearest_arts_college: '',
            nearest_engg_college: '',
            nearest_medical_college: '',
            nearest_polytechnic: '',
            nearest_vocational_iti: ''
          }
        });
      }

      res.json({
        success: true,
        data: education[0]
      });
    } catch (error) {
      console.error('Error fetching state village education:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch village education data',
        error: error.message
      });
    }
  },

  // Update state village education data
  updateStateVillageEducation: async (req, res) => {
    try {
      const { villageId } = req.params;
      const {
        primary_schools_govt,
        middle_schools_govt,
        secondary_schools_govt,
        senior_secondary_schools_govt,
        nearest_arts_college,
        nearest_engg_college,
        nearest_medical_college,
        nearest_polytechnic,
        nearest_vocational_iti
      } = req.body;

      // Check if record exists
      const [existing] = await pool.query(
        'SELECT id FROM state_village_education WHERE village_id = ?',
        [villageId]
      );

      if (existing && existing.length > 0) {
        // Update existing record
        await pool.query(
          `UPDATE state_village_education SET 
            primary_schools_govt = ?,
            middle_schools_govt = ?,
            secondary_schools_govt = ?,
            senior_secondary_schools_govt = ?,
            nearest_arts_college = ?,
            nearest_engg_college = ?,
            nearest_medical_college = ?,
            nearest_polytechnic = ?,
            nearest_vocational_iti = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE village_id = ?`,
          [
            primary_schools_govt,
            middle_schools_govt,
            secondary_schools_govt,
            senior_secondary_schools_govt,
            nearest_arts_college,
            nearest_engg_college,
            nearest_medical_college,
            nearest_polytechnic,
            nearest_vocational_iti,
            villageId
          ]
        );
      } else {
        // Insert new record
        await pool.query(
          `INSERT INTO state_village_education (
            village_id,
            primary_schools_govt,
            middle_schools_govt,
            secondary_schools_govt,
            senior_secondary_schools_govt,
            nearest_arts_college,
            nearest_engg_college,
            nearest_medical_college,
            nearest_polytechnic,
            nearest_vocational_iti
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            villageId,
            primary_schools_govt,
            middle_schools_govt,
            secondary_schools_govt,
            senior_secondary_schools_govt,
            nearest_arts_college,
            nearest_engg_college,
            nearest_medical_college,
            nearest_polytechnic,
            nearest_vocational_iti
          ]
        );
      }

      res.json({
        success: true,
        message: 'Village education data updated successfully'
      });
    } catch (error) {
      console.error('Error updating state village education:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update village education data',
        error: error.message
      });
    }
  },

  // Get territory village education data
  getTerritoryVillageEducation: async (req, res) => {
    try {
      const { villageId } = req.params;
      
      const [education] = await pool.query(
        `SELECT * FROM territory_village_education WHERE village_id = ?`,
        [villageId]
      );

      if (!education || education.length === 0) {
        // Return empty data structure if no record exists
        return res.json({
          success: true,
          data: {
            primary_schools_govt: null,
            middle_schools_govt: null,
            secondary_schools_govt: null,
            senior_secondary_schools_govt: null,
            nearest_arts_college: '',
            nearest_engg_college: '',
            nearest_medical_college: '',
            nearest_polytechnic: '',
            nearest_vocational_iti: ''
          }
        });
      }

      res.json({
        success: true,
        data: education[0]
      });
    } catch (error) {
      console.error('Error fetching territory village education:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch village education data',
        error: error.message
      });
    }
  },

  // Update territory village education data
  updateTerritoryVillageEducation: async (req, res) => {
    try {
      const { villageId } = req.params;
      const {
        primary_schools_govt,
        middle_schools_govt,
        secondary_schools_govt,
        senior_secondary_schools_govt,
        nearest_arts_college,
        nearest_engg_college,
        nearest_medical_college,
        nearest_polytechnic,
        nearest_vocational_iti
      } = req.body;

      // Check if record exists
      const [existing] = await pool.query(
        'SELECT id FROM territory_village_education WHERE village_id = ?',
        [villageId]
      );

      if (existing && existing.length > 0) {
        // Update existing record
        await pool.query(
          `UPDATE territory_village_education SET 
            primary_schools_govt = ?,
            middle_schools_govt = ?,
            secondary_schools_govt = ?,
            senior_secondary_schools_govt = ?,
            nearest_arts_college = ?,
            nearest_engg_college = ?,
            nearest_medical_college = ?,
            nearest_polytechnic = ?,
            nearest_vocational_iti = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE village_id = ?`,
          [
            primary_schools_govt,
            middle_schools_govt,
            secondary_schools_govt,
            senior_secondary_schools_govt,
            nearest_arts_college,
            nearest_engg_college,
            nearest_medical_college,
            nearest_polytechnic,
            nearest_vocational_iti,
            villageId
          ]
        );
      } else {
        // Insert new record
        await pool.query(
          `INSERT INTO territory_village_education (
            village_id,
            primary_schools_govt,
            middle_schools_govt,
            secondary_schools_govt,
            senior_secondary_schools_govt,
            nearest_arts_college,
            nearest_engg_college,
            nearest_medical_college,
            nearest_polytechnic,
            nearest_vocational_iti
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            villageId,
            primary_schools_govt,
            middle_schools_govt,
            secondary_schools_govt,
            senior_secondary_schools_govt,
            nearest_arts_college,
            nearest_engg_college,
            nearest_medical_college,
            nearest_polytechnic,
            nearest_vocational_iti
          ]
        );
      }

      res.json({
        success: true,
        message: 'Village education data updated successfully'
      });
    } catch (error) {
      console.error('Error updating territory village education:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update village education data',
        error: error.message
      });
    }
  }
};

module.exports = villageEducationController; 