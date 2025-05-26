const mysql = require('mysql2/promise');

async function testDatabase() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tourmyholiday',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');

    // Check if gallery_images table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'tourmyholiday' 
      AND TABLE_NAME = 'gallery_images'
    `);

    if (tables.length === 0) {
      console.log('❌ gallery_images table does not exist');
      console.log('Creating gallery_images table...');
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS gallery_images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255),
          description TEXT,
          image_path VARCHAR(255) NOT NULL,
          alt_text VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ gallery_images table created successfully');
    } else {
      console.log('✅ gallery_images table exists');
      
      // Check table structure
      const [columns] = await connection.query(`
        SHOW COLUMNS FROM gallery_images
      `);
      console.log('\nTable structure:');
      console.log(columns.map(col => `${col.Field} (${col.Type})`).join('\n'));
    }

    connection.release();
  } catch (error) {
    console.error('❌ Database error:', error.message);
    if (error.message.includes("Unknown database")) {
      console.log('\nCreating database tourmyholiday...');
      const rootPool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: ''
      });
      try {
        const rootConnection = await rootPool.getConnection();
        await rootConnection.query('CREATE DATABASE IF NOT EXISTS tourmyholiday');
        console.log('✅ Database tourmyholiday created successfully');
        console.log('Please run this script again to create the tables');
        rootConnection.release();
      } catch (err) {
        console.error('❌ Failed to create database:', err.message);
      }
    }
  }
}

testDatabase(); 