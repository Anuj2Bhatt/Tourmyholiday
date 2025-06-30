const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tourmyholiday',
      multipleStatements: true // Allow multiple statements
    });

    // Read and run village tables migration
    const villageTablesPath = path.join(__dirname, 'migrations', 'create_village_tables.sql');
    const villageTablesSQL = await fs.readFile(villageTablesPath, 'utf8');
    await connection.query(villageTablesSQL);
    // Read and run slug migration
    const slugMigrationPath = path.join(__dirname, 'migrations', 'add_slug_to_villages.sql');
    const slugMigrationSQL = await fs.readFile(slugMigrationPath, 'utf8');
    await connection.query(slugMigrationSQL);
    } catch (error) {
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      }
  }
}

// Run the migration
runMigration(); 