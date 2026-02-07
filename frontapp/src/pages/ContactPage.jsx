import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Toast from "@/components/Toast.jsx";

export default function ContactPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ show: true, message: "Your message has been sent to Arphatra!", type: "success" });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      setToast({ show: true, message: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-rice min-h-screen font-poppins text-mahogany flex flex-col">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 md:py-8 bg-transparent shrink-0">
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/")}>
          <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra Logo" className="w-24 md:w-32 h-auto" />
        </div>
        <a href="/cms/login" className="bg-mahogany text-rice px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">Sign In</a>
      </nav>

      <main className="flex-1 px-6 md:px-16 py-12 md:py-20 flex flex-col items-center">
        <div className="w-full max-w-4xl animate-fade-in">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-mahogany/60 hover:text-mahogany mb-8 transition-colors group border-none bg-transparent cursor-pointer font-bold"
          >
            <img src="/assets/icons/cms-form/thick-back-arrow.svg" alt="" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-12 items-start">
            <div className="space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">Get in touch with us</h1>
                <p className="text-tobacco text-lg font-medium">
                    Have questions about Arphatra? We're here to help you build better forms.
                </p>
                
                <div className="space-y-6 pt-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-vanilla rounded-xl flex items-center justify-center shrink-0 border border-mahogany/5">
                            <img src="/assets/icons/homepage/mic.svg" alt="" className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-mahogany">Email Us</p>
                            <p className="text-tobacco font-medium">arphatraform@gmail.com</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-vanilla rounded-xl flex items-center justify-center shrink-0 border border-mahogany/5">
                            <img src="/assets/icons/navbar/settings.svg" alt="" className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-mahogany">Our Office</p>
                            <p className="text-tobacco font-medium">Depok, Indonesia</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-vanilla/50 p-8 md:p-10 rounded-[40px] border-2 border-mahogany/5">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-mahogany/60 ml-4 uppercase tracking-widest">Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required 
                                className="w-full px-6 py-4 bg-rice border-2 border-mahogany/10 rounded-2xl outline-none focus:border-mahogany transition-all font-medium" 
                                placeholder="Your name" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-mahogany/60 ml-4 uppercase tracking-widest">Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required 
                                className="w-full px-6 py-4 bg-rice border-2 border-mahogany/10 rounded-2xl outline-none focus:border-mahogany transition-all font-medium" 
                                placeholder="Your email" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-mahogany/60 ml-4 uppercase tracking-widest">Subject</label>
                        <input 
                            type="text" 
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required 
                            className="w-full px-6 py-4 bg-rice border-2 border-mahogany/10 rounded-2xl outline-none focus:border-mahogany transition-all font-medium" 
                            placeholder="How can we help?" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-mahogany/60 ml-4 uppercase tracking-widest">Message</label>
                        <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required 
                            className="w-full px-6 py-4 bg-rice border-2 border-mahogany/10 rounded-2xl outline-none focus:border-mahogany transition-all font-medium min-h-[150px] resize-none" 
                            placeholder="Your message here..."
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-mahogany text-rice rounded-2xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
