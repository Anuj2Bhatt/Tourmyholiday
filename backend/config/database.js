const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tourmyholiday',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    // Test query to check if tables exist
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name IN ('villages', 'state_village_images', 'territory_village_images')
    `, [process.env.DB_NAME || 'tourmyholiday']);
    
    connection.release();
  } catch (error) {
    process.exit(1); // Exit if database connection fails
  }
};

// Run connection test
testConnection();

// Export query function with error handling
const query = async (sql, params) => {
  try {
    const results = await pool.query(sql, params);
    return results;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  pool,
  query
}; 