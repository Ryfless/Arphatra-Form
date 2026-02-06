// Mengambil variabel dari file .env (seperti API Key). 
// buat ganti kunci API, dan buat menyusun URL untuk registrasi dan login Firebase.

import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.replace("gs://", ""), // Strip gs:// prefix
  firebaseSignUpUrl: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
  firebaseSignInUrl: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
  nodeEnv: process.env.NODE_ENV || "development",

  // SMTP EMAIL
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: process.env.SMTP_PORT || 465,
  smtpUser: process.env.SMTP_USER, // Email kamu
  smtpPass: process.env.SMTP_PASS, // Password aplikasi (App Password)

  
};

export default config;