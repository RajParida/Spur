import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Spur - Frictionless Social Scheduling',
  description: 'Spontaneous availability signals for your close friends',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
