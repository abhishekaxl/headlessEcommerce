/**
 * Add to Cart Button Component
 * Client component for adding products to cart
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/graphql/types';
import { addToCart } from '@/lib/graphql/mutations';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  options?: Array<{ code: string; value: string }>;
  disabled?: boolean;
  disabledMessage?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  options,
  disabled = false,
  disabledMessage,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (disabled) {
      setError(disabledMessage || 'Please select required options');
      return;
    }
    if (!product.inStock) {
      setError('Product is out of stock');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addToCart(product.sku, quantity, options);
      // Redirect to cart or show success message
      router.push('/cart');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add to cart';
      setError(msg);
      // If Magento indicates options required, show a clear message
      if (msg.toLowerCase().includes('choose options')) {
        setError('Please select options for this product before adding to cart.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleAddToCart}
        disabled={isLoading || !product.inStock || disabled}
        className={`w-full px-6 py-3 rounded font-medium transition-colors ${
          product.inStock && !isLoading && !disabled
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Adding...' : !product.inStock ? 'Out of Stock' : disabled ? 'Select Options' : 'Add to Cart'}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}


