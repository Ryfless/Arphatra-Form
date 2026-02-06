import { useState, useRef, useEffect } from "react";
import AddOptionPanel from "./AddOptionPanel.jsx";
import QuestionCardContent from "./QuestionCardContent.jsx";

const QUESTION_TYPES = [
  { label: "Short text", icon: "short-text.svg", type: "short_text" },
  { label: "Long text", icon: "long-text.svg", type: "long_text" },
  { label: "Radio button", icon: "radio-filled.svg", type: "radio" },
  { label: "Checkbox", icon: "checkbox-outlined.svg", type: "checkbox" },
  { label: "Dropdown", icon: "dropdown-outlined.svg", type: "dropdown" },
  { label: "Upload file", icon: "upload.svg", type: "file" },
  { label: "Linear scale", icon: "linear-scale.svg", type: "scale" },
  { label: "Rating", icon: "rating-filled.svg", type: "rating" },
  { label: "Date", icon: "calendar.svg", type: "date" },
];

export default function QuestionCard({ 
  question, 
  isActive, 
  isPreview,
  theme,
  onClick, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  onAddQuestion,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  hasError, 
  onChangeResponse
}) {
  const [localTitle, setLocalTitle] = useState(question.title);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const dropdownRef = useRef(null);

  // DEBUG: Track error state
  useEffect(() => {
    if (hasError) console.log(`Question ID ${question.id} has validation error!`);
  }, [hasError]);

  const isSection = question.type === 'section';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTypeSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleChange = (e) => {
    setLocalTitle(e.target.value);
    onUpdate(question.id, { ...question, title: e.target.value });
  };

  const handleChangeType = (typeObj) => {
    onUpdate(question.id, { ...question, type: typeObj.type, typeLabel: typeObj.label, typeIcon: typeObj.icon });
    setIsTypeSelectorOpen(false);
  };

  return (
    <div 
        className={`relative w-full max-w-[1000px] flex justify-center group/card-wrapper transition-all duration-300 ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'} ${isActive ? 'z-30' : 'z-0'}`}
        draggable={!isPreview}
        onDragStart={(e) => onDragStart(e, question.id)}
        onDragEnter={(e) => onDragEnter(e, question.id)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
    >
      {/* INNER CARD - REMOVED overflow-hidden */}
      <div 
        onClick={onClick}
        className={`w-full rounded-[35px] shadow-sm flex flex-col relative shrink-0 transition-all duration-300 ${
          isActive 
            ? "h-auto p-10 ring-2 ring-white/50 shadow-xl scale-[1.01]" 
            : `h-auto p-10 ${!isPreview ? 'hover:brightness-95 cursor-pointer' : ''}`
        } ${hasError ? 'ring-4 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] border-red-500 animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={{ backgroundColor: theme.cardColor }}
      >
        <style>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `}</style>
        {/* DRAG HANDLE */}
        {(!isPreview && !isSection) && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing p-2 opacity-30 hover:opacity-80 transition-opacity z-10">
                <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-mahogany"></div><div className="w-1.5 h-1.5 rounded-full bg-mahogany"></div></div>
                <div className="flex gap-1 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-mahogany"></div><div className="w-1.5 h-1.5 rounded-full bg-mahogany"></div></div>
                <div className="flex gap-1 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-mahogany"></div><div className="w-1.5 h-1.5 rounded-full bg-mahogany"></div></div>
            </div>
        )}

        {/* Section Indicator Label (Improved corners for non-overflow parent) */}
        {isSection && (
            <div className={`absolute top-0 bg-mahogany text-rice px-6 py-1.5 rounded-br-2xl font-bold text-[14px] transition-all duration-300 z-10 ${isActive ? 'left-[27px] rounded-bl-none' : 'left-0 rounded-tl-[35px]'}`}>
                Section
            </div>
        )}

        {/* Active Indicator Bar */}
        {(isActive && !isPreview) && (
          <div className="absolute left-0 top-0 bottom-0 w-[27px] rounded-l-[35px]" style={{ backgroundColor: theme.accentColor }}></div>
        )}

        <div className={`flex flex-col gap-6 ${(isActive && !isPreview) ? 'pl-8' : ''}`}>
          <div className="flex justify-between items-start gap-4 pt-4">
              <div className="flex flex-col flex-1 gap-2">
                {isPreview ? (
                    <h2 className={`${isSection ? 'text-[28px]' : 'text-[32px]'} font-bold text-mahogany`}>
                        {localTitle} {question.required && <span className="text-red-500">*</span>}
                    </h2>
                ) : (
                    <>
                        {(!isSection && !['text', 'image', 'video'].includes(question.type)) && (
                            <input type="text" placeholder="Question" className="text-[36px] font-bold text-mahogany bg-transparent border-b border-transparent focus:border-mahogany outline-none w-full placeholder:text-mahogany/40" value={localTitle} onChange={handleTitleChange} />
                        )}
                        {(['text', 'image', 'video'].includes(question.type) || isSection) && (
                            <input type="text" placeholder={isSection ? "Section Title" : "Text Title"} className="text-[28px] font-bold text-mahogany bg-transparent border-b border-transparent focus:border-mahogany outline-none w-full placeholder:text-mahogany/40" value={localTitle} onChange={handleTitleChange} />
                        )}
                    </>
                )}
                
                {(isSection || question.type === 'text') && (
                    isPreview ? (
                        <p className="text-[18px] font-medium text-mahogany/80">{question.description}</p>
                    ) : (
                        <textarea placeholder="Description (Optional)" className="text-[18px] font-medium text-mahogany bg-transparent border-none outline-none resize-none w-full h-auto min-h-[40px] placeholder:text-mahogany/30" value={question.description || ""} onChange={(e) => onUpdate(question.id, { ...question, description: e.target.value })} />
                    )
                )}
              </div>
              
              {/* TYPE SELECTOR DROPDOWN (Z-INDEX 1000) */}
              {(isActive && !isSection && !isPreview) && (
                <div 
                    className="relative z-[1000]" 
                    ref={dropdownRef} 
                    onClick={(e) => e.stopPropagation()} 
                    onMouseDown={(e) => e.stopPropagation()} 
                    onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsTypeSelectorOpen(!isTypeSelectorOpen); }} className="flex items-center gap-3 border border-mahogany/20 rounded-lg px-4 py-2 cursor-pointer hover:bg-black/5 transition-colors bg-white/30 shrink-0 min-w-[200px] justify-between">
                        <div className="flex items-center gap-3">
                            <img src={`/assets/icons/cms-form/type-collection/${question.typeIcon || 'short-text.svg'}`} alt="" className="w-6 h-6 opacity-60" />
                            <span className="text-[20px] font-medium text-mahogany">{question.typeLabel || 'Short text'}</span>
                        </div>
                        <img src="/assets/icons/cms-form/thick-dropdown.svg" alt="" className={`w-4 h-4 opacity-40 transition-transform ${isTypeSelectorOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isTypeSelectorOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-rice border border-mahogany/10 rounded-2xl shadow-2xl z-[1001] py-2 animate-fade-in max-h-[400px] overflow-y-auto custom-scrollbar" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} >
                            {QUESTION_TYPES.map((typeObj) => (
                                <div key={typeObj.type} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleChangeType(typeObj); }} className={`flex items-center gap-4 px-4 py-3 hover:bg-vanilla transition-colors cursor-pointer ${question.type === typeObj.type ? 'bg-vanilla/50 font-bold' : ''}`}>
                                    <img src={`/assets/icons/cms-form/type-collection/${typeObj.icon}`} alt="" className="w-5 h-5 opacity-60" />
                                    <span className="text-[18px] font-medium text-mahogany">{typeObj.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              )}
          </div>

          <QuestionCardContent 
            question={question} 
            isActive={isActive && !isPreview} 
            isPreview={isPreview} 
            theme={theme} 
            onUpdate={onUpdate} 
            onChangeResponse={onChangeResponse}
          />

          {/* ERROR MESSAGE */}
          {hasError && (
            <div className="flex items-center gap-2 mt-4 animate-bounce text-red-600 font-bold text-[16px]">
                <img src="/assets/icons/cms-form/close-icon.svg" alt="" className="w-4 h-4 invert-[0.2] sepia-[1] saturate-[10000%] hue-rotate-[340deg]" />
                <span>This is a required question</span>
            </div>
          )}

          {/* Footer Actions */}
          {(isActive && !isPreview) && (
              <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-mahogany/10 animate-fade-in">
              <button onClick={(e) => { e.stopPropagation(); onDuplicate(question.id); }} className="opacity-60 hover:opacity-100 transition-opacity" title="Duplicate"><img src="/assets/icons/cms-form/copy.svg" alt="" className="w-6 h-6" /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(question.id); }} className="opacity-60 hover:opacity-100 hover:brightness-50 transition-all" title="Delete"><img src="/assets/icons/cms-form/trash-can.svg" alt="" className="w-6 h-6" /></button>
              
              {!isSection && !['text', 'image', 'video'].includes(question.type) && (
                <>
                    <div className="w-px h-8 bg-mahogany/20 mx-2"></div>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); onUpdate(question.id, { ...question, required: !question.required }); }}>
                        <span className="text-[20px] font-medium text-mahogany">Required</span>
                        <div className={`w-[44px] h-[26px] rounded-[5px] flex items-center px-1 transition-colors ${question.required ? '' : 'bg-[#e4e4e4]'}`} style={{ backgroundColor: question.required ? theme.accentColor : undefined }}>
                            <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-300 ${question.required ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </>
              )}
              <button className="opacity-60 hover:opacity-100 transition-opacity"><img src="/assets/icons/cms-form/more-vertical.svg" alt="" className="w-6 h-6" /></button>
              </div>
          )}
        </div>
      </div>

      {/* Option Panel */}
      {(isActive && !isPreview) && (
        <div className="absolute left-[calc(100%+32px)] top-0 z-50">
            <AddOptionPanel isActive={true} onAddQuestion={onAddQuestion} />
        </div>
      )}
    </div>
  );
}
