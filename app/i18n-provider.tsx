'use client';

import { I18nextProvider } from 'react-i18next';
import React, { useEffect, useState } from 'react';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [initializedI18n, setInitializedI18n] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const i18next = (await import('i18next')).default;
        const { initReactI18next } = await import('react-i18next');
        const Backend = (await import('i18next-http-backend')).default;
        const LanguageDetector = (await import('i18next-browser-languagedetector')).default;

        const instance = i18next.createInstance();

        instance
          .use(Backend)
          .use(LanguageDetector)
          .use(initReactI18next)
          .init({
            fallbackLng: 'en',
            debug: process.env.NODE_ENV === 'development',
            interpolation: {
              escapeValue: false,
            },
            backend: {
              loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
            react: {
              useSuspense: false,
            },
          });
        setInitializedI18n(instance);
      }
    };
    init();
  }, []);

  if (!initializedI18n) {
    return null; // Render nothing or a loading spinner until i18n is ready
  }

  return (
    <I18nextProvider i18n={initializedI18n}>
      {children}
    </I18nextProvider>
  );
} 