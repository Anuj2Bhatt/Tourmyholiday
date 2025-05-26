const db = require('./db');

async function checkTableStructure() {
  try {
    const connection = await db.getConnection();
    
    // Check table structure
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'tourmyholiday' 
      AND TABLE_NAME = 'hotels'
      AND COLUMN_NAME = 'accommodation_type'
    `);
    console.log('Column structure:', columns[0]);

    // Check current values
    const [values] = await connection.query(`
      SELECT DISTINCT accommodation_type 
      FROM hotels 
      WHERE accommodation_type IS NOT NULL 
      AND accommodation_type != ''
    `);
    console.log('Existing accommodation types:', values);

    connection.release();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkTableStructure(); 