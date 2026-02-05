import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Popup from "@/components/Popup.jsx";
import { API_BASE_URL, PASSWORD_MIN_LENGTH, STORAGE_KEYS } from "@/lib/config.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(password) {
  let strength = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
}

export default function ResetPassPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: "", type: "info" });

  useEffect(() => {
    document.title = "Reset Password - Arphatra";
    const otpCode = localStorage.getItem(STORAGE_KEYS.OTP);
    const resetEmail = localStorage.getItem(STORAGE_KEYS.RESET_EMAIL);
    if (!otpCode || !resetEmail || !EMAIL_REGEX.test(resetEmail)) {
      setPopup({ open: true, message: "Email atau OTP tidak valid.", type: "error" });
      setTimeout(() => navigate("/otp"), 1400);
    }
  }, [navigate]);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const strengthInfo = useMemo(() => {
    if (!newPassword) return { text: "", color: "" };
    if (strength <= 1) return { text: "Weak password", color: "var(--color-weak)" };
    if (strength <= 3) return { text: "Medium password", color: "var(--color-medium)" };
    return { text: "Strong password", color: "var(--color-strong)" };
  }, [newPassword, strength]);

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, open: false }));
    if (popup.type === "success") navigate("/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const otpCode = localStorage.getItem(STORAGE_KEYS.OTP);
    const resetEmail = localStorage.getItem(STORAGE_KEYS.RESET_EMAIL);
    if (!otpCode || !resetEmail) return setPopup({ open: true, message: "Email atau OTP tidak ditemukan.", type: "error" });
    if (newPassword.length < PASSWORD_MIN_LENGTH) return setPopup({ open: true, message: "Password minimal 8 karakter", type: "error" });
    if (newPassword !== confirmPassword) return setPopup({ open: true, message: "Password tidak cocok", type: "error" });

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: otpCode, newPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        localStorage.removeItem(STORAGE_KEYS.OTP);
        localStorage.removeItem(STORAGE_KEYS.RESET_EMAIL);
        setPopup({ open: true, message: "Your password has been changed successfully", type: "success" });
      } else {
        setPopup({ open: true, message: data.message || "Reset password gagal", type: "error" });
      }
    } catch (err) {
      setLoading(false);
      setPopup({ open: true, message: `Reset gagal: ${err.message}`, type: "error" });
    }
  };

  return (
    <>
      <Popup open={popup.open} message={popup.message} type={popup.type} onClose={closePopup} />
      <div className="w-full max-w-md bg-vanilla rounded-3xl shadow-lg px-10 py-8 animate-fade-in border-2 border-mahogany">
        <h1 className="text-3xl font-bold text-center mb-2 text-mahogany">Reset Password</h1>
        <p className="text-center mb-6 text-sm text-mahogany opacity-80">Masukkan password baru untuk akunmu</p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New password"
                aria-label="New password"
                autoFocus
                className="w-full rounded-full border-2 border-mahogany bg-vanilla px-5 py-3 outline-none text-mahogany focus:ring-0 disabled:opacity-60"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50" onClick={() => setShowNew(!showNew)} disabled={loading}>
                <img src={showNew ? "/assets/icons/login/eye-open.svg" : "/assets/icons/login/eye-closed.svg"} alt="" className="w-5 h-5 pointer-events-none" />
              </button>
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: strengthInfo.color }}>{strengthInfo.text}</p>
          </div>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              aria-label="Confirm password"
              className="w-full rounded-full border-2 border-mahogany bg-vanilla px-5 py-3 outline-none text-mahogany focus:ring-0 disabled:opacity-60"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50" onClick={() => setShowConfirm(!showConfirm)} disabled={loading}>
              <img src={showConfirm ? "/assets/icons/login/eye-open.svg" : "/assets/icons/login/eye-closed.svg"} alt="" className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
          <button type="submit" className="rounded-full py-3 font-semibold mt-4 transition bg-mahogany text-vanilla cursor-pointer hover:shadow-btn-hover disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
        <Link to="/login" className="block text-center font-medium text-sm underline mt-5 text-mahogany opacity-80 hover:opacity-100">Back to login</Link>
      </div>
    </>
  );
}
