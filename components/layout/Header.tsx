/**
 * Header Component - Urban Jungle Co.
 * Navigation header with logo, menu, and cart
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount] = useState(0);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Urban Jungle Co.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/shop" className="nav-link">Shop</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </nav>

        {/* Right Icons */}
        <div className="header-actions">
          <button className="icon-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
          
          <Link href="/account" className="icon-btn" aria-label="Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          
          <Link href="/cart" className="cart-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="nav-mobile">
          <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/shop" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link href="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link href="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </nav>
      )}

      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #fff;
          border-bottom: 1px solid #e8e6e1;
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .nav-desktop {
          display: flex;
          gap: 40px;
        }

        .nav-link {
          font-size: 15px;
          font-weight: 500;
          color: #333;
          transition: color 0.2s;
          position: relative;
        }

        .nav-link:hover {
          color: #4a7c59;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #4a7c59;
          transition: width 0.3s;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          padding: 8px;
          color: #333;
          transition: color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
        }

        .icon-btn:hover {
          color: #4a7c59;
        }

        .cart-btn {
          position: relative;
          padding: 8px;
          color: #333;
          transition: color 0.2s;
        }

        .cart-btn:hover {
          color: #4a7c59;
        }

        .cart-count {
          position: absolute;
          top: 0;
          right: 0;
          width: 18px;
          height: 18px;
          background: #4a7c59;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu-btn {
          display: none;
          padding: 8px;
          color: #333;
          background: none;
          border: none;
          cursor: pointer;
        }

        .nav-mobile {
          display: none;
          flex-direction: column;
          padding: 20px 24px;
          background: #fff;
          border-top: 1px solid #e8e6e1;
        }

        .nav-mobile .nav-link {
          padding: 12px 0;
          border-bottom: 1px solid #e8e6e1;
        }

        @media (max-width: 768px) {
          .nav-desktop {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .nav-mobile {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}


