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
import styles from './cart.module.css';

export default async function CartPage() {
  const cart = await getCart();

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


