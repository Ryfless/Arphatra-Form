import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Popup from "@/components/Popup.jsx";
import Toast from "@/components/Toast.jsx";
import { API_BASE_URL } from "@/lib/config.js";
import { clearAuthStorage, saveToken, saveUser, setIsNewUser } from "@/lib/storage.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: "", type: "info" });
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    document.title = "Login - Arphatra";
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 4000);
  };

  const showPopup = (message, type = "info") => {
    setPopup({ open: true, message, type });
  };

  const closePopup = () => setPopup((prev) => ({ ...prev, open: false }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!EMAIL_REGEX.test(email)) return showToast("Email format is incorrect", "error");
    if (!password) return showToast("Password is required", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      setLoading(false);

      const isHttpOk = res.ok;
      const hasSuccessFlag = data.success === true;
      const hasToken = Boolean(data.data?.idToken);
      const message = (data.message || "").toLowerCase();

      const containsErrorKeyword =
        message.includes("password") ||
        message.includes("wrong") ||
        message.includes("invalid") ||
        message.includes("not found") ||
        message.includes("register");

      if (isHttpOk && hasSuccessFlag && hasToken && !containsErrorKeyword) {
        saveToken(data.data.idToken);
        saveUser({
          fullName: data.data?.fullName || email,
          email,
          id: data.data?.userId || email.split("@")[0],
        });
        setIsNewUser(false);

        showToast("Login successful", "success");
        setTimeout(() => navigate("/homepage"), 1200);
        return;
      }

      clearAuthStorage();
      setIsNewUser(false);

      const errorMessage = message.includes("register") || message.includes("not found")
        ? "Account not registered. Please register first."
        : "Incorrect email or password.";
      showToast(errorMessage, "error");
    } catch (error) {
      setLoading(false);
      clearAuthStorage();
      setIsNewUser(false);
      showToast("Login failed. Please try again.", "error");
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
        hideOk={popup.type === "success"}
      />

      <div className="flex flex-col md:flex-row w-full max-w-[1200px] items-center relative py-4 md:py-8 gap-8 md:gap-12">
        <div className="flex-1 flex flex-col justify-center md:pr-12 animate-reveal-form w-full max-w-md md:max-w-none">
          <h1 className="text-[32px] sm:text-[38px] md:text-[44px] font-bold mb-2 text-mahogany text-center md:text-left">Welcome Back!</h1>
          <p className="text-[16px] md:text-[18px] mb-6 md:mb-8 text-mahogany opacity-90 text-center md:text-left">
            Sign in to continue and access your account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <input
              type="email"
              placeholder="Email"
              aria-label="Email address"
              autoFocus
              className="w-full rounded-full px-5 py-3 border-2 border-mahogany bg-rice outline-none focus:ring-0 disabled:opacity-60"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                aria-label="Password"
                className="w-full rounded-full px-5 py-3 pr-12 border-2 border-mahogany bg-rice outline-none focus:ring-0 disabled:opacity-60"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                <img
                  src={showPassword ? "/assets/icons/login/eye-open.svg" : "/assets/icons/login/eye-closed.svg"}
                  alt=""
                  className="w-5 h-5 pointer-events-none"
                />
              </button>
            </div>

            <div className="text-right -mt-2">
              <Link to="/otp" className="font-medium text-mahogany hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="rounded-full text-lg font-semibold py-3 transition-all bg-mahogany text-vanilla hover:shadow-btn-hover disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-6 text-mahogany">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold underline">Register</Link>
          </p>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center animate-cover-slide-right z-10">
          <img src="/assets/images/banner-login.png" alt="" className="max-w-full h-auto drop-shadow-2xl" />
        </div>
      </div>
    </>
  );
}
