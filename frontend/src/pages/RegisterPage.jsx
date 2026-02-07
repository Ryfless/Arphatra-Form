import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Popup from "@/components/Popup.jsx";
import Toast from "@/components/Toast.jsx";
import { PASSWORD_MIN_LENGTH } from "@/lib/config.js";
import { auth } from "@/lib/firebase.js";
import { useLanguage } from "@/lib/i18n.jsx";

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
  const { t } = useLanguage();
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
    if (strength <= 1) return { width: "33%", color: "var(--color-weak)", text: t("weak_password") };
    if (strength <= 3) return { width: "66%", color: "var(--color-medium)", text: t("medium_password") };
    return { width: "100%", color: "var(--color-strong)", text: t("strong_password") };
  }, [password, strength, t]);

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
    if (fullName.trim().length < 3) return t("name_min_3");
    if (!EMAIL_REGEX.test(email)) return t("email_not_valid");
    if (password.length < PASSWORD_MIN_LENGTH) return t("password_min_8");
    
    // Strict Password Validation
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    
    if (!hasUpper || !hasNumber || !hasSymbol) {
      return t("password_must_contain");
    }

    if (password !== confirm) return t("password_not_match");
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
        showPopup(t("account_created"), "success");
      } else {
        showToast(data.message || t("registration_failed"), "error");
      }
    } catch (err) {
      setSubmitting(false);
      showToast(t("error_occurred"), "error");
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
          <h1 className="text-[32px] sm:text-[38px] md:text-[44px] font-bold mb-2 text-mahogany text-center md:text-left">{t("create_account")}</h1>
          <p className="text-[16px] md:text-[18px] mb-6 text-mahogany opacity-90 text-center md:text-left">
            {t("register_subtitle")}
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={t("full_name")}
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
              placeholder={t("email_address")}
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
                  placeholder={t("password")}
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
              <p className="text-sm mt-1 text-mahogany opacity-70">{t("password_hint")}</p>
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
                placeholder={t("confirm_password")}
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
              {submitting ? t("registering") : t("sign_up")}
            </button>
          </form>

          <p className="text-center mt-6 text-mahogany">
            {t("have_account")}{" "}
            <Link to="/login" className="font-bold underline">{t("login")}</Link>
          </p>
        </div>
      </div>
    </>
  );
}
