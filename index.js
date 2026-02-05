const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

// Inisialisasi Admin
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'arphatraform@gmail.com',
        pass: 'uaxd jddm gupu sphh'
    }
});

// --- 1. REGISTER (Email Biasa) ---
app.post("/register", async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        const user = await admin.auth().createUser({
            email,
            password,
            displayName: fullName
        });

        await admin.firestore().collection("users").doc(user.uid).set({
            fullName: fullName,
            email: email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            uid: user.uid,
            provider: "password"
        });

        res.json({ success: true, message: `User ${fullName} berhasil terdaftar!` });
    } catch (err) {
        const msg = error?.response?.data?.error?.message;
        if (msg === "EMAIL_EXISTS") {
            return res.status(400).json({
                success: false,
                message: "email sudah terdaftar",
            })
        }

        res.status(400).json({ success: false, message: err.message });
    }
});

// --- 2. LOGIN (Verify Connection) ---
app.post("/login", (req, res) => {
    res.json({
        success: true,
        message: "Backend Cloud Aktif",
        data: { idToken: "manual-session-cloud" }
    });
});

// --- 3. GOOGLE AUTH (Dengan Firestore Sync) ---
app.post("/google", async (req, res) => {
    try {
        const { idToken } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        // Simpan atau Update data ke Firestore
        await admin.firestore().collection("users").doc(uid).set({
            uid,
            email,
            fullName: name || "Google User",
            photoURL: picture || "",
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            provider: "google"
        }, { merge: true });

        res.json({ success: true, message: "Google Login Berhasil!", data: { idToken, user: decodedToken } });
    } catch (err) {
        res.status(401).json({ success: false, message: "Token Google Tidak Valid" });
    }
});

// --- 4. FORGOT PASSWORD (Kirim OTP) ---
app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email wajib diisi" });

        // Cek apakah email terdaftar di sistem
        try {
            await admin.auth().getUserByEmail(email);
        } catch (e) {
            return res.status(404).json({ success: false, message: "Email tidak terdaftar" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await admin.firestore().collection("otps").add({
            email: email,
            otp: otp,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await transporter.sendMail({
            from: '"Project Arphatra" <arphatraform@gmail.com>',
            to: email,
            subject: 'Kode OTP Reset Password',
            text: `Kode OTP Anda adalah: ${otp}. Kode ini akan kadaluarsa dalam 5 menit.`
        });

        res.json({ success: true, message: "OTP terkirim ke " + email });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal kirim OTP: " + err.message });
    }
});

// --- 5. RESET PASSWORD (Dengan Penghapusan OTP Segera) ---
app.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const otpSnapshot = await admin.firestore().collection("otps")
            .where("email", "==", email)
            .where("otp", "==", otp)
            .limit(1).get();

        if (otpSnapshot.empty) {
            return res.status(400).json({ success: false, message: "OTP salah atau sudah kadaluarsa" });
        }

        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(user.uid, { password: newPassword });

        // Hapus OTP segera setelah berhasil
        const batch = admin.firestore().batch();
        otpSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        res.json({ success: true, message: "Password berhasil diperbarui!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 6. GET PROFILE ---
app.get("/profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token || token === "null") throw new Error("No token provided");

        if (token === "manual-session-cloud") {
            return res.json({ success: true, data: { status: "Online", info: "Logged in via Email" } });
        }

        const decoded = await admin.auth().verifyIdToken(token);
        res.json({ success: true, data: decoded });
    } catch (err) {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
});

// --- 7. LOGOUT ---
app.post("/logout", (req, res) => {
    res.json({ success: true, message: "Sesi telah diakhiri" });
});

// --- 8. AUTOMATIC CLEANUP (Setiap 5 Menit) ---
exports.cleanupOTP = onSchedule("every 5 minutes", async (event) => {
    const now = Date.now();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

    const snapshot = await admin.firestore().collection("otps")
        .where("createdAt", "<", fiveMinutesAgo)
        .get();

    if (snapshot.empty) return null;

    const batch = admin.firestore().batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Cleanup: Berhasil menghapus ${snapshot.size} OTP kadaluarsa.`);
});

// Health Check
app.get("/", (req, res) => {
    res.status(200).send("Cloud Functions Arphatra is Running");
});

exports.expressApi = onRequest(app);