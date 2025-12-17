/**
 * Search Results Page
 * Search results with filters and sorting
 */

import { searchProducts } from '@/lib/graphql/queries';
import { ProductGrid } from '@/components/catalog/ProductGrid';

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
    sort?: string;
    filters?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Search Products</h1>
        <p className="text-gray-600">Enter a search term to find products.</p>
      </div>
    );
  }

  // Parse pagination
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

  // Parse filters
  const filters = searchParams.filters ? JSON.parse(searchParams.filters) : undefined;

  const results = await searchProducts(query, { limit, cursor }, filters, sort);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for &quot;{query}&quot;
      </h1>
      
      {results.totalCount !== undefined && (
        <p className="text-gray-600 mb-6">
          Found {results.totalCount} {results.totalCount === 1 ? 'result' : 'results'}
        </p>
      )}

      <ProductGrid products={results.items} />

      {/* Pagination */}
      {results.pageInfo.hasNextPage && (
        <div className="mt-8 text-center">
          <a
            href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load More
          </a>
        </div>
      )}
    </div>
  );
}


