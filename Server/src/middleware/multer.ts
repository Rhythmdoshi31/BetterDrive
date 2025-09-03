import multer from 'multer';

// Configure multer with size and type limits
const upload = multer({
  storage: multer.memoryStorage(), // Keep files in memory as buffer
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    fieldSize: 500 * 1024 * 1024, // Field size limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all common file types including videos
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|svg|pdf|doc|docx|txt|rtf|zip|rar|7z|tar|gz|mp4|mov|avi|mkv|wmv|flv|webm|m4v|3gp|mp3|wav|aac|flac|ogg/;
    
    const mimeType = allowedTypes.test(file.mimetype.toLowerCase());
    const extName = allowedTypes.test((file.originalname.toLowerCase().split('.').pop() || ''));
    
    if (mimeType || extName) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supports: Images, Videos (MOV, MP4, AVI), Documents, Audio, Archives'));
    }
  }
});

export { upload };
