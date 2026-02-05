export default function Popup({ open, message, type = "info", onClose, hideOk }) {
  if (!open) return null;

  const isSuccess = type === "success";
  const iconColor = isSuccess ? "text-success" : "text-error";
  const buttonBg = isSuccess ? "bg-mahogany" : "bg-error";

  return (
    <div className="fixed inset-0 bg-mahogany/40 backdrop-blur-sm flex items-center justify-center z-9999 p-4" role="dialog" aria-live="polite">
      <div className="bg-vanilla rounded-[40px] w-full max-w-100 p-10 text-center shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-mahogany/10 animate-fade-in relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-mahogany/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-mahogany/5 rounded-full" />

        <div className={`mb-6 flex justify-center ${iconColor}`}>
          {isSuccess ? (
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h3 className="text-2xl font-bold text-mahogany mb-3">
          {isSuccess ? "Success!" : "Attention"}
        </h3>
        
        <p className="text-[17px] leading-relaxed text-mahogany/80 mb-8 font-medium">
          {message}
        </p>

        {!hideOk && (
          <button
            className={`${buttonBg} text-vanilla px-12 py-3.5 rounded-full text-lg font-bold cursor-pointer border-none shadow-lg hover:scale-105 active:scale-95 transition-all w-full`}
            type="button"
            onClick={onClose}
          >
            Got it
          </button>
        )}
      </div>
    </div>
  );
}
