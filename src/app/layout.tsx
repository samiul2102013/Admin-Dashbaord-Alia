import type { Metadata } from 'next';
import { Inter, Poppins, Urbanist, Manrope } from 'next/font/google';
import Providers from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-urbanist',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for Marage Support Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${urbanist.variable} ${manrope.variable} antialiased`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}