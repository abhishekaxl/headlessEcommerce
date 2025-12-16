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
}

export function AddToCartButton({ product, quantity = 1, options }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddToCart = async () => {
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
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleAddToCart}
        disabled={isLoading || !product.inStock}
        className={`w-full px-6 py-3 rounded font-medium transition-colors ${
          product.inStock && !isLoading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

