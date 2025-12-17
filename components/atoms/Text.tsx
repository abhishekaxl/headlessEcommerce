'use client';

import React from 'react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'error' | 'success' | 'white';

interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const defaultTags: Record<TextVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  small: 'span',
  caption: 'span',
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  className = '',
  children,
  as,
}) => {
  const Tag = as || defaultTags[variant];

  return (
    <>
      <Tag className={`text text-${variant} text-color-${color} ${className}`}>
        {children}
      </Tag>

      <style jsx>{`
        .text {
          margin: 0;
        }

        .text-h1 {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 600;
          line-height: 1.2;
        }

        .text-h2 {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          line-height: 1.2;
        }

        .text-h3 {
          font-family: var(--font-heading);
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 500;
          line-height: 1.3;
        }

        .text-h4 {
          font-family: var(--font-body);
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .text-body {
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.6;
        }

        .text-small {
          font-family: var(--font-body);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .text-caption {
          font-family: var(--font-body);
          font-size: 0.75rem;
          line-height: 1.4;
        }

        .text-color-primary { color: var(--black); }
        .text-color-secondary { color: var(--charcoal); }
        .text-color-muted { color: var(--dark-gray); }
        .text-color-accent { color: var(--primary); }
        .text-color-error { color: #dc3545; }
        .text-color-success { color: #28a745; }
        .text-color-white { color: #fff; }
      `}</style>
    </>
  );
};

export default Text;
