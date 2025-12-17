/**
 * Root Layout - Urban Jungle Co.
 * Nature-inspired eCommerce layout
 */

import type { Metadata } from 'next';
import './globals.css';
import { Header, Footer } from '@/components/organisms';

export const metadata: Metadata = {
  title: 'Urban Jungle Co. | Discover the Beauty of Nature',
  description: 'Your premier destination for all green. Curated selection of plants to inspire and enrich your living space.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
