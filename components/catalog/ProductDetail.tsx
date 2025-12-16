/**
 * Product Detail Component
 * Displays product details and configurable options
 */

'use client';

import { useState } from 'react';
import { Product } from '@/lib/graphql/types';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const handleOptionChange = (optionCode: string, valueCode: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionCode]: valueCode,
    }));
  };

  if (!product.configurableOptions || product.configurableOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-semibold">Select Options</h3>
      
      {product.configurableOptions.map((option) => (
        <div key={option.id}>
          <label className="block text-sm font-medium mb-2">
            {option.label}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => (
              <button
                key={value.id}
                onClick={() => handleOptionChange(option.code, value.code)}
                className={`px-4 py-2 border rounded transition-colors ${
                  selectedOptions[option.code] === value.code
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {value.swatch ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={value.swatch}
                      alt={value.label}
                      className="w-6 h-6 rounded"
                    />
                    <span>{value.label}</span>
                  </div>
                ) : (
                  <span>{value.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

