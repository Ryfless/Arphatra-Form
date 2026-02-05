import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Popup from "@/components/Popup.jsx";
import Toast from "@/components/Toast.jsx";
import { PASSWORD_MIN_LENGTH } from "@/lib/config.js";
import { auth } from "@/lib/firebase.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(password) {
  let strength = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: "", type: "info" });
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    document.title = "Register - Arphatra";
  }, []);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const strengthStyles = useMemo(() => {
    if (!password) return { width: "0%", color: "", text: "" };
    if (strength <= 1) return { width: "33%", color: "var(--color-weak)", text: "Weak password" };
    if (strength <= 3) return { width: "66%", color: "var(--color-medium)", text: "Medium password" };
    return { width: "100%", color: "var(--color-strong)", text: "Strong password" };
  }, [password, strength]);

  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 4000);
  };

  const showPopup = (message, type = "info") => {
    setPopup({ open: true, message, type });
  };

  const closePopup = () => {
    setPopup((prev) => ({ ...prev, open: false }));
    if (popup.type === "success") navigate("/login");
  };

  const validateForm = () => {
    if (fullName.trim().length < 3) return "Nama minimal 3 karakter";
    if (!EMAIL_REGEX.test(email)) return "Email tidak valid";
    if (password.length < PASSWORD_MIN_LENGTH) return "Password minimal 8 karakter";
    
    // Strict Password Validation
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    
    if (!hasUpper || !hasNumber || !hasSymbol) {
      return "Password harus mengandung huruf kapital, angka, dan simbol.";
    }

    if (password !== confirm) return "Password dan konfirmasi tidak sama";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateForm();
    if (error) return showToast(error, "error");

    setSubmitting(true);
    try {
      // Panggil Backend API alih-alih Firebase langsung agar data tersimpan di Firestore
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim()
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        showPopup("Account created successfully! You can now sign in.", "success");
      } else {
        showToast(data.message || "Registration failed", "error");
      }
    } catch (err) {
      setSubmitting(false);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  return (
    <>
      <Toast open={toast.open} message={toast.message} type={toast.type} />
      <Popup
        open={popup.open}
        message={popup.message}
        type={popup.type}
        onClose={closePopup}
      />

      <div className="flex flex-col md:flex-row w-full max-w-300 relative items-center py-4 md:py-8 gap-8 md:gap-12">
        <div className="hidden md:flex flex-1 items-center justify-center animate-cover-slide-left z-10">
          <img src="/assets/images/banner-register.png" alt="" className="max-w-full h-auto drop-shadow-2xl" />
        </div>

        <div className="flex-1 flex flex-col justify-center md:pl-12 animate-reveal-form w-full max-w-md md:max-w-none">
          <h1 className="text-[32px] sm:text-[38px] md:text-[44px] font-bold mb-2 text-mahogany text-center md:text-left">Create an Account</h1>
          <p className="text-[16px] md:text-[18px] mb-6 text-mahogany opacity-90 text-center md:text-left">
            Join us today and start your journey with a new account.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              aria-label="Full Name"
              autoFocus
              className="w-full rounded-full px-5 py-3 border-2 border-mahogany bg-rice outline-none focus:ring-0 disabled:opacity-60"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={submitting}
              required
            />

            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              className="w-full rounded-full px-5 py-3 border-2 border-mahogany bg-rice outline-none focus:ring-0 disabled:opacity-60"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              required
            />

            <div>
              <div className="relative flex items-center w-full rounded-full border-2 border-mahogany bg-rice px-5 py-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  aria-label="Password"
                  className="w-full bg-transparent outline-none pr-10 focus:ring-0 disabled:opacity-60"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="absolute right-5 flex items-center justify-center w-6 h-6 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={submitting}
                  aria-label="Toggle password visibility"
                >
                  <img src={showPassword ? "/assets/icons/login/eye-open.svg" : "/assets/icons/login/eye-closed.svg"} alt="" className="w-5 h-5 pointer-events-none" />
                </button>
              </div>
              <p className="text-sm mt-1 text-mahogany opacity-70">Min. 8 characters, capital letters, numbers & symbols.</p>
              <div className="mt-2">
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full transition-all duration-300" style={{ width: strengthStyles.width, backgroundColor: strengthStyles.color }} />
                </div>
                <p className="text-sm mt-1 font-medium" style={{ color: strengthStyles.color }}>{strengthStyles.text}</p>
              </div>
            </div>

            <div className="relative flex items-center w-full rounded-full border-2 border-mahogany bg-rice px-5 py-3">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                aria-label="Confirm Password"
                className="w-full bg-transparent outline-none pr-10 focus:ring-0 disabled:opacity-60"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                disabled={submitting}
                required
              />
              <button
                type="button"
                className="absolute right-5 flex items-center justify-center w-6 h-6 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
                onClick={() => setShowConfirm((prev) => !prev)}
                disabled={submitting}
                aria-label="Toggle confirm password visibility"
              >
                <img src={showConfirm ? "/assets/icons/login/eye-open.svg" : "/assets/icons/login/eye-closed.svg"} alt="" className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            <button
              type="submit"
              className="rounded-full text-lg font-semibold py-3 mt-4 transition-all bg-mahogany text-vanilla hover:shadow-btn-hover disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              disabled={submitting}
            >
              {submitting ? "Mendaftarkan..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center mt-6 text-mahogany">
            Already have an account?{" "}
            <Link to="/login" className="font-bold underline">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}
