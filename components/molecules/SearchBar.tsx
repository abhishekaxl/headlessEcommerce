'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Icon, Button } from '@/components/atoms';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search products...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`search-bar ${className}`}>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      <Button type="submit" variant="ghost" className="search-btn">
        <Icon name="search" size={20} />
      </Button>

      <style jsx>{`
        .search-bar {
          display: flex;
          align-items: center;
          position: relative;
        }
        :global(.search-input) {
          padding-right: 48px;
        }
        :global(.search-btn) {
          position: absolute;
          right: 4px;
          padding: 8px;
        }
      `}</style>
    </form>
  );
};

export default SearchBar;

