"use client";

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import i18n from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('i18nextLng') || 'en';
    }
    return 'en'; // Default to 'en' for server-side rendering
  });

  useEffect(() => {
    i18n.changeLanguage(language);
    i18n.on('languageChanged', (lng) => setLanguage(lng));
    return () => {
      i18n.off('languageChanged');
    };
  }, [language]);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ha' : 'en';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('i18nextLng', newLanguage);
  };

  return (
    <html lang={language}>
      <head>
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `,
          }}
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition"
          >
            {language === 'en' ? 'Hausa' : 'English'}
          </button>
        </header>
        {children}
      </body>
    </html>
  );
}
