import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/cms/Sidebar.jsx";
import CmsHeader from "@/components/cms/CmsHeader.jsx";
import QuestionCard from "@/components/cms/QuestionCard.jsx";
import AddOptionPanel from "@/components/cms/AddOptionPanel.jsx";
import Toast from "@/components/Toast.jsx";
import Popup from "@/components/Popup.jsx";
import ImageCropModal from "@/components/ImageCropModal.jsx";
import DatePickerModal from "@/components/DatePickerModal.jsx";
import { apiRequest } from "@/lib/api.js";
import { getToken } from "@/lib/storage.js";

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export default function CreateFormPage() {
  const { formId } = useParams();
  const [currentId, setCurrentId] = useState(formId);
  const [activeTab, setActiveTab] = useState("question"); 
  const [answerView, setAnswerView] = useState("summary");
  const [showSidebar, setShowSidebar] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);  
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [showPublishPopup, setShowPublishPopup] = useState(false);
  const [isDraggingUI, setIsDraggingUI] = useState(false);
  
  // Banner Crop State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedBanner, setSelectedImage] = useState(null);

  // Date Picker State
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeDateQuestionId, setActiveDateQuestionId] = useState(null);

  const [generatedLink, setGeneratedLink] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [previewPage, setPreviewPage] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState({}); 
  const [previewErrors, setPreviewErrors] = useState([]); // Track validation errors

  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isCurrentlySaving = useRef(false);
  const lastSwapTime = useRef(0);

  const [theme, setTheme] = useState({ backgroundColor: "var(--color-mountain)", cardColor: "var(--color-rice)", accentColor: "var(--color-mahogany)", bannerImage: "/assets/images/default-banner.png" });
  const [formData, setFormData] = useState({ name: "", title: "", description: "", bannerImage: "/assets/images/default-banner.png" });
  const [questions, setQuestions] = useState([]);
  
  const [activeQuestionId, setActiveQuestionId] = useState('header');
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [realResponses, setRealResponses] = useState({ total: 0, questions: [] });
  const [respondents, setRespondents] = useState([]);
  const [currentRespondentIndex, setCurrentRespondentIndex] = useState(0);
  const [selectedQuestionIdForView, setSelectedQuestionIdForView] = useState(null);

  const pages = useMemo(() => {
    const p = [];
    let currentPageItems = [];
    questions.forEach((q, idx) => {
        if (q.type === 'section' && idx !== 0) { p.push(currentPageItems); currentPageItems = [q]; } 
        else { currentPageItems.push(q); }
    });
    p.push(currentPageItems);
    return p;
  }, [questions]);

  const handleFileUpload = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    const token = getToken();
    try {
        const response = await fetch("http://localhost:5000/api/upload", { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formDataObj });
        const data = await response.json();
        return data.status === 'success' ? data.data.url : null;
    } catch (error) { setToast({ show: true, message: "Upload failed", type: "error" }); return null; }
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast({ show: true, message: "Please upload an image file", type: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleConfirmBannerCrop = async (blob) => {
    setCropModalOpen(false);
    setIsUploadingBanner(true);
    try {
      const url = await handleFileUpload(blob);
      if (url) handleUpdateTheme({ bannerImage: url });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  useEffect(() => {
    if (formId) {
        setCurrentId(formId);
        const fetchForm = async () => {
            try {
                const response = await apiRequest(`/api/forms/${formId}`);
                const data = response.data;
                setFormData({ name: data.name || "Form 1", title: data.title, description: data.description, bannerImage: data.bannerImage });
                setTheme(data.theme);
                setQuestions(data.questions);
                setGeneratedLink(`http://localhost:5174/form/view/${formId}`);
            } catch (error) { setToast({ show: true, message: "Failed to load", type: "error" }); }
        };
        fetchForm();
    }
  }, [formId]);

  const handleSave = async () => {
    if (isCurrentlySaving.current) return;
    isCurrentlySaving.current = true;
    setIsSaving(true);
    try {
        const body = { name: formData.name, title: formData.title, description: formData.description, theme, questions, bannerImage: theme.bannerImage };
        if (currentId) { await apiRequest(`/api/forms/${currentId}`, { method: "PUT", body: JSON.stringify(body) }); setToast({ show: true, message: "Saved!", type: "success" }); } 
        else {
            const res = await apiRequest("/api/forms", { method: "POST", body: JSON.stringify(body) });
            const newId = res.data.id;
            setCurrentId(newId);
            window.history.replaceState(null, "", `/form/edit/${newId}`);
            setGeneratedLink(`http://localhost:5174/form/view/${newId}`);
            setToast({ show: true, message: "Created!", type: "success" });
        }
    } catch (error) { setToast({ show: true, message: "Error", type: "error" }); } finally { setTimeout(() => { setIsSaving(false); isCurrentlySaving.current = false; }, 500); }
  };

  const handlePublish = async () => { if (isCurrentlySaving.current) return; setIsPublishing(true); try { await handleSave(); setShowPublishPopup(true); } catch (e) { setToast({ show: true, message: "Failed", type: "error" }); } finally { setIsPublishing(false); } };

  const [history, setHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const isUndoable = historyPointer > 0;
  const isRedoable = historyPointer < history.length - 1;
  const saveToHistory = useCallback((nt, nfd, nq) => { const snap = { theme: deepClone(nt), formData: deepClone(nfd), questions: deepClone(nq) }; setHistory(p => { const nh = p.slice(0, historyPointer + 1); return [...nh, snap]; }); setHistoryPointer(p => p + 1); }, [historyPointer]);
  
  const handleUpdateTheme = (nt) => { const next = { ...theme, ...nt }; setTheme(next); saveToHistory(next, formData, questions); };
  const handleAddQuestionAt = (idx, td) => { 
    // Default to short_text if td is not provided
    const targetData = td || { type: 'short_text', label: 'Short text', icon: 'short-text.svg' };
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1; 
    const isS = targetData.type === 'section'; 
    const newE = { 
        id: newId, 
        title: "", 
        description: "", 
        type: targetData.type, 
        typeLabel: targetData.label, 
        typeIcon: targetData.icon, 
        required: false, 
        options: isS ? undefined : [""] 
    }; 
    const nl = [...questions]; 
    nl.splice(idx + 1, 0, newE); 
    setQuestions(nl); 
    saveToHistory(theme, formData, nl); 
    setActiveQuestionId(newId); 
  };
  const handleUpdateQuestion = (id, ud) => setQuestions(p => p.map(q => q.id === id ? ud : q));
  const handleDeleteQuestion = (id) => { const nq = questions.filter(q => q.id !== id); setQuestions(nq); saveToHistory(theme, formData, nq); };
  const handleDuplicateQuestion = (id) => { const idx = questions.findIndex(q => q.id === id); const tc = questions[idx]; if (!tc) return; const nid = Math.max(...questions.map(q => q.id)) + 1; const nq = { ...tc, id: nid, title: `${tc.title} (Copy)` }; const nl = [...questions]; nl.splice(idx + 1, 0, nq); setQuestions(nl); saveToHistory(theme, formData, nl); setActiveQuestionId(nid); };
  const handleDragStart = (e, id) => { 
    if (isPreview) return; 
    setDraggedItemId(id); 
    setIsDraggingUI(true);
    e.dataTransfer.effectAllowed = "move"; 
  };

  const handleDragEnter = (e, tid) => { 
    if (isPreview || draggedItemId === null || draggedItemId === tid) return; 
    
    // Throttle swaps to prevent jitter (increased to 250ms)
    const now = Date.now();
    if (now - lastSwapTime.current < 250) return;
    lastSwapTime.current = now;

    const nq = [...questions]; 
    const di = nq.findIndex(q => q.id === draggedItemId); 
    const ti = nq.findIndex(q => q.id === tid); 
    if (di === -1 || ti === -1) return;

    const [item] = nq.splice(di, 1); 
    nq.splice(ti, 0, item); 
    setQuestions(nq); 
  };

  const handleDragEnd = () => { 
    setDraggedItemId(null); 
    setIsDraggingUI(false);
    saveToHistory(theme, formData, questions); 
  };
  
  const handleDragOver = (e) => {
    if (draggedItemId === null) return;
    e.preventDefault();
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const threshold = 100; // tighter zone for more control
    const mouseRelY = e.clientY - rect.top;
    
    // Smooth scrolling speed based on proximity to the edge
    if (mouseRelY < threshold) {
      const intensity = (threshold - mouseRelY) / threshold;
      container.scrollTop -= 15 * intensity;
    } else if (mouseRelY > rect.height - threshold) {
      const intensity = (mouseRelY - (rect.height - threshold)) / threshold;
      container.scrollTop += 15 * intensity;
    }
  };

  const handleClearForm = () => { 
    setFormResetKey(p => p + 1); 
    setPreviewPage(0); 
    setPreviewAnswers({}); 
    setPreviewErrors([]);
    setActiveQuestionId(null); 
  };

  const handleExportCSV = () => {
    if (respondents.length === 0) {
        setToast({ show: true, message: "No responses to export", type: "info" });
        return;
    }

    // 1. Prepare Headers (Timestamp + Question Titles)
    const activeQuestions = questions.filter(q => !['section', 'text', 'image', 'video'].includes(q.type));
    const headers = ["Submitted At", ...activeQuestions.map(q => q.title || "Untitled Question")];

    // 2. Prepare Rows
    const rows = respondents.map(res => {
        const rowData = [res.timestamp];
        activeQuestions.forEach(q => {
            let answer = res.answers[q.id];
            
            // Format complex answers (array, object, etc)
            if (Array.isArray(answer)) answer = answer.join("; ");
            if (answer === undefined || answer === null) answer = "";
            
            // Escape commas and quotes for CSV
            answer = `"${(answer.toString()).replace(/"/g, '""')}"`;
            rowData.push(answer);
        });
        return rowData.join(",");
    });

    // 3. Combine and Trigger Download
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${formData.name || 'form'}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ show: true, message: "CSV Exported successfully!", type: "success" });
  };

  // --- FETCH RESPONSES ---
  useEffect(() => {
    if (activeTab === 'answer' && currentId) {
        const fetchResponses = async () => {
            try {
                const response = await apiRequest(`/api/forms/${currentId}/responses`);
                const rawData = response.data;
                
                const summaryQuestions = questions.map(q => {
                    if (['section', 'text', 'image', 'video'].includes(q.type)) return null;
                    const data = [];
                    if (['radio', 'checkbox', 'dropdown'].includes(q.type)) {
                        const counts = {};
                        (q.options || []).forEach(opt => counts[opt] = 0);
                        rawData.forEach(res => {
                            const ans = res.answers[q.id];
                            if (Array.isArray(ans)) ans.forEach(a => counts[a] = (counts[a] || 0) + 1);
                            else if (ans) counts[ans] = (counts[ans] || 0) + 1;
                        });
                        const colors = ['#584738', '#AAA396', '#CEC1A8', '#E5DDD3', '#F5F2EF'];
                        Object.entries(counts).forEach(([label, count], i) => {
                            data.push({ label, count, color: colors[i % colors.length] });
                        });
                    } else if (['short_text', 'long_text'].includes(q.type)) {
                        rawData.forEach(res => { if (res.answers[q.id]) data.push(res.answers[q.id]); });
                    } else if (['rating', 'scale'].includes(q.type)) {
                        const counts = {};
                        const min = q.scaleConfig?.min || 1;
                        const max = q.scaleConfig?.max || (q.type === 'rating' ? q.ratingLevels || 5 : 5);
                        for (let i = min; i <= max; i++) counts[i] = 0;
                        rawData.forEach(res => { const val = res.answers[q.id]; if (val !== undefined) counts[val] = (counts[val] || 0) + 1; });
                        Object.entries(counts).forEach(([level, count]) => { data.push({ level, count }); });
                    } else if (q.type === 'date') {
                        const counts = {};
                        rawData.forEach(res => {
                            const val = res.answers[q.id];
                            if (val) counts[val] = (counts[val] || 0) + 1;
                        });
                        // Sort by date key
                        Object.entries(counts)
                            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                            .forEach(([date, count]) => {
                                // Robust date parsing
                                let label = date;
                                if (date.includes('-')) {
                                    const [y, m, d] = date.split('-');
                                    label = `${d}/${m}/${y.slice(-2)}`;
                                }
                                data.push({ label, count });
                            });
                    }
                    return { id: q.id, title: q.title, type: q.type, data };
                }).filter(Boolean);

                setRealResponses({ total: rawData.length, questions: summaryQuestions });
                setRespondents(rawData.map((r, i) => ({ id: r.id, email: `Respondent ${i + 1}`, timestamp: new Date(r.submittedAt).toLocaleString(), answers: r.answers })));
            } catch (error) { console.error("Failed to fetch responses", error); }
        };
        fetchResponses();
    }
  }, [activeTab, currentId, questions]);

  const validatePage = (pageIdx) => {
    const pageQuestions = pages[pageIdx] || [];
    const missing = pageQuestions.filter(q => {
        if (!q.required || ['section', 'text', 'image', 'video'].includes(q.type)) return false;
        const ans = previewAnswers[q.id];
        return ans === undefined || ans === null || ans === "" || (Array.isArray(ans) && ans.length === 0);
    });
    return missing;
  };

  const handleNextPage = () => {
    const missing = validatePage(previewPage);
    if (missing.length > 0) {
        setPreviewErrors(missing.map(q => q.id));
        setToast({ show: true, message: "Please answer all required questions.", type: "error" });
        return;
    }
    setPreviewErrors([]);
    setPreviewPage(prev => Math.min(prev + 1, pages.length - 1));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackPage = () => {
    setPreviewErrors([]);
    setPreviewPage(prev => Math.max(prev - 1, 0));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitPreview = () => {
    const missing = validatePage(previewPage);
    if (missing.length > 0) {
        setPreviewErrors(missing.map(q => q.id));
        setToast({ show: true, message: "Please answer all required questions.", type: "error" });
        return;
    }
    setPreviewErrors([]);
    setToast({ show: true, message: "Preview: Form submitted successfully!", type: "success" });
  };

  useEffect(() => {
    if (isPreview) return;
    const hasData = formData.name || formData.title || questions.length > 1 || (questions[0] && questions[0].title);
    if (hasData) setIsSaving(true);
    const timer = setTimeout(async () => {
        if (!hasData) { setIsSaving(false); return; }
        try {
            const body = { name: formData.name, title: formData.title, description: formData.description, theme, questions, bannerImage: theme.bannerImage };
            if (currentId) { await apiRequest(`/api/forms/${currentId}`, { method: "PUT", body: JSON.stringify(body) }); } 
            else if (isCurrentlySaving.current === false) { isCurrentlySaving.current = true; const res = await apiRequest("/api/forms", { method: "POST", body: JSON.stringify(body) }); const newId = res.data.id; setCurrentId(newId); window.history.replaceState(null, "", `/form/edit/${newId}`); setGeneratedLink(`${window.location.origin}/form/view/${newId}`); isCurrentlySaving.current = false; }
        } catch (err) { console.error(err); } finally { setTimeout(() => setIsSaving(false), 800); }
    }, 2500);
    return () => clearTimeout(timer);
  }, [formData, questions, theme, currentId, isPreview]);

  const currentQuestions = isPreview ? (pages[previewPage] || []) : questions;
  const isLastPage = previewPage === pages.length - 1;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-poppins relative transition-colors duration-500" style={{ backgroundColor: activeTab === 'question' ? theme.backgroundColor : 'var(--color-vanilla)' }}>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
            <CmsHeader 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onToggleSidebar={() => setShowSidebar(!showSidebar)} 
              onPreview={() => { 
                  setIsPreview(!isPreview); 
                  setPreviewPage(0); 
                  setPreviewAnswers({}); 
                  setPreviewErrors([]); // Clear errors when exiting/entering preview
                  setActiveQuestionId(null); 
              }} 
              isPreview={isPreview} 
       onUndo={() => { if(isUndoable) { const s = history[historyPointer-1]; setTheme(s.theme); setFormData(s.formData); setQuestions(s.questions); setHistoryPointer(historyPointer-1); } }} onRedo={() => { if(isRedoable) { const s = history[historyPointer+1]; setTheme(s.theme); setFormData(s.formData); setQuestions(s.questions); setHistoryPointer(historyPointer+1); } }} canUndo={isUndoable} canRedo={isRedoable} onPublish={handlePublish} isPublishing={isPublishing} onSave={handleSave} isSaving={isSaving} formName={formData.name} onNameChange={(val) => setFormData(p => ({...p, name: val}))} onNameBlur={() => saveToHistory(theme, formData, questions)} />

      {showPublishPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-rice rounded-[40px] p-12 w-[600px] shadow-2xl flex flex-col items-center gap-8 animate-reveal-form relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-2 bg-mahogany"></div><div className="w-32 h-32 bg-vanilla rounded-full flex items-center justify-center shadow-inner border-4 border-mahogany/5"><img src="/assets/icons/arphatra-form-1.svg" alt="Logo" className="w-20 h-auto" /></div><div className="flex flex-col items-center gap-2 text-center"><h2 className="text-[32px] font-bold text-mahogany leading-tight">Form Published!</h2><p className="text-tobacco text-[18px] max-w-[350px]">Your professional form is live and ready.</p></div><div className="w-full flex flex-col gap-2"><span className="text-mahogany font-bold text-[14px] uppercase ml-2">Share link</span><div className="flex items-center gap-3 bg-vanilla/50 p-4 rounded-2xl border-2 border-mahogany/10 group"><input type="text" readOnly value={generatedLink} className="bg-transparent border-none outline-none flex-1 text-mahogany font-medium" /><button onClick={() => { navigator.clipboard.writeText(generatedLink); setToast({ show: true, message: "Copied!", type: "success" }); }} className="bg-mahogany text-rice px-6 py-2 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-md">Copy</button></div></div><button onClick={() => setShowPublishPopup(false)} className="text-tobacco font-bold hover:text-mahogany">Close</button></div>
        </div>
      )}

      <main className="flex-1 flex relative overflow-hidden flex-col md:flex-row">
        {activeTab === 'question' ? (
            <>
                {(!isPreview && showSidebar) && (
                    <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:z-[60]">
                        <div className="absolute inset-0 bg-black/20 md:hidden" onClick={() => setShowSidebar(false)}></div>
                        <Sidebar onClose={() => setShowSidebar(false)} theme={theme} onUpdateTheme={handleUpdateTheme} />
                    </div>
                )}
                <div 
                    ref={scrollContainerRef} 
                    className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pt-6 md:pt-10 pb-32 md:pb-20 gap-5 md:gap-6 relative px-4 md:px-8 ${isDraggingUI ? 'scroll-auto' : 'scroll-smooth'}`} 
                    onClick={() => setActiveQuestionId(null)}
                    onDragOver={handleDragOver}
                >
                    <ImageCropModal 
                        open={cropModalOpen}
                        image={selectedBanner}
                        aspectRatio="4/1"
                        title="Adjust Header Image"
                        onCancel={() => setCropModalOpen(false)}
                        onConfirm={handleConfirmBannerCrop}
                    />
                    <DatePickerModal 
                        open={datePickerOpen}
                        value={activeDateQuestionId ? previewAnswers[activeDateQuestionId] : ""}
                        onClose={() => setDatePickerOpen(false)}
                        onSelect={(date) => {
                            if (activeDateQuestionId) {
                                setPreviewAnswers(p => ({...p, [activeDateQuestionId]: date}));
                                setPreviewErrors(prev => prev.filter(eid => eid !== activeDateQuestionId));
                            }
                        }}
                    />
                    {(!isPreview || previewPage === 0) && (
                        <>
                            <div className="relative w-full max-w-[1000px] flex justify-center animate-fade-in">
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleBannerSelect} />
                                <div className={`w-full h-[150px] md:h-[250px] rounded-[25px] md:rounded-[35px] overflow-hidden shrink-0 shadow-sm relative transition-all duration-500 ${!isPreview ? 'group cursor-pointer border-2 md:border-4 border-white/20 hover:border-white' : ''} ${isUploadingBanner ? 'blur-xl animate-pulse scale-95' : ''}`} style={{ backgroundColor: theme.accentColor }} onClick={(e) => { if (isPreview) return; e.stopPropagation(); fileInputRef.current.click(); }}>
                                    <img src={theme.bannerImage} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    {!isPreview && <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"><div className="bg-rice text-mahogany px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-2xl active:scale-95 transition-all flex items-center gap-2 md:gap-3 text-xs md:text-base"><img src="/assets/icons/cms-form/type-collection/add-image.svg" alt="" className="w-4 h-4 md:w-6 md:h-6" /><span>Change Header</span></div></div>}
                                </div>
                            </div>
                            <div className="relative w-full max-w-[1000px] flex justify-center animate-fade-in">
                                <div onClick={(e) => { if (isPreview) return; e.stopPropagation(); setActiveQuestionId('header'); }} className={`w-full rounded-[25px] md:rounded-[35px] shadow-sm flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${!isPreview ? 'cursor-pointer hover:brightness-95' : ''} ${activeQuestionId === 'header' ? 'ring-2 ring-white/50 shadow-xl scale-[1.01]' : ''}`} style={{ backgroundColor: theme.cardColor }}>
                                    <div className="h-[12px] md:h-[20px] w-full shrink-0" style={{ backgroundColor: theme.accentColor }}></div>
                                    <div className="p-6 md:p-10 flex flex-col gap-3 md:gap-4 relative">
                                        {(activeQuestionId === 'header' && !isPreview) && <div className="absolute left-0 top-0 bottom-0 w-[15px] md:w-[27px]" style={{ backgroundColor: theme.accentColor }}></div>}
                                        <div className={(activeQuestionId === 'header' && !isPreview) ? 'pl-4 md:pl-8' : ''}>
                                            {isPreview ? <><h1 className="text-[24px] md:text-[36px] font-bold text-mahogany mb-1 md:mb-2">{formData.title || "Untitled Form"}</h1><p className="text-[16px] md:text-[20px] font-medium text-mahogany leading-normal">{formData.description}</p></> : <><input type="text" className="text-[24px] md:text-[36px] font-bold text-mahogany bg-transparent border-b border-transparent focus:border-mahogany outline-none w-full mb-1 md:mb-2" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Form Title" /><textarea className="text-[16px] md:text-[20px] font-medium text-mahogany bg-transparent border-b border-transparent focus:border-mahogany outline-none resize-none w-full h-auto min-h-[40px] md:min-h-[60px] leading-normal" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Form Description" /></>}
                                        </div>
                                    </div>
                                </div>
                                {(!isPreview && activeQuestionId === 'header') && <div className="hidden lg:block absolute left-[calc(100%+32px)] top-0"><AddOptionPanel isActive={true} onAddQuestion={handleAddQuestionAt} /></div>}
                            </div>
                        </>
                    )}

                    <div className={`w-full flex flex-col items-center gap-6 ${isPreview ? 'animate-slide-in-right' : ''}`}>
                        {currentQuestions.map((q, index) => (
                            <div key={q.id} className="w-full flex flex-col items-center gap-6">
                                <QuestionCard 
                                    question={q} 
                                    theme={theme} 
                                    isActive={!isPreview && activeQuestionId === q.id} 
                                    isPreview={isPreview} 
                                    isDragging={draggedItemId === q.id} 
                                    hasError={previewErrors.includes(q.id)} // Pass error state
                                    onClick={(e) => { if (isPreview) return; e.stopPropagation(); setActiveQuestionId(q.id); }} 
                                    onUpdate={handleUpdateQuestion} 
                                    onDelete={handleDeleteQuestion} 
                                    onDuplicate={handleDuplicateQuestion} 
                                    onAddQuestion={(type) => handleAddQuestionAt(index, type)} 
                                    onDragStart={handleDragStart} 
                                    onDragEnter={handleDragEnter} 
                                    onDragEnd={handleDragEnd} 
                                    value={previewAnswers[q.id]}
                                    onChangeResponse={(id, val) => {
                                        setPreviewAnswers(p => ({...p, [id]: val}));
                                        // Clear error for this specific question as user provides input
                                        setPreviewErrors(prev => prev.filter(eid => eid !== id));
                                    }}
                                    onDateClick={(id) => {
                                        setActiveDateQuestionId(id);
                                        setDatePickerOpen(true);
                                    }}
                                />
                                {(!isPreview && index !== questions.length - 1 && questions[index + 1].type === 'section') && (
                                    <div 
                                        className="w-full max-w-[1000px] h-[60px] rounded-[20px] border-2 border-dashed border-white/20 flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-white/40 transition-all group/quickadd my-4"
                                        onClick={(e) => { e.stopPropagation(); handleAddQuestionAt(index); }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/quickadd:scale-110 transition-transform">
                                            <img src="/assets/icons/cms-form/add.svg" alt="" className="w-4 h-4 invert" />
                                        </div>
                                        <span className="text-white/60 font-bold group-hover/quickadd:text-white">Add question to this section</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isPreview ? (
                        <div className="w-full max-w-[1000px] flex flex-col items-center gap-8 md:gap-12 mt-8 md:mt-12 mb-20 px-4 md:px-0">
                            <div className="w-full flex justify-between items-center gap-2">
                                <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
                                    {previewPage > 0 && <button onClick={handleBackPage} className="border-2 border-mahogany/20 text-mahogany px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-mahogany/5 transition-all text-sm md:text-base w-full md:w-auto">Back</button>}
                                    <button onClick={handleClearForm} className="text-mahogany/40 font-bold hover:text-mahogany px-2 md:px-4 py-2 text-sm md:text-base">Clear Form</button>
                                </div>
                                {isLastPage ? (
                                    <button onClick={handleSubmitPreview} className="bg-mahogany text-rice px-6 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-[20px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 md:gap-3">
                                        <span>Submit</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-6 md:h-6"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                ) : (
                                    <button onClick={handleNextPage} className="bg-mahogany text-rice px-6 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-[20px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 md:gap-3">
                                        <span>Next</span>
                                        <img src="/assets/icons/cms-form/thick-next-arrow.svg" alt="" className="w-4 h-4 md:w-5 md:h-5 invert" />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col items-center gap-2 opacity-40">
                                <span className="text-[10px] md:text-[12px] font-bold text-mahogany uppercase tracking-widest">Page {previewPage + 1} of {pages.length}</span>
                                <div className="flex gap-1.5 md:gap-2">{pages.map((_, i) => (<div key={i} className={`h-1 md:h-1.5 rounded-full transition-all ${i === previewPage ? 'w-6 md:w-8 bg-mahogany' : 'w-1.5 md:w-2 bg-mahogany/20'}`}></div>))}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full max-w-[1000px] flex justify-center mt-4"><div className="w-full h-[250px] relative shrink-0 group"><div className="absolute inset-0 border-4 border-white/30 rounded-[35px] pointer-events-none group-hover:border-white/40 transition-colors"></div><div className="absolute inset-0 flex items-center justify-center gap-24"><button onClick={(e) => { e.stopPropagation(); handleAddQuestionAt(questions.length - 1, {type: 'short_text', label: 'Short text', icon: 'short-text.svg'}); }} className="flex flex-col items-center gap-4 group/btn cursor-pointer transition-all active:scale-95" ><div className="w-[110px] h-[110px] rounded-[30px] border-[5px] border-white/60 flex items-center justify-center bg-transparent group-hover/btn:bg-white/10 group-hover/btn:border-white group-hover/btn:scale-110 transition-all duration-300 shadow-lg"><img src="/assets/icons/cms-form/add.svg" alt="" className="w-12 h-12 invert opacity-60 group-hover/btn:opacity-100" /></div><span className="text-[24px] font-bold text-white/60 group-hover/btn:text-white transition-all">Add a question</span></button><button onClick={(e) => { e.stopPropagation(); handleAddQuestionAt(questions.length - 1, {type: 'section', label: 'Section', icon: 'section.svg'}); }} className="flex flex-col items-center gap-4 group/btn cursor-pointer transition-all active:scale-95" ><div className="w-[110px] h-[110px] rounded-[30px] border-[5px] border-white/60 flex items-center justify-center bg-transparent group-hover/btn:bg-white/10 group-hover/btn:border-white group-hover/btn:scale-110 transition-all duration-300 shadow-lg"><img src="/assets/icons/cms-form/section.svg" alt="" className="w-12 h-12 invert opacity-60 group-hover/btn:opacity-100" /></div><span className="text-[24px] font-bold text-white/60 group-hover/btn:text-white transition-all">Add section</span></button></div></div></div>
                    )}
                </div>
            </>
        ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center py-12 gap-8 bg-vanilla animate-fade-in">
                <div className="w-full max-w-[1000px] flex flex-col gap-8 pb-40">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end"><div className="flex flex-col gap-1"><h1 className="text-[44px] font-bold text-mahogany">{realResponses.total} Responses</h1><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><p className="text-tobacco text-[18px]">Accepting responses</p></div></div><div className="flex gap-4"><button onClick={handleExportCSV} className="bg-white border border-mahogany/20 px-6 py-2.5 rounded-xl font-bold text-mahogany hover:bg-mahogany/5 transition-all flex items-center gap-2 shadow-sm cursor-pointer"><img src="/assets/icons/front-apps/spreadsheet.svg" alt="" className="w-5 h-5" /><span>Export</span></button></div></div>
                        <div className="flex gap-8 border-b border-mahogany/10 pb-1">{['summary', 'question', 'individual'].map((tab) => (<button key={tab} onClick={() => setAnswerView(tab)} className={`text-[18px] font-bold pb-2 transition-all capitalize ${answerView === tab ? 'text-mahogany border-b-4 border-mahogany' : 'text-tobacco hover:text-mahogany'}`}>{tab}</button>))}</div>
                    </div>
                    {answerView === 'summary' && realResponses.questions.map((res, idx) => (
                        <div key={res.id} className="w-full bg-rice rounded-[40px] p-10 flex flex-col gap-8 shadow-sm border border-mahogany/5 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="flex flex-col gap-1 border-b border-mahogany/10 pb-4"><span className="text-tobacco font-bold text-[14px] uppercase tracking-widest">Question {idx + 1}</span><h3 className="text-[24px] font-bold text-mahogany">{res.title}</h3></div>
                            {(res.type === 'radio' || res.type === 'dropdown') && (<div className="flex items-center gap-20"><div className="w-48 h-48 rounded-full relative" style={{ background: `conic-gradient(#584738 0% 60%, #AAA396 60% 85%, #CEC1A8 85% 100%)` }}><div className="absolute inset-8 bg-rice rounded-full shadow-inner flex items-center justify-center flex-col"><span className="text-[24px] font-bold text-mahogany">100%</span></div></div><div className="flex flex-col gap-4 flex-1">{res.data.map((item, i) => (<div key={i} className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div><span className="text-[18px] font-medium text-mahogany">{item.label}</span></div><span className="text-tobacco font-bold">{item.count} responses</span></div>))}</div></div>)}
                            {res.type === 'checkbox' && (<div className="flex flex-col gap-6 w-full">{res.data.map((item, i) => { const percentage = (item.count / (realResponses.total || 1)) * 100; return (<div key={i} className="flex flex-col gap-2"><div className="flex justify-between items-center text-[16px] font-medium text-mahogany"><span>{item.label}</span><span>{item.count} responses</span></div><div className="w-full h-4 bg-vanilla rounded-full overflow-hidden"><div className="h-full bg-mahogany rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div></div></div>); })}</div>)}
                            {(res.type === 'rating' || res.type === 'scale') && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-end justify-between h-48 w-full px-4 md:px-10 gap-2 md:gap-4 border-b border-mahogany/10 pb-2">
                                        {(() => {
                                            const maxRes = Math.max(...res.data.map(d => d.count)) || 1;
                                            return res.data.map((item, i) => {
                                                const height = (item.count / maxRes) * 100;
                                                return (
                                                    <div key={i} className="flex flex-col items-center h-full justify-end flex-1 min-w-[30px] relative">
                                                        <span className="text-[12px] font-bold text-tobacco mb-2">{item.count}</span>
                                                        <div 
                                                            className="w-full max-w-[40px] bg-mahogany rounded-t-lg transition-all duration-1000 hover:brightness-125 cursor-help relative group/bar" 
                                                            style={{ height: `calc(${height}% - 30px)` }}
                                                        >
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-mahogany text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-10">
                                                                {item.count} responses
                                                            </div>
                                                        </div>
                                                        <span className="text-[12px] md:text-[16px] font-bold text-mahogany mt-2">
                                                            {item.level}{res.type === 'rating' ? '★' : ''}
                                                        </span>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            )}
                            {res.type === 'date' && (
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-end justify-start h-64 w-full gap-4 border-b border-mahogany/10 pb-10 overflow-x-auto custom-scrollbar px-4">
                                        {(() => {
                                            const maxRes = Math.max(...res.data.map(d => d.count)) || 1;
                                            return res.data.map((item, i) => {
                                                // Calculate height relative to the 100% of the parent (excluding labels)
                                                const height = (item.count / maxRes) * 100;
                                                return (
                                                    <div key={i} className="flex flex-col items-center h-full justify-end min-w-[60px] relative">
                                                        <span className="text-[12px] font-bold text-tobacco mb-2">{item.count}</span>
                                                        <div 
                                                            className="w-8 bg-sand rounded-t-lg transition-all duration-1000 hover:bg-mahogany cursor-help relative group/bar" 
                                                            style={{ height: `calc(${height}% - 40px)` }}
                                                        >
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-mahogany text-rice text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-10">
                                                                {item.count} responses
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-[100%] pt-2 left-1/2">
                                                            <span className="text-[12px] font-bold text-mahogany rotate-45 origin-left whitespace-nowrap block">
                                                                {item.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                    <p className="text-xs text-tobacco italic mt-16 px-2">*Timeline view: Distribution of selected dates across all responses.</p>
                                </div>
                            )}
                            {['short_text', 'long_text', 'text'].includes(res.type) && (<div className="flex flex-col gap-3">{res.data && res.data.length > 0 ? res.data.map((text, i) => (<div key={i} className="p-4 bg-vanilla/30 rounded-2xl border border-mahogany/5 text-[18px] text-mahogany italic">"{text}"</div>)) : <p className="text-tobacco italic text-center py-10 opacity-40">No responses yet.</p>}</div>)}
                        </div>
                    ))}
                    {answerView === 'individual' && respondents.length > 0 && (<div className="w-full bg-rice rounded-[40px] p-10 flex flex-col gap-8 shadow-sm border border-mahogany/5 animate-fade-in"><div className="flex items-center justify-between border-b border-mahogany/10 pb-6"><div className="flex items-center gap-4"><button disabled={currentRespondentIndex === 0} onClick={() => setCurrentRespondentIndex(prev => prev - 1)} className={`p-2 rounded-full border border-mahogany/20 ${currentRespondentIndex === 0 ? 'opacity-30' : 'hover:bg-mahogany/5'}`}><img src="/assets/icons/cms-form/thick-back-arrow.svg" alt="Prev" className="w-6 h-6" /></button><div className="flex flex-col items-center"><select value={currentRespondentIndex} onChange={(e) => setCurrentRespondentIndex(parseInt(e.target.value))} className="bg-vanilla px-4 py-1.5 rounded-xl border border-mahogany/10 font-bold text-mahogany text-[18px] outline-none cursor-pointer hover:bg-white/50 transition-colors">{respondents.map((r, i) => (<option key={r.id} value={i}>Respondent {i + 1} ({r.email})</option>))}</select></div><button disabled={currentRespondentIndex === respondents.length - 1} onClick={() => setCurrentRespondentIndex(prev => prev + 1)} className={`p-2 rounded-full border border-mahogany/20 ${currentRespondentIndex === respondents.length - 1 ? 'opacity-30' : 'hover:bg-mahogany/5'}`}><img src="/assets/icons/cms-form/thick-next-arrow.svg" alt="Next" className="w-6 h-6" /></button></div><span className="text-tobacco font-medium text-[16px]">{respondents[currentRespondentIndex].timestamp}</span></div><div className="flex flex-col gap-6">{questions.map((q) => { if(['section','text','image','video'].includes(q.type)) return null; return (<div key={q.id} className="p-6 bg-vanilla/30 rounded-2xl border border-mahogany/10"><h4 className="text-[18px] font-bold text-mahogany mb-2">{q.title}</h4><p className="text-[20px] font-medium text-mahogany/80">{respondents[currentRespondentIndex].answers[q.id] || <span className="italic text-tobacco/50">No answer</span>}</p></div>) })}</div></div>)}
                    {answerView === 'question' && (
                        <div className="w-full flex flex-col gap-6 animate-fade-in">
                            {!selectedQuestionIdForView ? (
                                <div className="w-full bg-rice rounded-[40px] p-10 md:p-20 flex flex-col items-center justify-center text-center gap-6 shadow-sm border border-mahogany/5">
                                    <h2 className="text-[24px] md:text-[28px] font-bold text-mahogany">Question View</h2>
                                    <p className="text-tobacco/60 text-[16px] md:text-[18px]">Select a question to see all responses.</p>
                                    <div className="grid grid-cols-1 gap-4 w-full mt-4">
                                        {questions.map((q, idx) => { 
                                            if(['section','text','image','video'].includes(q.type)) return null; 
                                            return (
                                                <div 
                                                    key={q.id} 
                                                    onClick={() => setSelectedQuestionIdForView(q.id)}
                                                    className="p-4 md:p-6 bg-vanilla/50 rounded-2xl border-2 border-mahogany/10 text-left hover:bg-vanilla hover:border-mahogany/30 cursor-pointer transition-all active:scale-[0.98] group flex justify-between items-center"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-mahogany bg-mahogany/5 w-8 h-8 rounded-lg flex items-center justify-center">{idx + 1}</span> 
                                                        <span className="text-[16px] md:text-[18px] font-medium text-mahogany">{q.title || "Untitled Question"}</span>
                                                    </div>
                                                    <img src="/assets/icons/cms-form/thick-next-arrow.svg" alt="" className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full flex flex-col gap-6">
                                    {/* Back & Navigation Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-center bg-rice p-6 rounded-[30px] shadow-sm border border-mahogany/5 gap-4">
                                        <button 
                                            onClick={() => setSelectedQuestionIdForView(null)}
                                            className="flex items-center gap-2 text-mahogany font-bold hover:bg-mahogany/5 px-4 py-2 rounded-xl transition-all cursor-pointer"
                                        >
                                            <img src="/assets/icons/cms-form/thick-back-arrow.svg" alt="" className="w-4 h-4" />
                                            <span>Back to List</span>
                                        </button>
                                        
                                        <div className="flex items-center gap-4">
                                            {(() => {
                                                const validQs = questions.filter(q => !['section','text','image','video'].includes(q.type));
                                                const currentIdx = validQs.findIndex(q => q.id === selectedQuestionIdForView);
                                                return (
                                                    <>
                                                        <button 
                                                            disabled={currentIdx === 0}
                                                            onClick={() => setSelectedQuestionIdForView(validQs[currentIdx - 1].id)}
                                                            className="p-2 rounded-full border border-mahogany/10 hover:bg-mahogany/5 disabled:opacity-20 cursor-pointer transition-all"
                                                        >
                                                            <img src="/assets/icons/cms-form/thick-back-arrow.svg" alt="" className="w-5 h-5" />
                                                        </button>
                                                        <span className="font-bold text-mahogany whitespace-nowrap">Question {currentIdx + 1} of {validQs.length}</span>
                                                        <button 
                                                            disabled={currentIdx === validQs.length - 1}
                                                            onClick={() => setSelectedQuestionIdForView(validQs[currentIdx + 1].id)}
                                                            className="p-2 rounded-full border border-mahogany/10 hover:bg-mahogany/5 disabled:opacity-20 cursor-pointer transition-all"
                                                        >
                                                            <img src="/assets/icons/cms-form/thick-next-arrow.svg" alt="" className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Response List for Selected Question */}
                                    <div className="w-full bg-rice rounded-[40px] p-10 flex flex-col gap-8 shadow-sm border border-mahogany/5 animate-fade-in">
                                        <div className="flex flex-col gap-2 border-b border-mahogany/10 pb-6">
                                            <span className="text-tobacco font-bold text-[14px] uppercase tracking-widest">Responses for:</span>
                                            <h3 className="text-[24px] md:text-[28px] font-bold text-mahogany">
                                                {questions.find(q => q.id === selectedQuestionIdForView)?.title || "Untitled Question"}
                                            </h3>
                                        </div>
                                        
                                        <div className="flex flex-col gap-4">
                                            {(() => {
                                                const responses = respondents.map(r => r.answers[selectedQuestionIdForView]).filter(val => val !== undefined && val !== "" && (!Array.isArray(val) || val.length > 0));
                                                
                                                if (responses.length === 0) return <p className="text-center py-20 text-tobacco/40 italic font-medium">No responses yet for this question.</p>;
                                                
                                                return responses.map((ans, i) => (
                                                    <div key={i} className="p-6 bg-vanilla/30 rounded-2xl border border-mahogany/5 hover:bg-vanilla/50 transition-all">
                                                        <div className="flex gap-4 items-start">
                                                            <div className="w-8 h-8 rounded-full bg-mahogany/10 flex items-center justify-center shrink-0 text-[12px] font-bold text-mahogany">{i + 1}</div>
                                                            <div className="text-[18px] md:text-[20px] font-medium text-mahogany">
                                                                {Array.isArray(ans) ? ans.join(", ") : ans.toString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}