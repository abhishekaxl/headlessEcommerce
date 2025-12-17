'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query GetCategories { categories { id name slug children { id name slug children { id name slug } } } }`,
            operationName: 'GetCategories',
          }),
        });
        const data = await res.json();
        setCategories(data?.data?.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories
        setCategories([
          { id: '1', name: 'Indoor Plants', slug: 'indoor-plants', children: [
            { id: '11', name: 'Succulents', slug: 'succulents', children: [
              { id: '111', name: 'Desert Cacti', slug: 'desert-cacti' },
              { id: '112', name: 'Aloe Vera', slug: 'aloe-vera' },
            ]},
            { id: '12', name: 'Tropical', slug: 'tropical', children: [
              { id: '121', name: 'Monstera', slug: 'monstera' },
              { id: '122', name: 'Philodendron', slug: 'philodendron' },
            ]},
            { id: '13', name: 'Ferns', slug: 'ferns' },
          ]},
          { id: '2', name: 'Outdoor Plants', slug: 'outdoor-plants', children: [
            { id: '21', name: 'Trees', slug: 'trees' },
            { id: '22', name: 'Shrubs', slug: 'shrubs' },
            { id: '23', name: 'Flowers', slug: 'flowers' },
          ]},
          { id: '3', name: 'Plant Care', slug: 'plant-care', children: [
            { id: '31', name: 'Fertilizers', slug: 'fertilizers' },
            { id: '32', name: 'Pots & Planters', slug: 'pots-planters' },
            { id: '33', name: 'Tools', slug: 'tools' },
          ]},
          { id: '4', name: 'Gifts', slug: 'gifts' },
        ]);
      }
    }
    fetchCategories();
  }, []);

  const handleCategoryHover = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setActiveSubCategory(null);
  };

  const handleSubCategoryHover = (subCategoryId: string | null) => {
    setActiveSubCategory(subCategoryId);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link href="/" className="logo">
            Urban Jungle Co.
          </Link>

          <nav className="nav-desktop">
            <Link href="/" className="nav-link">Home</Link>
            
            {/* Shop Megamenu Trigger */}
            <div 
              className="nav-item-wrapper"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => {
                setMegaMenuOpen(false);
                setActiveCategory(null);
                setActiveSubCategory(null);
              }}
            >
              <Link href="/shop" className="nav-link">
                Shop
                <svg className="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>

              {/* Megamenu */}
              {megaMenuOpen && (
                <div className="megamenu">
                  <div className="megamenu-container">
                    {/* Level 1 - Categories */}
                    <div className="megamenu-col level-1">
                      <h4 className="megamenu-title">Categories</h4>
                      <ul className="megamenu-list">
                        {categories.map((cat) => (
                          <li 
                            key={cat.id}
                            className={`megamenu-item ${activeCategory === cat.id ? 'active' : ''}`}
                            onMouseEnter={() => handleCategoryHover(cat.id)}
                          >
                            <Link href={`/category/${cat.slug}`} className="megamenu-link">
                              {cat.name}
                              {cat.children && cat.children.length > 0 && (
                                <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link href="/shop" className="megamenu-view-all">
                        View All Products →
                      </Link>
                    </div>

                    {/* Level 2 - Subcategories */}
                    {activeCategory && (
                      <div className="megamenu-col level-2">
                        {categories.find(c => c.id === activeCategory)?.children?.length ? (
                          <>
                            <h4 className="megamenu-title">
                              {categories.find(c => c.id === activeCategory)?.name}
                            </h4>
                            <ul className="megamenu-list">
                              {categories
                                .find(c => c.id === activeCategory)
                                ?.children?.map((subCat) => (
                                  <li 
                                    key={subCat.id}
                                    className={`megamenu-item ${activeSubCategory === subCat.id ? 'active' : ''}`}
                                    onMouseEnter={() => handleSubCategoryHover(subCat.id)}
                                  >
                                    <Link href={`/category/${subCat.slug}`} className="megamenu-link">
                                      {subCat.name}
                                      {subCat.children && subCat.children.length > 0 && (
                                        <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M9 5l7 7-7 7" />
                                        </svg>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          </>
                        ) : (
                          <div className="megamenu-promo">
                            <div className="promo-content">
                              <h4>New Arrivals</h4>
                              <p>Check out our latest collection</p>
                              <Link href="/shop?filter=new" className="promo-link">Shop Now</Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Level 3 - Sub-subcategories */}
                    {activeSubCategory && (
                      <div className="megamenu-col level-3">
                        {categories
                          .find(c => c.id === activeCategory)
                          ?.children?.find(sc => sc.id === activeSubCategory)
                          ?.children?.length ? (
                          <>
                            <h4 className="megamenu-title">
                              {categories
                                .find(c => c.id === activeCategory)
                                ?.children?.find(sc => sc.id === activeSubCategory)?.name}
                            </h4>
                            <ul className="megamenu-list">
                              {categories
                                .find(c => c.id === activeCategory)
                                ?.children?.find(sc => sc.id === activeSubCategory)
                                ?.children?.map((subSubCat) => (
                                  <li key={subSubCat.id} className="megamenu-item">
                                    <Link href={`/category/${subSubCat.slug}`} className="megamenu-link">
                                      {subSubCat.name}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          </>
                        ) : (
                          <div className="megamenu-promo">
                            <div className="promo-content">
                              <h4>Featured</h4>
                              <p>Popular in this category</p>
                              <Link href={`/category/${categories.find(c => c.id === activeCategory)?.children?.find(sc => sc.id === activeSubCategory)?.slug}`} className="promo-link">
                                Explore
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/about" className="nav-link">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>

          <div className="header-actions">
            <button className="icon-btn" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link href="/account" className="icon-btn" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <Link href="/cart" className="icon-btn cart-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="cart-count">0</span>
            </Link>
            <button
              className="menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="nav-mobile">
            <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <div className="mobile-accordion">
              <button className="mobile-accordion-trigger" onClick={() => setActiveCategory(activeCategory ? null : 'mobile')}>
                Shop
                <svg className={`chevron ${activeCategory === 'mobile' ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {activeCategory === 'mobile' && (
                <div className="mobile-submenu">
                  {categories.map((cat) => (
                    <div key={cat.id} className="mobile-cat-group">
                      <Link href={`/category/${cat.slug}`} className="mobile-cat-link" onClick={() => setMobileMenuOpen(false)}>
                        {cat.name}
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <div className="mobile-subcat-list">
                          {cat.children.map((subCat) => (
                            <Link key={subCat.id} href={`/category/${subCat.slug}`} className="mobile-subcat-link" onClick={() => setMobileMenuOpen(false)}>
                              {subCat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </nav>
        )}
      </header>

      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--white);
          border-bottom: 1px solid var(--light-gray);
        }

        .header-container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--black);
          text-decoration: none;
        }

        .nav-desktop {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 500;
          color: var(--charcoal);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .chevron {
          transition: transform 0.2s;
        }

        .nav-item-wrapper {
          position: relative;
        }

        .nav-item-wrapper:hover .chevron {
          transform: rotate(180deg);
        }

        /* Megamenu Styles */
        .megamenu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          padding-top: 16px;
          z-index: 1000;
        }

        .megamenu-container {
          display: flex;
          background: var(--white);
          border: 1px solid var(--light-gray);
          box-shadow: var(--shadow-lg);
          min-width: 700px;
        }

        .megamenu-col {
          padding: 24px;
          border-right: 1px solid var(--light-gray);
          min-width: 220px;
        }

        .megamenu-col:last-child {
          border-right: none;
        }

        .megamenu-col.level-1 {
          background: var(--off-white);
        }

        .megamenu-title {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--gray);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--light-gray);
        }

        .megamenu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .megamenu-item {
          margin-bottom: 4px;
        }

        .megamenu-item.active .megamenu-link {
          color: var(--primary);
          background: rgba(74, 124, 89, 0.08);
        }

        .megamenu-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          color: var(--charcoal);
          font-size: 14px;
          text-decoration: none;
          transition: all var(--transition-fast);
          border-radius: 4px;
        }

        .megamenu-link:hover {
          color: var(--primary);
          background: rgba(74, 124, 89, 0.05);
        }

        .megamenu-link .arrow {
          opacity: 0.5;
        }

        .megamenu-view-all {
          display: block;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--light-gray);
          font-size: 13px;
          font-weight: 500;
          color: var(--primary);
          text-decoration: none;
        }

        .megamenu-view-all:hover {
          text-decoration: underline;
        }

        .megamenu-promo {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 200px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          border-radius: 8px;
          padding: 24px;
        }

        .promo-content {
          text-align: center;
          color: var(--white);
        }

        .promo-content h4 {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .promo-content p {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 16px;
        }

        .promo-link {
          display: inline-block;
          padding: 10px 24px;
          background: var(--white);
          color: var(--primary);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .promo-link:hover {
          transform: translateY(-2px);
        }

        /* Header Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          background: transparent;
          border: none;
          color: var(--charcoal);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .icon-btn:hover {
          color: var(--primary);
        }

        .cart-btn {
          position: relative;
        }

        .cart-count {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--primary);
          color: white;
          font-size: 10px;
          font-weight: 600;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-btn {
          display: none;
          padding: 8px;
          background: transparent;
          border: none;
          color: var(--charcoal);
          cursor: pointer;
        }

        /* Mobile Navigation */
        .nav-mobile {
          display: none;
          flex-direction: column;
          padding: 16px 24px 24px;
          border-top: 1px solid var(--light-gray);
          background: var(--white);
        }

        .mobile-accordion-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 0;
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 500;
          color: var(--charcoal);
          cursor: pointer;
        }

        .mobile-accordion-trigger .chevron.open {
          transform: rotate(180deg);
        }

        .mobile-submenu {
          padding: 8px 0 8px 16px;
          border-left: 2px solid var(--light-gray);
          margin-left: 8px;
        }

        .mobile-cat-group {
          margin-bottom: 16px;
        }

        .mobile-cat-link {
          display: block;
          padding: 8px 0;
          font-weight: 500;
          color: var(--black);
          text-decoration: none;
        }

        .mobile-subcat-list {
          padding-left: 12px;
        }

        .mobile-subcat-link {
          display: block;
          padding: 6px 0;
          font-size: 14px;
          color: var(--dark-gray);
          text-decoration: none;
        }

        @media (max-width: 1024px) {
          .nav-desktop {
            display: none;
          }

          .menu-btn {
            display: flex;
          }

          .nav-mobile {
            display: flex;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
