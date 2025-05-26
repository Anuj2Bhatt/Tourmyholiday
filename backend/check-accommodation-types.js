const db = require('./db');

async function checkAccommodationTypes() {
  try {
    console.log('Connecting to database...');
    const connection = await db.getConnection();
    console.log('Connected successfully');

    // Get all distinct accommodation types
    console.log('\nQuerying distinct accommodation types...');
    const [types] = await connection.query('SELECT DISTINCT accommodation_type FROM hotels');
    console.log('Current accommodation types in use:', types.map(t => t.accommodation_type));

    // Get count of each type
    console.log('\nQuerying count of each type...');
    const [counts] = await connection.query(`
      SELECT accommodation_type, COUNT(*) as count 
      FROM hotels 
      GROUP BY accommodation_type
    `);
    console.log('\nCount of each accommodation type:');
    counts.forEach(row => {
      console.log(`${row.accommodation_type}: ${row.count}`);
    });

    // Check for any NULL or empty values
    console.log('\nChecking for NULL or empty values...');
    const [nullTypes] = await connection.query(`
      SELECT id, name, accommodation_type 
      FROM hotels 
      WHERE accommodation_type IS NULL OR accommodation_type = ''
    `);
    if (nullTypes.length > 0) {
      console.log('\nHotels with NULL or empty accommodation type:');
      nullTypes.forEach(hotel => {
        console.log(`ID: ${hotel.id}, Name: ${hotel.name}, Type: ${hotel.accommodation_type}`);
      });
    } else {
      console.log('\nNo hotels found with NULL or empty accommodation type.');
    }

    // Get all hotels for debugging
    console.log('\nGetting all hotels for debugging...');
    const [allHotels] = await connection.query('SELECT id, name, accommodation_type FROM hotels');
    console.log('\nAll hotels:');
    allHotels.forEach(hotel => {
      console.log(`ID: ${hotel.id}, Name: ${hotel.name}, Type: ${hotel.accommodation_type}`);
    });

    connection.release();
  } catch (error) {
    console.error('Error checking accommodation types:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
  } finally {
    process.exit();
  }
}

checkAccommodationTypes(); 