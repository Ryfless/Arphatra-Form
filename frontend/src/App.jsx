import { Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "@/pages/HomePage.jsx";
import LoginPage from "@/pages/LoginPage.jsx";
import OtpPage from "@/pages/OtpPage.jsx";
import RegisterPage from "@/pages/RegisterPage.jsx";
import ResetPassPage from "@/pages/ResetPassPage.jsx";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import CreateFormPage from "@/pages/CreateFormPage.jsx";
import ViewFormPage from "@/pages/ViewFormPage.jsx";
import ProfilePage from "@/pages/ProfilePage.jsx";
import SettingsPage from "@/pages/SettingsPage.jsx";
import SessionExpiredModal from "@/components/SessionExpiredModal.jsx";
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
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    window.addEventListener("session-expired", handleExpired);
    return () => window.removeEventListener("session-expired", handleExpired);
  }, []);

  return (
    <>
      <SessionExpiredModal open={sessionExpired} />
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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/form/create" element={<CreateFormPage />} />
        <Route path="/form/edit/:formId" element={<CreateFormPage />} />
        <Route path="/form/view/:formId" element={<ViewFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}