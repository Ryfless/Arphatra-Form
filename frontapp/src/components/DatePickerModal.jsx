import { useState, useEffect, useMemo } from "react";

export default function DatePickerModal({ open, value, onClose, onSelect }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("days"); // "days", "months", "years"
  
  useEffect(() => {
    if (open) {
      if (value) {
        const [y, m, d] = value.split('-').map(Number);
        setViewDate(new Date(y, m - 1, d));
      } else {
        setViewDate(new Date());
      }
      setViewMode("days");
    }
  }, [open, value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Calendar Logic for Days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(formattedDate);
    onClose();
  };

  const handleMonthSelect = (mIdx) => {
    setViewDate(new Date(year, mIdx, 1));
    setViewMode("days");
  };

  const handleYearSelect = (y) => {
    setViewDate(new Date(y, month, 1));
    setViewMode("months");
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const endYear = currentYear + 20;
    const arr = [];
    for (let i = endYear; i >= startYear; i--) arr.push(i);
    return arr;
  }, []);

  if (!open) return null;

  return (
    <div 
        className="fixed inset-0 z-[15000] flex items-center justify-center p-4 bg-mahogany/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-rice rounded-[40px] p-8 shadow-2xl border-2 border-mahogany/10 w-full max-w-[400px] animate-reveal-form flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
            <button 
                onClick={() => viewMode === "days" ? handlePrevMonth() : null} 
                className={`p-2 hover:bg-vanilla rounded-full transition-colors ${viewMode !== "days" ? 'opacity-0 pointer-events-none' : ''}`}
            >
                <img src="/assets/icons/cms-form/thick-back-arrow.svg" alt="Prev" className="w-5 h-5 opacity-60" />
            </button>
            
            <div className="flex gap-2 font-bold text-mahogany text-[20px]">
                <button 
                    onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                    className="hover:bg-mahogany/5 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                    {months[month]}
                </button>
                <button 
                    onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
                    className="hover:bg-mahogany/5 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                    {year}
                </button>
            </div>

            <button 
                onClick={() => viewMode === "days" ? handleNextMonth() : null} 
                className={`p-2 hover:bg-vanilla rounded-full transition-colors ${viewMode !== "days" ? 'opacity-0 pointer-events-none' : ''}`}
            >
                <img src="/assets/icons/cms-form/thick-next-arrow.svg" alt="Next" className="w-5 h-5 opacity-60" />
            </button>
        </div>

        {/* Views */}
        <div className="min-h-[280px]">
            {viewMode === "days" && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-7 text-center mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                            <span key={d} className="text-[12px] font-bold text-tobacco/60 py-2">{d}</span>
                        ))}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSel = value === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            return (
                                <button 
                                    key={day} 
                                    onClick={() => handleDayClick(day)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-bold transition-all mx-auto mt-1 ${isSel ? 'bg-mahogany text-rice shadow-lg' : 'text-mahogany hover:bg-vanilla'}`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {viewMode === "months" && (
                <div className="grid grid-cols-3 gap-3 animate-fade-in">
                    {months.map((m, i) => (
                        <button 
                            key={m} 
                            onClick={() => handleMonthSelect(i)}
                            className={`py-4 rounded-2xl font-bold text-[16px] transition-all ${i === month ? 'bg-mahogany text-rice shadow-md' : 'text-mahogany hover:bg-vanilla border border-mahogany/5'}`}
                        >
                            {m.substring(0, 3)}
                        </button>
                    ))}
                </div>
            )}

            {viewMode === "years" && (
                <div className="grid grid-cols-3 gap-2 h-[280px] overflow-y-auto custom-scrollbar pr-2 animate-fade-in">
                    {years.map(y => (
                        <button 
                            key={y} 
                            onClick={() => handleYearSelect(y)}
                            className={`py-3 rounded-xl font-bold text-[16px] transition-all ${y === year ? 'bg-mahogany text-rice shadow-md' : 'text-mahogany hover:bg-vanilla border border-mahogany/5'}`}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <button 
            onClick={onClose}
            className="w-full py-3 bg-vanilla/50 text-mahogany rounded-2xl font-bold hover:bg-vanilla transition-all border-none cursor-pointer"
        >
            Cancel
        </button>
      </div>
    </div>
  );
}