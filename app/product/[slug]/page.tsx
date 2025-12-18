/**
 * Product Detail Page (PDP)
 * Individual product page with details, images, and add to cart
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getApolloClient } from '@/lib/apollo/client';
import { GET_PRODUCT } from '@/lib/apollo/queries';
import { ProductImageGallery } from '@/components/catalog/ProductImageGallery';
import { ProductPurchasePanel } from '@/components/catalog/ProductPurchasePanel';
import styles from './product.module.css';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const client = getApolloClient();
  const { data } = await client.query({
    query: GET_PRODUCT,
    variables: { slug: params.slug },
    fetchPolicy: 'no-cache',
  });
  const product = data?.product || null;

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
  const client = getApolloClient();
  const { data } = await client.query({
    query: GET_PRODUCT,
    variables: { slug: params.slug },
    fetchPolicy: 'no-cache',
  });
  const product = data?.product || null;

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
      <div className={styles.grid}>
        {/* Product Images */}
        <div className={styles.mediaCol}>
          <ProductImageGallery images={product.images} />
        </div>

        {/* Product Details */}
        <div className={styles.detailsCol}>
          <h1 className={styles.title}>{product.name}</h1>
          
          {product.sku && (
            <p className={styles.sku}>SKU: {product.sku}</p>
          )}

          {/* Price */}
          <div className={styles.priceBlock}>
            {product.price ? (
              <p className={styles.price}>
                {product.price.formatted}
              </p>
            ) : product.priceRange ? (
              <p className={styles.price}>
                {product.priceRange.min.formatted} - {product.priceRange.max.formatted}
              </p>
            ) : null}
            
            {product.specialPrice && (
              <p style={{ color: 'var(--gray)', textDecoration: 'line-through', marginTop: 6 }}>
                {product.price?.formatted}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className={styles.stock}>
            {product.inStock ? (
              <span className={`${styles.badge} ${styles.inStock}`}>
                In Stock
              </span>
            ) : (
              <span className={`${styles.badge} ${styles.outStock}`}>
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {/* Configurable Options */}
          {product.configurableOptions && product.configurableOptions.length > 0 && (
            <div className={styles.purchase}>
              <ProductPurchasePanel product={product} />
            </div>
          )}

          {/* Add to Cart */}
          <div className={styles.purchase}>
            {(!product.configurableOptions || product.configurableOptions.length === 0) && (
              <ProductPurchasePanel product={product} />
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className={styles.related}>
          <h2 className={styles.relatedTitle}>Related Products</h2>
          <div className={styles.relatedGrid}>
            {product.relatedProducts.map((relatedProduct) => (
              <a
                key={relatedProduct.id}
                href={`/product/${relatedProduct.slug}`}
                className={styles.relatedCard}
              >
                {relatedProduct.images[0] && (
                  <img
                    src={relatedProduct.images[0].url}
                    alt={relatedProduct.images[0].alt || relatedProduct.name}
                    className={styles.relatedImg}
                  />
                )}
                <h3 className={styles.relatedName}>{relatedProduct.name}</h3>
                {relatedProduct.price && (
                  <p className={styles.relatedPrice}>
                    {relatedProduct.price.formatted}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}


