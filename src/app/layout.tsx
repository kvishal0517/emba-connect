import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EMBA Connect - Executive MBA Academic Portal',
  description: 'A premium, role-based academic management system for Executive MBA programs.',
  keywords: 'EMBA, Executive MBA, portal, syllabus, assignments, Zoom scheduling, attendance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
