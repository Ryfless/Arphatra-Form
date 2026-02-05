import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutModal from "@/components/LogoutModal.jsx";
import { formsDataNewUser, formsDataNormalUser } from "@/data/formsData.js";
import { clearAuthStorage, getIsNewUser, getToken, getUser } from "@/lib/storage.js";

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
  const [sortConfig, setSortConfig] = useState({ key: "time", direction: "desc" });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const user = getUser();
  const isNewUser = getIsNewUser();

  const formsData = useMemo(() => isNewUser ? formsDataNewUser : formsDataNormalUser, [isNewUser]);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const formsForTab = useMemo(() => {
    let forms = [...(formsData[activeTab] || [])];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      forms = forms.filter((f) => f.title.toLowerCase().includes(query));
    }
    forms.sort((a, b) => {
      const valA = a[sortConfig.key]?.toLowerCase() || "";
      const valB = b[sortConfig.key]?.toLowerCase() || "";
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
    <div className="bg-rice min-h-screen lg:h-screen w-screen lg:overflow-hidden font-poppins text-mahogany flex flex-col">
      <LogoutModal open={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={handleLogout} />

      <header className="flex items-center justify-between px-6 md:px-16 pt-4 pb-2 bg-transparent shrink-0 gap-4">
        <div className="flex items-center cursor-pointer shrink-0">
          <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra Logo" className="w-24 md:w-32 h-auto" />
        </div>

        <div className="hidden md:flex flex-1 max-w-2xl px-4 md:px-12">
          <div className="flex items-center gap-4 w-full rounded-full px-6 py-2.5 border-2 border-mahogany bg-transparent focus-within:ring-1 focus-within:ring-mahogany/20 transition-all">
            <img src="/assets/icons/homepage/search-icon.svg" alt="" className="w-5 h-5 opacity-70" />
            <input
              type="text"
              placeholder="Search your forms..."
              aria-label="Search forms"
              className="flex-1 border-none outline-none bg-transparent text-sm md:text-lg focus:ring-0 text-mahogany placeholder:text-mahogany/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-black/5 rounded-full cursor-pointer transition-colors" aria-label="Clear search">
                <img src="/assets/icons/cms-form/close-icon.svg" alt="" className="w-4 h-4 opacity-60" />
              </button>
            )}
            <button className="p-1 hover:bg-black/5 rounded-full cursor-pointer transition-colors" aria-label="Voice search">
              <img src="/assets/icons/homepage/mic.svg" alt="" className="w-5 h-5 opacity-70" />
            </button>
          </div>
        </div>

        <div className="shrink-0 relative profile-menu-container">
          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden border-none cursor-pointer bg-transparent hover:ring-4 hover:ring-mahogany/10 transition-all" aria-label="User menu">
             <img src="/assets/icons/homepage/Avatar.svg" alt="Avatar" className="w-full h-full object-cover" />
          </button>
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 md:w-64 bg-vanilla rounded-3xl shadow-2xl border border-mahogany/10 py-4 z-100 animate-fade-in overflow-hidden">
              <div className="px-6 py-3 border-b border-mahogany/10 mb-2">
                <p className="font-bold text-base md:text-lg text-mahogany truncate">{user?.fullName || "User"}</p>
                <p className="text-xs md:text-sm text-tobacco truncate">{user?.email || ""}</p>
              </div>
              <div className="flex flex-col">
                <button className="px-6 py-3 text-left hover:bg-mahogany/5 transition-colors cursor-pointer text-mahogany font-medium border-none bg-transparent text-sm md:text-base">My Profile</button>
                <button className="px-6 py-3 text-left hover:bg-mahogany/5 transition-colors cursor-pointer text-mahogany font-medium border-none bg-transparent text-sm md:text-base">Settings</button>
                <button onClick={() => { setIsProfileMenuOpen(false); setLogoutOpen(true); }} className="px-6 py-3 text-left hover:bg-red-50 text-red-600 transition-colors cursor-pointer font-bold mt-2 border-t border-mahogany/5 bg-transparent text-sm md:text-base">Logout</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 md:px-16 pb-8 md:pb-12 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 lg:overflow-hidden items-center">
        <div className="flex flex-col gap-6 md:gap-10 h-full justify-center shrink-0 mt-4 md:mt-0">
          <section className="space-y-1">
            <p className="text-lg md:text-xl font-medium text-mahogany/70">{greeting}, {firstName}!</p>
            <h1 className="text-[32px] md:text-[44px] font-bold tracking-tight text-mahogany leading-tight">Ready to create a new form today?</h1>
          </section>
          <section className="relative group cursor-pointer w-full max-w-sm md:max-w-md mx-auto lg:mx-0">
            <div className="relative overflow-hidden rounded-[30px] md:rounded-[45px] shadow-sm transition-all duration-500 hover:shadow-xl">
              <img src={isNewUser ? "/assets/images/newForm-empty.png" : "/assets/images/new-form.png"} alt="Create New Form" className="w-full h-75 md:h-112.5 object-contain bg-sand" />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </section>
        </div>

        <div className="flex flex-col h-full lg:overflow-hidden pt-4 min-h-125 lg:min-h-0">
          <div className="flex justify-center md:justify-end gap-6 md:gap-12 md:pr-10 mb-6 shrink-0 flex-wrap">
            {tabs.map((tab) => (
              <button key={tab.key} type="button" className={`font-bold py-2 cursor-pointer transition-all text-lg md:text-2xl relative shrink-0 border-none bg-transparent ${activeTab === tab.key ? "text-mahogany" : "text-mahogany/40 hover:text-mahogany/60"}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
                {activeTab === tab.key && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-mahogany rounded-full"></div>}
              </button>
            ))}
          </div>

          <section className="bg-vanilla rounded-[35px] md:rounded-[50px] p-6 md:p-12 flex-1 flex flex-col shadow-sm overflow-hidden min-h-0">
            <div className="grid grid-cols-[1.5fr_1fr_40px] gap-2 md:gap-4 px-2 md:px-8 py-4 mb-4 font-bold text-sm md:text-xl text-mahogany shrink-0 border-b border-mahogany/10 select-none">
              <div className="text-center cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center gap-1 md:gap-2" onClick={() => handleSort("title")}>
                Title {sortConfig.key === "title" && <span className="text-xs md:text-sm">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
              </div>
              <div className="text-center cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center gap-1 md:gap-2" onClick={() => handleSort("time")}>
                Time {sortConfig.key === "time" && <span className="text-xs md:text-sm">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
              </div>
              <div className="flex justify-center items-center">
                <img src="/assets/icons/homepage/mdi_sort.svg" alt="Sort" className={`w-4 h-4 md:w-6 md:h-6 transition-transform duration-300 ${sortConfig.direction === "desc" ? "rotate-180" : ""}`} />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 flex-1 overflow-y-auto custom-scrollbar px-1 md:px-2 min-h-0" id="table-body">
              {formsForTab.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-mahogany/5 rounded-full flex items-center justify-center mb-4">
                    <img src="/assets/icons/homepage/doc-icon.svg" alt="" className="w-8 h-8 md:w-10 md:h-10 opacity-20" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-mahogany/40 mb-2">No forms available</p>
                  <button className="bg-mahogany text-vanilla px-6 md:px-8 py-2 md:py-3 rounded-full font-bold shadow-lg hover:shadow-btn-hover transition-all active:scale-95 cursor-pointer border-none text-sm md:text-base">
                    + Create Form
                  </button>
                </div>
              ) : (
                formsForTab.map((form) => {
                  const isSelected = selectedRowId === form.id || (form.highlighted && !selectedRowId);
                  return (
                    <div key={form.id} className={`grid grid-cols-[1.5fr_1fr_40px] gap-2 md:gap-4 p-3 md:p-5 rounded-2xl md:rounded-3xl items-center transition-all cursor-pointer border-2 shrink-0 ${isSelected ? "bg-mountain border-transparent shadow-sm scale-[1.01]" : "bg-transparent border-transparent hover:bg-mountain/10"}`} onClick={() => setSelectedRowId(form.id)}>
                      <div className="flex items-center gap-2 md:gap-5 overflow-hidden pl-1 md:pl-4">
                        <div className={`w-8 h-8 md:w-11 md:h-11 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-white/30" : "bg-mountain/30"}`}>
                          <img src="/assets/icons/homepage/doc-icon.svg" alt="Form" className={`w-4 h-4 md:w-6 md:h-6 ${isSelected ? "invert brightness-200" : "opacity-60"}`} />
                        </div>
                        <span className={`text-sm md:text-xl font-medium truncate ${isSelected ? "text-white" : "text-mahogany"}`}>{form.title}</span>
                      </div>
                      <div className={`text-center text-xs md:text-lg font-medium ${isSelected ? "text-white/80" : "text-mahogany/60"}`}>{form.time}</div>
                      <div className="flex justify-center items-center">
                        <img src="/assets/icons/homepage/more-vertical.svg" alt="More" className={`w-4 h-4 md:w-6 md:h-6 ${isSelected ? "invert brightness-200" : "opacity-40"}`} />
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