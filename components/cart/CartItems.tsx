/**
 * Cart Items Component
 * Displays cart items with update/remove functionality
 */

'use client';

import { CartItem } from '@/lib/graphql/types';
import { useUpdateCartItem, useRemoveCartItem } from '@/lib/apollo/hooks';
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
  const { updateCartItem } = useUpdateCartItem();
  const { removeCartItem } = useRemoveCartItem();

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
    <div className="cart-items">
      {items.map((item) => {
        const isUpdating = updatingItems.has(item.id);
        const imageUrl = item.product.images?.[0]?.url;
        const imageAlt = item.product.images?.[0]?.alt || item.product.name;

        return (
          <div key={item.id} className="cart-item">
            <div className="item-media">
              <Link href={`/product/${item.product.slug || ''}`} className="image-link">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    width={96}
                    height={96}
                    className="item-image"
                  />
                ) : (
                  <div className="item-image placeholder">No Image</div>
                )}
              </Link>
            </div>

            <div className="item-details">
              <Link href={`/product/${item.product.slug || ''}`} className="item-name">
                {item.product.name || 'Product'}
              </Link>
              {item.product.sku ? <div className="item-sku">SKU: {item.product.sku}</div> : null}

              <div className="qty-row">
                <span className="qty-label">Quantity</span>
                <div className="qty-controls">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={isUpdating || item.quantity <= 1}
                    className="qty-btn"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={isUpdating}
                    className="qty-btn"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="item-actions">
              <div className="item-price">{item.rowTotal.formatted}</div>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                disabled={isUpdating}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 120px 1fr 140px;
          gap: 16px;
          padding: 16px;
          border: 1px solid var(--light-gray);
          background: var(--white);
          align-items: center;
        }

        .item-media {
          width: 120px;
        }

        .image-link {
          display: inline-block;
        }

        :global(.item-image) {
          border-radius: 8px;
          background: var(--cream);
          object-fit: cover;
        }

        .placeholder {
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray);
          font-size: 12px;
          border-radius: 8px;
          background: var(--cream);
        }

        .item-details {
          min-width: 0;
        }

        .item-name {
          display: inline-block;
          font-family: var(--font-body);
          font-weight: 600;
          color: var(--black);
          text-decoration: none;
          margin-bottom: 6px;
        }

        .item-name:hover {
          color: var(--primary);
        }

        .item-sku {
          font-size: 13px;
          color: var(--dark-gray);
          margin-bottom: 12px;
        }

        .qty-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qty-label {
          font-size: 13px;
          color: var(--dark-gray);
          width: 70px;
        }

        .qty-controls {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--light-gray);
        }

        .qty-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: var(--white);
          cursor: pointer;
          font-size: 18px;
          color: var(--charcoal);
        }

        .qty-btn:hover {
          background: var(--off-white);
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-value {
          width: 44px;
          text-align: center;
          font-weight: 600;
          color: var(--black);
        }

        .item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .item-price {
          font-weight: 700;
          color: var(--black);
        }

        .remove-btn {
          border: none;
          background: transparent;
          color: #dc3545;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
        }

        .remove-btn:hover {
          text-decoration: underline;
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .cart-item {
            grid-template-columns: 96px 1fr;
            grid-template-rows: auto auto;
          }
          .item-actions {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}


