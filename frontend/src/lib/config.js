export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "arphatra_user",
  IS_NEW_USER: "arphatra_isNewUser",
  OTP: "otpCode",
  RESET_EMAIL: "resetEmail",
};

export const PASSWORD_MIN_LENGTH = 8;
