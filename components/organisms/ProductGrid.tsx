'use client';

import React from 'react';
import { ProductCard } from '@/components/molecules';

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

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  onAddToCart?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  columns = 3,
  onAddToCart,
}) => {
  return (
    <>
      <div className={`product-grid cols-${columns}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      <style jsx>{`
        .product-grid {
          display: grid;
          gap: 32px;
        }

        .cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .cols-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .cols-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 1024px) {
          .cols-3,
          .cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .product-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default ProductGrid;
