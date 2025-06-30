const db = require('../db');

async function migrateHotelAmenities() {
  try {
    // Get all hotels with their amenities
    const [hotels] = await db.query('SELECT id, amenities FROM hotels WHERE amenities IS NOT NULL');
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // First clear existing hotel_amenities to avoid duplicates
      await connection.query('DELETE FROM hotel_amenities');
      // Process each hotel
      for (const hotel of hotels) {
        let amenities;
        try {
          // Parse amenities JSON string
          amenities = JSON.parse(hotel.amenities);
          
          if (Array.isArray(amenities) && amenities.length > 0) {
            // Insert each amenity into hotel_amenities
            for (const amenityName of amenities) {
              // First get or create amenity in amenities table
              const [amenityRows] = await connection.query(
                'SELECT id FROM amenities WHERE name = ?',
                [amenityName]
              );

              let amenityId;
              if (amenityRows.length === 0) {
                // Create new amenity if it doesn't exist
                const [result] = await connection.query(
                  'INSERT INTO amenities (name) VALUES (?)',
                  [amenityName]
                );
                amenityId = result.insertId;
                } else {
                amenityId = amenityRows[0].id;
              }

              // Insert into hotel_amenities
              await connection.query(
                'INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES (?, ?)',
                [hotel.id, amenityId]
              );
            }
            }
        } catch (err) {
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

// Run migration
migrateHotelAmenities()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    process.exit(1);
  }); 