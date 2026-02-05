import axios from "axios";
import nodemailer from "nodemailer";
import { config } from "../config/config.js";
import { auth, db } from "../config/firebase-config.js";
import { generateId } from "../utils/generateId.js";
import { validateEmail, validatePassword } from "../utils/validators.js";

// --- 1. REGISTER USER ---
export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName || !validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ success: false, message: "register gagal" });
    }

    const authResponse = await axios.post(config.firebaseSignUpUrl, { email, password, returnSecureToken: true });
    const { localId, idToken, refreshToken } = authResponse.data;

    const userId = generateId();
    await db.collection("users").doc(userId).set({
      uid: localId, userId, email, fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json(
      { success: true, 
        message: "register berhasil", 
        data: { userId, idToken } 
      });
  } catch (error) {
    const msg = error?.response?.data?.error?.message;

    if (msg === "EMAIL_EXISTS") {
      return res.status(400).json({
        success: false,
        message: "email sudah terdaftar",
      })
    }

    return res.status(500).json({ success: false, message: "register gagal" });
  }
};

// --- 2. LOGIN USER ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const authResponse = await axios.post(config.firebaseSignInUrl, { email, password, returnSecureToken: true });
    const { localId, idToken, refreshToken } = authResponse.data;

    return res.status(200).json({ success: true, message: "login berhasil", data: { idToken, refreshToken } });
  } catch (error) {
    return res.status(401).json({ success: false, message: "login gagal" });
  }
};

// --- 3. REFRESH TOKEN ---
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    const refreshResponse = await axios.post(`https://securetoken.googleapis.com/v1/token?key=${config.firebaseApiKey}`, {
      grant_type: "refresh_token",
      refresh_token: token
    });

    return res.status(200).json({
      success: true,
      message: "berhasil diperbarui",
      data: {
        idToken: refreshResponse.data.id_token,
        refreshToken: refreshResponse.data.refresh_token
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "gagal diperbarui" });
  }
};

// --- 4. LOGOUT ---
export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: "logout berhasil" });
};

// --- 5. FORGOT PASSWORD ---
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: true,
  auth: { user: config.smtpUser, pass: config.smtpPass },
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userSnapshot = await db.collection("users").where("email", "==", email).limit(1).get();
    if (userSnapshot.empty) return res.status(404).json({ success: false, message: "email tidak terdaftar" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 1 * 60 * 1000;

    await db.collection("otps").doc(email).set({ email, otp, expiresAt: otpExpiry });

    await transporter.sendMail({
      from: `"Arphatra Security" <${config.smtpUser}>`,
      to: email,
      subject: "OTP Reset Password",
      text: `Kode OTP anda: ${otp}. Berlaku 1 menit.`,
    });

    res.status(200).json({ success: true, message: "otp berhasil dikirim" });
  } catch (error) {
    res.status(500).json({ success: false, message: "gagal kirim otp" });
  }
};

// --- 6. RESET PASSWORD) ---
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const otpDoc = await db.collection("otps").doc(email).get();

    if (!otpDoc.exists) return res.status(400).json({ success: false, message: "otp tidak ditemukan" });
    const otpData = otpDoc.data();

    if (otpData.otp !== otp) return res.status(400).json({ success: false, message: "otp salah" });

    if (Date.now() > otpData.expiresAt) {
      await db.collection("otps").doc(email).delete();
      return res.status(400).json({ success: false, message: "otp kadaluarsa" });
    }

    // TERMINATE DATA OTP
    await db.collection("otps").doc(email).delete();

    const userSnapshot = await db.collection("users").where("email", "==", email).limit(1).get();
    const userUid = userSnapshot.docs[0].data().uid;

    await auth.updateUser(userUid, { password: newPassword });

    return res.status(200).json({ success: true, message: "berhasil update password" });

  } catch (error) {
    console.log("Error Detail:", error); // Lihat pesan aslinya di terminal cmd/vscode
    return res.status(500).json({ success: false, message: "gagal update password" });
  }
};

// --- 7. GET PROFILE ---
export const getCurrentUser = async (req, res) => {
  try {
    const userSnapshot = await db.collection("users").where("uid", "==", req.user.uid).limit(1).get();
    if (userSnapshot.empty) return res.status(404).json({ success: false, message: "user tidak ditemukan" });
    return res.status(200).json({ success: true, data: userSnapshot.docs[0].data() });
  } catch (error) {
    return res.status(500).json({ success: false, message: "gagal ambil data" });
  }
};

// --- 8. UPDATE PROFILE ---
export const updateUserProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userSnapshot = await db.collection("users").where("uid", "==", req.user.uid).limit(1).get();
    if (userSnapshot.empty) return res.status(404).json({ success: false, message: "user tidak ditemukan" });

    const docId = userSnapshot.docs[0].id;
    await db.collection("users").doc(docId).update({ fullName, updatedAt: new Date().toISOString() });
    return res.status(200).json({ success: true, message: "berhasil update profil" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "gagal update profil" });
  }
};
// --- 9. GOOGLE AUTH (VERIFY & SYNC) ---
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    // 1. Verifikasi ID Token dari Google via Firebase Admin
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // 2. Cari user di Firestore
    const userSnapshot = await db.collection("users").where("uid", "==", uid).limit(1).get();

    let userData;
    let message = "login berhasil";

    if (userSnapshot.empty) {
      // Jika user pertama kali login via Google, buatkan dokumen di Firestore
      const userId = generateId();
      userData = {
        uid,
        userId,
        email,
        fullName: name || "google user",
        photoURL: picture || "",
        authMethod: "google",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.collection("users").doc(userId).set(userData);
      message = "register berhasil";
    } else {
      userData = userSnapshot.docs[0].data();
    }

    return res.status(200).json({
      success: true,
      message: message,
      data: { ...userData, idToken }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "login gagal" });
  }
};