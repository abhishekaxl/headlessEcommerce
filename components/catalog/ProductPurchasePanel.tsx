/**
 * Product Purchase Panel
 * Handles configurable option selection + add to cart enablement
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Product } from '@/lib/graphql/types';
import { ProductDetail } from '@/components/catalog/ProductDetail';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const isConfigurable = product.type === 'CONFIGURABLE' && (product.configurableOptions?.length || 0) > 0;

  const selectionsComplete = useMemo(() => {
    if (!isConfigurable) return true;
    const options = product.configurableOptions || [];
    return options.every((opt) => !!selectedOptions[opt.code]);
  }, [isConfigurable, product.configurableOptions, selectedOptions]);

  const optionsInput = useMemo(() => {
    if (!isConfigurable) return undefined;
    const opts = product.configurableOptions || [];
    return opts
      .map((opt) => {
        const valueUid = selectedOptions[opt.code];
        return valueUid ? { code: opt.code, value: valueUid } : null;
      })
      .filter(Boolean) as Array<{ code: string; value: string }>;
  }, [isConfigurable, product.configurableOptions, selectedOptions]);

  return (
    <div>
      {isConfigurable ? (
        <ProductDetail product={product} onSelectionChange={setSelectedOptions} />
      ) : null}

      {!selectionsComplete && isConfigurable ? (
        <p style={{ color: '#dc3545', fontSize: 13, marginBottom: 10 }}>
          Please select all options to add this product to cart.
        </p>
      ) : null}

      <AddToCartButton
        product={product}
        options={optionsInput}
        disabled={isConfigurable && !selectionsComplete}
        disabledMessage="Please select all options first."
      />
    </div>
  );
}


