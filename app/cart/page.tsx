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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <CartItems items={cart.items} />
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary cart={cart} />
          
          <div className="mt-6 space-y-4">
            <ProceedToCheckoutButton />
            <ContinueShoppingButton />
          </div>
        </div>
      </div>
    </div>
  );
}

