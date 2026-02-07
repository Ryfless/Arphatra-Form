import { useLanguage } from "@/lib/i18n.jsx";

export default function LogoutModal({ open, onCancel, onConfirm }) {
  const { t } = useLanguage();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-vanilla rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-fade-in border-2 border-mahogany">
        <h2 className="text-2xl font-bold mb-4 text-center text-mahogany">
          {t("logout_title")}
        </h2>
        <p className="text-center mb-8 text-tobacco">
          {t("logout_confirm")}
        </p>

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 rounded-full font-semibold border-2 border-mahogany text-mahogany bg-transparent transition-all duration-300 hover:bg-mahogany hover:text-vanilla cursor-pointer"
          >
            {t("no")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-8 py-2.5 rounded-full font-semibold transition-all duration-300 bg-mahogany text-vanilla border-none cursor-pointer hover:shadow-btn-hover"
          >
            {t("yes")}
          </button>
        </div>
      </div>
    </div>
  );
}
