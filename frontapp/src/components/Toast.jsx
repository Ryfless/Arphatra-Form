import { useEffect, useState } from "react";

export default function Toast({ open = true, message, type = "success", onClose, duration = 2000 }) {
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    setShouldRender(open);
    if (open && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, onClose, duration]);

  if (!open || !shouldRender) return null;

  const isSuccess = type === "success";
  const isError = type === "error";
  
  let bgColor = "bg-mahogany";
  let label = "Information";
  
  if (isSuccess) {
    bgColor = "bg-success";
    label = "Success";
  } else if (isError) {
    bgColor = "bg-error";
    label = "Error";
  }

  return (
    <div className="fixed top-8 inset-x-0 z-9999 flex justify-center pointer-events-none px-4">
      <div
        className={`pointer-events-auto relative flex items-center gap-4 pl-5 pr-8 py-4 rounded-2xl text-white shadow-[0_10px_40px_rgba(0,0,0,0.25)] animate-slide-down ${bgColor} w-full max-w-400px md:w-auto overflow-hidden`}
      >
        <div className="bg-white/20 p-2 rounded-xl shrink-0">
          {isError ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : isSuccess ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        <div className="flex flex-col">
          <p className="font-bold text-[15px] leading-tight">
            {label}
          </p>
          <p className="text-sm opacity-90 font-medium">
            {message}
          </p>
        </div>

        {/* Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/40 w-full">
            <div 
                className="h-full bg-white" 
                style={{ 
                    animation: `toastProgress ${duration}ms linear forwards` 
                }}
            />
        </div>

        <style>{`
            @keyframes toastProgress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `}</style>
      </div>
    </div>
  );
}