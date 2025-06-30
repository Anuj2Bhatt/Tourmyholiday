const db = require('../db');

const createIndiaCultureInfoTable = async () => {
  try {
    // Create india_culture_info table
    await db.query(`
      CREATE TABLE IF NOT EXISTS india_culture_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        culture_id INT NOT NULL,
        info_title VARCHAR(255) NOT NULL,
        info_type VARCHAR(100),
        info_description TEXT NOT NULL,
        info_source VARCHAR(255),
        info_importance ENUM('high', 'medium', 'low') DEFAULT 'medium',
        info_tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (culture_id) REFERENCES india_cultures(id) ON DELETE CASCADE,
        INDEX idx_culture_id (culture_id),
        INDEX idx_info_type (info_type),
        INDEX idx_importance (info_importance)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    } catch (error) {
    throw error;
  }
};

// Run the migration
createIndiaCultureInfoTable()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  }); 