import { useState, useRef, useEffect } from "react";

export default function ImageCropModal({ open, image, onCancel, onConfirm, aspectRatio = "1/1", title = "Adjust Picture" }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const isLandscape = aspectRatio !== "1/1";

  // Reset state when modal opens with a new image
  useEffect(() => {
    if (open && imgRef.current) {
      // Small delay to ensure image is loaded and dimensions are available
      const timer = setTimeout(() => {
        const img = imgRef.current;
        const container = containerRef.current;
        
        if (!img || !container) return;

        // Calculate scale to "cover" the container
        const scaleX = container.offsetWidth / img.naturalWidth;
        const scaleY = container.offsetHeight / img.naturalHeight;
        const initialScale = Math.max(scaleX, scaleY);
        
        setScale(initialScale);
        setPosition({ x: 0, y: 0 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, image]);

  if (!open) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    const container = containerRef.current;
    
    // Set canvas dimensions (Target Resolution)
    if (isLandscape) {
        canvas.width = 1200;
        canvas.height = 300; 
    } else {
        canvas.width = 500;
        canvas.height = 500;
    }
    
    // Calculate ratio between canvas and UI container
    const ratio = canvas.width / container.offsetWidth;
    
    // Final dimensions on canvas
    const drawWidth = img.naturalWidth * scale * ratio;
    const drawHeight = img.naturalHeight * scale * ratio;
    
    // Draw centered + offset
    ctx.drawImage(
      img, 
      (canvas.width / 2) - (drawWidth / 2) + (position.x * ratio), 
      (canvas.height / 2) - (drawHeight / 2) + (position.y * ratio), 
      drawWidth, 
      drawHeight
    );
    
    canvas.toBlob((blob) => {
      onConfirm(blob);
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-mahogany/60 backdrop-blur-sm animate-fade-in">
      <div className={`bg-rice w-full ${isLandscape ? 'max-w-4xl' : 'max-w-lg'} rounded-[40px] shadow-2xl overflow-hidden flex flex-col border-4 border-vanilla`}>
        <div className="p-8 border-b border-mahogany/10 flex justify-between items-center bg-vanilla/30">
          <h2 className="text-2xl font-bold text-mahogany">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-mahogany/10 rounded-full transition-colors cursor-pointer border-none bg-transparent">
            <img src="/assets/icons/cms-form/close-icon.svg" alt="Close" className="w-6 h-6 opacity-60" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center gap-8">
          {/* Crop Area */}
          <div 
            ref={containerRef}
            className={`relative ${isLandscape ? 'w-full aspect-[4/1] rounded-3xl' : 'w-64 h-64 md:w-80 md:h-80 rounded-full'} border-4 border-mahogany/20 overflow-hidden bg-black/10 cursor-move touch-none`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={image}
              alt="To Crop"
              onLoad={() => {
                  // Trigger initial scale calculation
                  const img = imgRef.current;
                  const container = containerRef.current;
                  if(img && container) {
                    const scaleX = container.offsetWidth / img.naturalWidth;
                    const scaleY = container.offsetHeight / img.naturalHeight;
                    setScale(Math.max(scaleX, scaleY));
                  }
              }}
              draggable={false}
              className="absolute pointer-events-none transition-transform duration-75 select-none"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                top: '50%',
                left: '50%',
                maxWidth: 'none',
                width: 'auto',
                height: 'auto'
              }}
            />
            {/* Overlay to darken outside area */}
            <div className={`absolute inset-0 pointer-events-none border-2 border-mahogany/30 ${isLandscape ? 'rounded-3xl shadow-[0_0_0_1000px_rgba(241,234,218,0.6)]' : 'rounded-full shadow-[0_0_0_1000px_rgba(241,234,218,0.6)]'}`}></div>
          </div>

          {/* Controls */}
          <div className="w-full space-y-6">
            <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold text-mahogany/60 px-2">
                    <span>Zoom</span>
                    <span>{Math.round(scale * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0.1" 
                    max="5" 
                    step="0.01" 
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-mahogany/10 rounded-lg appearance-none cursor-pointer accent-mahogany"
                />
            </div>
            <p className="text-center text-xs text-tobacco font-bold italic opacity-60">
                DRAG IMAGE TO POSITION • SCROLL TO ZOOM
            </p>
          </div>
        </div>

        <div className="p-8 bg-vanilla/30 flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 bg-transparent text-mahogany border-2 border-mahogany rounded-2xl font-bold hover:bg-mahogany/5 transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-4 bg-mahogany text-rice rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer border-none">
            Save & Upload
          </button>
        </div>
      </div>
    </div>
  );
}