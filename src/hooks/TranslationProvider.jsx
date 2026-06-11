import { useState, useEffect } from 'react';
import { translations } from '../constants/translations';
import { TranslationContext } from './TranslationContext';

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("quiniela_lang") || "es");

  useEffect(() => {
    localStorage.setItem("quiniela_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations["es"]?.[key] || key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "es" ? "en" : "es"));
  };

  return (
    <TranslationContext.Provider value={{ t, lang, setLang, toggleLang }}>
      {children}
    </TranslationContext.Provider>
  );
}
