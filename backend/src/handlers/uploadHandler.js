import { bucket } from '../config/firebase-config.js';
import { generateId } from '../utils/generateId.js';
import path from 'path';
import Busboy from 'busboy';
import os from 'os';
import fs from 'fs';

export const uploadFile = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const busboy = Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();
  const fields = {};
  const uploads = {};
  const fileWrites = [];

  // 1. Process File
  busboy.on('file', (fieldname, file, info) => {
    const { filename, mimeType } = info;
    console.log(`Processing file: ${filename}, mimetype: ${mimeType}`);
    
    const fileExtension = path.extname(filename);
    const newFileName = `${generateId()}${fileExtension}`;
    const filepath = path.join(tmpdir, newFileName);
    
    uploads[fieldname] = { filepath, mimeType, newFileName };

    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    const promise = new Promise((resolve, reject) => {
      file.on('end', () => {
        writeStream.end();
      });
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    fileWrites.push(promise);
  });

  // 2. Process Fields (jika ada data lain selain file)
  busboy.on('field', (fieldname, val) => {
    fields[fieldname] = val;
  });

  // 3. Finish Parsing -> Upload to Firebase
  busboy.on('finish', async () => {
    try {
      await Promise.all(fileWrites);
      
      // Ambil file pertama (karena ini single upload)
      const fileKey = Object.keys(uploads)[0];
      if (!fileKey) {
        return res.status(400).json({ status: 'error', message: 'No file uploaded' });
      }

      const fileData = uploads[fileKey];
      const destination = `uploads/${fileData.newFileName}`;
      
      console.log(`Uploading to bucket: ${destination}`);

      await bucket.upload(fileData.filepath, {
        destination: destination,
        metadata: {
          contentType: fileData.mimeType,
        },
      });

      // Hapus file temp
      fs.unlinkSync(fileData.filepath);

      // Make Public (Try-Catch)
      const fileRef = bucket.file(destination);
      try {
        await fileRef.makePublic();
      } catch (err) {
        console.warn(`Failed to make public: ${err.message}`);
      }

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      
      res.status(200).json({
        status: 'success',
        message: 'File uploaded successfully',
        data: { url: publicUrl }
      });

    } catch (error) {
      console.error('Upload handler error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  });

  busboy.on('error', (error) => {
    console.error('Busboy error:', error);
    res.status(500).json({ status: 'error', message: 'Something went wrong parsing the file' });
  });

  // Pipe request ke busboy (KUNCI UTAMA)
  if (req.rawBody) {
      busboy.end(req.rawBody);
  } else {
      req.pipe(busboy);
  }
};