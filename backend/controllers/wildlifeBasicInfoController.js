const pool = require('../db');



// Helper: get all fields for insert/update
const fields = [
  "sanctuary_id", "sanctuary_name", "location", "total_area", "established_year",
  "entry_fee_adults", "entry_fee_children", "entry_fee_foreign", "camera_fee", "video_camera_fee", "parking_fee",
  "opening_time", "closing_time", "best_time_to_visit", "peak_season", "off_season", "daily_visitor_capacity", "max_group_size",
  "contact_number", "email_address", "website", "emergency_contact",
  "nearest_airport", "nearest_railway", "nearest_bus_stand", "distance_from_airport", "distance_from_railway", "distance_from_bus_stand",
  "parking_available", "restroom_facilities", "drinking_water", "first_aid_facility", "souvenir_shop", "food_court",
  "wheelchair_accessible", "senior_citizen_friendly", "child_friendly",
  "photography_allowed", "drone_photography_allowed", "flash_photography_allowed", "tripod_allowed",
  "advance_booking_required", "online_booking_available", "permit_required", "permit_fee", "permit_validity",
  "dress_code", "what_to_carry", "what_not_to_carry", "safety_guidelines", "rules_and_regulations",
  "weather_info", "temperature_range", "monsoon_info",
  "special_instructions", "important_notes", "cancellation_policy", "refund_policy"
];

// Helper function to ensure table exists
const ensureTableExists = async () => {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS wildlife_basic_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sanctuary_id INT NOT NULL,
        sanctuary_name VARCHAR(255),
        location VARCHAR(255),
        total_area VARCHAR(100),
        established_year VARCHAR(50),
        entry_fee_adults VARCHAR(100),
        entry_fee_children VARCHAR(100),
        entry_fee_foreign VARCHAR(100),
        camera_fee VARCHAR(100),
        video_camera_fee VARCHAR(100),
        parking_fee VARCHAR(100),
        opening_time VARCHAR(100),
        closing_time VARCHAR(100),
        best_time_to_visit TEXT,
        peak_season VARCHAR(100),
        off_season VARCHAR(100),
        daily_visitor_capacity VARCHAR(100),
        max_group_size VARCHAR(100),
        contact_number VARCHAR(50),
        email_address VARCHAR(255),
        website VARCHAR(255),
        emergency_contact VARCHAR(50),
        nearest_airport VARCHAR(255),
        nearest_railway VARCHAR(255),
        nearest_bus_stand VARCHAR(255),
        distance_from_airport VARCHAR(100),
        distance_from_railway VARCHAR(100),
        distance_from_bus_stand VARCHAR(100),
        parking_available BOOLEAN DEFAULT 0,
        restroom_facilities BOOLEAN DEFAULT 0,
        drinking_water BOOLEAN DEFAULT 0,
        first_aid_facility BOOLEAN DEFAULT 0,
        souvenir_shop BOOLEAN DEFAULT 0,
        food_court BOOLEAN DEFAULT 0,
        wheelchair_accessible BOOLEAN DEFAULT 0,
        senior_citizen_friendly BOOLEAN DEFAULT 0,
        child_friendly BOOLEAN DEFAULT 0,
        photography_allowed BOOLEAN DEFAULT 0,
        drone_photography_allowed BOOLEAN DEFAULT 0,
        flash_photography_allowed BOOLEAN DEFAULT 0,
        tripod_allowed BOOLEAN DEFAULT 0,
        advance_booking_required BOOLEAN DEFAULT 0,
        online_booking_available BOOLEAN DEFAULT 0,
        permit_required BOOLEAN DEFAULT 0,
        permit_fee VARCHAR(100),
        permit_validity VARCHAR(100),
        dress_code TEXT,
        what_to_carry TEXT,
        what_not_to_carry TEXT,
        safety_guidelines TEXT,
        rules_and_regulations TEXT,
        weather_info TEXT,
        temperature_range VARCHAR(100),
        monsoon_info TEXT,
        special_instructions TEXT,
        important_notes TEXT,
        cancellation_policy TEXT,
        refund_policy TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sanctuary_id (sanctuary_id)
      )
    `;
    
    await pool.execute(createTableSQL);
  } catch (error) {
    throw error;
  }
};

const wildlifeBasicInfoController = {
  // Get all records
  getAllBasicInfo: async (req, res) => {
    try {
      const [results] = await pool.execute(
        `SELECT * FROM wildlife_basic_info ORDER BY created_at DESC`
      );
  
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch basic info', error: error.message });
    }
  },

  // Get by sanctuary ID
  getBasicInfoBySanctuary: async (req, res) => {
    try {
      const { sanctuaryId } = req.params;
      const [results] = await pool.execute(
        `SELECT * FROM wildlife_basic_info WHERE sanctuary_id = ?`, [sanctuaryId]
      );
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch basic info' });
    }
  },

  // Get by record ID
  getBasicInfoById: async (req, res) => {
    try {
      const { id } = req.params;
      const [results] = await pool.execute(
        `SELECT * FROM wildlife_basic_info WHERE id = ?`, [id]
      );
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.json({ success: true, data: results[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch basic info' });
    }
  },

  // Create new record
  createBasicInfo: async (req, res) => {
    try {
      // Ensure table exists
      await ensureTableExists();
      
      // Validate required fields
      if (!req.body.sanctuary_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'sanctuary_id is required' 
        });
      }
      
      // Handle missing fields by providing default values
      const values = fields.map(f => {
        const value = req.body[f];
        return value !== undefined ? value : null;
      });
      
      const placeholders = fields.map(() => '?').join(', ');
      const sql = `INSERT INTO wildlife_basic_info (${fields.join(', ')}) VALUES (${placeholders})`;
      
      await pool.execute(sql, values);
      res.json({ success: true, message: 'Basic info created successfully' });
    } catch (error) {
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create basic info', 
        error: error.message,
        details: {
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage
        }
      });
    }
  },

  // Update record
  updateBasicInfo: async (req, res) => {
    try {
      const { id } = req.params;
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      
      // Handle missing fields by providing default values
      const values = fields.map(f => {
        const value = req.body[f];
        return value !== undefined ? value : null;
      });
      
      values.push(id);
      const sql = `UPDATE wildlife_basic_info SET ${setClause} WHERE id = ?`;
      
      
      
      await pool.execute(sql, values);
      res.json({ success: true, message: 'Basic info updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update basic info', error: error.message });
    }
  },

  // Delete record
  deleteBasicInfo: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.execute(`DELETE FROM wildlife_basic_info WHERE id = ?`, [id]);
      res.json({ success: true, message: 'Basic info deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete basic info' });
    }
  },

  // Search by sanctuary name
  searchBasicInfoByName: async (req, res) => {
    try {
      const { sanctuaryName } = req.params;
      const [results] = await pool.execute(
        `SELECT * FROM wildlife_basic_info WHERE sanctuary_name LIKE ?`, [`%${sanctuaryName}%`]
      );
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to search basic info' });
    }
  }
};

module.exports = wildlifeBasicInfoController;
