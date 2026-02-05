export default function Toast({ open, message, type = "success" }) {
  if (!open) return null;

  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-success" : "bg-error";

  return (
    <div className="fixed top-8 inset-x-0 z-9999 flex justify-center pointer-events-none px-4">
      <div
        className={`pointer-events-auto flex items-center gap-4 pl-5 pr-8 py-4 rounded-2xl text-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] animate-slide-down ${bgColor} w-full max-w-400px md:w-auto`}
      >
        <div className="bg-white/20 p-2 rounded-xl shrink-0">
          {isSuccess ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        <div className="flex flex-col">
          <p className="font-bold text-[15px] leading-tight">
            {isSuccess ? "Success" : "Error"}
          </p>
          <p className="text-sm opacity-90 font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
