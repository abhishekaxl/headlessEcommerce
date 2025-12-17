/**
 * Product Grid Component
 * Displays products in a grid layout
 */

'use client';

import Link from 'next/link';
import { Product } from '@/lib/graphql/types';
import Image from 'next/image';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.slug}`}
          className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          {product.images[0] && (
            <div className="relative w-full h-64 bg-gray-100">
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
            {product.price && (
              <p className="text-lg font-bold">{product.price.formatted}</p>
            )}
            {!product.inStock && (
              <p className="text-sm text-red-600 mt-2">Out of Stock</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}


