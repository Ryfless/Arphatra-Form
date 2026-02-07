import { useNavigate } from "react-router-dom";

export default function TermsPage() {
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

          <h1 className="text-4xl md:text-5xl font-bold mb-10">Terms of Service</h1>
          
          <div className="bg-vanilla/50 p-8 md:p-12 rounded-[40px] border-2 border-mahogany/5 space-y-8 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
              <p className="text-tobacco font-medium">
                By accessing or using Arphatra, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">2. Use License</h2>
              <p className="text-tobacco font-medium">
                Permission is granted to temporarily use Arphatra for personal or commercial form building. You may not attempt to decompile or reverse engineer any software contained on our website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">3. User Content</h2>
              <p className="text-tobacco font-medium">
                You retain all rights to any content you submit through our service. However, by creating forms, you grant us the right to store and process that data to provide the service to you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">4. Limitation of Liability</h2>
              <p className="text-tobacco font-medium">
                In no event shall Arphatra be liable for any damages arising out of the use or inability to use the materials on our website.
              </p>
            </section>
          </div>
          
          <p className="mt-12 text-center text-tobacco text-sm font-medium">Last updated: February 7, 2026</p>
        </div>
      </main>
    </div>
  );
}
