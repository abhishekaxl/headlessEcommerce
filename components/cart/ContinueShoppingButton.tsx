/**
 * Continue Shopping Button Component
 */

'use client';

import Link from 'next/link';

export function ContinueShoppingButton() {
  return (
    <Link
      href="/"
      className="block w-full text-center px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
    >
      Continue Shopping
    </Link>
  );
}


