const mysql = require('mysql2/promise');

async function up() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tourmyholiday'
  });

  try {
    // First check if the column exists and drop it if it does
    await connection.execute(`
      ALTER TABLE villages 
      DROP COLUMN IF EXISTS highlights
    `);

    await connection.execute(`
      ALTER TABLE territory_villages 
      DROP COLUMN IF EXISTS highlights
    `);

    // Add highlights column to villages table with LONGTEXT
    await connection.execute(`
      ALTER TABLE villages 
      ADD COLUMN highlights LONGTEXT NULL AFTER best_time_to_visit
    `);

    // Add highlights column to territory_villages table with LONGTEXT
    await connection.execute(`
      ALTER TABLE territory_villages 
      ADD COLUMN highlights LONGTEXT NULL AFTER best_time_to_visit
    `);

  } catch (error) {
    throw error;
  } finally {
    await connection.end();
  }
}

async function down() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tourmyholiday'
  });

  try {
    // Remove highlights column from villages table
    await connection.execute(`
      ALTER TABLE villages 
      DROP COLUMN IF EXISTS highlights
    `);

    // Remove highlights column from territory_villages table
    await connection.execute(`
      ALTER TABLE territory_villages 
      DROP COLUMN IF EXISTS highlights
    `);

  } catch (error) {
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { up, down }; 