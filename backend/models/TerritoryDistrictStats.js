const db = require('../db');

class TerritoryDistrictStats {
  static async create(statsData) {
    const { district_id, population, males, females, literacy, households, adults, children, old } = statsData;
    const query = `
      INSERT INTO territory_district_stats 
      (district_id, population, males, females, literacy, households, adults, children, old)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await db.query(query, [
        district_id, population, males, females, literacy, 
        households, adults, children, old
      ]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(districtId, statsData) {
    const { population, males, females, literacy, households, adults, children, old } = statsData;
    const query = `
      UPDATE territory_district_stats 
      SET 
        population = ?,
        males = ?,
        females = ?,
        literacy = ?,
        households = ?,
        adults = ?,
        children = ?,
        old = ?
      WHERE district_id = ?
    `;
    try {
      const [result] = await db.query(query, [
        population, males, females, literacy, 
        households, adults, children, old, districtId
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getByDistrictId(districtId) {
    const query = `
      SELECT 
        tds.*,
        td.name as district_name,
        t.title as territory_name
      FROM territory_district_stats tds
      JOIN territory_districts td ON tds.district_id = td.id
      JOIN territories t ON td.territory_id = t.id
      WHERE tds.district_id = ?
    `;
    try {
      const [rows] = await db.query(query, [districtId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByTerritoryId(territoryId) {
    const query = `
      SELECT 
        tds.*,
        td.name as district_name
      FROM territory_district_stats tds
      JOIN territory_districts td ON tds.district_id = td.id
      WHERE td.territory_id = ?
      ORDER BY td.name
    `;
    try {
      const [rows] = await db.query(query, [territoryId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(districtId) {
    const query = 'DELETE FROM territory_district_stats WHERE district_id = ?';
    try {
      const [result] = await db.query(query, [districtId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async exists(districtId) {
    const query = 'SELECT EXISTS(SELECT 1 FROM territory_district_stats WHERE district_id = ?) as stats_exist';
    try {
      const [rows] = await db.query(query, [districtId]);
      return rows[0].stats_exist === 1;
    } catch (error) {
      throw error;
    }
  }

  static async getTerritorySummary(territoryId) {
    const query = `
      SELECT 
        t.title as territory_name,
        COUNT(td.id) as total_districts,
        SUM(tds.population) as total_population,
        AVG(tds.literacy) as avg_literacy,
        SUM(tds.households) as total_households
      FROM territories t
      LEFT JOIN territory_districts td ON t.id = td.territory_id
      LEFT JOIN territory_district_stats tds ON td.id = tds.district_id
      WHERE t.id = ?
      GROUP BY t.id, t.title
    `;
    try {
      const [rows] = await db.query(query, [territoryId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TerritoryDistrictStats; 