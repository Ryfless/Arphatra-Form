import express from "express";
import { sendContactMessage } from "../handlers/contactHandler.js";

const router = express.Router();

router.post("/", sendContactMessage);

export default router;
