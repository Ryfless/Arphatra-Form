import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutModal from "@/components/LogoutModal.jsx";
import Popup from "@/components/Popup.jsx";
import Toast from "@/components/Toast.jsx";
import { formsDataNewUser, formsDataNormalUser } from "@/data/formsData.js";
import { clearAuthStorage, getIsNewUser, getToken, getUser } from "@/lib/storage.js";
import { apiRequest } from "@/lib/api.js";
import { useLanguage } from "@/lib/i18n.jsx";

const tabs = [
  { key: "all", label: "all" },
  { key: "today", label: "today" },
  { key: "yesterday", label: "yesterday" },
  { key: "2days", label: "2days" },
];

const SkeletonItem = () => (
  <div className="grid grid-cols-[1.5fr_1fr_40px] gap-2 md:gap-4 p-3 md:p-5 rounded-2xl md:rounded-3xl items-center border-2 border-transparent bg-mahogany/5 animate-pulse">
    <div className="flex items-center gap-2 md:gap-4 md:pl-4">
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-mahogany/10 shrink-0"></div>
      <div className="h-4 md:h-6 bg-mahogany/10 rounded-md w-32 md:w-48"></div>
    </div>
    <div className="h-3 md:h-4 bg-mahogany/10 rounded-md w-12 md:w-20 mx-auto"></div>
    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-mahogany/10 mx-auto"></div>
  </div>
);

