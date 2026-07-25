import { useTranslation } from "react-i18next";
import { LuLanguages } from "react-icons/lu";

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const activeLanguage = (i18n.resolvedLanguage ?? i18n.language).split("-")[0];

  const changeLanguage = async (language: "en" | "vi") => {
    if (activeLanguage === language) return;
    try {
      await i18n.changeLanguage(language);
      document.documentElement.lang = language;
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn m-1">
        <LuLanguages size={18} />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-1 w-20 p-0 shadow left-0 mt-2 border border-base-300 overflow-hidden"
      >
        <li className="p-0">
          <button className={`btn text-xs ${activeLanguage === "en" ? "btn-primary" : "btn-ghost"}`} onClick={() => changeLanguage("en")}>{t("english")}</button>
        </li>
        <li>
          <button className={`btn text-xs ${activeLanguage === "vi" ? "btn-primary" : "btn-ghost"}`} onClick={() => changeLanguage("vi")}>
            {t("vietnamese")}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default LanguageSwitcher;
