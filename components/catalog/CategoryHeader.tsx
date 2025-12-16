/**
 * Category Header Component
 * Displays category information and breadcrumbs
 */

import { Category } from '@/lib/graphql/types';
import Link from 'next/link';

interface CategoryHeaderProps {
  category: Category;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {category.breadcrumbs && category.breadcrumbs.length > 0 && (
        <nav className="mb-4 text-sm text-gray-600">
          <ol className="flex space-x-2">
            <li>
              <Link href="/" className="hover:text-gray-900">
                Home
              </Link>
            </li>
            {category.breadcrumbs.map((crumb) => (
              <li key={crumb.id} className="flex items-center">
                <span className="mx-2">/</span>
                <Link href={`/category/${crumb.slug}`} className="hover:text-gray-900">
                  {crumb.name}
                </Link>
              </li>
            ))}
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">{category.name}</span>
            </li>
          </ol>
        </nav>
      )}

      {/* Category Title */}
      <h1 className="text-4xl font-bold mb-4">{category.name}</h1>

      {/* Category Description */}
      {category.description && (
        <div
          className="prose text-gray-600"
          dangerouslySetInnerHTML={{ __html: category.description }}
        />
      )}
    </div>
  );
}

