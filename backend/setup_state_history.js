const mysql = require('mysql2');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tourmyholiday',
  multipleStatements: true
});

async function setupStateHistory() {
  try {
    // Insert some sample data
    const sampleData = [
      {
        state_id: 1, // Uttarakhand
        title: 'Formation of Uttarakhand',
        content: 'Uttarakhand was formed as the 27th state of India on November 9, 2000. The state was carved out of the northwestern part of Uttar Pradesh.',
        slug: 'formation-of-uttarakhand',
        status: 'published',
        meta_title: 'Formation of Uttarakhand - Historical Event',
        meta_description: 'Learn about the formation of Uttarakhand as the 27th state of India in 2000.',
        meta_keywords: 'Uttarakhand, state formation, Indian history'
      },
      {
        state_id: 1,
        title: 'Kedarnath Floods',
        content: 'In June 2013, the state of Uttarakhand experienced devastating floods and landslides, particularly affecting the Kedarnath region. This natural disaster caused significant damage to infrastructure and loss of life.',
        slug: 'kedarnath-floods-2013',
        status: 'published',
        meta_title: 'Kedarnath Floods 2013 - Natural Disaster',
        meta_description: 'The devastating floods and landslides that affected Uttarakhand in 2013.',
        meta_keywords: 'Kedarnath, floods, natural disaster, Uttarakhand'
      }
    ];

    for (const data of sampleData) {
      await connection.promise().query(
        'INSERT INTO state_history (state_id, title, content, slug, status, meta_title, meta_description, meta_keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [data.state_id, data.title, data.content, data.slug, data.status, data.meta_title, data.meta_description, data.meta_keywords]
      );
    }
    console.log('Sample state history data inserted successfully');

  } catch (error) {
    console.error('Error setting up state history:', error);
  } finally {
    connection.end();
  }
}

setupStateHistory(); 