const db = require('../db');

async function fixAmenities() {
  try {
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // First get all amenities
      const [amenities] = await connection.query('SELECT * FROM amenities');
      // Create a map of valid amenities
      const validAmenities = new Map();
      const amenityMapping = new Map();

      // Process each amenity
      for (const amenity of amenities) {
        // Clean the name
        let cleanName = amenity.name.trim();
        
        // Remove quotes and special characters
        cleanName = cleanName.replace(/["']/g, '');
        
        // Remove empty or single character names
        if (cleanName.length <= 1) {
          await connection.query('DELETE FROM amenities WHERE id = ?', [amenity.id]);
          continue;
        }

        // If this is a valid name we haven't seen before
        if (!validAmenities.has(cleanName)) {
          validAmenities.set(cleanName, amenity.id);
          } else {
          // This is a duplicate, map it to the original
          amenityMapping.set(amenity.id, validAmenities.get(cleanName));
          }
      }

      // Update hotel_amenities to use the mapped IDs
      for (const [oldId, newId] of amenityMapping) {
        await connection.query(
          'UPDATE hotel_amenities SET amenity_id = ? WHERE amenity_id = ?',
          [newId, oldId]
        );
        // Delete the duplicate amenity
        await connection.query('DELETE FROM amenities WHERE id = ?', [oldId]);
      }

      // Update amenity names to their clean versions
      for (const [name, id] of validAmenities) {
        await connection.query(
          'UPDATE amenities SET name = ? WHERE id = ?',
          [name, id]
        );
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

// Run fix
fixAmenities()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    process.exit(1);
  }); 