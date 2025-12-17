/**
 * Hero Section - Urban Jungle Co.
 */

'use client';

import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-tagline">Welcome to Urban Jungle Co.</span>
        <h1>Discover the Beauty of Nature at Your Fingertips</h1>
        <Link href="/shop" className="btn btn-primary">
          Shop Now
        </Link>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(74, 124, 89, 0.1) 0%, rgba(245, 243, 238, 1) 100%),
                      url('https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1920&q=80') center/cover;
          text-align: center;
          padding: 120px 24px;
        }

        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.7);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
        }

        .hero-tagline {
          display: inline-block;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #4a7c59;
          margin-bottom: 24px;
        }

        .hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 600;
          line-height: 1.1;
          color: #1a1a1a;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 70vh;
            padding: 80px 24px;
          }
        }
      `}</style>
    </section>
  );
}

