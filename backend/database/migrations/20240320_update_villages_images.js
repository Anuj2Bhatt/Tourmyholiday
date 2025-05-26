const mysql = require('mysql2/promise');
const config = require('../../src/config');

async function migrate() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(config);

    console.log('Starting migration: Update villages table for featured image only');

    // First, backup any featured images from the images array
    console.log('Backing up featured images from images array...');
    await connection.query(`
      UPDATE villages 
      SET featured_image = JSON_UNQUOTE(JSON_EXTRACT(images, '$[0]'))
      WHERE featured_image IS NULL 
      AND images IS NOT NULL 
      AND JSON_LENGTH(images) > 0
    `);

    // Drop the images column
    console.log('Dropping images column...');
    await connection.query(`
      ALTER TABLE villages 
      DROP COLUMN images
    `);

    // Ensure featured_image column is properly set up
    console.log('Updating featured_image column...');
    await connection.query(`
      ALTER TABLE villages 
      MODIFY COLUMN featured_image VARCHAR(255) NULL
    `);

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
migrate().catch(console.error); 