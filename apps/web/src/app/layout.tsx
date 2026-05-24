import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Ignite — Deployment Platform',
  description:
    'Ignite is a developer-focused deployment platform. Connect GitHub repos, trigger deployments, stream live build logs, and monitor application health.',
  keywords: ['deployment', 'CI/CD', 'DevOps', 'platform', 'monitoring'],
  openGraph: {
    title: 'Ignite — Deployment Platform',
    description: 'Modern deployment pipeline for developers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
