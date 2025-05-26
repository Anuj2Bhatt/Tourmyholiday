const db = require('./db');

async function testCottageUpdate() {
  try {
    const connection = await db.getConnection();
    console.log('Connected to database');

    // First, let's check the current ENUM values
    const [enumInfo] = await connection.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'tourmyholiday' 
      AND TABLE_NAME = 'hotels' 
      AND COLUMN_NAME = 'accommodation_type'
    `);
    console.log('\nCurrent ENUM definition:', enumInfo[0].COLUMN_TYPE);

    // Now let's try to update a hotel to cottage
    const testHotelId = 11; // Using the hotel we know about
    console.log('\nAttempting to update hotel ID', testHotelId, 'to cottage...');

    const [updateResult] = await connection.query(
      'UPDATE hotels SET accommodation_type = ? WHERE id = ?',
      ['cottage', testHotelId]
    );

    if (updateResult.affectedRows > 0) {
      console.log('Successfully updated hotel to cottage!');
      
      // Verify the update
      const [updatedHotel] = await connection.query(
        'SELECT id, name, accommodation_type FROM hotels WHERE id = ?',
        [testHotelId]
      );
      console.log('\nUpdated hotel details:', updatedHotel[0]);
    } else {
      console.log('No hotel was updated. Hotel ID', testHotelId, 'may not exist.');
    }

    connection.release();
  } catch (error) {
    console.error('Error during update test:', error);
    if (error.code === 'ER_WRONG_VALUE_FOR_TYPE') {
      console.log('\nThis error means the ENUM does not accept "cottage".');
      console.log('Please check your database schema (for example, run "SHOW CREATE TABLE hotels;" in your SQL client) and verify that the ENUM includes "cottage".');
    }
  } finally {
    process.exit();
  }
}

testCottageUpdate(); 