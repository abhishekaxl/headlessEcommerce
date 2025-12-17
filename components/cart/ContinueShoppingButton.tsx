/**
 * Continue Shopping Button Component
 */

'use client';

import Link from 'next/link';

export function ContinueShoppingButton() {
  return (
    <Link
      href="/"
      className="btn"
    >
      Continue Shopping
      <style jsx>{`
        .btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 14px 20px;
          border: 1px solid var(--light-gray);
          background: var(--white);
          color: var(--black);
          font-family: var(--font-body);
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .btn:hover {
          background: var(--off-white);
          border-color: var(--gray);
          transform: translateY(-2px);
        }
      `}</style>
    </Link>
  );
}


