'use client';

import React from 'react';

interface PriceProps {
  amount: number;
  currency?: string;
  originalAmount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

export const Price: React.FC<PriceProps> = ({
  amount,
  currency = 'USD',
  originalAmount,
  size = 'md',
  className = '',
}) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  const hasDiscount = originalAmount && originalAmount > amount;

  return (
    <div className={`price-wrapper ${className}`}>
      <span className={`current-price ${sizeStyles[size]} font-semibold text-[#1a1a1a]`}>
        {formatter.format(amount)}
      </span>
      {hasDiscount && (
        <span className={`original-price ${sizeStyles[size]} text-[#999] line-through ml-2`}>
          {formatter.format(originalAmount)}
        </span>
      )}
    </div>
  );
};

export default Price;

