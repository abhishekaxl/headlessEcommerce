'use client';

import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price?: {
    amount: number;
    currency: string;
    formatted: string;
  } | null;
  images?: Array<{ url: string; alt?: string }>;
  inStock?: boolean;
  rating?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23f5f3ee" width="300" height="300"/%3E%3Ctext fill="%239a9a9a" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const imageUrl = product.images?.[0]?.url || PLACEHOLDER;
  const rating = product.rating || 4.5;
  const fullStars = Math.floor(rating);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <>
      <Link href={`/product/${product.slug}`} className="product-card">
        <div className="product-card-image">
          <NextImage
            src={imageUrl}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            unoptimized={imageUrl.startsWith('data:')}
          />
          {!product.inStock && (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>

        <div className="product-card-content">
          <div className="rating">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`rating-star ${i < fullStars ? '' : 'empty'}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={i < fullStars ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ))}
            <span className="rating-count">({rating})</span>
          </div>

          <h3 className="product-card-title">{product.name}</h3>

          {product.price && (
            <p className="product-card-price">{product.price.formatted}</p>
          )}

          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            Add to cart
          </button>
        </div>
      </Link>

      <style jsx>{`
        .product-card {
          display: block;
          text-decoration: none;
          background: var(--white);
          transition: all var(--transition-normal);
        }

        .product-card:hover {
          transform: translateY(-8px);
        }

        .product-card-image {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background-color: var(--cream);
        }

        .out-of-stock {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #dc3545;
          color: white;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-card-content {
          padding: 20px 0;
          text-align: center;
        }

        .rating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 8px;
        }

        .rating-star {
          color: var(--accent);
        }

        .rating-star.empty {
          color: var(--light-gray);
        }

        .rating-count {
          margin-left: 6px;
          font-size: 12px;
          color: var(--gray);
        }

        .product-card-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--black);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .product-card-price {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 16px;
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 12px 24px;
          background: var(--black);
          color: white;
          border: none;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .add-to-cart-btn:hover {
          background: var(--charcoal);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default ProductCard;
