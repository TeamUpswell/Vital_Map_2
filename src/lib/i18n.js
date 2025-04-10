import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      survey_message:
        'We can help you find a free HPV vaccine to protect your daughter against cervical cancer!',
      question_cares_for_girl: 'Do you care for a girl who is age 9 or older?',
      question_received_hpv_dose:
        'Has she received an HPV vaccine dose already?',
      question_ready_for_vaccine:
        'Are you ready to have your daughter vaccinated?',
      thank_you: 'Thank you!',
      share_message: 'Please share this with someone who might benefit.',
      join_whatsapp: 'Join Chat on WhatsApp',
      view_map: 'View Map',
      complete_message_yes: 'Find your nearest health center on our map below.',
      complete_message_no: 'Join our WhatsApp group for more information.',
    },
  },
  ha: {
    translation: {
      survey_message:
        'Za mu iya taimaka muku samun rigakafin HPV kyauta don kare yarinyarku daga cutar sankarar mahaifa!',
      question_cares_for_girl:
        'Shin kuna kula da yarinya mai shekaru 9 ko sama?',
      question_received_hpv_dose:
        'Shin ta riga ta karɓi allurar rigakafin HPV?',
      question_ready_for_vaccine: 'Shin kun shirya yi wa yarinyarku rigakafi?',
      thank_you: 'Na gode!',
      share_message: 'Da fatan za a raba wannan da wanda zai iya amfana.',
      join_whatsapp: 'Shiga Tattaunawa a WhatsApp',
      view_map: 'Duba Taswira',
      complete_message_yes:
        'Nemo cibiyar lafiya mafi kusa a taswirar mu a ƙasa.',
      complete_message_no: 'Shiga ƙungiyar WhatsApp ɗinmu don ƙarin bayani.',
    },
  },
};

i18next
  .use(LanguageDetector) // Add language detection
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default to English if no match
    supportedLngs: ['en', 'ha'], // Add Hausa ('ha') and English ('en')
    detection: {
      order: ['navigator', 'localStorage', 'cookie'], // Detect from browser settings first
      caches: ['localStorage', 'cookie'], // Cache the detected language
    },
    lng: navigator.language.startsWith('ha') ? 'ha' : 'en', // Default to Hausa if device language starts with "ha"
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18next;
