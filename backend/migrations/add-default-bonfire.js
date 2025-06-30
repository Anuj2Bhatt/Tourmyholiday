const db = require('../db');

async function addDefaultBonfire() {
  try {
     
    
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
        } else {
        bonfireId = amenityRows[0].id;
        }

      // Get all hotels
      const [hotels] = await connection.query('SELECT id FROM hotels');
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
          } else {
          }
      }

      // Commit transaction
      await connection.commit();
      } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    process.exit(1);
  }
}

// Run update
addDefaultBonfire()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    process.exit(1);
  }); 