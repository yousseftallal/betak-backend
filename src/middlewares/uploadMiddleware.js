const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(path.join(uploadDir, 'videos'))) fs.mkdirSync(path.join(uploadDir, 'videos'));
if (!fs.existsSync(path.join(uploadDir, 'thumbnails'))) fs.mkdirSync(path.join(uploadDir, 'thumbnails'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    } else if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    // Hack: Allow both video and image in 'video' field for now to reuse endpoint
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Not a video or image!'), false);
  } else if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Not an image!'), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
