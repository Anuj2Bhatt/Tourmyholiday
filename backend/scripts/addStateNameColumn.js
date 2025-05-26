const mysql = require('mysql2/promise');
require('dotenv').config();

async function addStateNameColumn() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'tourmyholiday'
  });

  try {
    // First check if states table exists and has name column
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'states'
    `, [process.env.DB_NAME || 'tourmyholiday']);

    if (tables.length === 0) {
      console.log('Creating states table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS states (
          name VARCHAR(255) PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Successfully created states table');
    }

    // First drop the state_id foreign key constraint if it exists
    await pool.query(`
      ALTER TABLE state_education_institutions 
      DROP FOREIGN KEY IF EXISTS state_education_institutions_ibfk_1
    `);
    console.log('Successfully dropped state_id foreign key constraint');

    // Then drop the state_id column if it exists
    await pool.query(`
      ALTER TABLE state_education_institutions 
      DROP COLUMN IF EXISTS state_id
    `);
    console.log('Successfully dropped state_id column');

    // Add state_name column if it doesn't exist
    await pool.query(`
      ALTER TABLE state_education_institutions 
      ADD COLUMN IF NOT EXISTS state_name VARCHAR(255) AFTER subdistrict_id
    `);
    console.log('Successfully added state_name column');

    // Add status column to state_education_institutions if it doesn't exist
    await pool.query(`
      ALTER TABLE state_education_institutions 
      ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER meta_keywords
    `);
    console.log('Successfully added status column to state_education_institutions');

    // Add status column to territory_education_institutions if it doesn't exist
    await pool.query(`
      ALTER TABLE territory_education_institutions 
      ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER meta_keywords
    `);
    console.log('Successfully added status column to territory_education_institutions');

    // Add status column to territory_healthcare_institutions if it doesn't exist
    await pool.query(`
      ALTER TABLE territory_healthcare_institutions 
      ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER meta_keywords
    `);
    console.log('Successfully added status column to territory_healthcare_institutions');

    // Add status column to territory_subdistrict_education if it doesn't exist
    await pool.query(`
      ALTER TABLE territory_subdistrict_education 
      ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER meta_keywords
    `);
    console.log('Successfully added status column to territory_subdistrict_education');

    // Add status column to territory_subdistrict_healthcare if it doesn't exist
    await pool.query(`
      ALTER TABLE territory_subdistrict_healthcare 
      ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active' AFTER meta_keywords
    `);
    console.log('Successfully added status column to territory_subdistrict_healthcare');

    // Add foreign key constraint for state_name
    try {
      // First drop existing constraint if any
      await pool.query(`
        ALTER TABLE state_education_institutions 
        DROP FOREIGN KEY IF EXISTS fk_state_name
      `);
      console.log('Successfully dropped existing state_name foreign key constraint');

      // Then add new constraint
      await pool.query(`
        ALTER TABLE state_education_institutions 
        ADD CONSTRAINT fk_state_name 
        FOREIGN KEY (state_name) REFERENCES states(name)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
      `);
      console.log('Successfully added state_name foreign key constraint');
    } catch (error) {
      console.error('Error adding foreign key:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
addStateNameColumn().catch(console.error); 