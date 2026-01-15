import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LODDGO',
  description: 'Live raffle app for school and club fundraisers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
