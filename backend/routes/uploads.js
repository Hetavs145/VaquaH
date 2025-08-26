import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadsRoot = path.resolve(process.cwd(), 'uploads');
const productsDir = path.join(uploadsRoot, 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, productsDir);
  },
  filename: (_req, file, cb) => {
    const base = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${base}_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Invalid file type'), ok);
  }
});

router.post('/products', upload.array('images', 10), (req, res) => {
  const files = req.files || [];
  const urls = files.map(f => `/uploads/products/${path.basename(f.path)}`);
  res.json({ success: true, urls });
});

export default router;