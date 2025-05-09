import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        translation: {
          "User": "Người dùng",
          "Role": "Vai trò",
          "Blog": "Blog",
          "Logout": "Đăng xuất",
          "Home": "Trang chủ"
          // Thêm các key khác ở đây
        }
      },
      en: {
        translation: {
          "User": "User ",
          "Role": "Role ",
          "Blog": "Blog",
          "Logout": "Logout",
          "Home": "Home"
          // Add more keys here
        }
      }
    },
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;