/**
 * Product Image Gallery Component
 * Displays product images with thumbnail navigation
 */

'use client';

import { useState } from 'react';
import { Media } from '@/lib/graphql/types';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: Media[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="empty">
        <span>No image available</span>
        <style jsx>{`
          .empty {
            width: 100%;
            height: 420px;
            background: var(--cream);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gray);
            border: 1px solid var(--light-gray);
          }
        `}</style>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <div className="gallery">
      {/* Main Image */}
      <div className="main">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || 'Product image'}
          fill
          className="img"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`thumb ${selectedImageIndex === index ? 'active' : ''}`}
            >
              <Image
                src={image.thumbnail || image.url}
                alt={image.alt || `Thumbnail ${index + 1}`}
                fill
                className="img"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .gallery {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 520px;
        }

        .main {
          position: relative;
          width: 100%;
          height: min(520px, 65vh);
          background: var(--cream);
          border: 1px solid var(--light-gray);
          overflow: hidden;
        }

        :global(.img) {
          object-fit: cover;
        }

        .thumbs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border: 2px solid transparent;
          background: var(--cream);
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .thumb:hover {
          border-color: var(--gray);
        }

        .thumb.active {
          border-color: var(--primary);
        }

        @media (max-width: 1024px) {
          .gallery {
            max-width: 100%;
          }
          .main {
            height: min(420px, 55vh);
          }
        }
      `}</style>
    </div>
  );
}


