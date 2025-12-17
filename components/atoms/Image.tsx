'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect fill="%23f0f0f0" width="300" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  fallbackSrc = PLACEHOLDER_IMAGE,
  objectFit = 'cover',
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  if (fill) {
    return (
      <NextImage
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        style={{ objectFit }}
        onError={handleError}
        unoptimized={imgSrc.startsWith('data:')}
      />
    );
  }

  return (
    <NextImage
      src={imgSrc}
      alt={alt}
      width={width || 300}
      height={height || 300}
      className={className}
      style={{ objectFit }}
      onError={handleError}
      unoptimized={imgSrc.startsWith('data:')}
    />
  );
};

export default Image;

