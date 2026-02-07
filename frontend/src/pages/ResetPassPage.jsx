import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Popup from "@/components/Popup.jsx";
import Toast from "@/components/Toast.jsx";
import { API_BASE_URL, PASSWORD_MIN_LENGTH, STORAGE_KEYS } from "@/lib/config.js";
import { getToken } from "@/lib/storage.js";

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
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

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
  const strengthStyles = useMemo(() => {
    if (!newPassword) return { width: "0%", color: "", text: "" };
    if (strength <= 1) return { width: "33%", color: "var(--color-weak)", text: "Weak password" };
    if (strength <= 3) return { width: "66%", color: "var(--color-medium)", text: "Medium password" };
    return { width: "100%", color: "var(--color-strong)", text: "Strong password" };
  }, [newPassword, strength]);

  const isFormValid = useMemo(() => {
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
    const isMatching = newPassword === confirmPassword && newPassword !== "";
    const isLongEnough = newPassword.length >= PASSWORD_MIN_LENGTH;
    
    return hasUpper && hasNumber && hasSymbol && isMatching && isLongEnough;
  }, [newPassword, confirmPassword]);

  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 4000);
  };

  const closePopup = () => {
    const token = getToken();
    setPopup((prev) => ({ ...prev, open: false }));
    if (popup.type === "success") {
      if (token) {
        navigate("/profile");
      } else {
        navigate("/login");
      }
    }
  };

  const validateForm = () => {
    if (newPassword.length < PASSWORD_MIN_LENGTH) return "Password minimal 8 karakter";
    
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
    
    if (!hasUpper || !hasNumber || !hasSymbol) {
      return "Password harus mengandung huruf kapital, angka, dan simbol.";
    }

    if (newPassword !== confirmPassword) return "Password tidak cocok";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateForm();
    if (error) return showToast(error, "error");

    const otpCode = localStorage.getItem(STORAGE_KEYS.OTP);
    const resetEmail = localStorage.getItem(STORAGE_KEYS.RESET_EMAIL);
    
    console.log("Submitting reset password:", { email: resetEmail, otp: otpCode });

    if (!otpCode || !resetEmail) return setPopup({ open: true, message: "Email atau OTP tidak ditemukan.", type: "error" });

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: otpCode, newPassword }),
      });
      const data = await res.json();
      console.log("Reset password response:", data);
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
      <Toast open={toast.open} message={toast.message} type={toast.type} />
      <Popup open={popup.open} message={popup.message} type={popup.type} onClose={closePopup} />
      
      <div className="w-full max-w-md bg-vanilla rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-10 md:p-12 animate-reveal-form border-2 border-mahogany/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-mahogany/5 rounded-full -mr-16 -mt-16" />
        <h1 className="text-[36px] md:text-[42px] font-bold text-center mb-2 text-mahogany leading-tight">New Password</h1>
        <p className="text-center mb-8 text-[16px] text-mahogany opacity-80 font-medium">Create a strong password to secure your account.</p>
        
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <div className="relative flex items-center w-full rounded-full border-2 border-mahogany bg-rice px-5 py-3 shadow-sm focus-within:ring-4 focus-within:ring-mahogany/5 transition-all">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New password"
                aria-label="New password"
                autoFocus
                className="w-full bg-transparent border-none outline-none pr-10 focus:ring-0 disabled:opacity-60 text-mahogany font-medium"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button type="button" className="absolute right-5 flex items-center justify-center w-6 h-6 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50" onClick={() => setShowNew(!showNew)} disabled={loading}>
                <img src={showNew ? "/assets/icons/login/eye-open.svg" : "/assets/icons/login/eye-closed.svg"} alt="" className="w-5 h-5 pointer-events-none" />
              </button>
            </div>
            <p className="text-[11px] mt-2 text-mahogany opacity-70 ml-2 font-medium">Min. 8 characters, capital letters, numbers & symbols.</p>
            <div className="mt-3 px-2">
              <div className="w-full h-1.5 rounded-full bg-mahogany/5 overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: strengthStyles.width, backgroundColor: strengthStyles.color }} />
              </div>
              <p className="text-[12px] mt-1.5 font-bold" style={{ color: strengthStyles.color }}>{strengthStyles.text}</p>
            </div>
          </div>

          <div className="relative flex items-center w-full rounded-full border-2 border-mahogany bg-rice px-5 py-3 shadow-sm focus-within:ring-4 focus-within:ring-mahogany/5 transition-all">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              aria-label="Confirm password"
              className="w-full bg-transparent border-none outline-none pr-10 focus:ring-0 disabled:opacity-60 text-mahogany font-medium"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button type="button" className="absolute right-5 flex items-center justify-center w-6 h-6 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50" onClick={() => setShowConfirm(!showConfirm)} disabled={loading}>
              <img src={showConfirm ? "/assets/icons/login/eye-open.svg" : "/assets/icons/login/eye-closed.svg"} alt="" className="w-5 h-5 pointer-events-none" />
            </button>
          </div>

          <button 
            type="submit" 
            className="w-full rounded-full py-4 font-bold mt-4 transition-all duration-300 bg-mahogany text-vanilla cursor-pointer hover:shadow-btn-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none text-lg shadow-lg" 
            disabled={loading || !isFormValid}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
        
        <div className="text-center mt-8">
            {getToken() ? (
            <button onClick={() => navigate("/profile")} className="text-mahogany font-bold underline hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none text-base">Back to Profile</button>
            ) : (
            <Link to="/login" className="text-mahogany font-bold underline hover:opacity-70 transition-opacity text-base">Back to Sign In</Link>
            )}
        </div>
      </div>
    </>
  );
}