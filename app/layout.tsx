import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ARCHITECTED TO EXIST — Axiom Concept Study',
  description: 'An original scroll-controlled architectural interaction study: light, structure and time assembled into a living address.',
  openGraph: {
    title: 'ARCHITECTED TO EXIST — Axiom Concept Study',
    description: 'An original scroll-controlled architectural interaction study.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Architected to Exist concept study' }],
  },
  twitter: { card: 'summary_large_image', title: 'ARCHITECTED TO EXIST', description: 'An original architectural interaction study.', images: ['/og.png'] },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
