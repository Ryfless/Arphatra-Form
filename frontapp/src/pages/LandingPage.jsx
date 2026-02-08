import { useNavigate, Link } from "react-router-dom";
import DashboardPreview from "@/components/DashboardPreview.jsx";
import { useLanguage } from "@/lib/i18n.jsx";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="bg-rice min-h-screen font-poppins text-mahogany flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 md:py-8 bg-transparent shrink-0">
        <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/")}>
          <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra Logo" className="w-24 md:w-32 h-auto" />
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <a href="/cms/login" className="font-bold text-mahogany hover:opacity-70 transition-opacity">{t("login")}</a>
          <a href="/cms/register" className="bg-mahogany text-rice px-6 py-2.5 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">{t("sign_up")}</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-16 text-center py-8 md:py-16 gap-10">
        <div className="flex flex-col gap-4 animate-fade-in max-w-[1400px] w-full">
          <h1 className="text-[40px] md:text-[84px] font-bold tracking-tight text-mahogany leading-[1.05]">
            {t("hero_title_1")} <br />
            <span className="underline decoration-sand underline-offset-8">{t("hero_title_2")}</span> {t("hero_title_3")}
          </h1>
          <p className="text-[18px] md:text-[24px] text-tobacco max-w-3xl mx-auto font-medium opacity-90">
            {t("hero_subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 animate-slide-up">
          <a href="/cms/register" className="px-12 py-4 bg-mahogany text-rice rounded-2xl font-bold text-lg md:text-xl shadow-2xl hover:shadow-mahogany/20 hover:-translate-y-1 active:scale-95 transition-all">
            {t("get_started")}
          </a>
        </div>

        <DashboardPreview />
      </main>

      {/* Features Section */}
      <section className="px-6 md:px-16 py-20 md:py-32 bg-vanilla/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="w-16 h-16 bg-mahogany/10 rounded-2xl flex items-center justify-center shadow-lg mb-2 mx-auto md:mx-0">
              <img src="/assets/icons/homepage/doc-icon.svg" alt="" className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold">{t("feature_1_title")}</h3>
            <p className="text-tobacco font-medium leading-relaxed">
              {t("feature_1_desc")}
            </p>
          </div>
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center shadow-lg mb-2 mx-auto md:mx-0">
              <img src="/assets/icons/navbar/ic_outline-palette.svg" alt="" className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold">{t("feature_2_title")}</h3>
            <p className="text-tobacco font-medium leading-relaxed">
              {t("feature_2_desc")}
            </p>
          </div>
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="w-16 h-16 bg-mahogany/10 rounded-2xl flex items-center justify-center shadow-lg mb-2 mx-auto md:mx-0">
              <img src="/assets/icons/front-apps/spreadsheet.svg" alt="" className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold">{t("feature_3_title")}</h3>
            <p className="text-tobacco font-medium leading-relaxed">
              {t("feature_3_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-12 md:py-20 border-t border-mahogany/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <img src="/assets/icons/arphatra-form-1.svg" alt="Arphatra Logo" className="w-24 md:w-32 h-auto" />
            <p className="text-tobacco text-sm font-medium">© 2026 Arphatra. {t("all_rights")}</p>
          </div>
          <div className="flex gap-8 font-bold text-mahogany/60">
            <Link to="/privacy" className="hover:text-mahogany transition-colors">{t("privacy")}</Link>
            <Link to="/terms" className="hover:text-mahogany transition-colors">{t("terms")}</Link>
            <Link to="/contact" className="hover:text-mahogany transition-colors">{t("contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}