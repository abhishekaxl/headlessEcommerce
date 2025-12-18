/**
 * Cart Page
 * Shopping cart page with items, totals, and checkout button
 */

import { getApolloClient } from '@/lib/apollo/client';
import { GET_CART } from '@/lib/apollo/queries';
import { CartItems } from '@/components/cart/CartItems';
import { CartSummary } from '@/components/cart/CartSummary';
import { ContinueShoppingButton } from '@/components/cart/ContinueShoppingButton';
import { ProceedToCheckoutButton } from '@/components/cart/ProceedToCheckoutButton';
import Link from 'next/link';
import styles from './cart.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CartPage() {
  const client = getApolloClient();
  const { data } = await client.query({
    query: GET_CART,
    fetchPolicy: 'no-cache',
  });
  const cart = data?.cart || null;

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
        <p className={styles.emptyText}>Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link
          href="/"
          className={styles.cta}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Shopping Cart</h1>

        <div className={styles.layout}>
          <div>
            <CartItems items={cart.items} />
          </div>

          <aside className={styles.summary}>
            <CartSummary cart={cart} />
            <div className={styles.actions}>
              <ProceedToCheckoutButton />
              <ContinueShoppingButton />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


