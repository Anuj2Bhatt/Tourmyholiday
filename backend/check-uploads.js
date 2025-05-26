const fs = require('fs');
const path = require('path');

function checkUploadsDirectory() {
  const uploadDir = path.join(__dirname, 'uploads');
  
  try {
    // Check if directory exists
    if (!fs.existsSync(uploadDir)) {
      console.log('Uploads directory does not exist. Creating...');
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Uploads directory created successfully');
    } else {
      console.log('✅ Uploads directory exists');
    }
    
    // Check permissions
    try {
      const testFile = path.join(uploadDir, 'test.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ Uploads directory has write permissions');
    } catch (error) {
      console.error('❌ Uploads directory does not have write permissions:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking uploads directory:', error.message);
  }
}

checkUploadsDirectory(); 