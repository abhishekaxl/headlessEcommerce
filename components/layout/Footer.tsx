/**
 * Footer Component - Urban Jungle Co.
 */

'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      {/* CTA Section */}
      <div className="footer-cta">
        <div className="footer-cta-content">
          <span className="cta-icon">🌱</span>
          <h2>Ready to Find your Perfect Plant?</h2>
          <p>Browse our online store or visit us in person to experience the beauty of nature.</p>
          <Link href="/shop" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <nav className="footer-nav">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <p className="copyright">
            Copyright © {new Date().getFullYear()} Urban Jungle Co.
          </p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #2c3e2d;
          color: #fff;
        }

        .footer-cta {
          background: linear-gradient(135deg, #4a7c59 0%, #3d6349 100%);
          padding: 80px 24px;
          text-align: center;
        }

        .footer-cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 20px;
        }

        .footer-cta h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: #fff;
        }

        .footer-cta p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 32px;
          color: rgba(255, 255, 255, 0.9);
        }

        .footer-bottom {
          padding: 40px 24px;
          background: #1a2a1b;
        }

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .footer-nav {
          display: flex;
          gap: 32px;
        }

        .footer-nav a {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          transition: color 0.2s;
        }

        .footer-nav a:hover {
          color: #fff;
        }

        .copyright {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        @media (max-width: 768px) {
          .footer-cta {
            padding: 60px 24px;
          }

          .footer-cta h2 {
            font-size: 2rem;
          }

          .footer-nav {
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
          }
        }
      `}</style>
    </footer>
  );
}

