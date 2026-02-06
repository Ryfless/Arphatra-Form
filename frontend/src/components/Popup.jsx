export default function Popup({ 
  open, 
  title, 
  message, 
  description, // Alias for message to match usage
  type = "info", 
  onClose, 
  onConfirm, // New prop for confirmation action
  onCancel,  // New prop for cancel action
  confirmText = "Yes, delete it",
  cancelText = "Cancel"
}) {
  if (!open) return null;

  const isSuccess = type === "success";
  // If onConfirm exists, treat as "danger/warning" dialog unless specified otherwise
  const isDanger = !!onConfirm && type !== "success"; 
  
  const iconColor = isSuccess ? "text-green-600" : isDanger ? "text-red-600" : "text-mahogany";
  const buttonBg = isSuccess ? "bg-mahogany" : isDanger ? "bg-red-600" : "bg-mahogany";

  const displayMessage = message || description;
  const displayTitle = title || (isSuccess ? "Success!" : isDanger ? "Are you sure?" : "Attention");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in" role="dialog" aria-live="polite">
      <div className="bg-rice rounded-[40px] w-full max-w-[500px] p-10 text-center shadow-2xl border border-mahogany/10 relative overflow-hidden transform transition-all scale-100">
        
        {/* Decorative Background Pattern */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-mahogany/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-mahogany/5 rounded-full" />

        <div className={`mb-6 flex justify-center ${iconColor}`}>
          {isSuccess ? (
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : isDanger ? (
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          ) : (
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </div>

        <h3 className="text-[28px] font-bold text-mahogany mb-3">
          {displayTitle}
        </h3>
        
        <p className="text-[18px] leading-relaxed text-tobacco/80 mb-8 font-medium">
          {displayMessage}
        </p>

        <div className="flex gap-4 justify-center w-full">
            {onConfirm ? (
                <>
                    <button
                        className="bg-transparent border-2 border-mahogany/10 text-mahogany px-8 py-3 rounded-2xl text-lg font-bold cursor-pointer hover:bg-mahogany/5 transition-all flex-1"
                        type="button"
                        onClick={onCancel || onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`${buttonBg} text-rice px-8 py-3 rounded-2xl text-lg font-bold cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex-1 border-none`}
                        type="button"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </>
            ) : (
                <button
                    className={`${buttonBg} text-rice px-12 py-3.5 rounded-full text-lg font-bold cursor-pointer border-none shadow-lg hover:scale-105 active:scale-95 transition-all w-full`}
                    type="button"
                    onClick={onClose}
                >
                    Got it
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
