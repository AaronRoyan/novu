import type { Metadata, Viewport } from 'next';
import { Archivo, Geist_Mono, Noto_Sans_Kannada, Orbitron } from 'next/font/google';

import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { RevealObserver } from '@/components/RevealObserver';
import { ScrollFx } from '@/components/ScrollFx';

import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

// Only the NOVU wordmark uses Orbitron, matching the existing brand mark.
const wordmark = Orbitron({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-wordmark',
});

// ನೋವು — the word Novu is named after.
const kannada = Noto_Sans_Kannada({
  subsets: ['kannada'],
  // One static weight: it's only ever four letters, so skip the variable font.
  weight: '600',
  variable: '--font-kannada',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'https://www.thenovu.in'),
  title: {
    default: 'Novu — Built for the In-Between',
    template: '%s — Novu',
  },
  description:
    'Running gear built through real use. For the miles that demand better — the runs before sunrise, the restarts, and everything in between.',
  openGraph: {
    siteName: 'Novu',
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0b0c',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${mono.variable} ${wordmark.variable} ${kannada.variable}`}
    >
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <RevealObserver />
        <ScrollFx />
      </body>
    </html>
  );
}
