//File ini mengekspor db (Firestore) dan auth (Admin Auth) agar bisa dipakai di file lain.

import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inisialisasi Firebase Admin SDK dihidupkan
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "../../serviceAccountKey.json"), "utf8")
);

//Membaca serviceAccountKey.json untuk mendapatkan "hak akses penuh" sebagai admin.
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log("Firebase Admin Initialized");
}
const db = admin.firestore();
const auth = admin.auth();

export { admin, auth, db };


