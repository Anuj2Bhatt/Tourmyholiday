const mysql = require('mysql2/promise');

async function up() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tourmyholiday'
  });

  try {
    // First drop existing foreign key constraints
    console.log('Dropping existing foreign key constraints...');
    
    // For hotels table
    await connection.execute(`
      ALTER TABLE hotels 
      DROP FOREIGN KEY fk_hotel_state
    `);

    // For state_images table
    await connection.execute(`
      ALTER TABLE state_images 
      DROP FOREIGN KEY state_images_ibfk_1
    `);

    // For state_history table
    await connection.execute(`
      ALTER TABLE state_history 
      DROP FOREIGN KEY state_history_ibfk_1
    `);

    // Now add back the constraints with CASCADE DELETE
    console.log('Adding back foreign key constraints with CASCADE DELETE...');

    // For hotels table
    await connection.execute(`
      ALTER TABLE hotels 
      ADD CONSTRAINT fk_hotel_state 
      FOREIGN KEY (state_id) 
      REFERENCES states(id) 
      ON DELETE CASCADE
    `);

    // For state_images table
    await connection.execute(`
      ALTER TABLE state_images 
      ADD CONSTRAINT state_images_ibfk_1 
      FOREIGN KEY (state_id) 
      REFERENCES states(id) 
      ON DELETE CASCADE
    `);

    // For state_history table
    await connection.execute(`
      ALTER TABLE state_history 
      ADD CONSTRAINT state_history_ibfk_1 
      FOREIGN KEY (state_id) 
      REFERENCES states(id) 
      ON DELETE CASCADE
    `);

    console.log('Successfully updated foreign key constraints to use CASCADE DELETE');
  } catch (error) {
    console.error('Error updating foreign key constraints:', error);
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
    // Drop the CASCADE DELETE constraints
    console.log('Dropping CASCADE DELETE constraints...');
    
    // For hotels table
    await connection.execute(`
      ALTER TABLE hotels 
      DROP FOREIGN KEY fk_hotel_state
    `);

    // For state_images table
    await connection.execute(`
      ALTER TABLE state_images 
      DROP FOREIGN KEY state_images_ibfk_1
    `);

    // For state_history table
    await connection.execute(`
      ALTER TABLE state_history 
      DROP FOREIGN KEY state_history_ibfk_1
    `);

    // Add back the original constraints without CASCADE
    console.log('Adding back original foreign key constraints...');

    // For hotels table
    await connection.execute(`
      ALTER TABLE hotels 
      ADD CONSTRAINT fk_hotel_state 
      FOREIGN KEY (state_id) 
      REFERENCES states(id)
    `);

    // For state_images table
    await connection.execute(`
      ALTER TABLE state_images 
      ADD CONSTRAINT state_images_ibfk_1 
      FOREIGN KEY (state_id) 
      REFERENCES states(id)
    `);

    // For state_history table
    await connection.execute(`
      ALTER TABLE state_history 
      ADD CONSTRAINT state_history_ibfk_1 
      FOREIGN KEY (state_id) 
      REFERENCES states(id)
    `);

    console.log('Successfully reverted foreign key constraints to original state');
  } catch (error) {
    console.error('Error reverting foreign key constraints:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { up, down }; 