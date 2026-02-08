import express from 'express';
import { uploadFile } from '../handlers/uploadHandler.js';
import { verifyToken } from '../middlewares/authentication.js';

const router = express.Router();

// Langsung panggil uploadFile tanpa middleware multer
router.post('/', verifyToken, uploadFile);

export default router;
