import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage.jsx";
import LoginPage from "@/pages/LoginPage.jsx";
import OtpPage from "@/pages/OtpPage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";
import ResetPassPage from "@/pages/ResetPassPage.jsx";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import { getToken, getUser } from "@/lib/storage.js";

function RootRedirect() {
  const token = getToken();
  const user = getUser();
  if (token && user) {
    return <Navigate to="/homepage" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      
      {/* Auth Routes with Persistent Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/resetpass" element={<ResetPassPage />} />
      </Route>

      <Route path="/homepage" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}