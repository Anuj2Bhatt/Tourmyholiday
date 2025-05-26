const db = require('../db');

async function addDefaultBonfire() {
  try {
    console.log('Starting to add Bonfire as default amenity...');
    
    // Get connection and start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // First get or create Bonfire amenity
      const [amenityRows] = await connection.query(
        'SELECT id FROM amenities WHERE LOWER(name) = LOWER(?)',
        ['Bonfire']
      );

      let bonfireId;
      if (amenityRows.length === 0) {
        // Create Bonfire amenity if it doesn't exist
        const [result] = await connection.query(
          'INSERT INTO amenities (name) VALUES (?)',
          ['Bonfire']
        );
        bonfireId = result.insertId;
        console.log('Created new Bonfire amenity');
      } else {
        bonfireId = amenityRows[0].id;
        console.log('Found existing Bonfire amenity');
      }

      // Get all hotels
      const [hotels] = await connection.query('SELECT id FROM hotels');
      console.log(`Found ${hotels.length} hotels`);

      // Add Bonfire to each hotel if not already present
      for (const hotel of hotels) {
        // Check if hotel already has Bonfire
        const [existing] = await connection.query(
          'SELECT 1 FROM hotel_amenities WHERE hotel_id = ? AND amenity_id = ?',
          [hotel.id, bonfireId]
        );

        if (existing.length === 0) {
          // Add Bonfire to hotel
          await connection.query(
            'INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES (?, ?)',
            [hotel.id, bonfireId]
          );
          console.log(`Added Bonfire to hotel ${hotel.id}`);
        } else {
          console.log(`Hotel ${hotel.id} already has Bonfire`);
        }
      }

      // Commit transaction
      await connection.commit();
      console.log('Successfully added Bonfire to all hotels!');

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

// Run update
addDefaultBonfire()
  .then(() => {
    console.log('Update completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Update failed:', error);
    process.exit(1);
  }); 