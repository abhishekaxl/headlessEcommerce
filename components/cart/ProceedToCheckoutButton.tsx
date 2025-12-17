/**
 * Proceed to Checkout Button Component
 */

'use client';

import Link from 'next/link';

export function ProceedToCheckoutButton() {
  return (
    <Link
      href="/checkout"
      className="btn"
    >
      Proceed to Checkout
      <style jsx>{`
        .btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 14px 20px;
          background: var(--primary);
          color: var(--white);
          font-family: var(--font-body);
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }
      `}</style>
    </Link>
  );
}


