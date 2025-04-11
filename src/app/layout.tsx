'use client';

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
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // i18n-browser-languagedetector will have detected language by now
  }, []);

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLanguage = currentLang === 'en' ? 'ha' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  // Use suppressHydrationWarning to prevent hydration warnings
  return (
    <html lang="en" suppressHydrationWarning>
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
        suppressHydrationWarning
      >
        {children}
        {mounted && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.documentElement.lang = "${i18n.language}";
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}