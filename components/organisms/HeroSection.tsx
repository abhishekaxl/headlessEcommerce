'use client';

import React from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Bring Nature Into Your Home',
  subtitle = 'Discover our curated collection of beautiful, healthy plants that transform your living space.',
  ctaText = 'Shop Now',
  ctaLink = '/shop',
}) => {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          <Link href={ctaLink} className="hero-cta">
            {ctaText}
          </Link>
        </div>
      </section>

      <style jsx>{`
        .hero {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
                      linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          padding: 60px 24px;
          text-align: center;
        }

        .hero-content {
          max-width: 700px;
        }

        .hero-title {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 600;
          color: var(--white);
          margin-bottom: 20px;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 36px;
          line-height: 1.6;
        }

        .hero-cta {
          display: inline-block;
          padding: 16px 40px;
          background: var(--white);
          color: var(--black);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-decoration: none;
          transition: all var(--transition-normal);
        }

        .hero-cta:hover {
          background: var(--cream);
          transform: translateY(-3px);
        }
      `}</style>
    </>
  );
};

export default HeroSection;
