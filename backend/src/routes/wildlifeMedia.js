const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'galleryImages') {
      // Allow images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for gallery images'));
      }
    } else if (file.fieldname === 'video') {
      // Allow videos
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  }
});

// Get gallery images for a sanctuary
router.get('/:sanctuaryId/gallery', async (req, res) => {
  try {
    const { sanctuaryId } = req.params;
    
    // For now, return mock data
    // In a real implementation, you would query the database
    const mockImages = [
      {
        id: 1,
        filename: 'galleryImages-1234567890-123456789.jpg',
        alt_text: 'Wildlife sanctuary landscape',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        filename: 'galleryImages-1234567890-987654321.jpg',
        alt_text: 'Animals in sanctuary',
        created_at: new Date().toISOString()
      }
    ];
    
    res.json(mockImages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Upload gallery images for a sanctuary
router.post('/:sanctuaryId/gallery', upload.array('galleryImages', 10), async (req, res) => {
  try {
    const { sanctuaryId } = req.params;
    const files = req.files;
    const altTexts = req.body.altTexts || [];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedFiles = files.map((file, index) => ({
      id: Date.now() + index,
      filename: file.filename,
      alt_text: altTexts[index] || '',
      created_at: new Date().toISOString()
    }));
    
    res.json({
      message: `${files.length} images uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload gallery images' });
  }
});

// Delete gallery image
router.delete('/:sanctuaryId/gallery/:imageId', async (req, res) => {
  try {
    const { sanctuaryId, imageId } = req.params;
    
    // In a real implementation, you would delete from database and file system
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

// Get videos for a sanctuary
router.get('/:sanctuaryId/videos', async (req, res) => {
  try {
    const { sanctuaryId } = req.params;
    
    // For now, return mock data
    const mockVideos = [
      {
        id: 1,
        filename: 'video-1234567890-123456789.mp4',
        title: 'Sanctuary Tour Video',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        filename: 'video-1234567890-987654321.mp4',
        title: 'Wildlife Documentary',
        created_at: new Date().toISOString()
      }
    ];
    
    res.json(mockVideos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Upload video for a sanctuary
router.post('/:sanctuaryId/videos', upload.single('video'), async (req, res) => {
  try {
    const { sanctuaryId } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    const uploadedVideo = {
      id: Date.now(),
      filename: file.filename,
      title: req.body.title || '',
      created_at: new Date().toISOString()
    };
    
    res.json({
      message: 'Video uploaded successfully',
      video: uploadedVideo
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Delete video
router.delete('/:sanctuaryId/videos/:videoId', async (req, res) => {
  try {
    const { sanctuaryId, videoId } = req.params;
    
    // In a real implementation, you would delete from database and file system
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

module.exports = router; 