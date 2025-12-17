/**
 * Cart Page
 * Shopping cart page with items, totals, and checkout button
 */

import { getCart } from '@/lib/graphql/queries';
import { CartItems } from '@/components/cart/CartItems';
import { CartSummary } from '@/components/cart/CartSummary';
import { ContinueShoppingButton } from '@/components/cart/ContinueShoppingButton';
import { ProceedToCheckoutButton } from '@/components/cart/ProceedToCheckoutButton';
import Link from 'next/link';

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty">
        <h1>Your Cart is Empty</h1>
        <p>Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link
          href="/"
          className="cta"
        >
          Continue Shopping
        </Link>

        <style jsx>{`
          .empty {
            max-width: 720px;
            margin: 0 auto;
            padding: 80px 24px;
            text-align: center;
          }
          h1 {
            font-family: var(--font-heading);
            font-size: 2.5rem;
            color: var(--black);
            margin-bottom: 10px;
          }
          p {
            color: var(--dark-gray);
            margin-bottom: 28px;
          }
          .cta {
            display: inline-block;
            padding: 14px 28px;
            background: var(--primary);
            color: var(--white);
            text-decoration: none;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: background 0.2s ease, transform 0.2s ease;
          }
          .cta:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Shopping Cart</h1>

        <div className="layout">
          <div className="items">
            <CartItems items={cart.items} />
          </div>

          <aside className="summary">
            <CartSummary cart={cart} />
            <div className="actions">
              <ProceedToCheckoutButton />
              <ContinueShoppingButton />
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .page {
          padding: 60px 24px;
          background: var(--white);
        }
        .container {
          max-width: var(--container-max);
          margin: 0 auto;
        }
        .title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 4vw, 3rem);
          color: var(--black);
          margin: 0 0 24px 0;
        }
        .layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
          align-items: start;
        }
        .summary {
          position: sticky;
          top: 100px;
        }
        .actions {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (max-width: 980px) {
          .layout {
            grid-template-columns: 1fr;
          }
          .summary {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}


