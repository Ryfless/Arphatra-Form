//File ini mengekspor db (Firestore) dan auth (Admin Auth) agar bisa dipakai di file lain.

import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

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
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log("🔥 Firebase Admin Initialized (Local)");
    } catch (error) {
      console.error("❌ Failed to load serviceAccountKey.json. Make sure it exists in the backend root for local testing.");
      // Fallback ke default, mungkin pakai GOOGLE_APPLICATION_CREDENTIALS env var
      adminApp = admin.initializeApp();
    }
  }
} else {
  adminApp = admin.app();
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, auth, db };


