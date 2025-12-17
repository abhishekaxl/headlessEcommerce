'use client';

import React from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ShopLayoutProps {
  children: React.ReactNode;
  categories?: Category[];
  title?: string;
  subtitle?: string;
}

export const ShopLayout: React.FC<ShopLayoutProps> = ({
  children,
  categories = [],
  title = 'Shop',
  subtitle = 'Browse our curated collection',
}) => {
  return (
    <>
      <div className="shop-layout">
        {/* Page Header */}
        <div className="page-header">
          <div className="container">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        <div className="shop-container">
          {/* Sidebar */}
          <aside className="shop-sidebar">
            <div className="sidebar-section">
              <h4 className="sidebar-title">Categories</h4>
              <ul className="category-list">
                <li>
                  <Link href="/shop" className="active">All Products</Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                  </li>
                ))}
              </ul>
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
          <div className="shop-content">{children}</div>
        </div>
      </div>

      <style jsx>{`
        .shop-layout {
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

        .shop-container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 60px 24px;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 48px;
        }

        .shop-sidebar {
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
          margin-bottom: 8px;
        }

        .category-list a {
          display: block;
          padding: 8px 0;
          color: var(--dark-gray);
          font-size: 15px;
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .category-list a:hover,
        .category-list a.active {
          color: var(--primary);
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

        @media (max-width: 1024px) {
          .shop-container {
            grid-template-columns: 1fr;
          }

          .shop-sidebar {
            position: static;
          }
        }
      `}</style>
    </>
  );
};

export default ShopLayout;
