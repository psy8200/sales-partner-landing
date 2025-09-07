import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PwaProvider } from "@/components/PwaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "세일즈 파트너 랜딩 - 프리미엄 파트너십",
  description: "보험료 • 통신료 • 렌탈료 • 상조 • 쇼핑몰 - 이미 내는 돈으로 매월 수익 창출. 전국 800+ 성공 파트너와 함께하는 안전한 네트워크",
  keywords: ["세일즈 파트너", "수익 창출", "부수입", "파트너십", "통신비", "보험료"],
  authors: [{ name: "세일즈 파트너" }],
  creator: "세일즈 파트너",
  publisher: "세일즈 파트너",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sales-partner-landing.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "세일즈 파트너 랜딩 - 프리미엄 파트너십",
    description: "이미 내는 돈으로 매월 수익 창출. 전국 800+ 성공 파트너와 함께하는 안전한 네트워크",
    url: 'https://sales-partner-landing.vercel.app',
    siteName: '세일즈 파트너',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '세일즈 파트너 랜딩',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "세일즈 파트너 랜딩 - 프리미엄 파트너십",
    description: "이미 내는 돈으로 매월 수익 창출. 전국 800+ 성공 파트너와 함께하는 안전한 네트워크",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '세일즈 파트너',
    startupImage: [
      {
        url: '/apple-touch-startup-image-768x1004.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <PwaProvider>
            {children}
          </PwaProvider>
        </Providers>
      </body>
    </html>
  );
}
