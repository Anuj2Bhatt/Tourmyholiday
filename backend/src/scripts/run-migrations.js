const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tourmyholiday',
    multipleStatements: true // This allows running multiple SQL statements
  });

  try {
    const migrationPath = path.join(__dirname, '../migrations/create_master_tables.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');

    await connection.query(migrationSQL);
    } catch (error) {
    } finally {
    await connection.end();
  }
}

runMigrations(); 