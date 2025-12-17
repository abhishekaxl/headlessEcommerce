/**
 * Product Card Component - Urban Jungle Co.
 */

'use client';

import Link from 'next/link';
import { Product } from '@/lib/graphql/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url || 
    'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80';
  
  return (
    <div className="product-card">
      <Link href={`/product/${product.slug}`} className="product-link">
        <div className="product-image">
          <img src={imageUrl} alt={product.name} />
          <div className="product-overlay">
            <button className="add-to-cart-btn">Add to cart</button>
          </div>
        </div>
        <div className="product-content">
          <div className="product-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="star empty">★</span>
            ))}
          </div>
          <span className="product-category">Indoor Plants</span>
          <h3 className="product-title">{product.name}</h3>
          <span className="product-price">
            {product.price?.formatted || `$${product.price?.amount?.toFixed(2) || '0.00'}`}
          </span>
        </div>
      </Link>

      <style jsx>{`
        .product-card {
          background: #fff;
          transition: all 0.3s ease;
        }

        .product-link {
          display: block;
          text-decoration: none;
        }

        .product-image {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background: #f5f3ee;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.08);
        }

        .product-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .add-to-cart-btn {
          padding: 12px 28px;
          background: #fff;
          color: #1a1a1a;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-to-cart-btn:hover {
          background: #4a7c59;
          color: #fff;
        }

        .product-content {
          padding: 20px 0;
          text-align: center;
        }

        .product-rating {
          display: flex;
          justify-content: center;
          gap: 2px;
          margin-bottom: 8px;
        }

        .star {
          color: #c9a227;
          font-size: 14px;
        }

        .star.empty {
          color: #e8e6e1;
        }

        .product-category {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #9a9a9a;
          margin-bottom: 8px;
        }

        .product-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.375rem;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 8px;
          transition: color 0.2s;
        }

        .product-card:hover .product-title {
          color: #4a7c59;
        }

        .product-price {
          font-size: 1.125rem;
          font-weight: 600;
          color: #4a7c59;
        }
      `}</style>
    </div>
  );
}

