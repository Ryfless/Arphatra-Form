import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "@/components/Toast.jsx";
import { API_BASE_URL, STORAGE_KEYS } from "@/lib/config.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyOtp = Array.from({ length: 6 }, () => "");

export default function OtpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("email");
  const [otpDigits, setOtpDigits] = useState(emptyOtp);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const inputRefs = useRef([]);

  useEffect(() => {
    document.title = "OTP Verification - Arphatra";
    const storedEmail = localStorage.getItem(STORAGE_KEYS.RESET_EMAIL);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (stage === "otp") setTimeout(() => inputRefs.current[0]?.focus(), 0);
  }, [stage]);

  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 4000);
  };

  const clearResetStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.RESET_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.OTP);
  };

  const handleBackToLogin = () => {
    clearResetStorage();
    navigate("/login");
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) return showToast("Email tidak valid", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        localStorage.setItem(STORAGE_KEYS.RESET_EMAIL, trimmedEmail);
        showToast("OTP code was sent to your email.", "success");
        setTimeout(() => {
          setStage("otp");
          setOtpDigits(emptyOtp);
        }, 1200);
      } else {
        showToast(data.message || "Gagal mengirim OTP", "error");
      }
    } catch (error) {
      setLoading(false);
      showToast("Terjadi kesalahan. Silakan coba lagi.", "error");
    }
  };

  const handleOtpChange = (index, value) => {
    const digits = [...otpDigits];
    const sanitized = value.replace(/\D/g, "").slice(-1);
    digits[index] = sanitized;
    setOtpDigits(digits);
    if (sanitized && index < digits.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const digits = [...otpDigits];
      digits[index] = "";
      setOtpDigits(digits);
      if (index > 0) inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event, index) => {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").split("");
    if (!digits.length) return;
    const next = [...otpDigits];
    digits.forEach((digit, idx) => { if (index + idx < next.length) next[index + idx] = digit; });
    setOtpDigits(next);
    inputRefs.current[Math.min(index + digits.length - 1, next.length - 1)]?.focus();
  };

  const handleOtpSubmit = (event) => {
    event.preventDefault();
    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) return showToast("Masukkan 6 digit kode OTP", "error");
    localStorage.setItem(STORAGE_KEYS.OTP, otpCode);
    localStorage.setItem(STORAGE_KEYS.RESET_EMAIL, email.trim());
    showToast("OTP verified! Redirecting...", "success");
    setTimeout(() => navigate("/resetpass"), 1200);
  };

  const handleResend = async (event) => {
    event.preventDefault();
    if (!email) return showToast("Email tidak ditemukan", "error");
    setResending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setResending(false);
      if (data.success) {
        showToast("OTP code was resent.", "success");
        setOtpDigits(emptyOtp);
        inputRefs.current[0]?.focus();
      } else {
        showToast(data.message || "Gagal mengirim ulang OTP", "error");
      }
    } catch (error) {
      setResending(false);
      showToast("Terjadi kesalahan.", "error");
    }
  };

  return (
    <>
      <Toast open={toast.open} message={toast.message} type={toast.type} />
      
      <div className="flex flex-col md:flex-row w-full max-w-300 items-center relative py-4 md:py-8 gap-8 md:gap-12">
        <div className="hidden md:flex flex-1 items-center justify-center animate-cover-slide-left z-10">
          <img src="/assets/images/banner-login.png" alt="" className="max-w-full h-auto drop-shadow-2xl opacity-80" />
        </div>

        <div className="flex-1 flex flex-col justify-center md:pl-12 animate-reveal-form w-full max-w-md md:max-w-none">
          {stage === "email" && (
            <div className="bg-vanilla rounded-[40px] p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border-2 border-mahogany/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-mahogany/5 rounded-full -mr-16 -mt-16" />
              <h1 className="text-[36px] md:text-[42px] font-bold mb-2 text-mahogany leading-tight">Forgot Password?</h1>
              <p className="text-[16px] md:text-[18px] mb-8 text-mahogany opacity-80">Don't worry! Enter your email below to receive a verification code.</p>
              <form className="flex flex-col gap-6 mb-6" onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                  autoFocus
                  className="w-full px-6 py-4 text-[16px] bg-rice text-mahogany border-2 border-mahogany rounded-full outline-none focus:ring-4 focus:ring-mahogany/10 transition-all disabled:opacity-60"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-full font-bold transition-all duration-300 py-4 text-[18px] bg-mahogany text-vanilla cursor-pointer hover:shadow-btn-hover active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed border-none"
                  disabled={loading}
                >
                  {loading ? "Sending Code..." : "Send Reset Link"}
                </button>
              </form>
              <div className="text-center">
                <button onClick={handleBackToLogin} className="text-mahogany font-bold underline hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none text-base">Return to Sign In</button>
              </div>
            </div>
          )}

          {stage === "otp" && (
            <div className="bg-vanilla rounded-[40px] p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border-2 border-mahogany relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-mahogany/5 rounded-full -mr-16 -mt-16" />
              <h1 className="text-[36px] md:text-[42px] font-bold mb-2 text-mahogany leading-tight">Check Your Mail</h1>
              <p className="text-[16px] md:text-[18px] mb-8 text-mahogany opacity-80">We've sent a 6-digit code to <span className="font-bold text-mahogany">{email}</span></p>
              <form className="flex flex-col gap-8 mb-6" onSubmit={handleOtpSubmit}>
                <div className="flex gap-2 sm:gap-3 justify-between">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={`otp-${index}`}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(event, index)}
                      onPaste={(event) => handleOtpPaste(event, index)}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-[28px] font-bold text-center bg-rice border-2 border-mahogany rounded-2xl outline-none focus:ring-4 focus:ring-mahogany/10 text-mahogany transition-all disabled:opacity-60"
                      disabled={loading}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full font-bold transition-all duration-300 py-4 text-[18px] bg-mahogany text-vanilla cursor-pointer hover:shadow-btn-hover active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed border-none"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify Identity"}
                </button>
              </form>
              <div className="text-center space-y-4">
                <div className="text-mahogany/70 font-medium">
                  Didn't receive the code?{" "}
                  <button type="button" onClick={handleResend} className="font-bold text-mahogany underline cursor-pointer hover:opacity-70 transition-all bg-transparent border-none" disabled={resending}>
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                </div>
                <button type="button" onClick={() => { clearResetStorage(); setStage("email"); }} className="text-sm font-bold text-mahogany/50 hover:text-mahogany transition-colors cursor-pointer bg-transparent border-none">Use a different email address</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
