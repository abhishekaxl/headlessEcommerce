/**
 * Category Page
 * Product listing page for a category
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategory, getProductsByCategory } from '@/lib/graphql/queries';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CategoryHeader } from '@/components/catalog/CategoryHeader';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
    filters?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategory(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: category.metaTitle || category.name,
    description: category.metaDescription || category.description,
    alternates: {
      canonical: category.canonicalUrl,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  // Parse pagination and filters from search params
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  const cursor = page > 1 ? `page-${page}` : undefined;

  // Parse sort
  const sort = searchParams.sort
    ? {
        field: searchParams.sort.split('-')[0].toUpperCase(),
        direction: searchParams.sort.split('-')[1]?.toUpperCase() || 'ASC',
      }
    : undefined;

  // Parse filters (simplified - in production, parse JSON or query params)
  const filters = searchParams.filters ? JSON.parse(searchParams.filters) : undefined;

  const products = await getProductsByCategory(params.slug, { limit, cursor }, filters, sort);

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryHeader category={category} />
      <ProductGrid products={products.items} />
      
      {/* Pagination */}
      {products.pageInfo.hasNextPage && (
        <div className="mt-8 text-center">
          <a
            href={`/category/${params.slug}?page=${page + 1}`}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load More
          </a>
        </div>
      )}
    </div>
  );
}

