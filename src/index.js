const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

// 1. Inisialisasi Firebase Admin
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// 2. Konfigurasi Nodemailer (Gunakan App Password Google)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'arphatraform@gmail.com', // Email pengirim
        pass: 'uaxd jddm gupu sphh'      // Password aplikasi 16 digit
    }
});

// --- API ROUTES ---

// A. REGISTER
app.post("/register", async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        const user = await admin.auth().createUser({
            email,
            password,
            displayName: fullName
        });
        res.json({ success: true, message: "User " + fullName + " berhasil terdaftar!" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// B. LOGIN (Simple verify)
app.post("/login", (req, res) => {
    // Karena login utama dilakukan di Client (Firebase SDK), 
    // endpoint ini memastikan backend terhubung.
    res.json({ 
        success: true, 
        message: "Berhasil terhubung ke Cloud!", 
        data: { idToken: "session_from_cloud" } 
    });
});

// C. GOOGLE AUTH VERIFY
app.post("/google", async (req, res) => {
    try {
        const { idToken } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        res.json({ success: true, message: "Google Login Terverifikasi!", data: { idToken } });
    } catch (err) {
        res.status(401).json({ success: false, message: "Token tidak valid" });
    }
});

// D. SEND OTP & SAVE TO FIRESTORE
app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email wajib diisi" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Simpan ke Firestore Collection 'otps'
        await db.collection("otps").add({
            email: email,
            otp: otp,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Kirim Email Asli
        await transporter.sendMail({
            from: '"Arphatra Project" <arphatraform@gmail.com>',
            to: email,
            subject: 'Kode OTP Reset Password',
            text: `Kode OTP Anda adalah: ${otp}. Segera masukkan di aplikasi.`
        });

        res.json({ success: true, message: "OTP asli telah dikirim ke " + email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal kirim OTP: " + err.message });
    }
});

// E. GET PROFILE (Verifikasi Token)
app.get("/profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token) throw new Error("No token");
        
        // Verifikasi token untuk ambil data user
        // Jika token dummy "manual-token", kita kembalikan data statis
        if (token === "manual-token" || token === "session_from_cloud") {
            return res.json({ success: true, data: { status: "Online", server: "Cloud Functions" } });
        }

        const decoded = await admin.auth().verifyIdToken(token);
        res.json({ success: true, data: decoded });
    } catch (err) {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
});

// EXPORT FUNGSI
exports.expressApi = onRequest(app);