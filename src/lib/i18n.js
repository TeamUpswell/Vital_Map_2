import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: 'Welcome',
          survey: {
            question1: 'What is your name?',
            question2: 'How old are you?',
          },
        },
      },
      ha: {
        translation: {
          welcome: 'Barka da zuwa',
          survey: {
            question1: 'Menene sunanka?',
            question2: 'Shekararka nawa?',
          },
        },
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18next;
