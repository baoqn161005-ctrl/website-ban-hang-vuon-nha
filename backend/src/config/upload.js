const multer = require('multer'), path = require('path'), fs = require('fs');
const UPLOAD_DIR = path.join(__dirname, '../../uploads'); fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const upload = multer({
  storage: multer.diskStorage({ destination: UPLOAD_DIR, filename: (q, f, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 8) + EXT[f.mimetype]) }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (q, f, cb) => EXT[f.mimetype] ? cb(null, true) : cb(Object.assign(new Error('Chỉ nhận ảnh JPG/PNG/WEBP/GIF'), { status: 400 }))
});
module.exports = { upload, UPLOAD_DIR };
