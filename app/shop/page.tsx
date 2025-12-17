'use client';

import React, { useEffect, useState } from 'react';
import { ShopLayout } from '@/components/templates';
import { ProductGrid } from '@/components/organisms';
import { Text } from '@/components/atoms';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productsRes = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query ProductsByCategory($categorySlug: String!, $pagination: PaginationInput) {
              productsByCategory(categorySlug: $categorySlug, pagination: $pagination) {
                items { id sku name slug type price { amount currency formatted } images { url alt } inStock stockStatus }
              }
            }`,
            variables: { categorySlug: 'gear', pagination: { limit: 12 } },
            operationName: 'ProductsByCategory',
          }),
        });
        const productsData = await productsRes.json();
        setProducts(productsData?.data?.productsByCategory?.items || []);

        const catsRes = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query GetCategories { categories { id name slug } }`,
            operationName: 'GetCategories',
          }),
        });
        const catsData = await catsRes.json();
        setCategories(catsData?.data?.categories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fallbackProducts = [
    { id: '1', sku: '1', name: 'Zen Bamboo', slug: 'zen-bamboo', price: { amount: 70, currency: 'USD', formatted: '$70.00' }, images: [], inStock: true },
    { id: '2', sku: '2', name: 'Starlight Succulent', slug: 'starlight', price: { amount: 80, currency: 'USD', formatted: '$80.00' }, images: [], inStock: true },
    { id: '3', sku: '3', name: 'Silver Mist', slug: 'silver-mist', price: { amount: 90, currency: 'USD', formatted: '$90.00' }, images: [], inStock: true },
    { id: '4', sku: '4', name: 'Desert Bloom', slug: 'desert-bloom', price: { amount: 100, currency: 'USD', formatted: '$100.00' }, images: [], inStock: true },
    { id: '5', sku: '5', name: 'Golden Glow', slug: 'golden-glow', price: { amount: 110, currency: 'USD', formatted: '$110.00' }, images: [], inStock: true },
    { id: '6', sku: '6', name: 'Emerald Dream', slug: 'emerald-dream', price: { amount: 120, currency: 'USD', formatted: '$120.00' }, images: [], inStock: true },
  ];

  const displayProducts = products.length > 0 ? products : fallbackProducts;

  return (
    <ShopLayout categories={categories} title="Shop" subtitle="Browse our curated collection of beautiful plants">
      <div className="shop-toolbar">
        <Text variant="small" color="muted">
          {loading ? 'Loading...' : `Showing ${displayProducts.length} results`}
        </Text>
        <select className="sort-select">
          <option value="default">Default sorting</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      <ProductGrid products={displayProducts} columns={3} />

      <style jsx>{`
        .shop-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e8e6e1;
        }
        .sort-select {
          padding: 10px 16px;
          border: 1px solid #e8e6e1;
          background: #fff;
          font-size: 14px;
          color: #333;
          cursor: pointer;
        }
      `}</style>
    </ShopLayout>
  );
}
