/**
 * Flash Sale Banner - Urban Jungle Co.
 */

'use client';

import Link from 'next/link';

export function FlashSaleBanner() {
  return (
    <section className="flash-sale">
      <div className="flash-sale-content">
        <h2>Flash Sale: Up to 50% Off On Select Items!</h2>
        <p>Don&apos;t miss out on our flash sale event! For a limited time, enjoy up to 50% off on a selection of our best-selling products.</p>
        <Link href="/shop?sale=true" className="btn btn-secondary">
          Shop Now
        </Link>
      </div>

      <style jsx>{`
        .flash-sale {
          background: linear-gradient(135deg, #2c3e2d 0%, #1a2a1b 100%);
          padding: 80px 24px;
          text-align: center;
        }

        .flash-sale-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .flash-sale h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 600;
          color: #fff;
          margin-bottom: 20px;
        }

        .flash-sale p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 32px;
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .flash-sale {
            padding: 60px 24px;
          }
        }
      `}</style>
    </section>
  );
}

