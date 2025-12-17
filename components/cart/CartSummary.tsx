/**
 * Cart Summary Component
 * Displays cart totals and summary
 */

import { Cart } from '@/lib/graphql/types';

interface CartSummaryProps {
  cart: Cart;
}

export function CartSummary({ cart }: CartSummaryProps) {
  return (
    <div className="summary">
      <h2 className="title">Order Summary</h2>

      <div className="rows">
        <div className="row">
          <span>Subtotal</span>
          <span>{cart.subtotal.formatted}</span>
        </div>

        {cart.discount ? (
          <div className="row discount">
            <span>Discount</span>
            <span>-{cart.discount.formatted}</span>
          </div>
        ) : null}

        {cart.shipping ? (
          <div className="row">
            <span>Shipping</span>
            <span>{cart.shipping.formatted}</span>
          </div>
        ) : null}

        {cart.tax ? (
          <div className="row">
            <span>Tax</span>
            <span>{cart.tax.formatted}</span>
          </div>
        ) : null}
      </div>

      <div className="total">
        <span>Total</span>
        <span>{cart.total.formatted}</span>
      </div>

      {cart.couponCode ? (
        <div className="coupon">
          Coupon applied: <strong>{cart.couponCode}</strong>
        </div>
      ) : null}

      <style jsx>{`
        .summary {
          border: 1px solid var(--light-gray);
          background: var(--off-white);
          padding: 20px;
        }
        .title {
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 700;
          color: var(--black);
          margin: 0 0 14px 0;
        }
        .rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--light-gray);
        }
        .row {
          display: flex;
          justify-content: space-between;
          color: var(--charcoal);
          font-size: 14px;
        }
        .discount {
          color: #1f7a3b;
        }
        .total {
          display: flex;
          justify-content: space-between;
          padding-top: 14px;
          font-size: 18px;
          font-weight: 800;
          color: var(--black);
        }
        .coupon {
          margin-top: 12px;
          padding: 10px 12px;
          background: rgba(74, 124, 89, 0.08);
          color: var(--charcoal);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}


