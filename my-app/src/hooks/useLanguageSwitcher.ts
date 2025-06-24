'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from '@/app/i18n'; // hoặc từ next-i18next
import { useState } from 'react';

export default function LanguageSwitcher({ lang }: { lang: string }) {
  const router = useRouter();
  const currentPath = window.location.pathname; // Lấy toàn bộ đường dẫn hiện tại
  const { t } = useTranslations();

  const switchLanguage = (newLang: string) => {
    // Loại bỏ locale cũ nếu có
    const pathWithoutOldLocale = currentPath.replace(/^\/(en|vi)\//, '/');
    // Tạo đường dẫn mới với locale mới
    const newPath = `/${newLang}${pathWithoutOldLocale}`;

    // Chuyển hướng sang URL mới (cùng page, khác ngôn ngữ)
    router.push(newPath);
  };

  return { switchLanguage };
};