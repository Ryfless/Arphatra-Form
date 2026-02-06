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
    // Jika config.storageBucket kosong, ini akan melempar error yang kita tangkap
    bucket = admin.storage().bucket(config.storageBucket);
    console.log(`✅ Storage Bucket Initialized: ${config.storageBucket || 'Default'}`);
} catch (e) {
    console.warn("⚠️ Storage Bucket Failed to Initialize:", e.message);
    bucket = { 
        file: () => ({ 
            createWriteStream: () => { throw new Error("Storage not configured or invalid bucket name"); },
            makePublic: async () => {}
        }) 
    };
}

export { admin, auth, db, bucket };
