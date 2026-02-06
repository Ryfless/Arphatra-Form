export default function AddOptionPanel({ onAddQuestion, isActive }) {
  const groups = [
    {
      items: [
        { label: "Text", icon: "title-icon.svg", type: "text" },
        { label: "Image", icon: "add-image.svg", type: "image" },
        { label: "Video", icon: "add-video.svg", type: "video" },
      ],
      showLine: true
    },
    {
      items: [
        { label: "Short text", icon: "short-text.svg", type: "short_text" },
        { label: "Long text", icon: "long-text.svg", type: "long_text" },
      ],
      showLine: true
    },
    {
      items: [
        { label: "Radio button", icon: "radio-filled.svg", type: "radio" },
        { label: "Checkbox", icon: "checkbox-outlined.svg", type: "checkbox" },
        { label: "Dropdown", icon: "dropdown-outlined.svg", type: "dropdown" },
      ],
      showLine: true
    },
    {
      items: [
        { label: "Upload file", icon: "upload.svg", type: "file" },
        { label: "Linear scale", icon: "linear-scale.svg", type: "scale" },
        { label: "Rating", icon: "rating-filled.svg", type: "rating" },
        { label: "Date", icon: "calendar.svg", type: "date" },
      ]
    }
  ];

  if (!isActive) return null;

  return (
    <div className="absolute left-0 top-0 w-[271px] h-[628px] bg-rice rounded-[35px] shadow-[0px_4px_15px_rgba(0,0,0,0.15)] border border-mahogany/5 flex flex-col z-50 animate-slide-in-right overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 px-6 pt-8 pb-4 flex flex-col overflow-y-auto custom-scrollbar">
            {groups.map((group, gIdx) => (
                <div key={gIdx} className="flex flex-col">
                    <div className="flex flex-col gap-1">
                        {group.items.map((item, iIdx) => (
                            <div 
                                key={iIdx} 
                                onClick={() => onAddQuestion(item)}
                                className="flex items-center gap-4 py-2 px-2 hover:bg-vanilla/50 rounded-xl cursor-pointer transition-all group active:scale-95"
                            >
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    <img 
                                        src={`/assets/icons/cms-form/type-collection/${item.icon}`} 
                                        alt="" 
                                        className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" 
                                    />
                                </div>
                                <span className="text-[18px] font-medium text-mahogany/90 group-hover:text-mahogany transition-colors">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    {group.showLine && (
                        <div className="my-3 h-px bg-mahogany/10 w-[80%] mx-auto"></div>
                    )}
                </div>
            ))}
        </div>
        
        {/* Footer (Fixed at bottom) */}
        <div className="h-[39px] bg-mahogany shrink-0 w-full"></div>
    </div>
  );
}