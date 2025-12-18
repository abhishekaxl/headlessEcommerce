/**
 * Homepage - Urban Jungle Co.
 * Nature-inspired eCommerce homepage using Atomic Design
 */

import { getApolloClient } from '@/lib/apollo/client';
import { GET_PRODUCTS_BY_CATEGORY, GET_CATEGORIES } from '@/lib/apollo/queries';
import { HeroSection, FeaturesBar, ProductGrid } from '@/components/organisms';
import { Text, Button } from '@/components/atoms';
import Link from 'next/link';

// Keep existing home components for now - they can be migrated later
import { FlashSaleBanner } from '@/components/home/FlashSaleBanner';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { AboutSection } from '@/components/home/AboutSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

export default async function HomePage() {
  let trendingProducts: any[] = [];
  let popularProducts: any[] = [];
  let categories: any[] = [];

  const client = getApolloClient();

  try {
    const { data } = await client.query({
      query: GET_PRODUCTS_BY_CATEGORY,
      variables: {
        categorySlug: 'gear',
        pagination: { limit: 6 },
      },
      fetchPolicy: 'no-cache',
    });
    const productsResult = data?.productsByCategory || { items: [] };
    trendingProducts = productsResult.items?.slice(0, 3) || [];
    popularProducts = productsResult.items?.slice(3, 6) || [];
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  try {
    const { data } = await client.query({
      query: GET_CATEGORIES,
      fetchPolicy: 'no-cache',
    });
    categories = data?.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
  }

  // Fallback products using atomic design structure
  const fallbackProducts = [
    { id: '1', sku: '1', name: 'Zen Bamboo', slug: 'zen-bamboo', price: { amount: 70, currency: 'USD', formatted: '$70.00' }, images: [], inStock: true },
    { id: '2', sku: '2', name: 'Starlight Succulent', slug: 'starlight', price: { amount: 80, currency: 'USD', formatted: '$80.00' }, images: [], inStock: true },
    { id: '3', sku: '3', name: 'Silver Mist', slug: 'silver-mist', price: { amount: 90, currency: 'USD', formatted: '$90.00' }, images: [], inStock: true },
  ];

  const displayTrending = trendingProducts.length > 0 ? trendingProducts : fallbackProducts;
  const displayPopular = popularProducts.length > 0 ? popularProducts : fallbackProducts;

  return (
    <>
      <HeroSection />
      <FeaturesBar />
      
      {/* Trending Products Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Text variant="h2">Trending Now</Text>
          <Text variant="body" color="muted" as="p">Our most popular plants this season</Text>
        </div>
        <ProductGrid products={displayTrending} columns={3} />
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/shop">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>
      </section>
      
      <FlashSaleBanner />
      <CategoriesSection categories={categories} />
      <AboutSection />
      
      {/* Popular Products Section */}
      <section style={{ padding: '80px 24px', background: '#f8f7f4' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Text variant="h2">Popular Picks</Text>
            <Text variant="body" color="muted" as="p">Customer favorites you&apos;ll love</Text>
          </div>
          <ProductGrid products={displayPopular} columns={3} />
        </div>
      </section>
      
      <TestimonialsSection />
    </>
  );
}
