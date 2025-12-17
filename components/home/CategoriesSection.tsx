/**
 * Categories Section - Urban Jungle Co.
 */

'use client';

import Link from 'next/link';
import { Category } from '@/lib/graphql/types';

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  // Fallback categories
  const displayCategories = categories.length > 0 ? categories.slice(0, 4) : [
    { id: '1', name: 'Houseplants', slug: 'houseplants', breadcrumbs: [] },
    { id: '2', name: 'Outdoor Plants', slug: 'outdoor', breadcrumbs: [] },
    { id: '3', name: 'Succulents', slug: 'succulents', breadcrumbs: [] },
    { id: '4', name: 'Desert Bloom', slug: 'desert', breadcrumbs: [] },
  ];

  const categoryImages = [
    'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80',
    'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400&q=80',
    'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&q=80',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80',
  ];

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="section-title">Our Categories</h2>
        <div className="categories-grid">
          {displayCategories.map((category, index) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="category-card"
            >
              <div 
                className="category-image"
                style={{ backgroundImage: `url(${categoryImages[index % categoryImages.length]})` }}
              />
              <div className="category-overlay">
                <h4>{category.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .categories-section {
          padding: 80px 24px;
          background: #f8f7f4;
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

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .category-card {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }

        .category-image {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.5s ease;
        }

        .category-card:hover .category-image {
          transform: scale(1.1);
        }

        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          padding: 24px;
        }

        .category-overlay h4 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .categories-grid {
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

