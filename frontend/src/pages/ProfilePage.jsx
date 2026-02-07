import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, clearAuthStorage, saveUser } from "@/lib/storage.js";
import { apiRequest } from "@/lib/api.js";
import { STORAGE_KEYS } from "@/lib/config.js";
import LogoutModal from "@/components/LogoutModal.jsx";
import Toast from "@/components/Toast.jsx";
import ImageCropModal from "@/components/ImageCropModal.jsx";
import ImagePreviewModal from "@/components/ImagePreviewModal.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Image States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    document.title = "My Profile - Arphatra";
    const fetchProfile = async () => {
      try {
        const response = await apiRequest("/api/users/profile");
        setUser(response.data);
        setFullName(response.data.fullName || "");
        // Sync storage if needed
        saveUser(response.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        const localUser = getUser();
        if (localUser) {
          setUser(localUser);
          setFullName(localUser.fullName || "");
        } else {
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/login");
  };

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      setToast({ show: true, message: "Name cannot be empty", type: "error" });
      return;
    }

    try {
      setIsUpdating(true);
      const response = await apiRequest("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({ fullName }),
      });
      
      setUser(response.data);
      saveUser(response.data);
      setIsEditing(false);
      setToast({ show: true, message: "Profile updated successfully!", type: "success" });
    } catch (error) {
      setToast({ show: true, message: error.message || "Failed to update profile", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ show: true, message: "Please upload an image file", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // Increased to 5MB for better quality before crop
      setToast({ show: true, message: "Image size must be less than 5MB", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  const handleConfirmCrop = async (blob) => {
    setCropModalOpen(false);
    const formData = new FormData();
    formData.append("file", blob, "avatar.jpg");

    try {
      setIsUploading(true);
      
      const uploadResponse = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.message || "Upload failed");

      const imageUrl = uploadData.data.url;

      const updateResponse = await apiRequest("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({ avatarUrl: imageUrl }),
      });

      setUser(updateResponse.data);
      saveUser(updateResponse.data);
      setToast({ show: true, message: "Profile picture updated!", type: "success" });
    } catch (error) {
      console.error("Image upload failed:", error);
      setToast({ show: true, message: error.message || "Failed to upload image", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInitiatePasswordChange = async () => {
    if (!user?.email) return;
    
    try {
      setIsSendingOtp(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(STORAGE_KEYS.RESET_EMAIL, user.email.trim().toLowerCase());
        setToast({ show: true, message: "Verification code sent to your email!", type: "success" });
        setTimeout(() => navigate("/otp"), 1500);
      } else {
        throw new Error(data.message || "Failed to send verification code");
      }
    } catch (error) {
      setToast({ show: true, message: error.message, type: "error" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  if (!user) return null;

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
      <ImageCropModal 
        open={cropModalOpen}
        image={selectedImage}
        onCancel={() => setCropModalOpen(false)}
        onConfirm={handleConfirmCrop}
      />
      <ImagePreviewModal
        open={isPreviewOpen}
        image={user?.avatarUrl}
        onCancel={() => setIsPreviewOpen(false)}
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
        
        {/* Profile Avatar removed as per request */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 md:px-16 pt-6 md:pt-10 pb-12 overflow-y-auto">
        <div className="w-full max-w-4xl animate-fade-in">
          <button
            onClick={() => navigate("/homepage")}
            className="flex items-center gap-2 text-mahogany/60 hover:text-mahogany mb-6 md:mb-8 transition-colors group cursor-pointer"
          >
            <img
              src="/assets/icons/cms-form/thick-back-arrow.svg"
              alt="Back"
              className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-bold text-sm md:text-base">Back to Dashboard</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 md:gap-8">
            {/* Profile Sidebar */}
            <div className="flex flex-col items-center gap-4 md:gap-6 bg-vanilla p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm border border-mahogany/5 h-fit">
              <div className="relative group">
                <div 
                  onClick={() => !isUploading && setIsPreviewOpen(true)}
                  className={`w-28 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-mahogany/10 group-hover:border-mahogany/30 transition-all ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-zoom-in'} relative`}
                >
                  <img
                    src={user?.avatarUrl || "/assets/icons/homepage/Avatar.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay */}
                  {!isUploading && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <img src="/assets/icons/navbar/eye.svg" alt="" className="w-6 h-6 md:w-8 md:h-8 invert opacity-70" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-mahogany border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-mahogany text-rice rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer border-none z-10">
                   <img src="/assets/icons/cms-form/add.svg" alt="Edit" className="w-4 h-4 md:w-5 md:h-5 invert" />
                   <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                   />
                </label>
              </div>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-mahogany">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-tobacco text-sm md:text-base">{user?.email}</p>
              </div>
              <div className="w-full pt-4 border-t border-mahogany/10 flex flex-col gap-2">
                 <div className="flex justify-between items-center px-2 text-xs md:text-sm">
                    <span className="font-medium text-mahogany/50">Member since</span>
                    <span className="font-bold text-mahogany">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "February 2026"}
                    </span>
                 </div>
                 <div className="flex justify-between items-center px-2">
                    <span className="text-xs md:text-sm font-medium text-mahogany/50">Status</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Active</span>
                 </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex flex-col gap-4 md:gap-6">
              <section className="bg-vanilla p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm border border-mahogany/5">
                <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-5 md:w-2 md:h-6 bg-mahogany rounded-full"></div>
                    Profile Details
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => { setIsEditing(false); setFullName(user?.fullName || ""); }}
                      className="text-xs md:text-sm font-bold text-mahogany/40 hover:text-mahogany transition-colors border-none bg-transparent cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </h3>

                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs md:text-sm font-bold text-mahogany/60 ml-1">Full Name</label>
                    <div className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-rice border-2 transition-all ${isEditing ? 'border-mahogany shadow-inner' : 'border-mahogany/10'}`}>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        readOnly={!isEditing}
                        placeholder="Enter your full name"
                        className={`w-full bg-transparent border-none outline-none text-mahogany font-medium text-base md:text-lg ${!isEditing ? 'cursor-default' : 'cursor-text'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs md:text-sm font-bold text-mahogany/60 ml-1">Email Address</label>
                    <div className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-rice border-2 border-mahogany/5 transition-all opacity-70">
                      <input 
                        type="email" 
                        defaultValue={user?.email || ""}
                        disabled
                        className="w-full bg-transparent border-none outline-none text-mahogany font-medium text-base md:text-lg cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-tobacco ml-1 italic">*Email address cannot be changed.</p>
                  </div>

                  <div className="pt-4 md:pt-6 flex flex-col sm:flex-row gap-3 md:gap-4">
                    {isEditing ? (
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdating}
                        className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-mahogany text-rice rounded-xl md:rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
                      >
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-mahogany text-rice rounded-xl md:rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer border-none text-sm md:text-base"
                      >
                        Edit Profile
                      </button>
                    )}
                    <button 
                      onClick={handleInitiatePasswordChange}
                      disabled={isSendingOtp}
                      className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-transparent text-mahogany border-2 border-mahogany rounded-xl md:rounded-2xl font-bold hover:bg-mahogany/5 transition-all cursor-pointer text-sm md:text-base disabled:opacity-50"
                    >
                      {isSendingOtp ? "Sending Code..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