const SkeletonGridItem = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="aspect-[4/3] rounded-[25px] md:rounded-[35px] bg-mahogany/5 border-2 border-mahogany/5"></div>
    <div className="px-2 space-y-2">
      <div className="h-4 bg-mahogany/10 rounded-md w-3/4"></div>
      <div className="h-3 bg-mahogany/10 rounded-md w-1/2"></div>
    </div>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [user, setUser] = useState(getUser()); // Change to state
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "updatedAt", direction: "desc" });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeFormMenu, setActiveFormMenu] = useState(null);
  const [formToDelete, setFormToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [realForms, setRealForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('list'); // 'list' or 'grid'

  const isNewUser = getIsNewUser();

  useEffect(() => {
    const handleUpdate = (e) => {
      setUser(e.detail || getUser());
    };
    window.addEventListener("user-profile-updated", handleUpdate);
    return () => window.removeEventListener("user-profile-updated", handleUpdate);
  }, []);

  const confirmDeleteForm = async () => {
    if (!formToDelete) return;
    try {
        await apiRequest(`/forms/${formToDelete}`, { method: "DELETE" });
        setRealForms(prev => prev.filter(f => f.id !== formToDelete));
        setToast({ show: true, message: t("form_deleted"), type: "success" });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
        setFormToDelete(null);
        setActiveFormMenu(null);
    } catch (error) {
        console.error("Failed to delete form", error);
        setToast({ show: true, message: t("form_delete_failed"), type: "error" });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Parallel fetch for speed
        const [formsRes, settingsRes] = await Promise.all([
            apiRequest("/forms"),
            apiRequest("/users/settings")
        ]);

        // Handle Forms
        setRealForms(formsRes.data || []);

        // Handle Settings
        if (settingsRes.data?.display?.layout) {
            setLayout(settingsRes.data.display.layout);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t("greeting.morning");
    if (hour >= 12 && hour < 18) return t("greeting.afternoon");
    return t("greeting.evening");
  }, [t]);

  const firstName = useMemo(() => {
    const displayName = user?.fullName || user?.name || "User";
    return displayName.split(" ")[0];
  }, [user]);

  const hasForms = useMemo(() => {
    return realForms.length > 0;
  }, [realForms]);

  const formsList = useMemo(() => realForms, [realForms]);

  useEffect(() => {
    document.title = "Homepage - Arphatra";
    const token = getToken();
    if (!token || !user) {
      clearAuthStorage();
      navigate("/login");
    }
  }, [navigate, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest(".profile-menu-container")) setIsProfileMenuOpen(false);
      if (activeFormMenu && !event.target.closest(".form-menu-container")) setActiveFormMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen, activeFormMenu]);

  const formsForTab = useMemo(() => {
    let filtered = [...realForms];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 1. Filter by Tab
    if (activeTab !== "all") {
      filtered = filtered.filter(form => {
        const formDate = new Date(form.updatedAt || form.createdAt);
        formDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((now - formDate) / (1000 * 60 * 60 * 24));

        if (activeTab === "today") return diffDays === 0;
        if (activeTab === "yesterday") return diffDays === 1;
        if (activeTab === "2days") return diffDays === 2;
        return true;
      });
    }

    // 2. Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((f) => f.name?.toLowerCase().includes(query) || f.title?.toLowerCase().includes(query));
    }

    // 3. Sort
    filtered.sort((a, b) => {
      const key = sortConfig.key;
      let valA = a[key] || "";
      let valB = b[key] || "";
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [activeTab, realForms, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/login");
  };

  return (
    <div className="bg-rice min-h-screen lg:h-screen w-screen lg:overflow-hidden font-poppins text-mahogany flex flex-col relative transition-all duration-700">
      <style>{`
        @keyframes bobbing {
          0%, 100% { transform: translateY(-50%) translateX(0) rotate(0deg); }
          50% { transform: translateY(-50%) translateX(10px) rotate(2deg); }
        }
        .animate-bobbing {
          animation: bobbing 4s ease-in-out infinite;
        }
        .stagger-item {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.5s ease-out forwards;
        }
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <LogoutModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={handleLogout} />
      
      <Popup 
        open={!!formToDelete}
        onCancel={() => setFormToDelete(null)}
        onConfirm={confirmDeleteForm}
        title={t("delete_form")}
        description={t("delete_form_confirm")}
      />

      <header className="flex items-center justify-between px-4 md:px-16 pt-4 pb-2 bg-transparent shrink-0 gap-4">
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/homepage")}>
          <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra Logo" className="w-20 md:w-32 h-auto" />
        </div>

        <div className="flex md:flex-1 max-w-2xl px-0 md:px-12">
          <div className="flex items-center gap-2 md:gap-4 w-full rounded-full px-4 md:px-6 py-2 border-2 border-mahogany bg-transparent focus-within:ring-1 focus-within:ring-mahogany/20 transition-all">
            <img src="/assets/icons/homepage/search-icon.svg" alt="" className="w-4 h-4 md:w-5 md:h-5 opacity-70" />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              className="flex-1 border-none outline-none bg-transparent text-xs md:text-lg focus:ring-0 text-mahogany placeholder:text-mahogany/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-black/5 rounded-full cursor-pointer transition-colors">
                <img src="/assets/icons/cms-form/close-icon.svg" alt="" className="w-3 h-3 md:w-4 md:h-4 opacity-60" />
              </button>
            )}
          </div>
        </div>

        <div className="shrink-0 relative profile-menu-container">
          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden border-none cursor-pointer bg-transparent hover:ring-4 hover:ring-mahogany/10 transition-all">
             <img src={user?.avatarUrl || "/assets/icons/homepage/Avatar.svg"} alt="Avatar" className="w-full h-full object-cover" />
          </button>
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 md:w-64 bg-vanilla rounded-3xl shadow-2xl border border-mahogany/10 py-4 z-100 animate-fade-in overflow-hidden">
              <div className="px-6 py-3 border-b border-mahogany/10 mb-2">
                <p className="font-bold text-base md:text-lg text-mahogany truncate">{user?.fullName || "User"}</p>
                <p className="text-xs md:text-sm text-tobacco truncate">{user?.email || ""}</p>
              </div>
              <div className="flex flex-col">
                <button 
                  onClick={() => navigate("/profile")}
                  className="px-6 py-3 text-left hover:bg-mahogany/5 transition-colors cursor-pointer text-mahogany font-medium border-none bg-transparent"
                >
                  {t("my_profile")}
                </button>
                <button 
                  onClick={() => navigate("/settings")}
                  className="px-6 py-3 text-left hover:bg-mahogany/5 transition-colors cursor-pointer text-mahogany font-medium border-none bg-transparent"
                >
                  {t("settings")}
                </button>
                <button onClick={() => { setIsProfileMenuOpen(false); setLogoutOpen(true); }} className="px-6 py-3 text-left hover:bg-red-50 text-red-600 transition-colors cursor-pointer font-bold mt-2 border-t border-mahogany/5 bg-transparent">{t("logout")}</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 md:px-16 pb-8 md:pb-12 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 lg:overflow-hidden items-start pt-6 md:pt-10">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6 md:gap-10 w-full shrink-0">
          <section className="space-y-1">
            <p className="text-base md:text-xl font-medium text-mahogany/70">{greeting}, {firstName}!</p>
            <h1 className="text-[28px] md:text-[44px] font-bold tracking-tight text-mahogany leading-tight">{t("ready_to_create")}</h1>
          </section>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative">
            <section onClick={() => navigate("/form/create")} className="relative group cursor-pointer w-full md:w-[280px] lg:w-[320px] shrink-0 transition-all max-w-[320px]">
                {!hasForms && (
                    <img src="/assets/images/peeking.png" alt="" className="absolute top-1/2 -translate-y-1/2 -right-24 md:-right-38 w-32 md:w-48 h-auto z-0 pointer-events-none animate-bobbing group-hover:scale-110 transition-transform duration-500 hidden sm:block" />
                )}
                <div className="relative z-10 overflow-hidden rounded-[30px] md:rounded-[45px] shadow-sm transition-all duration-500 hover:shadow-xl group-active:scale-95 bg-sand">
                    <img src={isNewUser ? "/assets/images/newForm-empty.png" : "/assets/images/new-form.png"} alt="Create New" className="w-full h-auto object-contain" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </section>

            {hasForms && (
                <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full animate-fade-in items-center md:items-start">
                    <section className="relative w-full pointer-events-none hidden md:block">
                        <div className="relative overflow-hidden rounded-[30px] md:rounded-[40px] shadow-sm border-2 border-mahogany/5">
                            <img src="/assets/images/recent.png" alt="Recent" className="w-full h-[140px] md:h-[180px] object-cover" />
                        </div>
                    </section>
                    <div className="flex gap-4 md:gap-6 justify-center md:justify-start">
                        {[0, 1].map((idx) => {
                            const f = formsList[idx];
                            if (!f) return null;
                            const initial = f.name ? f.name.charAt(0).toUpperCase() : "?";
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => navigate(`/form/edit/${f.id}`)} 
                                    className={`w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-[25px] sm:rounded-[35px] md:rounded-[45px] flex items-center justify-center text-[36px] sm:text-[48px] md:text-[72px] font-bold shadow-lg transition-all duration-300 ${idx === 0 ? 'bg-mahogany text-rice' : 'bg-vanilla text-mahogany border-[3px] border-mahogany'} cursor-pointer hover:shadow-2xl hover:-translate-y-2 active:scale-95`}
                                >
                                    {initial}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col w-full h-full lg:overflow-hidden min-h-[400px] lg:min-h-0">
          <div className="flex justify-center md:justify-end gap-4 md:gap-12 md:pr-10 mb-4 md:mb-6 shrink-0 flex-wrap">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" className={`font-bold py-1 md:py-2 cursor-pointer transition-all text-base md:text-2xl relative shrink-0 border-none bg-transparent ${activeTab === tab.key ? "text-mahogany" : "text-mahogany/40 hover:text-mahogany/60"}`} onClick={() => setActiveTab(tab.key)}>
                {t(tab.key)}
                {activeTab === tab.key && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-mahogany rounded-full"></div>}
              </button>
            ))}
          </div>

          <section className="bg-vanilla rounded-[30px] md:rounded-[50px] p-4 md:p-12 flex-1 flex flex-col shadow-sm overflow-hidden min-h-0 relative">
            {layout === 'list' ? (
                <>
                    <div className="grid grid-cols-[1.5fr_1fr_40px] gap-2 md:gap-4 px-4 md:px-8 py-3 md:py-4 mb-2 md:mb-4 font-bold text-[10px] md:text-xl text-mahogany shrink-0 border-b border-mahogany/10 select-none uppercase tracking-widest opacity-60">
                        <div className="text-center cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center gap-1 md:gap-2" onClick={() => handleSort("name")}>
                            {t("name")} {sortConfig.key === "name" && <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                        </div>
                        <div className="text-center cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center gap-1 md:gap-2" onClick={() => handleSort("updatedAt")}>
                            {t("last_opened")} {sortConfig.key === "updatedAt" && <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                        </div>
                        <div></div>
                    </div>

                    <div className="flex flex-col gap-2 md:gap-4 flex-1 overflow-y-auto custom-scrollbar px-1 md:px-2 min-h-0 pb-4">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
                        ) : formsForTab.length === 0 ? (
                            <div className="flex flex-col h-full">
                                {activeTab === "all" && (
                                    <div 
                                        onClick={() => navigate("/form/create")}
                                        className="stagger-item group/quick bg-mahogany/5 border-2 border-dashed border-mahogany/20 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center justify-between cursor-pointer hover:bg-mahogany/10 hover:border-mahogany/40 transition-all mb-6"
                                    >
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-mahogany flex items-center justify-center shadow-md group-hover/quick:scale-110 transition-transform">
                                                <img src="/assets/icons/cms-form/add.svg" alt="" className="w-4 h-4 md:w-5 md:h-5 invert" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm md:text-lg font-bold text-mahogany">{t("ignite_project")}</span>
                                                <span className="text-[10px] md:text-xs text-tobacco/60">{t("start_blank")}</span>
                                            </div>
                                        </div>
                                        <div className="bg-mahogany/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold text-mahogany opacity-0 group-hover/quick:opacity-100 transition-opacity">
                                            {t("create_now")}
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                                    <div className="w-16 h-16 md:w-24 md:h-24 bg-mahogany/5 rounded-full flex items-center justify-center mb-4 opacity-20">
                                        <img src="/assets/icons/homepage/doc-icon.svg" alt="" className="w-8 h-8 md:w-12 md:h-12" />
                                    </div>
                                    <p className="text-lg md:text-xl font-bold text-mahogany/40 italic max-w-xs md:max-w-md">
                                        {activeTab === "today" ? t("empty_today") : 
                                         activeTab === "yesterday" ? t("empty_yesterday") :
                                         activeTab === "2days" ? t("empty_2days") :
                                         t("no_forms")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            formsForTab.map((form, idx) => {
                                const isSelected = selectedRowId === form.id;
                                return (
                                    <div 
                                        key={form.id} 
                                        style={{ animationDelay: `${idx * 0.05}s` }}
                                        className={`stagger-item grid grid-cols-[1.5fr_1fr_40px] gap-2 md:gap-4 p-3 md:p-5 rounded-2xl md:rounded-3xl items-center transition-all cursor-pointer border-2 ${isSelected ? "bg-mountain border-transparent shadow-md scale-[1.01]" : "bg-transparent border-transparent hover:bg-mountain/10"}`}
                                        onClick={() => navigate(`/form/edit/${form.id}`)}
                                    >
                                        <div className="flex items-center gap-2 md:gap-4 overflow-hidden md:pl-4">
                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-white/20" : "bg-mahogany/5"}`}>
                                                <img src="/assets/icons/homepage/doc-icon.svg" alt="" className={`w-4 h-4 md:w-5 md:h-5 ${isSelected ? "invert" : ""}`} />
                                            </div>
                                            <span className={`text-sm md:text-lg font-bold truncate ${isSelected ? "text-white" : "text-mahogany"}`}>{form.name || "Untitled Form"}</span>
                                        </div>
                                        <div className={`text-center text-xs md:text-md font-medium ${isSelected ? "text-white/80" : "text-mahogany/60"}`}>
                                            {new Date(form.updatedAt || form.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex justify-center items-center relative form-menu-container">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveFormMenu(activeFormMenu === form.id ? null : form.id); }}
                                                className={`p-1.5 md:p-2 rounded-full transition-all ${isSelected ? 'invert brightness-200' : 'opacity-40 hover:opacity-100'}`}
                                            >
                                                <img src="/assets/icons/homepage/more-vertical.svg" alt="" className="w-5 h-5 md:w-6 md:h-6" />
                                            </button>
                                            {activeFormMenu === form.id && (
                                                <div className="absolute right-0 top-full mt-2 w-40 md:w-48 bg-white rounded-xl md:rounded-2xl shadow-2xl border border-mahogany/5 py-1 md:py-2 z-[150] text-mahogany" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => navigate(`/form/edit/${form.id}`)} className="w-full px-4 md:px-6 py-2 md:py-2.5 text-left hover:bg-mahogany/5 transition-colors text-sm md:text-base font-medium border-none bg-transparent cursor-pointer">{t("edit")}</button>
                                                    <button onClick={() => window.open(form.slug ? `${window.location.origin.replace('/cms', '')}/f/${form.slug}` : `${window.location.origin.replace('/cms', '')}/form/view/${form.id}`, '_blank')} className="w-full px-4 md:px-6 py-2 md:py-2.5 text-left hover:bg-mahogany/5 transition-colors text-sm md:text-base font-medium border-none bg-transparent cursor-pointer">{t("view_public")}</button>
                                                    <button onClick={() => setFormToDelete(form.id)} className="w-full px-4 md:px-6 py-2 md:py-2.5 text-left hover:bg-red-50 text-red-600 transition-colors text-sm md:text-base font-bold mt-1 border-t border-mahogany/5 border-none bg-transparent cursor-pointer">{t("delete")}</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8 flex-1 overflow-y-auto custom-scrollbar px-1 md:px-2 min-h-0 pb-4 animate-fade-in pt-4">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <SkeletonGridItem key={i} />)
                    ) : formsForTab.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center h-full text-center opacity-40">
                            <p className="text-lg md:text-xl font-bold">No forms found</p>
                        </div>
                    ) : (
                        formsForTab.map((form, idx) => {
                            const isMenuOpen = activeFormMenu === form.id;
                            return (
                                <div 
                                    key={form.id}
                                    onClick={() => navigate(`/form/edit/${form.id}`)}
                                    className={`stagger-item flex flex-col gap-3 group cursor-pointer relative ${isMenuOpen ? "z-[100]" : "z-0"}`}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    <div className="aspect-[4/3] rounded-[25px] md:rounded-[35px] bg-mahogany/5 border-2 border-mahogany/5 flex items-center justify-center relative transition-all duration-300 hover:border-mahogany/20 hover:shadow-xl group-hover:-translate-y-1 overflow-hidden">
                                        {form.thumbnail ? (
                                            <img src={form.thumbnail} alt="" className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                                        ) : (
                                            <img src="/assets/icons/homepage/doc-icon.svg" alt="" className="w-12 h-12 md:w-16 md:h-16 opacity-20" />
                                        )}
                                        {/* Action Dot Overlay */}
                                        <div className="absolute top-4 right-4 form-menu-container">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveFormMenu(isMenuOpen ? null : form.id); }}
                                                className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <img src="/assets/icons/homepage/more-vertical.svg" alt="" className="w-4 h-4" />
                                            </button>
                                            {isMenuOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-40 md:w-48 bg-white rounded-xl md:rounded-2xl shadow-2xl border border-mahogany/5 py-1 md:py-2 z-[150] text-mahogany" onClick={(e) => e.stopPropagation()}>
                                                    <button onClick={() => navigate(`/form/edit/${form.id}`)} className="w-full px-4 md:px-6 py-2 md:py-2.5 text-left hover:bg-mahogany/5 transition-colors text-sm md:text-base font-medium border-none bg-transparent cursor-pointer">{t("edit")}</button>
                                                    <button onClick={() => window.open(form.slug ? `https://arphatra.web.app/f/${form.slug}` : `https://arphatra.web.app/form/view/${form.id}`, '_blank')} className="w-full px-4 md:px-6 py-2 md:py-2.5 text-left hover:bg-mahogany/5 transition-colors text-sm md:text-base font-medium border-none bg-transparent cursor-pointer">{t("view_public")}</button>
                                                    <button onClick={() => setFormToDelete(form.id)} className="w-full px-4 md:px-6 py-2 md:py-2.5 text-left hover:bg-red-50 text-red-600 transition-colors text-sm md:text-base font-bold mt-1 border-t border-mahogany/5 border-none bg-transparent cursor-pointer">{t("delete")}</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <p className="font-bold text-mahogany text-sm md:text-lg truncate">{form.name || "Untitled Form"}</p>
                                        <p className="text-tobacco/60 text-[10px] md:text-xs font-medium">Edited {new Date(form.updatedAt || form.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}