const mysql = require('mysql2/promise');

async function up() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tourmyholiday'
  });

  try {
    // First, let's check if there are any constraints on the highlights column
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'villages' 
      AND CONSTRAINT_TYPE = 'CHECK'
    `, [process.env.DB_NAME || 'tourmyholiday']);

    // Drop any existing constraints
    for (const constraint of constraints) {
      await connection.execute(`
        ALTER TABLE villages 
        DROP CONSTRAINT ${constraint.CONSTRAINT_NAME}
      `);
    }

    // Now modify the column to LONGTEXT
    await connection.execute(`
      ALTER TABLE villages 
      MODIFY COLUMN highlights LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
    `);

    // Do the same for territory_villages table
    const [territoryConstraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'territory_villages' 
      AND CONSTRAINT_TYPE = 'CHECK'
    `, [process.env.DB_NAME || 'tourmyholiday']);

    for (const constraint of territoryConstraints) {
      await connection.execute(`
        ALTER TABLE territory_villages 
        DROP CONSTRAINT ${constraint.CONSTRAINT_NAME}
      `);
    }

    await connection.execute(`
      ALTER TABLE territory_villages 
      MODIFY COLUMN highlights LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
    `);

  } catch (error) {
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
    // Revert back to TEXT if needed
    await connection.execute(`
      ALTER TABLE villages 
      MODIFY COLUMN highlights TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
    `);

    await connection.execute(`
      ALTER TABLE territory_villages 
      MODIFY COLUMN highlights TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
    `);

  } catch (error) {
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { up, down }; 