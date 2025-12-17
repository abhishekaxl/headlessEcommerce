/**
 * Product Detail Page (PDP)
 * Individual product page with details, images, and add to cart
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/graphql/queries';
import { ProductImageGallery } from '@/components/catalog/ProductImageGallery';
import { ProductPurchasePanel } from '@/components/catalog/ProductPurchasePanel';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription,
    alternates: {
      canonical: product.canonicalUrl,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.map((img) => img.url),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ProductImageGallery images={product.images} />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {product.sku && (
            <p className="text-gray-600 mb-4">SKU: {product.sku}</p>
          )}

          {/* Price */}
          <div className="mb-6">
            {product.price ? (
              <p className="text-3xl font-bold">
                {product.price.formatted}
              </p>
            ) : product.priceRange ? (
              <p className="text-3xl font-bold">
                {product.priceRange.min.formatted} - {product.priceRange.max.formatted}
              </p>
            ) : null}
            
            {product.specialPrice && (
              <p className="text-lg text-gray-500 line-through">
                {product.price?.formatted}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.inStock ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                In Stock
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div
              className="mb-6 prose"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {/* Configurable Options */}
          {product.configurableOptions && product.configurableOptions.length > 0 && (
            <ProductPurchasePanel product={product} />
          )}

          {/* Add to Cart */}
          <div className="mt-8">
            {(!product.configurableOptions || product.configurableOptions.length === 0) && (
              <ProductPurchasePanel product={product} />
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {product.relatedProducts.map((relatedProduct) => (
              <a
                key={relatedProduct.id}
                href={`/product/${relatedProduct.slug}`}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                {relatedProduct.images[0] && (
                  <img
                    src={relatedProduct.images[0].url}
                    alt={relatedProduct.images[0].alt || relatedProduct.name}
                    className="w-full h-48 object-cover mb-2"
                  />
                )}
                <h3 className="font-medium">{relatedProduct.name}</h3>
                {relatedProduct.price && (
                  <p className="text-lg font-bold mt-2">
                    {relatedProduct.price.formatted}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


