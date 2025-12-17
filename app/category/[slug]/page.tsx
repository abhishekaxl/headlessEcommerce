'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProductGrid } from '@/components/organisms';
import { Text } from '@/components/atoms';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  children?: Category[];
}

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
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Fetch category details with children
        const catRes = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query GetCategory($slug: String!) { 
              category(slug: $slug) { 
                id name slug description 
                children { id name slug children { id name slug } } 
              } 
            }`,
            variables: { slug },
            operationName: 'GetCategory',
          }),
        });
        const catData = await catRes.json();
        const fetchedCategory = catData?.data?.category;
        
        if (fetchedCategory) {
          setCategory(fetchedCategory);
        } else {
          // Fallback category with sample children
          setCategory({
            id: '0',
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            slug,
            children: [
              { id: '1', name: 'Succulents', slug: 'succulents' },
              { id: '2', name: 'Tropical', slug: 'tropical' },
              { id: '3', name: 'Ferns', slug: 'ferns' },
            ],
          });
        }

        // Fetch products for this specific category
        const productsRes = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query ProductsByCategory($categorySlug: String!, $pagination: PaginationInput) {
              productsByCategory(categorySlug: $categorySlug, pagination: $pagination) {
                items { id sku name slug price { amount currency formatted } images { url alt } inStock stockStatus }
              }
            }`,
            variables: { categorySlug: slug, pagination: { limit: 12 } },
            operationName: 'ProductsByCategory',
          }),
        });
        const productsData = await productsRes.json();
        setProducts(productsData?.data?.productsByCategory?.items || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // Fallback products
  const fallbackProducts: Product[] = [
    { id: '1', sku: '1', name: 'Zen Bamboo', slug: 'zen-bamboo', price: { amount: 70, currency: 'USD', formatted: '$70.00' }, images: [], inStock: true },
    { id: '2', sku: '2', name: 'Starlight Succulent', slug: 'starlight', price: { amount: 80, currency: 'USD', formatted: '$80.00' }, images: [], inStock: true },
    { id: '3', sku: '3', name: 'Silver Mist', slug: 'silver-mist', price: { amount: 90, currency: 'USD', formatted: '$90.00' }, images: [], inStock: true },
    { id: '4', sku: '4', name: 'Desert Bloom', slug: 'desert-bloom', price: { amount: 100, currency: 'USD', formatted: '$100.00' }, images: [], inStock: true },
    { id: '5', sku: '5', name: 'Golden Glow', slug: 'golden-glow', price: { amount: 110, currency: 'USD', formatted: '$110.00' }, images: [], inStock: true },
    { id: '6', sku: '6', name: 'Emerald Dream', slug: 'emerald-dream', price: { amount: 120, currency: 'USD', formatted: '$120.00' }, images: [], inStock: true },
  ];

  const displayProducts = products.length > 0 ? products : fallbackProducts;
  const categoryName = category?.name || slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Category';
  const subcategories = category?.children || [];

  return (
    <>
      <div className="category-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="container">
            <h1>{categoryName}</h1>
            <p>{category?.description || `Browse our ${categoryName.toLowerCase()} collection`}</p>
          </div>
        </div>

        <div className="category-container">
          {/* Sidebar - Shows only subcategories of current category */}
          <aside className="category-sidebar">
            <div className="sidebar-section">
              <h4 className="sidebar-title">{categoryName}</h4>
              {subcategories.length > 0 ? (
                <ul className="category-list">
                  <li>
                    <Link href={`/category/${slug}`} className="active">
                      All {categoryName}
                    </Link>
                  </li>
                  {subcategories.map((subCat) => (
                    <li key={subCat.id}>
                      <Link href={`/category/${subCat.slug}`}>
                        {subCat.name}
                      </Link>
                      {/* Show third level if exists */}
                      {subCat.children && subCat.children.length > 0 && (
                        <ul className="subcategory-list">
                          {subCat.children.map((subSubCat) => (
                            <li key={subSubCat.id}>
                              <Link href={`/category/${subSubCat.slug}`}>
                                {subSubCat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-subcategories">No subcategories</p>
              )}
              <Link href="/shop" className="back-to-shop">
                ← Back to All Products
              </Link>
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-title">Price Range</h4>
              <div className="price-filter">
                <input type="range" min="0" max="200" defaultValue="200" />
                <div className="price-labels">
                  <span>$0</span>
                  <span>$200</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="category-content">
            <div className="shop-toolbar">
              <Text variant="small" color="muted">
                {loading ? 'Loading...' : `Showing ${displayProducts.length} products in ${categoryName}`}
              </Text>
              <select className="sort-select">
                <option value="default">Default sorting</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            <ProductGrid products={displayProducts} columns={3} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .category-page {
          min-height: 100vh;
        }

        .page-header {
          background: linear-gradient(135deg, var(--off-white) 0%, var(--light-gray) 100%);
          padding: 60px 24px;
          text-align: center;
        }

        .page-header h1 {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 600;
          color: var(--black);
          margin-bottom: 12px;
        }

        .page-header p {
          font-size: 1.1rem;
          color: var(--dark-gray);
          margin: 0;
        }

        .container {
          max-width: var(--container-max);
          margin: 0 auto;
        }

        .category-container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 60px 24px;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 48px;
        }

        .category-sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .sidebar-section {
          margin-bottom: 40px;
        }

        .sidebar-title {
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          color: var(--black);
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--light-gray);
        }

        .category-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .category-list li {
          margin-bottom: 4px;
        }

        .category-list a {
          display: block;
          padding: 10px 12px;
          color: var(--dark-gray);
          font-size: 15px;
          text-decoration: none;
          transition: all var(--transition-fast);
          border-radius: 4px;
        }

        .category-list a:hover,
        .category-list a.active {
          color: var(--primary);
          background: rgba(74, 124, 89, 0.08);
        }

        .subcategory-list {
          list-style: none;
          padding: 0 0 0 16px;
          margin: 4px 0 8px;
          border-left: 2px solid var(--light-gray);
        }

        .subcategory-list a {
          font-size: 14px;
          padding: 8px 12px;
        }

        .no-subcategories {
          font-size: 14px;
          color: var(--gray);
          padding: 8px 0;
        }

        .back-to-shop {
          display: block;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--light-gray);
          font-size: 14px;
          color: var(--primary);
          text-decoration: none;
        }

        .back-to-shop:hover {
          text-decoration: underline;
        }

        .price-filter input[type="range"] {
          width: 100%;
          margin-bottom: 12px;
          accent-color: var(--primary);
        }

        .price-labels {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--dark-gray);
        }

        .shop-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--light-gray);
        }

        .sort-select {
          padding: 10px 16px;
          border: 1px solid var(--light-gray);
          background: var(--white);
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--charcoal);
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .category-container {
            grid-template-columns: 1fr;
          }

          .category-sidebar {
            position: static;
          }
        }
      `}</style>
    </>
  );
}
