import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionCard from "@/components/cms/QuestionCard.jsx";
import { apiRequest } from "@/lib/api.js";
import Toast from "@/components/Toast.jsx";

export default function ViewFormPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formResetKey, setFormResetKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [theme, setTheme] = useState({ backgroundColor: "var(--color-mountain)", cardColor: "var(--color-rice)", accentColor: "var(--color-mahogany)", bannerImage: "/assets/images/default-banner.png" });
  const [formData, setFormData] = useState({ title: "", description: "", bannerImage: "/assets/images/default-banner.png" });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

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
            const response = await apiRequest(`/api/forms/${formId}`);
            const data = response.data;
            setFormData({ title: data.title, description: data.description, bannerImage: data.bannerImage || "/assets/images/default-banner.png" });
            setTheme(data.theme);
            setQuestions(data.questions);
        } catch (error) {
            setToast({ show: true, message: "Form not found", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };
    fetchForm();
  }, [formId]);

  const handleChangeResponse = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    // Validasi Required di halaman aktif bisa ditambahkan di sini
    setCurrentPage(prev => Math.min(prev + 1, pages.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await apiRequest(`/api/forms/${formId}/submit`, { method: "POST", body: JSON.stringify({ answers }) });
        setToast({ show: true, message: "Response submitted successfully!", type: "success" });
        setTimeout(() => navigate("/homepage"), 2000);
    } catch (error) {
        setToast({ show: true, message: "Failed to submit", type: "error" });
    }
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-mountain font-bold text-mahogany animate-pulse">Loading Form...</div>;

  const currentQuestions = pages[currentPage] || [];
  const isLastPage = currentPage === pages.length - 1;

  return (
    <div className="min-h-screen w-screen overflow-x-hidden flex flex-col font-poppins relative transition-colors duration-500" style={{ backgroundColor: theme.backgroundColor }}>
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      
      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-10 pb-40 gap-6 relative">
          
          {/* Banner (Hanya di halaman pertama) */}
          {currentPage === 0 && (
            <div className="relative w-full max-w-[1000px] flex justify-center animate-fade-in">
                <div className="w-full h-[250px] rounded-[35px] overflow-hidden shrink-0 shadow-sm border-4 border-white/20">
                    <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                </div>
            </div>
          )}

          {/* Header Card (Hanya di halaman pertama) */}
          {currentPage === 0 && (
            <div className="relative w-full max-w-[1000px] flex justify-center animate-fade-in">
                <div className="w-full rounded-[35px] shadow-sm flex flex-col shrink-0 overflow-hidden" style={{ backgroundColor: theme.cardColor }}>
                    <div className="h-[20px] w-full shrink-0" style={{ backgroundColor: theme.accentColor }}></div>
                    <div className="p-10 flex flex-col gap-4">
                        <h1 className="text-[36px] font-bold text-mahogany mb-2">{formData.title}</h1>
                        <p className="text-[20px] font-medium text-mahogany leading-normal">{formData.description}</p>
                    </div>
                </div>
            </div>
          )}

          {/* Questions List for Current Page */}
          <div className="w-full flex flex-col items-center gap-6 animate-slide-in-right">
            {currentQuestions.map((q) => (
                <QuestionCard 
                    key={`${q.id}-${formResetKey}`}
                    question={q}
                    theme={theme}
                    isActive={false}
                    isPreview={true}
                    onChangeResponse={handleChangeResponse}
                />
            ))}
          </div>

          {/* Pagination Actions */}
          <div className="w-full max-w-[1000px] flex justify-between items-center mt-12 mb-20 px-4 md:px-0">
              <div className="flex gap-4">
                {currentPage > 0 && (
                    <button onClick={handleBack} className="border-2 border-mahogany/20 text-mahogany px-8 py-3 rounded-2xl font-bold hover:bg-mahogany/5 transition-all">Back</button>
                )}
                <button onClick={() => { setFormResetKey(k => k+1); setAnswers({}); setCurrentPage(0); }} className="text-mahogany/40 font-bold hover:text-mahogany px-4 py-2">Clear Form</button>
              </div>

              {isLastPage ? (
                <button onClick={handleSubmit} className="bg-mahogany text-rice px-12 py-4 rounded-2xl font-bold text-[20px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <span>Submit</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              ) : (
                <button onClick={handleNext} className="bg-mahogany text-rice px-12 py-4 rounded-2xl font-bold text-[20px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <span>Next</span>
                    <img src="/assets/icons/cms-form/thick-next-arrow.svg" alt="" className="w-5 h-5 invert" />
                </button>
              )}
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-col items-center gap-2 mb-10 opacity-40">
              <span className="text-[12px] font-bold text-mahogany">Page {currentPage + 1} of {pages.length}</span>
              <div className="flex gap-2">
                  {pages.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentPage ? 'w-8 bg-mahogany' : 'w-2 bg-mahogany/20'}`}></div>
                  ))}
              </div>
          </div>
      </div>

      <div className="fixed bottom-0 w-full py-4 bg-black/5 backdrop-blur-md flex justify-center items-center gap-2 pointer-events-none">
          <span className="text-[14px] text-mahogany/60">Powered by</span>
          <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra" className="h-6 opacity-60" />
      </div>
    </div>
  );
}