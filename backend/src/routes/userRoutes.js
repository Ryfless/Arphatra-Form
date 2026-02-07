import express from "express";
import { getProfile, updateProfile } from "../handlers/userHandler.js";
import { getSettings, updateSettings, deactivateAccount, deleteAccount } from "../handlers/settingsHandler.js";
import { verifyToken } from "../middlewares/authentication.js";

const router = express.Router();

// All user routes require authentication
router.use(verifyToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Settings Routes
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.post("/deactivate", deactivateAccount);
router.delete("/delete", deleteAccount);

export default router;