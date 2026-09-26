import '@/app/_styles/global.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import Head from 'next/head';
import { Suspense } from 'react';

import { KakaoScript, MSWComponent, QueryProvider, ToastProvider } from './_providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const gaId = process.env.GA_ID ?? '';

export const metadata: Metadata = {
  title: '건강해짐',
  description: '피트니스 센터, 트레이너와 회원을 위한 필수 앱',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  verification: {
    other: {
      'naver-site-verification': 'b5ecdd5d03c3293745087f7532f9b91e2a13caa4',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='ko'>
      <Head>
        <link rel='icon' href='/favicon.png' sizes='any' />
      </Head>
      <KakaoScript />
      <body>
        <QueryProvider>
          <MSWComponent />
          <Suspense>{children}</Suspense>
        </QueryProvider>
        <ToastProvider />
      </body>
      <GoogleAnalytics gaId={gaId} />
    </html>
  );
}
