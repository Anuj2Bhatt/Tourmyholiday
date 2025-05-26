const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function dropTables() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'tourmyholiday'
    });

    console.log('Connected to database');

    // Read SQL file
    const sql = fs.readFileSync(path.join(__dirname, 'drop_state_tables.sql'), 'utf8');

    // Execute SQL commands
    await connection.query(sql);
    console.log('Tables dropped successfully');

    // Close connection
    await connection.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

dropTables(); 