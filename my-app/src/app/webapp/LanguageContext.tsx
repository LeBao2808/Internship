import React, { createContext, useContext, useState } from "react";
import { locales } from "./locales";

type Lang = "vi" | "en";
const LanguageContext = createContext<{
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>
  ;
  t: (key: keyof typeof locales["vi"]) => string;
}>({
  lang: "vi",
  
  setLang: () => {},
  t: (key) => locales.vi[key]
});

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("vi");
  const t = (key: keyof typeof locales["vi"]) => locales[lang][key] || key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);