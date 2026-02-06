import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutModal from "@/components/LogoutModal.jsx";
import Popup from "@/components/Popup.jsx";
import Toast from "@/components/Toast.jsx";
import { formsDataNewUser, formsDataNormalUser } from "@/data/formsData.js";
import { clearAuthStorage, getIsNewUser, getToken, getUser } from "@/lib/storage.js";
import { apiRequest } from "@/lib/api.js";

const tabs = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "2days", label: "2 Days ago" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeFormMenu, setActiveFormMenu] = useState(null);
  const [formToDelete, setFormToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [realForms, setRealForms] = useState({ today: [], yesterday: [], '2days': [] });
  const [isLoading, setIsLoading] = useState(true);

  const user = getUser();
  const isNewUser = getIsNewUser();

  const confirmDeleteForm = async () => {
    if (!formToDelete) return;
    try {
        await apiRequest(`/api/forms/${formToDelete}`, { method: "DELETE" });
        setRealForms(prev => ({
            today: prev.today.filter(f => f.id !== formToDelete),
            yesterday: prev.yesterday.filter(f => f.id !== formToDelete),
            '2days': prev['2days'].filter(f => f.id !== formToDelete)
        }));
        setToast({ show: true, message: "Form deleted successfully", type: "success" });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
        setFormToDelete(null);
        setActiveFormMenu(null);
    } catch (error) {
        console.error("Failed to delete form", error);
        setToast({ show: true, message: "Failed to delete form", type: "error" });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }
  };

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("/api/forms");
        const grouped = { today: [], yesterday: [], '2days': [] };
        const now = new Date();
        response.data.forEach(form => {
            const formDate = new Date(form.createdAt);
            const diffDays = Math.floor((now - formDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) grouped.today.push(form);
            else if (diffDays === 1) grouped.yesterday.push(form);
            else grouped['2days'].push(form);
        });
        setRealForms(grouped);
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForms();
  }, []);

  const formsData = useMemo(() => {
      if (isLoading) return { today: [], yesterday: [], '2days': [] };
      return realForms;
  }, [realForms, isLoading]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const firstName = useMemo(() => {
    const displayName = user?.fullName || user?.name || "User";
    return displayName.split(" ")[0];
  }, [user]);

  const hasForms = useMemo(() => {
    return realForms.today.length > 0 || realForms.yesterday.length > 0 || realForms['2days'].length > 0;
  }, [realForms]);

  const formsList = useMemo(() => [...realForms.today, ...realForms.yesterday, ...realForms['2days']], [realForms]);

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
    let forms = [...(formsData[activeTab] || [])];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      forms = forms.filter((f) => f.name?.toLowerCase().includes(query) || f.title?.toLowerCase().includes(query));
    }
    forms.sort((a, b) => {
      const key = sortConfig.key;
      const valA = (a[key] || "").toString().toLowerCase();
      const valB = b[key] || "".toString().toLowerCase();
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return forms;
  }, [activeTab, formsData, searchQuery, sortConfig]);

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
        title="Delete Form"
        description="Are you sure you want to delete this form? All responses will be permanently removed. This action cannot be undone."
      />

      <header className="flex items-center justify-between px-6 md:px-16 pt-4 pb-2 bg-transparent shrink-0 gap-4">
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/homepage")}>
          <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra Logo" className="w-24 md:w-32 h-auto" />
        </div>

        <div className="hidden md:flex flex-1 max-w-2xl px-4 md:px-12">
          <div className="flex items-center gap-4 w-full rounded-full px-6 py-2.5 border-2 border-mahogany bg-transparent focus-within:ring-1 focus-within:ring-mahogany/20 transition-all">
            <img src="/assets/icons/homepage/search-icon.svg" alt="" className="w-5 h-5 opacity-70" />
            <input
              type="text"
              placeholder="Search your forms..."
              className="flex-1 border-none outline-none bg-transparent text-sm md:text-lg focus:ring-0 text-mahogany placeholder:text-mahogany/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-black/5 rounded-full cursor-pointer transition-colors">
                <img src="/assets/icons/cms-form/close-icon.svg" alt="" className="w-4 h-4 opacity-60" />
              </button>
            )}
            <button className="p-1 hover:bg-black/5 rounded-full cursor-pointer transition-colors">
              <img src="/assets/icons/homepage/mic.svg" alt="" className="w-5 h-5 opacity-70" />
            </button>
          </div>
        </div>

        <div className="shrink-0 relative profile-menu-container">
          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden border-none cursor-pointer bg-transparent hover:ring-4 hover:ring-mahogany/10 transition-all">
             <img src="/assets/icons/homepage/Avatar.svg" alt="Avatar" className="w-full h-full object-cover" />
          </button>
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 md:w-64 bg-vanilla rounded-3xl shadow-2xl border border-mahogany/10 py-4 z-100 animate-fade-in overflow-hidden">
              <div className="px-6 py-3 border-b border-mahogany/10 mb-2">
                <p className="font-bold text-base md:text-lg text-mahogany truncate">{user?.fullName || "User"}</p>
                <p className="text-xs md:text-sm text-tobacco truncate">{user?.email || ""}</p>
              </div>
              <div className="flex flex-col">
                <button className="px-6 py-3 text-left hover:bg-mahogany/5 transition-colors cursor-pointer text-mahogany font-medium border-none bg-transparent">My Profile</button>
                <button className="px-6 py-3 text-left hover:bg-mahogany/5 transition-colors cursor-pointer text-mahogany font-medium border-none bg-transparent">Settings</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setLogoutOpen(true); }} className="px-6 py-3 text-left hover:bg-red-50 text-red-600 transition-colors cursor-pointer font-bold mt-2 border-t border-mahogany/5 bg-transparent">Logout</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 md:px-16 pb-8 md:pb-12 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 lg:overflow-hidden items-start pt-10">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-10 w-full shrink-0">
          <section className="space-y-1">
            <p className="text-lg md:text-xl font-medium text-mahogany/70">{greeting}, {firstName}!</p>
            <h1 className="text-[32px] md:text-[44px] font-bold tracking-tight text-mahogany leading-tight">Ready to create a new form today?</h1>
          </section>
          
          <div className="flex flex-col md:flex-row items-start gap-8 relative">
            <section onClick={() => navigate("/form/create")} className="relative group cursor-pointer w-full md:w-[280px] lg:w-[320px] shrink-0 transition-all">
                {!hasForms && (
                    <img src="/assets/images/peeking.png" alt="" className="absolute top-1/2 -translate-y-1/2 -right-38 w-48 h-auto z-0 pointer-events-none animate-bobbing group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className="relative z-10 overflow-hidden rounded-[30px] md:rounded-[45px] shadow-sm transition-all duration-500 hover:shadow-xl group-active:scale-95 bg-sand">
                    <img src={isNewUser ? "/assets/images/newForm-empty.png" : "/assets/images/new-form.png"} alt="Create New" className="w-full h-auto object-contain" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </section>

            {hasForms && (
                <div className="flex-1 flex flex-col gap-6 w-full animate-fade-in">
                    <section className="relative w-full pointer-events-none">
                        <div className="relative overflow-hidden rounded-[30px] md:rounded-[40px] shadow-sm border-2 border-mahogany/5">
                            <img src="/assets/images/recent.png" alt="Recent" className="w-full h-[140px] md:h-[180px] object-cover" />
                        </div>
                    </section>
                    <div className="flex gap-6">
                        {[0, 1].map((idx) => {
                            const f = formsList[idx];
                            if (!f) return null;
                            const initial = f.name ? f.name.charAt(0).toUpperCase() : "?";
                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => navigate(`/form/edit/${f.id}`)} 
                                    className={`w-32 h-32 md:w-44 md:h-44 rounded-[35px] md:rounded-[45px] flex items-center justify-center text-[48px] md:text-[72px] font-bold shadow-lg transition-all duration-300 ${idx === 0 ? 'bg-mahogany text-rice' : 'bg-vanilla text-mahogany border-[3px] border-mahogany'} cursor-pointer hover:shadow-2xl hover:-translate-y-2 active:scale-95`}
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
        <div className="flex flex-col w-full h-full lg:overflow-hidden min-h-[500px] lg:min-h-0">
          <div className="flex justify-center md:justify-end gap-6 md:gap-12 md:pr-10 mb-6 shrink-0 flex-wrap">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" className={`font-bold py-2 cursor-pointer transition-all text-lg md:text-2xl relative shrink-0 border-none bg-transparent ${activeTab === tab.key ? "text-mahogany" : "text-mahogany/40 hover:text-mahogany/60"}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
                {activeTab === tab.key && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-mahogany rounded-full"></div>}
              </button>
            ))}
          </div>

          <section className="bg-vanilla rounded-[35px] md:rounded-[50px] p-6 md:p-12 flex-1 flex flex-col shadow-sm overflow-hidden min-h-0 relative">
            <div className="grid grid-cols-[1.5fr_1fr_40px] gap-4 px-8 py-4 mb-4 font-bold text-sm md:text-xl text-mahogany shrink-0 border-b border-mahogany/10 select-none uppercase tracking-widest opacity-60">
              <div className="text-center cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center gap-2" onClick={() => handleSort("name")}>
                Name {sortConfig.key === "name" && <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
              </div>
              <div className="text-center cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center gap-2" onClick={() => handleSort("createdAt")}>
                Last Opened {sortConfig.key === "createdAt" && <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
              </div>
              <div></div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 flex-1 overflow-y-auto custom-scrollbar px-1 md:px-2 min-h-0">
              {/* QUICK START ROW - Hidden if forms exist in this tab */}
              {formsForTab.length === 0 && (
                <div 
                  onClick={() => navigate("/form/create")}
                  className="stagger-item group/quick bg-mahogany/5 border-2 border-dashed border-mahogany/20 p-5 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-mahogany/10 hover:border-mahogany/40 transition-all mb-2"
                >
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-mahogany flex items-center justify-center shadow-md group-hover/quick:scale-110 transition-transform">
                          <img src="/assets/icons/cms-form/add.svg" alt="" className="w-5 h-5 invert" />
                      </div>
                      <div className="flex flex-col">
                          <span className="text-lg font-bold text-mahogany">Ignite a new project</span>
                          <span className="text-xs text-tobacco/60">Every great idea starts with a simple blank form.</span>
                      </div>
                  </div>
                  <div className="bg-mahogany/10 px-4 py-1.5 rounded-full text-xs font-bold text-mahogany opacity-0 group-hover/quick:opacity-100 transition-opacity">
                      Create Now →
                  </div>
                </div>
              )}

              {formsForTab.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                  <p className="text-xl font-bold">No forms found</p>
                </div>
              ) : (
                formsForTab.map((form, idx) => {
                  const isSelected = selectedRowId === form.id;
                  return (
                    <div 
                        key={form.id} 
                        style={{ animationDelay: `${idx * 0.05}s` }}
                        className={`stagger-item grid grid-cols-[1.5fr_1fr_40px] gap-4 p-5 rounded-3xl items-center transition-all cursor-pointer border-2 ${isSelected ? "bg-mountain border-transparent shadow-md scale-[1.01]" : "bg-transparent border-transparent hover:bg-mountain/10"}`}
                        onClick={() => navigate(`/form/edit/${form.id}`)}
                    >
                      <div className="flex items-center gap-4 overflow-hidden pl-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-white/20" : "bg-mahogany/5"}`}>
                          <img src="/assets/icons/homepage/doc-icon.svg" alt="" className={`w-5 h-5 ${isSelected ? "invert" : ""}`} />
                        </div>
                        <span className={`text-lg font-bold truncate ${isSelected ? "text-white" : "text-mahogany"}`}>{form.name || "Untitled Form"}</span>
                      </div>
                      <div className={`text-center text-md font-medium ${isSelected ? "text-white/80" : "text-mahogany/60"}`}>
                        {new Date(form.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex justify-center items-center relative form-menu-container">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setActiveFormMenu(activeFormMenu === form.id ? null : form.id); }}
                            className={`p-2 rounded-full transition-all ${isSelected ? 'invert brightness-200' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <img src="/assets/icons/homepage/more-vertical.svg" alt="" className="w-6 h-6" />
                        </button>
                        {activeFormMenu === form.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-mahogany/5 py-2 z-[150] text-mahogany" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => navigate(`/form/edit/${form.id}`)} className="w-full px-6 py-2.5 text-left hover:bg-mahogany/5 transition-colors font-medium">Edit</button>
                                <button onClick={() => navigate(`/form/view/${form.id}`)} className="w-full px-6 py-2.5 text-left hover:bg-mahogany/5 transition-colors font-medium">View Public</button>
                                <button onClick={() => setFormToDelete(form.id)} className="w-full px-6 py-2.5 text-left hover:bg-red-50 text-red-600 transition-colors font-bold mt-1 border-t border-mahogany/5">Delete</button>
                            </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}