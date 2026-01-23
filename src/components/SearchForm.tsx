'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Locale } from '../app/i18n/settings';

interface SearchFormProps {
  dictionary: any;
  locale: Locale;
}

export default function SearchForm({ dictionary, locale }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    // Navigate to search results page with the query
    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dictionary.home.searchPlaceholder}
          className="w-full p-4 border rounded-lg"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isLoading ? '...' : dictionary.common.search}
        </button>
      </div>
    </form>
  );
}
