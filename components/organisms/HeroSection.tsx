'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Premium Quality Products',
  subtitle = 'Discover our curated collection of high-quality products that elevate your lifestyle.',
  ctaText = 'Shop Now',
  ctaLink = '/shop',
}) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    { icon: '🚚', text: 'Free Shipping', subtext: 'On orders over $50' },
    { icon: '✓', text: 'Quality Assured', subtext: 'Premium products only' },
    { icon: '💳', text: 'Secure Payment', subtext: '100% secure checkout' },
    { icon: '↩️', text: 'Easy Returns', subtext: '30-day return policy' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">New Collection 2025</span>
            </div>
            
            <h1 className="hero-title">
              {title.split(' ').map((word, i) => (
                <span key={i} className="hero-word" style={{ animationDelay: `${i * 0.1}s` }}>
                  {word}
                </span>
              ))}
            </h1>
            
            <p className="hero-subtitle">{subtitle}</p>
            
            <div className="hero-cta-group">
              <Link href={ctaLink} className="hero-cta-primary">
                {ctaText}
                <span className="cta-arrow">→</span>
              </Link>
              <Link href="/category/what-is-new" className="hero-cta-secondary">
                View New Arrivals
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Products</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">4.8★</div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Rotating Features */}
          <div className="hero-features">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${index === currentFeature ? 'active' : ''}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content">
                  <div className="feature-text">{feature.text}</div>
                  <div className="feature-subtext">{feature.subtext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          overflow: hidden;
          background: #0a0a0a;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(10, 10, 10, 0.85) 0%,
            rgba(10, 10, 10, 0.75) 50%,
            rgba(10, 10, 10, 0.85) 100%
          );
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
          animation: patternMove 20s ease-in-out infinite;
          opacity: 0.3;
        }

        @keyframes patternMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -20px) scale(1.1); }
        }

        .hero-container {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 60px;
          align-items: center;
          margin: 0 auto;
        }

        .hero-content {
          text-align: left;
        }

        .hero-badge {
          display: inline-block;
          margin-bottom: 24px;
        }

        .badge-text {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #0a0a0a;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .hero-title {
          font-family: var(--font-heading, 'system-ui, sans-serif');
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 24px;
          line-height: 1.1;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8),
                       0 2px 10px rgba(0, 0, 0, 0.6),
                       0 0 40px rgba(0, 0, 0, 0.4);
        }

        .hero-word {
          display: inline-block;
          animation: fadeInUp 0.8s ease-out both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          color: #ffffff;
          margin-bottom: 40px;
          line-height: 1.6;
          max-width: 600px;
          text-shadow: 0 2px 15px rgba(0, 0, 0, 0.8),
                       0 1px 5px rgba(0, 0, 0, 0.6);
          font-weight: 400;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          margin-bottom: 60px;
          flex-wrap: wrap;
        }

        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 36px;
          background: #ffffff;
          color: #0a0a0a;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
        }

        .hero-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(255, 255, 255, 0.3);
          background: #f5f5f5;
        }

        .cta-arrow {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .hero-cta-primary:hover .cta-arrow {
          transform: translateX(4px);
        }

        .hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 18px 36px;
          background: transparent;
          color: #ffffff;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .hero-cta-secondary:hover {
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.05);
        }

        .hero-stats {
          display: flex;
          gap: 32px;
          align-items: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1;
          margin-bottom: 4px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
        }

        .stat-label {
          font-size: 14px;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.7);
          font-weight: 500;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          opacity: 0.5;
          transform: scale(0.95);
          transition: all 0.4s ease;
        }

        .feature-card.active {
          opacity: 1;
          transform: scale(1);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .feature-icon {
          font-size: 32px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .feature-content {
          flex: 1;
        }

        .feature-text {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        .feature-subtext {
          font-size: 13px;
          color: #ffffff;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
          opacity: 0.9;
        }

        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-features {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 10px;
          }

          .feature-card {
            min-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .hero {
            min-height: 85vh;
            padding: 60px 16px;
          }

          .hero-content {
            text-align: center;
          }

          .hero-title {
            justify-content: center;
          }

          .hero-cta-group {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-features {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default HeroSection;
