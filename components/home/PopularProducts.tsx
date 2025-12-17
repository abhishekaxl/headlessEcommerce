/**
 * Popular Products Section - Urban Jungle Co.
 */

'use client';

import { Product } from '@/lib/graphql/types';
import { ProductCard } from '@/components/catalog/ProductCard';

interface PopularProductsProps {
  products: Product[];
}

export function PopularProducts({ products }: PopularProductsProps) {
  // Fallback products if no data
  const displayProducts = products.length > 0 ? products : [
    { id: '4', sku: '4', name: 'Desert Bloom', slug: 'desert-bloom', price: { amount: 70, currency: 'USD', formatted: '$70.00' }, images: [], inStock: true, stockStatus: 'IN_STOCK' as const, type: 'SIMPLE' as const },
    { id: '5', sku: '5', name: 'Golden Glow', slug: 'golden-glow', price: { amount: 85, currency: 'USD', formatted: '$85.00' }, images: [], inStock: true, stockStatus: 'IN_STOCK' as const, type: 'SIMPLE' as const },
    { id: '6', sku: '6', name: 'Silver Mist', slug: 'silver-mist-2', price: { amount: 92, currency: 'USD', formatted: '$92.00' }, images: [], inStock: true, stockStatus: 'IN_STOCK' as const, type: 'SIMPLE' as const },
  ];

  return (
    <section className="popular-section">
      <div className="container">
        <h2 className="section-title">Popular Products</h2>
        <div className="products-grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .popular-section {
          padding: 80px 24px;
          background: #f8f7f4;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          text-align: center;
          color: #1a1a1a;
          margin-bottom: 48px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .products-grid {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}

