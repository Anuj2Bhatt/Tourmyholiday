const mysql = require('mysql2/promise');
const axios = require('axios');

async function testConnections() {
  try {
    // Test database connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // XAMPP default password is empty
      database: 'tourmyholiday'
    });

    console.log('✅ Database connection successful');

    // Test server connection
    try {
      const response = await axios.get('http://localhost:5000/api/check-table');
      console.log('✅ Server connection successful');
      console.log('Table structure:', response.data.tableStructure);
    } catch (error) {
      console.error('❌ Server connection failed:', error.message);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

testConnections(); 