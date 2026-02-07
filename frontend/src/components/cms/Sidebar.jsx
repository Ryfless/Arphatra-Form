import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/api.js";
import { getToken } from "@/lib/storage.js";
import ImageCropModal from "@/components/ImageCropModal.jsx";

export default function Sidebar({ onClose, theme, onUpdateTheme }) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("theme"); // 'theme' or 'forms'
  const [myForms, setMyForms] = useState([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const handleSidebarUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        return data.status === 'success' ? data.data.url : null;
    } catch (error) {
        console.error("Upload failed", error);
        return null;
    }
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleConfirmBannerCrop = async (blob) => {
    setCropModalOpen(false);
    const url = await handleSidebarUpload(blob);
    if (url) onUpdateTheme({ bannerImage: url });
  };

  useEffect(() => {
    if (activeTab === "forms") {
        const fetchForms = async () => {
            try {
                const res = await apiRequest("/forms");
                setMyForms(res.data);
            } catch (err) {
                console.error("Failed sidebar forms", err);
            }
        };
        fetchForms();
    }
  }, [activeTab]);

  if (!open) return null;

  const colorPresets = [
    { label: "Classic Mahogany", bg: "var(--color-mountain)", card: "var(--color-rice)", accent: "var(--color-mahogany)" },
    { label: "Ocean Breeze", bg: "#A2C4C9", card: "#FFFFFF", accent: "#1E5F74" },
    { label: "Forest Moss", bg: "#8DA47E", card: "#F6F8ED", accent: "#2D4030" },
    { label: "Sunset Peach", bg: "#E9C46A", card: "#FFFFFF", accent: "#E76F51" },
    { label: "Minimalist Gray", bg: "#D1D5DB", card: "#FFFFFF", accent: "#374151" },
  ];

  return (
    <div className="fixed left-0 top-0 md:top-[80px] bottom-0 w-full md:w-[350px] bg-rice border-r border-mahogany/10 shadow-2xl flex flex-col font-poppins z-[110] md:z-[60] animate-slide-in-left">
      <ImageCropModal 
        open={cropModalOpen}
        image={selectedImage}
        aspectRatio="4/1"
        title="Adjust Header Image"
        onCancel={() => setCropModalOpen(false)}
        onConfirm={handleConfirmBannerCrop}
      />
      {/* Header with Tabs */}
      <div className="h-[70px] md:h-[80px] bg-rice border-b border-mahogany/5 flex items-center px-6 md:px-8 justify-between shrink-0 pt-2 md:pt-0">
        <div className="flex gap-4 md:gap-6">
            <button onClick={() => setActiveTab("theme")} className={`text-[16px] md:text-[20px] font-bold transition-colors ${activeTab === 'theme' ? 'text-mahogany border-b-2 border-mahogany' : 'text-mahogany/40 hover:text-mahogany'}`}>Theme</button>
            <button onClick={() => setActiveTab("forms")} className={`text-[16px] md:text-[20px] font-bold transition-colors ${activeTab === 'forms' ? 'text-mahogany border-b-2 border-mahogany' : 'text-mahogany/40 hover:text-mahogany'}`}>My Forms</button>
        </div>
        <button onClick={() => { setOpen(false); onClose && onClose(); }} className="p-2 hover:bg-mahogany/5 rounded-full transition-all group">
          <img src="/assets/icons/cms-form/close-icon.svg" alt="Close" className="w-5 h-5 opacity-50 group-hover:opacity-100" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 md:gap-10 custom-scrollbar">
        {/* --- TAB: THEME --- */}
        {activeTab === "theme" && (
            <>
                {/* Color Presets */}
                <section className="flex flex-col gap-5">
                <h3 className="text-[18px] font-bold text-mahogany uppercase tracking-wider">Presets</h3>
                <div className="grid grid-cols-1 gap-3">
                    {colorPresets.map((preset, idx) => (
                    <button 
                        key={idx}
                        onClick={() => onUpdateTheme({ 
                            backgroundColor: preset.bg, 
                            cardColor: preset.card, 
                            accentColor: preset.accent 
                        })}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all hover:bg-vanilla/50 ${theme.backgroundColor === preset.bg ? 'border-mahogany bg-vanilla/30' : 'border-transparent'}`}
                    >
                        <span className="text-[14px] font-bold text-mahogany">{preset.label}</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: preset.bg }}></div>
                            <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: preset.accent }}></div>
                        </div>
                    </button>
                    ))}
                </div>
                </section>

                <div className="w-full h-px bg-mahogany/10"></div>

                {/* Custom Color Adjustment */}
                <section className="flex flex-col gap-6">
                <h3 className="text-[18px] font-bold text-mahogany uppercase tracking-wider">Custom Colors</h3>
                
                <div className="flex flex-col gap-5">
                    {[
                    { label: "Background", key: "backgroundColor" },
                    { label: "Card Color", key: "cardColor" },
                    { label: "Accent Color", key: "accentColor" },
                    ].map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                        <span className="text-[16px] font-medium text-mahogany">{item.label}</span>
                        <input 
                            type="color" 
                            value={theme[item.key].startsWith('var') ? "#AAA396" : theme[item.key]}
                            onChange={(e) => onUpdateTheme({ [item.key]: e.target.value })}
                            className="w-10 h-10 border-none bg-transparent cursor-pointer rounded-lg"
                        />
                        </div>
                    </div>
                    ))}
                </div>
                </section>

                <div className="w-full h-px bg-mahogany/10"></div>

                {/* Header Image Section */}
                <section className="flex flex-col gap-5">
                <h3 className="text-[18px] font-bold text-mahogany uppercase tracking-wider">Header Image</h3>
                <input 
                    type="file" 
                    id="header-upload" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleBannerSelect}
                />
                <label 
                    htmlFor="header-upload"
                    className="flex flex-col gap-3 text-center p-6 border-2 border-dashed border-mahogany/20 rounded-2xl bg-vanilla/10 hover:bg-vanilla/30 transition-all cursor-pointer group"
                >
                    <img src="/assets/icons/cms-form/type-collection/add-image.svg" alt="" className="w-8 h-8 mx-auto opacity-40 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[14px] font-medium text-tobacco">Choose from computer</span>
                </label>
                
                {theme.bannerImage !== "/assets/images/default-banner.png" && (
                    <div className="flex items-center justify-between bg-vanilla/30 rounded-xl px-4 py-2 border border-mahogany/10 group animate-fade-in mt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-mountain shrink-0 border border-mahogany/10">
                                <img src={theme.bannerImage} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-mahogany">Custom Header</span>
                                <span className="text-[10px] text-tobacco italic">Active</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onUpdateTheme({ bannerImage: "/assets/images/default-banner.png" })}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group/btn"
                            title="Remove custom image"
                        >
                            <img src="/assets/icons/cms-form/close-icon.svg" alt="Reset" className="w-4 h-4 opacity-40 group-hover/btn:opacity-100" />
                        </button>
                    </div>
                )}
                </section>
            </>
        )}

        {/* --- TAB: MY FORMS --- */}
        {activeTab === "forms" && (
            <div className="flex flex-col gap-4 animate-fade-in">
                {myForms.length === 0 ? (
                    <p className="text-center text-tobacco italic mt-10">No saved forms yet.</p>
                ) : (
                    myForms.map((form) => (
                        <div 
                            key={form.id}
                            onClick={() => {
                                navigate(`/form/edit/${form.id}`);
                                window.location.reload(); // Hard reload to reset state cleanly
                            }}
                            className="p-4 rounded-2xl bg-vanilla/30 border border-mahogany/10 hover:bg-vanilla/60 cursor-pointer transition-all group"
                        >
                            <h4 className="text-[16px] font-bold text-mahogany truncate group-hover:text-mahogany/80">{form.title}</h4>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[12px] text-tobacco">{new Date(form.createdAt).toLocaleDateString()}</span>
                                <div className="px-2 py-0.5 bg-green-100 rounded-md text-[10px] text-green-700 font-bold uppercase tracking-wider">Active</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>

      <div className="p-6 bg-rice border-t border-mahogany/5 shrink-0">
         <button onClick={() => onClose()} className="w-full bg-mahogany text-rice py-3 rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all">
            Done
         </button>
      </div>
    </div>
  );
}