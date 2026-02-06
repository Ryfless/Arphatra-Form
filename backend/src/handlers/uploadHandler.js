import { bucket } from '../config/firebase-config.js';
import { generateId } from '../utils/generateId.js';
import path from 'path';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${generateId()}${fileExtension}`;
    const destination = `uploads/${fileName}`;

    const fileUpload = bucket.file(destination);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ status: 'error', message: 'Failed to upload file' });
    });

    blobStream.on('finish', async () => {
      // Make the file public
      await fileUpload.makePublic();
      
      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

      res.status(200).json({
        status: 'success',
        message: 'File uploaded successfully',
        data: { url: publicUrl }
      });
    });

    blobStream.end(file.buffer);

  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
