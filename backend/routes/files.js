const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { verifyToken } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.sh', '.cmd', '.com', '.app', '.msi', '.dmg'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Executable files are not allowed for security reasons'));
  }
  cb(null, true);
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const file = new File({
      userId: req.user.userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: fileUrl
    });

    await file.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        fileName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        fileUrl: fileUrl,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    if (error.message.includes('Executable files')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'File upload failed' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.userId })
      .select('-__v')
      .sort({ uploadedAt: -1 });

    res.json({ files });
  } catch (error) {
    console.error('Fetch files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

router.delete('/:fileId', verifyToken, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.fileId, 
      userId: req.user.userId 
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', file.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.deleteOne({ _id: req.params.fileId });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
