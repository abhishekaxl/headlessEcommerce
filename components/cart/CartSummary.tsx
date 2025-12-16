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
    <div className="border rounded-lg p-6 bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{cart.subtotal.formatted}</span>
        </div>

        {cart.discount && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{cart.discount.formatted}</span>
          </div>
        )}

        {cart.shipping && (
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{cart.shipping.formatted}</span>
          </div>
        )}

        {cart.tax && (
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{cart.tax.formatted}</span>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>{cart.total.formatted}</span>
        </div>
      </div>

      {cart.couponCode && (
        <div className="mt-4 p-3 bg-green-50 rounded">
          <p className="text-sm">
            Coupon applied: <span className="font-medium">{cart.couponCode}</span>
          </p>
        </div>
      )}
    </div>
  );
}

