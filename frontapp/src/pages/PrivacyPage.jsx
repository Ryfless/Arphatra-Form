import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-rice min-h-screen font-poppins text-mahogany flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 md:py-8 bg-transparent shrink-0">
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/")}>
          <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra Logo" className="w-24 md:w-32 h-auto" />
        </div>
        <a href="/cms/login" className="bg-mahogany text-rice px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">Sign In</a>
      </nav>

      <main className="flex-1 px-6 md:px-16 py-12 md:py-20 flex flex-col items-center">
        <div className="w-full max-w-3xl animate-fade-in">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-mahogany/60 hover:text-mahogany mb-8 transition-colors group border-none bg-transparent cursor-pointer font-bold"
          >
            <img src="/assets/icons/cms-form/thick-back-arrow.svg" alt="" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <h1 className="text-4xl md:text-5xl font-bold mb-10">Privacy Policy</h1>
          
          <div className="bg-vanilla/50 p-8 md:p-12 rounded-[40px] border-2 border-mahogany/5 space-y-8 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Information We Collect</h2>
              <p className="text-tobacco font-medium">
                We collect information you provide directly to us when you create an account, create forms, or contact us for support. This includes your name, email address, and any data contained within the forms you build.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
              <p className="text-tobacco font-medium">
                We use the information we collect to provide, maintain, and improve our services, to process your responses, and to communicate with you about your account and our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">3. Data Security</h2>
              <p className="text-tobacco font-medium">
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All your form data is stored securely using industry-standard encryption.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">4. Your Choices</h2>
              <p className="text-tobacco font-medium">
                You may update or delete your account information at any time by logging into your account settings. You can also request to export all your collected data.
              </p>
            </section>
          </div>
          
          <p className="mt-12 text-center text-tobacco text-sm font-medium">Last updated: February 7, 2026</p>
        </div>
      </main>
    </div>
  );
}
