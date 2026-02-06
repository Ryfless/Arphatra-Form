import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthStorage, getUser } from "@/lib/storage.js";

export default function CmsHeader({ 
  onToggleSidebar, 
  onPreview, 
  isPreview, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo, 
  activeTab, 
  onTabChange,
  onPublish,
  onSave,
  isPublishing,
  isSaving,
  formName, // New prop
  onNameChange // New prop
}) {
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const user = getUser();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest(".profile-menu-container")) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/login");
  };

  if (isPreview) {
    return (
        <div className="fixed top-6 right-8 z-[100] flex gap-4 animate-fade-in">
            <button 
                onClick={onPreview}
                className="bg-mahogany/80 backdrop-blur-md text-rice px-6 py-2.5 rounded-full font-bold shadow-2xl hover:bg-mahogany transition-all active:scale-95 flex items-center gap-2 border border-white/20"
            >
                <img src="/assets/icons/navbar/eye.svg" alt="" className="w-5 h-5 invert" />
                <span>Exit Preview</span>
            </button>
        </div>
    );
  }

  return (
    <div className="bg-rice h-[80px] w-full shadow-sm flex items-center justify-between px-8 md:px-12 font-poppins relative z-50 shrink-0 border-b border-mahogany/10">
      <div className="flex items-center gap-4">
        <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/homepage")}>
            <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra Logo" className="w-24 md:w-32 h-auto" />
        </div>
        <div className="h-8 w-px bg-mahogany/20 mx-2"></div>
        <input 
          type="text" 
          value={formName || ""} 
          onChange={(e) => onNameChange && onNameChange(e.target.value)}
          onBlur={() => onNameBlur && onNameBlur()} // Connect onBlur
          placeholder="Untitled Form"
          className="text-[20px] font-bold text-mahogany bg-transparent border-none outline-none focus:ring-2 focus:ring-mahogany/10 rounded-md px-2 w-[200px] transition-all placeholder:text-mahogany/30"
        />
        {isSaving ? (
            <span className="text-[12px] text-tobacco animate-pulse ml-2">Saving...</span>
        ) : (
            <span className="text-[12px] text-tobacco/40 ml-2">Saved</span>
        )}
      </div>

      {/* Center: Tabs Switcher */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-10 h-full">
         <div 
            onClick={() => onTabChange("question")}
            className="flex flex-col items-center justify-center h-full cursor-pointer group relative"
         >
           <span className={`text-[18px] font-bold transition-colors ${activeTab === 'question' ? 'text-mahogany' : 'text-tobacco hover:text-mahogany'}`}>Question</span>
           {activeTab === 'question' && <div className="absolute bottom-0 w-full h-[4px] bg-mahogany rounded-t-full animate-fade-in"></div>}
         </div>
         <div 
            onClick={() => onTabChange("answer")}
            className="flex flex-col items-center justify-center h-full cursor-pointer group relative"
         >
           <span className={`text-[18px] font-bold transition-colors ${activeTab === 'answer' ? 'text-mahogany' : 'text-tobacco hover:text-mahogany'}`}>Answer</span>
           {activeTab === 'answer' && <div className="absolute bottom-0 w-full h-[4px] bg-mahogany rounded-t-full animate-fade-in"></div>}
         </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
            {!isPreview && (
                <button onClick={onToggleSidebar} className="p-2 hover:bg-mahogany/5 rounded-xl transition-all group active:scale-95" title="Theme Settings">
                    <img src="/assets/icons/navbar/ic_outline-palette.svg" alt="Theme" className="w-8 h-8 opacity-60 group-hover:opacity-100" />
                </button>
            )}
            <button onClick={onPreview} className={`p-2 rounded-xl transition-all group active:scale-95 ${isPreview ? 'bg-mahogany shadow-md' : 'hover:bg-mahogany/5'}`} title="Preview">
              <img src="/assets/icons/navbar/eye.svg" alt="Preview" className={`w-7 h-7 transition-all ${isPreview ? 'invert' : 'opacity-60 group-hover:opacity-100'}`} />
            </button>
            <button onClick={onUndo} disabled={!canUndo} className={`p-2 hover:bg-mahogany/5 rounded-full transition-colors group ${!canUndo ? 'opacity-30 cursor-not-allowed' : ''}`} title="Undo"><img src="/assets/icons/navbar/undo.svg" alt="Undo" className="w-6 h-6 opacity-60 group-hover:opacity-100" /></button>
            <button onClick={onRedo} disabled={!canRedo} className={`p-2 hover:bg-mahogany/5 rounded-full transition-colors group ${!canRedo ? 'opacity-30 cursor-not-allowed' : ''}`} title="Redo"><img src="/assets/icons/navbar/redo.svg" alt="Redo" className="w-6 h-6 opacity-60 group-hover:opacity-100" /></button>
        </div>
        <div className="h-8 w-px bg-mahogany/10 mr-2"></div>
        
        {/* SAVE BUTTON */}
        {!isPreview && (
            <button 
                onClick={() => onSave && onSave()}
                disabled={isSaving}
                className={`p-2 rounded-xl transition-all group active:scale-95 mr-2 ${isSaving ? 'bg-mahogany/10' : 'hover:bg-mahogany/5'}`}
                title="Save Changes"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isSaving ? 'text-mahogany animate-pulse' : 'opacity-60 group-hover:opacity-100 text-mahogany'}`}>
                    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
        )}

        <button 
            onClick={() => onPublish && onPublish()}
            disabled={isPublishing}
            className="bg-mahogany text-rice px-6 py-2 rounded-xl text-[16px] font-bold flex items-center gap-2 hover:shadow-md transition-all active:scale-95 mr-2 disabled:opacity-50"
        >
            <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
            {!isPublishing && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </button>

        <div className="relative profile-menu-container">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-mahogany/20 cursor-pointer hover:border-mahogany/50 transition-colors active:scale-95" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}><img src="/assets/icons/homepage/Avatar.svg" alt="Profile" className="w-full h-full object-cover" /></div>
            {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-vanilla rounded-[25px] shadow-2xl border border-mahogany/10 py-4 z-[110] animate-fade-in overflow-hidden"><div className="px-6 py-3 border-b border-mahogany/10 mb-2"><p className="font-bold text-lg text-mahogany truncate">{user?.fullName || "User"}</p><p className="text-xs text-tobacco truncate">{user?.email || ""}</p></div><div className="flex flex-col"><button className="px-6 py-3 text-left hover:bg-mahogany/5 transition-colors cursor-pointer text-mahogany font-medium border-none bg-transparent" onClick={() => navigate("/homepage")}>My Dashboard</button><button className="px-6 py-3 text-left hover:bg-mahogany/5 transition-colors cursor-pointer text-mahogany font-medium border-none bg-transparent">Account Settings</button><button onClick={handleLogout} className="px-6 py-3 text-left hover:bg-red-50 text-red-600 transition-colors cursor-pointer font-bold mt-2 border-t border-mahogany/5 bg-transparent">Logout</button></div></div>
            )}
        </div>
      </div>
    </div>
  );
}
