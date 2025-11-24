// app/layout.tsx
import { Inter, Roboto } from 'next/font/google';
import '../styles/globals.css';
import { Metadata } from 'next';
import { Providers } from './providers'; // Import Providers yang sudah diperbaiki

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'ALIFA Institute LMS',
  description: 'Sistem Pembelajaran Terpadu - ALIFA Institute',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased text-sm bg-background`}>
        {/* HANYA gunakan Providers di sini */}
        <Providers attribute="class" enableSystem disableTransitionOnChange>
          {children}
        </Providers>
      </body>
    </html>
  );
}