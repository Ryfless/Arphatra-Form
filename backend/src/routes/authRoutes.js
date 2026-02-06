//menghubungkan alamat URL dengan fungsi di handler.

import express from "express";
import {
  forgotPassword,
  getCurrentUser,
  googleAuth,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  updateUserProfile
} from "../handlers/authHandler.js";
import { verifyToken } from "../middlewares/authentication.js";

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/google-login", googleAuth);

// Protected Routes (memerlukan token)
router.post("/logout", verifyToken, logout);
router.get("/profile", verifyToken, getCurrentUser);
router.put("/profile", verifyToken, updateUserProfile);

//forget password and reset password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;


