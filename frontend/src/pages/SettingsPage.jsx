import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, clearAuthStorage } from "@/lib/storage.js";
import { apiRequest } from "@/lib/api.js";
import { useLanguage } from "@/lib/i18n.jsx";
import LogoutModal from "@/components/LogoutModal.jsx";
import Toast from "@/components/Toast.jsx";
import Popup from "@/components/Popup.jsx";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, changeLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("notifications");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmAction, setConfirmAction] = useState({ open: false, type: "", title: "", message: "" });

  const [settings, setSettings] = useState({
    notifications: { email: true, weeklySummary: false },
    preferences: { defaultTheme: '#584738', autoBranding: true },
    display: { layout: 'list', language: 'English (US)' }
  });

  useEffect(() => {
    document.title = "Settings - Arphatra";
    const userData = getUser();
    if (!userData) {
      navigate("/login");
    } else {
      setUser(userData);
      fetchSettings();
    }
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const res = await apiRequest("/users/settings");
      setSettings(res.data);
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  const handleUpdateSetting = async (category, key, value) => {
    // Optimistic Update
    const prevSettings = { ...settings };
    setSettings(prev => ({
        ...prev,
        [category]: {
            ...prev[category],
            [key]: value
        }
    }));

    if (key === 'language') {
        changeLanguage(value);
    }

    try {
        await apiRequest("/users/settings", {
            method: "PUT",
            body: JSON.stringify({ category, key, value })
        });
        setToast({ show: true, message: t("setting_updated"), type: "success" });
    } catch (error) {
        setSettings(prevSettings); // Revert on error
        setToast({ show: true, message: t("update_failed"), type: "error" });
    }
  };

  const handleAccountAction = async () => {
    if (!confirmAction.type) return;
    
    try {
        const endpoint = confirmAction.type === 'deactivate' ? '/users/deactivate' : '/users/delete';
        const method = confirmAction.type === 'deactivate' ? 'POST' : 'DELETE';
        
        const response = await apiRequest(endpoint, { method });
        
        setConfirmAction({ open: false, type: "", title: "", message: "" });
        
        // Show success message before logout
        const successMessage = confirmAction.type === 'deactivate' 
          ? t('account_deactivated')
          : t('account_deleted');
        setToast({ show: true, message: successMessage, type: "success" });
        
        // Wait a bit for toast to show, then logout
        setTimeout(() => {
          clearAuthStorage();
          navigate("/login");
          window.location.reload();
        }, 1500);
    } catch (error) {
        setConfirmAction({ open: false, type: "", title: "", message: "" });
        const errorMessage = confirmAction.type === 'deactivate'
          ? t('deactivate_failed')
          : t('delete_failed');
        setToast({ show: true, message: errorMessage, type: "error" });
    }
  };

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/login");
  };

  if (!user) return null;

  const tabs = [
    { id: "notifications", label: t("notifications"), icon: "/assets/icons/navbar/settings.svg" },
    { id: "display", label: t("display_language"), icon: "/assets/icons/homepage/mdi_sort.svg" },
    { id: "account", label: t("advanced_account"), icon: "/assets/icons/cms-form/trash-can.svg" },
  ];

  return (
    <div className="bg-rice min-h-screen w-screen font-poppins text-mahogany flex flex-col transition-all duration-700">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <LogoutModal
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />

      <Popup 
        open={confirmAction.open}
        title={confirmAction.title}
        description={confirmAction.message}
        onConfirm={handleAccountAction}
        onCancel={() => setConfirmAction({ open: false, type: "", title: "", message: "" })}
        confirmText={t("confirm")}
        cancelText={t("cancel")}
        type="error"
      />

      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-16 pt-4 pb-2 bg-transparent shrink-0 gap-4">
        <div
          className="flex items-center cursor-pointer shrink-0"
          onClick={() => navigate("/homepage")}
        >
          <img
            src="/assets/icons/arphatra-form-1.svg"
            alt="Arphatra Logo"
            className="w-20 md:w-32 h-auto"
          />
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate("/profile")}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-none cursor-pointer bg-transparent hover:ring-4 hover:ring-mahogany/10 transition-all"
            >
                <img
                src={user?.avatarUrl || "/assets/icons/homepage/Avatar.svg"}
                alt="Avatar"
                className="w-full h-full object-cover"
                />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 md:px-16 pt-6 md:pt-10 pb-12 overflow-y-auto">
        <div className="w-full max-w-5xl animate-fade-in">
          <button
            onClick={() => navigate("/homepage")}
            className="flex items-center gap-2 text-mahogany/60 hover:text-mahogany mb-6 md:mb-8 transition-colors group cursor-pointer border-none bg-transparent"
          >
            <img
              src="/assets/icons/cms-form/thick-back-arrow.svg"
              alt="Back"
              className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-bold text-sm md:text-base">{t("back_to_dashboard")}</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">{t("settings_title")}</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <aside className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 custom-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm md:text-base transition-all whitespace-nowrap border-none cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-mahogany text-rice shadow-lg translate-x-2"
                      : "bg-vanilla/50 text-mahogany/60 hover:bg-vanilla"
                  }`}
                >
                  <img src={tab.icon} alt="" className={`w-5 h-5 ${activeTab === tab.id ? 'invert' : 'opacity-60'}`} />
                  {tab.label}
                </button>
              ))}
            </aside>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-vanilla p-6 md:p-10 rounded-[40px] shadow-sm border border-mahogany/5 animate-reveal-form">
                
                {/* 1. NOTIFICATIONS */}
                {activeTab === "notifications" && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-2 h-6 bg-mahogany rounded-full"></div>
                        {t("notification_settings")}
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-mahogany/5 rounded-2xl">
                            <div>
                                <p className="font-bold">{t("email_notifications")}</p>
                                <p className="text-sm text-tobacco/80">{t("email_notifications_desc")}</p>
                            </div>
                            <div 
                                onClick={() => handleUpdateSetting('notifications', 'email', !settings.notifications.email)} 
                                className={`w-[44px] h-[26px] rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.notifications.email ? 'bg-mahogany' : 'bg-[#e4e4e4]'}`}
                            >
                                <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.notifications.email ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-mahogany/5 rounded-2xl">
                            <div>
                                <p className="font-bold">{t("weekly_analytics")}</p>
                                <p className="text-sm text-tobacco/80">{t("weekly_analytics_desc")}</p>
                            </div>
                            <div 
                                onClick={() => handleUpdateSetting('notifications', 'weeklySummary', !settings.notifications.weeklySummary)} 
                                className={`w-[44px] h-[26px] rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.notifications.weeklySummary ? 'bg-mahogany' : 'bg-[#e4e4e4]'}`}
                            >
                                <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-300 ${settings.notifications.weeklySummary ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* 5. DISPLAY & LANGUAGE */}
                {activeTab === "display" && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-2 h-6 bg-mahogany rounded-full"></div>
                        {t("display_language")}
                    </h2>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="font-bold">{t("dashboard_layout")}</p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleUpdateSetting('display', 'layout', 'list')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${settings.display.layout === 'list' ? 'bg-mahogany text-rice shadow-md' : 'bg-vanilla text-mahogany border border-mahogany/20'}`}
                                >
                                    {t("list_view")}
                                </button>
                                <button 
                                    onClick={() => handleUpdateSetting('display', 'layout', 'grid')}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${settings.display.layout === 'grid' ? 'bg-mahogany text-rice shadow-md' : 'bg-vanilla text-mahogany border border-mahogany/20'}`}
                                >
                                    {t("grid_view")}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4">
                            <p className="font-bold">{t("app_language")}</p>
                            <select 
                                value={settings.display.language}
                                onChange={(e) => handleUpdateSetting('display', 'language', e.target.value)}
                                className="w-full p-4 rounded-xl bg-rice border-2 border-mahogany/10 outline-none font-bold cursor-pointer"
                            >
                                <option>English (US)</option>
                                <option>Bahasa Indonesia</option>
                            </select>
                        </div>
                    </div>
                  </div>
                )}

                {/* 4. ACCOUNT ADVANCED */}
                {activeTab === "account" && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-red-600">
                        <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                        {t("advanced_account_actions")}
                    </h2>
                    <div className="space-y-4">
                        <div className="p-6 bg-red-50 rounded-[30px] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="font-bold text-red-700 text-lg">{t("deactivate_account")}</p>
                                <p className="text-sm text-red-600/70">{t("deactivate_account_desc")}</p>
                            </div>
                            <button 
                                onClick={() => setConfirmAction({ 
                                    open: true, 
                                    type: "deactivate", 
                                    title: t("deactivate_confirm_title"), 
                                    message: t("deactivate_confirm_msg")
                                })}
                                className="px-6 py-2 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors border-none cursor-pointer"
                            >
                                {t("deactivate")}
                            </button>
                        </div>
                        <div className="p-6 bg-red-600 rounded-[30px] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="font-bold text-white text-lg">{t("delete_account_permanent")}</p>
                                <p className="text-sm text-white/70">{t("delete_account_desc")}</p>
                            </div>
                            <button 
                                onClick={() => setConfirmAction({ 
                                    open: true, 
                                    type: "delete", 
                                    title: t("delete_confirm_title"), 
                                    message: t("delete_confirm_msg")
                                })}
                                className="px-6 py-2 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors border-none cursor-pointer"
                            >
                                {t("delete_account")}
                            </button>
                        </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
