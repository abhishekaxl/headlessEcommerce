/**
 * Simple Home Page (No GraphQL)
 * Test version without API calls
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Store</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Shop by Category</h2>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Loading categories...</p>
          <div className="mt-8">
            <Link 
              href="/search" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}



