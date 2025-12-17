'use client';

/**
 * Error Boundary Component
 * Handles errors in the application
 */

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }, [error]);

  const isNetworkError = error.message?.toLowerCase().includes('network') || 
                        error.message?.toLowerCase().includes('fetch') ||
                        error.message?.toLowerCase().includes('failed to fetch');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Something went wrong
          </h2>
          
          {isNetworkError ? (
            <>
              <p className="text-gray-600 mb-4">
                Network connection error. Please check:
              </p>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2 bg-gray-50 p-4 rounded">
                <li>• Make sure the development server is running</li>
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Check the browser console for more details</li>
              </ul>
            </>
          ) : (
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try again or return to the homepage.
            </p>
          )}
          
          <div className="text-left text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded">
            <strong>Error:</strong> {error.message || 'Unknown error'}
          </div>
          
          {error.digest && (
            <p className="text-sm text-gray-500 mb-4">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
