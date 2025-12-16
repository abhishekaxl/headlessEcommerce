/**
 * Home Page
 * Landing page of the storefront
 */

import Link from 'next/link';

export default function HomePage() {
  // For now, show static content
  // GraphQL integration will be added once page is stable
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Store</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Shop by Category</h2>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Categories loading...</p>
          <p className="text-sm text-gray-500 mb-4">
            Sample categories from Magento will appear here.
          </p>
          <div className="mt-8 space-x-4">
            <Link 
              href="/search" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
            <Link 
              href="/test" 
              className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Test Page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
