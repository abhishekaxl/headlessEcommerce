/**
 * Home Page
 * Landing page of the storefront
 */

import Link from 'next/link';

export default async function HomePage() {
  // Fetch categories for navigation with error handling
  let categories: Array<{ id: string; name: string; slug: string; description?: string }> = [];
  
  try {
    // Try to fetch categories, but don't fail if it doesn't work
    const { getCategories } = await import('@/lib/graphql/queries');
    const result = await getCategories();
    
    // Safely extract categories from result
    if (result && typeof result === 'object' && 'categories' in result) {
      const resultWithCategories = result as { categories?: unknown };
      if (Array.isArray(resultWithCategories.categories)) {
        categories = resultWithCategories.categories as Array<{ id: string; name: string; slug: string; description?: string }>;
      }
    } else if (Array.isArray(result)) {
      categories = result as Array<{ id: string; name: string; slug: string; description?: string }>;
    }
  } catch (error) {
    // Silently fail - just show empty state
    console.error('Error fetching categories:', error);
    categories = [];
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Store</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Shop by Category</h2>
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id || category.slug || Math.random()}
                href={`/category/${category.slug || 'uncategorized'}`}
                className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-medium mb-2">{category.name || 'Unnamed Category'}</h3>
                {category.description && (
                  <p className="text-gray-600 text-sm">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No categories available yet.</p>
            <p className="text-sm text-gray-500 mb-4">
              Install sample data or add categories through the admin panel.
            </p>
            <div className="mt-8">
              <Link 
                href="/search" 
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

