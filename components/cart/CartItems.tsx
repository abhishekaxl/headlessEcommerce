/**
 * Cart Items Component
 * Displays cart items with update/remove functionality
 */

'use client';

import { CartItem } from '@/lib/graphql/types';
import { updateCartItem, removeCartItem } from '@/lib/graphql/mutations';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CartItemsProps {
  items: CartItem[];
}

export function CartItems({ items }: CartItemsProps) {
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await updateCartItem(itemId, newQuantity);
      router.refresh();
    } catch (error) {
      console.error('Failed to update cart item:', error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await removeCartItem(itemId);
      router.refresh();
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isUpdating = updatingItems.has(item.id);

        return (
          <div
            key={item.id}
            className="flex gap-4 p-4 border rounded-lg"
          >
            {/* Product Image */}
            {item.product.images[0] && (
              <Link href={`/product/${item.product.slug}`} className="flex-shrink-0">
                <div className="relative w-24 h-24 bg-gray-100 rounded">
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.images[0].alt || item.product.name}
                    fill
                    className="object-cover rounded"
                    sizes="96px"
                  />
                </div>
              </Link>
            )}

            {/* Product Details */}
            <div className="flex-1">
              <Link href={`/product/${item.product.slug}`}>
                <h3 className="font-medium hover:text-blue-600">{item.product.name}</h3>
              </Link>
              {item.product.sku && (
                <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
              )}

              {/* Quantity Controls */}
              <div className="mt-4 flex items-center gap-4">
                <label className="text-sm">Quantity:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={isUpdating || item.quantity <= 1}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={isUpdating}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price and Remove */}
            <div className="flex flex-col items-end justify-between">
              <p className="font-bold">{item.rowTotal.formatted}</p>
              <button
                onClick={() => handleRemoveItem(item.id)}
                disabled={isUpdating}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

