import { useNavigate } from "react-router-dom";
import { clearAuthStorage } from "@/lib/storage.js";

export default function SessionExpiredModal({ open }) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleLoginAgain = () => {
    clearAuthStorage();
    navigate("/login");
    // Force a reload if necessary to clear all states, but navigate should be enough
    window.location.reload(); 
  };

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-mahogany/80 backdrop-blur-md animate-fade-in">
      <div className="bg-rice w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col border-4 border-vanilla animate-reveal-form">
        <div className="p-10 flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
             <img src="/assets/icons/cms-form/close-icon.svg" alt="Expired" className="w-10 h-10 opacity-60" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-mahogany">Session Expired</h2>
            <p className="text-tobacco font-medium leading-relaxed">
              Your security session has ended for your protection. Please sign in again to continue working.
            </p>
          </div>

          <button 
            onClick={handleLoginAgain}
            className="w-full py-4 bg-mahogany text-rice rounded-2xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer border-none mt-4"
          >
            Sign In Again
          </button>
        </div>
        
        {/* Footer decoration */}
        <div className="h-2 bg-red-500 w-full opacity-50"></div>
      </div>
    </div>
  );
}
