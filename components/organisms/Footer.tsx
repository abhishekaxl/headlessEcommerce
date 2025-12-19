'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <>
      <footer className="footer">
        {/* Newsletter Section */}
        <div className="newsletter-section">
          <div className="newsletter-container">
            <h2 className="newsletter-title">Join Our Plant Family</h2>
            <p className="newsletter-desc">
              Subscribe for exclusive offers, plant care tips, and new arrivals.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Footer Links */}
        <div className="footer-main">
          <div className="footer-container">
            <div className="footer-col">
              <h4 className="footer-title">Urban Jungle Co.</h4>
              <p className="footer-text">
                Bringing nature into your home since 2020.
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Shop</h4>
              <ul className="footer-links">
                <li><Link href="/shop">All Plants</Link></li>
                <li><Link href="/category/indoor">Indoor Plants</Link></li>
                <li><Link href="/category/outdoor">Outdoor Plants</Link></li>
                <li><Link href="/category/succulents">Succulents</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Help</h4>
              <ul className="footer-links">
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/shipping">Shipping</Link></li>
                <li><Link href="/returns">Returns</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/press">Press</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Urban Jungle Co. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          background: var(--black);
          color: var(--white);
        }

        .newsletter-section {
          background: var(--primary);
          padding: 60px 24px;
          text-align: center;
        }

        .newsletter-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .newsletter-title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 600;
          color: var(--white);
          margin-bottom: 12px;
        }

        .newsletter-desc {
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 24px;
          font-size: 1rem;
        }

        .newsletter-form {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .newsletter-input {
          flex: 1;
          min-width: 200px;
          max-width: 300px;
          padding: 14px 18px;
          border: none;
          font-size: 15px;
        }

        .newsletter-btn {
          padding: 14px 32px;
          background: var(--black);
          color: var(--white);
          border: none;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .newsletter-btn:hover {
          background: var(--charcoal);
        }

        .footer-main {
          padding: 60px 24px;
        }

        .footer-container {
          max-width: var(--container-max);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        .footer-title {
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 20px;
        }

        .footer-text {
          color: var(--gray);
          font-size: 14px;
          line-height: 1.6;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 10px;
        }

        .footer-links a {
          color: var(--gray);
          font-size: 14px;
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-links a:hover {
          color: var(--white);
        }

        .footer-bottom {
          border-top: 1px solid var(--charcoal);
          padding: 24px;
          text-align: center;
        }

        .footer-bottom p {
          color: var(--gray);
          font-size: 14px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .footer-container {
            grid-template-columns: 1fr;
          }

          .newsletter-form {
            flex-direction: column;
            align-items: stretch;
          }

          .newsletter-input {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Footer;
