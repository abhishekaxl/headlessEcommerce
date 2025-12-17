/**
 * Trending Products Section - Urban Jungle Co.
 */

'use client';

import { Product } from '@/lib/graphql/types';
import { ProductCard } from '@/components/catalog/ProductCard';

interface TrendingProductsProps {
  products: Product[];
}

export function TrendingProducts({ products }: TrendingProductsProps) {
  // Fallback products if no data
  const displayProducts = products.length > 0 ? products : [
    { id: '1', sku: '1', name: 'Zen Bamboo Grove', slug: 'zen-bamboo', price: { amount: 90, currency: 'USD', formatted: '$90.00' }, images: [], inStock: true, stockStatus: 'IN_STOCK' as const, type: 'SIMPLE' as const },
    { id: '2', sku: '2', name: 'Starlight Succulent', slug: 'starlight', price: { amount: 95, currency: 'USD', formatted: '$95.00' }, images: [], inStock: true, stockStatus: 'IN_STOCK' as const, type: 'SIMPLE' as const },
    { id: '3', sku: '3', name: 'Silver Mist', slug: 'silver-mist', price: { amount: 92, currency: 'USD', formatted: '$92.00' }, images: [], inStock: true, stockStatus: 'IN_STOCK' as const, type: 'SIMPLE' as const },
  ];

  return (
    <section className="trending-section">
      <div className="container">
        <h2 className="section-title">Trending Products</h2>
        <div className="products-grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .trending-section {
          padding: 80px 24px;
          background: #fff;
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

