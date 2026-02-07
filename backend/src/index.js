import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { config } from "./config/config.js";
import authRoutes from "./routes/authRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ 
  origin: true, // Izinkan origin apapun secara dinamis
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));
app.use(express.json());

// Basic Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);

// Root Endpoint (Health Check)
app.get("/", (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Arphatra Backend API is running!", 
    env: config.nodeEnv 
  });
});

// Error Handling Middleware Global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Internal Server Error", 
    error: config.nodeEnv === "development" ? err.message : undefined 
  });
});

// Export Cloud Function

export const api = onRequest(app);



// Logic untuk jalan di Lokal (Node.js)

if (process.env.NODE_ENV !== "production") {
  const PORT = config.port || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Arphatra Local Server is running!`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`📂 Environment: ${config.nodeEnv}\n`);
  });
}
