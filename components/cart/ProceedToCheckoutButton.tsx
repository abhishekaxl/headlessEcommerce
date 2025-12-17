/**
 * Proceed to Checkout Button Component
 */

'use client';

import Link from 'next/link';

export function ProceedToCheckoutButton() {
  return (
    <Link
      href="/checkout"
      className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
    >
      Proceed to Checkout
    </Link>
  );
}


