import express from 'express';
import multer from 'multer';
import { uploadFile } from '../handlers/uploadHandler.js';
import { verifyToken } from '../middlewares/authentication.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Simpan di RAM sebelum ke Firebase

router.post('/', verifyToken, upload.single('file'), uploadFile);

export default router;
