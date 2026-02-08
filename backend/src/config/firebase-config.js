//File ini mengekspor db (Firestore) dan auth (Admin Auth) agar bisa dipakai di file lain.

import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js"; // Import config yang sudah kita bersihkan

dotenv.config();

let adminApp;

if (admin.apps.length === 0) {
  if (process.env.NODE_ENV === "production") {
    // Di produksi (Cloud Functions), gunakan default credentials
    adminApp = admin.initializeApp();
  } else {
    // Di lokal, coba baca serviceAccountKey.json
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const keyPath = join(__dirname, "../../serviceAccountKey.json");
      const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.firebaseProjectId,
        storageBucket: config.storageBucket // Menggunakan bucket yang sudah di-strip gs://
      });
      console.log("🔥 Firebase Admin Initialized (Local)");
    } catch (error) {
      console.error("❌ Failed to load serviceAccountKey.json or Init Failed:", error.message);
      // Fallback
      adminApp = admin.initializeApp({
          projectId: config.firebaseProjectId,
          storageBucket: config.storageBucket
      });
    }
  }
} else {
  adminApp = admin.app();
}

const db = admin.firestore();
const auth = admin.auth();

// Safe Bucket Initialization
let bucket;
try {
    const bucketName = config.storageBucket || `${config.firebaseProjectId}.appspot.com`; 
    bucket = admin.storage().bucket(bucketName);
    console.log(`✅ Storage Bucket Initialized: ${bucketName}`);
} catch (e) {
    console.error("❌ CRTICAL: Storage Bucket Failed to Initialize:", e.message);
    // Jangan biarkan app crash di awal, tapi pastikan error jelas saat upload
    bucket = { 
        file: () => { throw new Error("Storage bucket configuration is invalid or failed to initialize."); },
        name: 'invalid-bucket'
    };
}

export { admin, auth, db, bucket };
