const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupCategories() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // XAMPP default password is empty
      database: 'tourmyholiday'
    });

    console.log('✅ Connected to database');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'create_categories.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim());

    // Execute each statement separately
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('✅ Categories table created and populated');

    // Verify categories
    const [categories] = await connection.query('SELECT * FROM categories');
    console.log('\nCategories created:');
    console.table(categories);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Database access denied. Please check your credentials.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to database. Please make sure MySQL is running.');
    }
  }
}

setupCategories(); 