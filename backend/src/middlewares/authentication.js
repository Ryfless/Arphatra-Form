import { auth } from "../config/firebase-config.js";

// Middleware untuk verifikasi token menggunakan Firebase Admin SDK
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    // Verifikasi token menggunakan Firebase Admin SDK 
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Token sudah expired",
      });
    }

    if (error.code === "auth/id-token-revoked") {
      return res.status(401).json({
        success: false,
        message: "Token telah dibatalkan",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
      error: error.message,
    });
  }
};

// Optional middleware untuk token verification 
export const optionalVerifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
    }

    next();
  } catch (error) {
    // Token tidak valid, tapi lanjutkan
    next();
  }
};
