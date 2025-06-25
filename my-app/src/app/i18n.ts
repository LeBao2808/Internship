// app/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../../public/locates/en/common.json';
import viCommon from '../../public/locates/vi/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      vi: { common: viCommon },
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });

export default i18n;