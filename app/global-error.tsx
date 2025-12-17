'use client';

/**
 * Global Error Boundary
 * Catches errors in the root layout
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">
                Application Error
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                A critical error occurred
              </h2>
              <p className="text-gray-600 mb-6">
                The application encountered a critical error. Please refresh the page or contact support.
              </p>
              
              {error.digest && (
                <p className="text-sm text-gray-500 mb-4">
                  Error ID: {error.digest}
                </p>
              )}

              <button
                onClick={reset}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


