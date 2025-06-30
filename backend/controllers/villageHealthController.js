const db = require('../db');

// Get health data for a state village
const getStateVillageHealth = async (req, res) => {
  try {
    const { villageId } = req.params;
    
    const [healthData] = await db.query(
      'SELECT * FROM state_village_health WHERE village_id = ?',
      [villageId]
    );

    if (healthData.length === 0) {
      // If no data exists, return empty object with success
      return res.json({
        success: true,
        data: {
          nearest_community_health_centre: '',
          nearest_primary_health_centre: '',
          nearest_maternity_centre: '',
          nearest_hospital_allopathic: '',
          nearest_dispensary: '',
          nearest_mobile_clinic: '',
          nearest_family_welfare_centre: ''
        }
      });
    }

    res.json({
      success: true,
      data: healthData[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health data'
    });
  }
};

// Get health data for a territory village
const getTerritoryVillageHealth = async (req, res) => {
  try {
    const { villageId } = req.params;
    
    const [healthData] = await db.query(
      'SELECT * FROM territory_village_health WHERE village_id = ?',
      [villageId]
    );

    if (healthData.length === 0) {
      // If no data exists, return empty object with success
      return res.json({
        success: true,
        data: {
          nearest_community_health_centre: '',
          nearest_primary_health_centre: '',
          nearest_maternity_centre: '',
          nearest_hospital_allopathic: '',
          nearest_dispensary: '',
          nearest_mobile_clinic: '',
          nearest_family_welfare_centre: ''
        }
      });
    }

    res.json({
      success: true,
      data: healthData[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health data'
    });
  }
};

// Update health data for a state village
const updateStateVillageHealth = async (req, res) => {
  try {
    const { villageId } = req.params;
    const {
      nearest_community_health_centre,
      nearest_primary_health_centre,
      nearest_maternity_centre,
      nearest_hospital_allopathic,
      nearest_dispensary,
      nearest_mobile_clinic,
      nearest_family_welfare_centre
    } = req.body;

    // Check if record exists
    const [existing] = await db.query(
      'SELECT id FROM state_village_health WHERE village_id = ?',
      [villageId]
    );

    if (existing.length === 0) {
      // Insert new record
      await db.query(
        `INSERT INTO state_village_health (
          village_id,
          nearest_community_health_centre,
          nearest_primary_health_centre,
          nearest_maternity_centre,
          nearest_hospital_allopathic,
          nearest_dispensary,
          nearest_mobile_clinic,
          nearest_family_welfare_centre
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          villageId,
          nearest_community_health_centre,
          nearest_primary_health_centre,
          nearest_maternity_centre,
          nearest_hospital_allopathic,
          nearest_dispensary,
          nearest_mobile_clinic,
          nearest_family_welfare_centre
        ]
      );
    } else {
      // Update existing record
      await db.query(
        `UPDATE state_village_health SET
          nearest_community_health_centre = ?,
          nearest_primary_health_centre = ?,
          nearest_maternity_centre = ?,
          nearest_hospital_allopathic = ?,
          nearest_dispensary = ?,
          nearest_mobile_clinic = ?,
          nearest_family_welfare_centre = ?
        WHERE village_id = ?`,
        [
          nearest_community_health_centre,
          nearest_primary_health_centre,
          nearest_maternity_centre,
          nearest_hospital_allopathic,
          nearest_dispensary,
          nearest_mobile_clinic,
          nearest_family_welfare_centre,
          villageId
        ]
      );
    }

    // Fetch updated data
    const [updatedData] = await db.query(
      'SELECT * FROM state_village_health WHERE village_id = ?',
      [villageId]
    );

    res.json({
      success: true,
      data: updatedData[0],
      message: 'Health data updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update health data'
    });
  }
};

// Update health data for a territory village
const updateTerritoryVillageHealth = async (req, res) => {
  try {
    const { villageId } = req.params;
    const {
      nearest_community_health_centre,
      nearest_primary_health_centre,
      nearest_maternity_centre,
      nearest_hospital_allopathic,
      nearest_dispensary,
      nearest_mobile_clinic,
      nearest_family_welfare_centre
    } = req.body;

    // Check if record exists
    const [existing] = await db.query(
      'SELECT id FROM territory_village_health WHERE village_id = ?',
      [villageId]
    );

    if (existing.length === 0) {
      // Insert new record
      await db.query(
        `INSERT INTO territory_village_health (
          village_id,
          nearest_community_health_centre,
          nearest_primary_health_centre,
          nearest_maternity_centre,
          nearest_hospital_allopathic,
          nearest_dispensary,
          nearest_mobile_clinic,
          nearest_family_welfare_centre
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          villageId,
          nearest_community_health_centre,
          nearest_primary_health_centre,
          nearest_maternity_centre,
          nearest_hospital_allopathic,
          nearest_dispensary,
          nearest_mobile_clinic,
          nearest_family_welfare_centre
        ]
      );
    } else {
      // Update existing record
      await db.query(
        `UPDATE territory_village_health SET
          nearest_community_health_centre = ?,
          nearest_primary_health_centre = ?,
          nearest_maternity_centre = ?,
          nearest_hospital_allopathic = ?,
          nearest_dispensary = ?,
          nearest_mobile_clinic = ?,
          nearest_family_welfare_centre = ?
        WHERE village_id = ?`,
        [
          nearest_community_health_centre,
          nearest_primary_health_centre,
          nearest_maternity_centre,
          nearest_hospital_allopathic,
          nearest_dispensary,
          nearest_mobile_clinic,
          nearest_family_welfare_centre,
          villageId
        ]
      );
    }

    // Fetch updated data
    const [updatedData] = await db.query(
      'SELECT * FROM territory_village_health WHERE village_id = ?',
      [villageId]
    );

    res.json({
      success: true,
      data: updatedData[0],
      message: 'Health data updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update health data'
    });
  }
};

module.exports = {
  getStateVillageHealth,
  getTerritoryVillageHealth,
  updateStateVillageHealth,
  updateTerritoryVillageHealth
}; 