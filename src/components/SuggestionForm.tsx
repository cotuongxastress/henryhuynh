'use client';

import { useState, FormEvent } from 'react';
import { Locale } from '../app/i18n/settings';

interface SuggestionFormProps {
  dictionary: any;
  locale: Locale;
}

interface Suggestion {
  title: string;
  description: string;
}

const categories = [
  'Technology',
  'Gaming',
  'Cooking',
  'Fitness',
  'Travel',
  'Education',
  'Finance',
  'Beauty',
  'DIY',
  'Entertainment'
];

export default function SuggestionForm({ dictionary, locale }: SuggestionFormProps) {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [language, setLanguage] = useState(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = category === 'custom' ? customCategory : category;
    
    if (!selectedCategory) {
      setError('Please select or enter a category');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          language,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }
      
      const data = (await response.json()) as { suggestions: Suggestion[] };
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError(dictionary.suggest.error || 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {dictionary.suggest.categoryLabel}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="custom">Custom Category</option>
          </select>
        </div>
        
        {category === 'custom' && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Custom Category
            </label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading}
              placeholder="Enter custom category"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">
            {dictionary.outline.languageLabel}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Locale)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
            <option value="es">Español</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 text-white p-3 rounded-lg font-medium hover:bg-green-600 transition"
        >
          {isLoading ? dictionary.suggest.loading : dictionary.suggest.generateButton}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{dictionary.suggest.title}</h2>
          
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                <h3 className="font-bold text-lg mb-2">{suggestion.title}</h3>
                <p className="text-gray-600">{suggestion.description}</p>
                <div className="mt-3 flex justify-end space-x-2">
                  <button 
                    onClick={() => window.location.href = `/${locale}/outline?topic=${encodeURIComponent(suggestion.title)}`}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    {dictionary.search.createOutline}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => handleSubmit({ preventDefault: () => {} } as FormEvent)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              {dictionary.suggest.regenerateButton}
            </button>
            
            <button
              onClick={() => window.location.href = `/${locale}/trends`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {dictionary.suggest.exploreButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
