const mysql = require('mysql2/promise');

async function up() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tourmyholiday'
  });

  try {
    // First, let's check for all types of constraints
    const [constraints] = await connection.execute(`
      SELECT 
        tc.CONSTRAINT_NAME,
        tc.CONSTRAINT_TYPE,
        kcu.COLUMN_NAME
      FROM information_schema.TABLE_CONSTRAINTS tc  
      JOIN information_schema.KEY_COLUMN_USAGE kcu 
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE tc.TABLE_SCHEMA = ? 
        AND tc.TABLE_NAME = 'villages'
        AND kcu.COLUMN_NAME = 'highlights'
    `, [process.env.DB_NAME || 'tourmyholiday']);

    // Drop all constraints found
    for (const constraint of constraints) {
      if (constraint.CONSTRAINT_TYPE === 'FOREIGN KEY') {
        await connection.execute(`
          ALTER TABLE villages 
          DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
        `);
      } else {
        await connection.execute(`
          ALTER TABLE villages 
          DROP CONSTRAINT ${constraint.CONSTRAINT_NAME}
        `);
      }
    }

    // Check for triggers
    const [triggers] = await connection.execute(`
      SELECT TRIGGER_NAME 
      FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = ? 
        AND EVENT_OBJECT_TABLE = 'villages'
        AND ACTION_STATEMENT LIKE '%highlights%'
    `, [process.env.DB_NAME || 'tourmyholiday']);

    // Drop any triggers that might affect highlights
    for (const trigger of triggers) {
      await connection.execute(`
        DROP TRIGGER IF EXISTS ${trigger.TRIGGER_NAME}
      `);
    }

    // Now completely remove and recreate the column
    await connection.execute(`
      ALTER TABLE villages 
      DROP COLUMN IF EXISTS highlights
    `);

    await connection.execute(`
      ALTER TABLE villages 
      ADD COLUMN highlights LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
    `);

    // Do the same for territory_villages
    const [territoryConstraints] = await connection.execute(`
      SELECT 
        tc.CONSTRAINT_NAME,
        tc.CONSTRAINT_TYPE,
        kcu.COLUMN_NAME
      FROM information_schema.TABLE_CONSTRAINTS tc
      JOIN information_schema.KEY_COLUMN_USAGE kcu 
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE tc.TABLE_SCHEMA = ? 
        AND tc.TABLE_NAME = 'territory_villages'
        AND kcu.COLUMN_NAME = 'highlights'
    `, [process.env.DB_NAME || 'tourmyholiday']);

    for (const constraint of territoryConstraints) {
      if (constraint.CONSTRAINT_TYPE === 'FOREIGN KEY') {
        await connection.execute(`
          ALTER TABLE territory_villages 
          DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
        `);
      } else {
        await connection.execute(`
          ALTER TABLE territory_villages 
          DROP CONSTRAINT ${constraint.CONSTRAINT_NAME}
        `);
      }
    }

    const [territoryTriggers] = await connection.execute(`
      SELECT TRIGGER_NAME 
      FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = ? 
        AND EVENT_OBJECT_TABLE = 'territory_villages'
        AND ACTION_STATEMENT LIKE '%highlights%'
    `, [process.env.DB_NAME || 'tourmyholiday']);

    for (const trigger of territoryTriggers) {
      await connection.execute(`
        DROP TRIGGER IF EXISTS ${trigger.TRIGGER_NAME}
      `);
    }

    await connection.execute(`
      ALTER TABLE territory_villages 
      DROP COLUMN IF EXISTS highlights
    `);

    await connection.execute(`
      ALTER TABLE territory_villages 
      ADD COLUMN highlights LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
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
    // Revert back to original state if needed
    await connection.execute(`
      ALTER TABLE villages 
      DROP COLUMN IF EXISTS highlights
    `);

    await connection.execute(`
      ALTER TABLE territory_villages 
      DROP COLUMN IF EXISTS highlights
    `);

  } catch (error) {
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { up, down }; 