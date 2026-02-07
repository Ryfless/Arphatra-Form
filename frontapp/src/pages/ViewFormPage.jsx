import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionCard from "@/components/cms/QuestionCard.jsx";
import { apiRequest } from "@/lib/api.js";
import Toast from "@/components/Toast.jsx";
import ImagePreviewModal from "@/components/ImagePreviewModal.jsx";
import DatePickerModal from "@/components/DatePickerModal.jsx";
import { useLanguage } from "@/lib/i18n.jsx";

export default function ViewFormPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formResetKey, setFormResetKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Image Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Date Picker State
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeDateQuestionId, setActiveDateQuestionId] = useState(null);

  const [theme, setTheme] = useState({ backgroundColor: "var(--color-mountain)", cardColor: "var(--color-rice)", accentColor: "var(--color-mahogany)", bannerImage: "/assets/images/default-banner.png" });
  const [formData, setFormData] = useState({ title: "", description: "", bannerImage: "/assets/images/default-banner.png" });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState([]); // Track validation errors

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(0);

  // Pecah pertanyaan ke dalam halaman-halaman berdasarkan tipe 'section'
  const pages = useMemo(() => {
    const p = [];
    let currentPageItems = [];

    questions.forEach((q, idx) => {
        if (q.type === 'section' && idx !== 0) {
            p.push(currentPageItems);
            currentPageItems = [q];
        } else {
            currentPageItems.push(q);
        }
    });
    p.push(currentPageItems);
    return p;
  }, [questions]);

  useEffect(() => {
    const fetchForm = async () => {
        try {
            setIsLoading(true);
            const response = await apiRequest(`/forms/${formId}`);
            const data = response.data;
            setFormData({ title: data.title, description: data.description, bannerImage: data.bannerImage || "/assets/images/default-banner.png" });
            setTheme(data.theme);
            setQuestions(data.questions);
        } catch (error) {
            setToast({ show: true, message: t("form_not_found"), type: "error" });
        } finally {
            setIsLoading(false);
        }
    };
    fetchForm();
  }, [formId, t]);

  const handleChangeResponse = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // Clear error for this question when user answers
    setErrors(prev => prev.filter(id => id !== questionId));
  };

  const validatePage = (pageIdx) => {
    const pageQuestions = pages[pageIdx] || [];
    const missing = pageQuestions.filter(q => {
        if (!q.required || ['section', 'text', 'image', 'video'].includes(q.type)) return false;
        const ans = answers[q.id];
        return ans === undefined || ans === null || ans === "" || (Array.isArray(ans) && ans.length === 0);
    });
    return missing;
  };

  const handleNext = () => {
    const missing = validatePage(currentPage);
    if (missing.length > 0) {
        setErrors(missing.map(q => q.id));
        setToast({ show: true, message: t("submit_required_alert"), type: "error" });
        return;
    }
    setErrors([]);
    setCurrentPage(prev => Math.min(prev + 1, pages.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setErrors([]);
    setCurrentPage(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    setFormResetKey(k => k + 1); 
    setAnswers({}); 
    setErrors([]);
    setCurrentPage(0);
    setToast({ show: true, message: t("form_cleared_msg"), type: "info" });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const missing = validatePage(currentPage);
    if (missing.length > 0) {
        setErrors(missing.map(q => q.id));
        setToast({ show: true, message: t("submit_required_alert"), type: "error" });
        return;
    }

    try {
        await apiRequest(`/forms/${formId}/submit`, { method: "POST", body: JSON.stringify({ answers }) });
        setToast({ show: true, message: t("submit_success"), type: "success" });
        setTimeout(() => navigate("/"), 2000);
    } catch (error) {
        setToast({ show: true, message: t("submit_failed"), type: "error" });
    }
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-mountain font-bold text-mahogany animate-pulse">{t("loading_form")}</div>;

  const currentQuestions = pages[currentPage] || [];
  const isLastPage = currentPage === pages.length - 1;

  return (
    <div className="min-h-screen w-screen overflow-x-hidden flex flex-col font-poppins relative transition-colors duration-500" style={{ backgroundColor: theme.backgroundColor }}>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      
      <ImagePreviewModal
        open={isPreviewOpen}
        image={formData.bannerImage}
        onCancel={() => setIsPreviewOpen(false)}
      />

      <DatePickerModal 
        open={datePickerOpen}
        value={activeDateQuestionId ? answers[activeDateQuestionId] : ""}
        onClose={() => setDatePickerOpen(false)}
        onSelect={(date) => {
            if (activeDateQuestionId) {
                handleChangeResponse(activeDateQuestionId, date);
            }
        }}
      />

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-6 md:pt-10 pb-2 gap-5 relative px-4 md:px-0">
          
          {/* Banner (Hanya di halaman pertama) */}
          {currentPage === 0 && (
            <div className="relative w-full max-w-[1000px] flex justify-center animate-fade-in">
                <div 
                    onClick={() => setIsPreviewOpen(true)}
                    className="w-full h-[150px] md:h-[250px] rounded-[25px] md:rounded-[35px] overflow-hidden shrink-0 shadow-sm border-2 md:border-4 border-white/20 cursor-zoom-in group relative"
                >
                    <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <img src="/assets/icons/navbar/eye.svg" alt="" className="w-8 h-8 invert opacity-70" />
                    </div>
                </div>
            </div>
          )}

          {/* Header Card (Hanya di halaman pertama) */}
          {currentPage === 0 && (
            <div className="relative w-full max-w-[1000px] flex justify-center animate-fade-in">
                <div className="w-full rounded-[25px] md:rounded-[35px] shadow-sm flex flex-col shrink-0 overflow-hidden" style={{ backgroundColor: theme.cardColor }}>
                    <div className="h-[12px] md:h-[20px] w-full shrink-0" style={{ backgroundColor: theme.accentColor }}></div>
                    <div className="p-6 md:p-10 flex flex-col gap-3 md:gap-4">
                        <h1 className="text-[24px] md:text-[36px] font-bold text-mahogany mb-1 md:mb-2">{formData.title || "Untitled Form"}</h1>
                        <p className="text-[16px] md:text-[20px] font-medium text-mahogany leading-normal">{formData.description}</p>
                    </div>
                </div>
            </div>
          )}

          {/* Questions List for Current Page */}
          <div className="w-full flex flex-col items-center gap-5 md:gap-6 animate-slide-in-right">
            {currentQuestions.map((q) => (
                <QuestionCard 
                    key={q.id}
                    question={q}
                    theme={theme}
                    isActive={false}
                    isPreview={true}
                    value={answers[q.id]}
                    hasError={errors.includes(q.id)}
                    onChangeResponse={handleChangeResponse}
                    onDateClick={(id) => {
                        setActiveDateQuestionId(id);
                        setDatePickerOpen(true);
                    }}
                />
            ))}
          </div>

          {/* Pagination Actions */}
          <div className="w-full max-w-[1000px] flex justify-between items-center mt-8 md:mt-12 mb-20 px-4 md:px-0">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
                {currentPage > 0 && (
                    <button onClick={handleBack} className="border-2 border-mahogany/20 text-mahogany px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-mahogany/5 transition-all text-sm md:text-base w-full md:w-auto">{t("back")}</button>
                )}
                <button onClick={handleClear} className="text-mahogany/40 font-bold hover:text-mahogany px-2 md:px-4 py-2 text-sm md:text-base">{t("clear_form")}</button>
              </div>

              {isLastPage ? (
                <button onClick={handleSubmit} className="bg-mahogany text-rice px-6 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-[20px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 md:gap-3">
                    <span>{t("submit")}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-6 md:h-6"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ) : (
                <button onClick={handleNext} className="bg-mahogany text-rice px-6 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-[20px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 md:gap-3">
                    <span>{t("next")}</span>
                    <img src="/assets/icons/cms-form/thick-next-arrow.svg" alt="" className="w-4 h-4 md:w-5 md:h-5 invert" />
                </button>
              )}
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-col items-center gap-2 mb-10 opacity-40">
              <span className="text-[10px] md:text-[12px] font-bold text-mahogany uppercase tracking-widest">{t("page_of").replace("{current}", currentPage + 1).replace("{total}", pages.length)}</span>
              <div className="flex gap-1.5 md:gap-2">
                  {pages.map((_, i) => (
                      <div key={i} className={`h-1 md:h-1.5 rounded-full transition-all ${i === currentPage ? 'w-6 md:w-8 bg-mahogany' : 'w-1.5 md:w-2 bg-mahogany/20'}`}></div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
          