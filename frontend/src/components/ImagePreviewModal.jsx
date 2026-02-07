export default function ImagePreviewModal({ open, image, onCancel }) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-mahogany/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
      onClick={onCancel}
    >
      <div className="relative max-w-4xl w-full h-full flex items-center justify-center p-4 md:p-12" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer border-none z-10"
        >
          <img src="/assets/icons/cms-form/close-icon.svg" alt="Close" className="w-8 h-8 invert" />
        </button>
        
        <div className="bg-vanilla p-2 rounded-[40px] shadow-2xl overflow-hidden animate-reveal-form max-h-full">
          <img 
            src={image || "/assets/icons/homepage/Avatar.svg"} 
            alt="Profile Full View" 
            className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain block rounded-[35px]"
          />
        </div>
      </div>
    </div>
  );
}
