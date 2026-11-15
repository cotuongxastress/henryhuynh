'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Locale } from '../app/i18n/settings';

interface SearchResultsProps {
  dictionary: any;
  locale: Locale;
}

interface Channel {
  id: { channelId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface Video {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    publishedAt: string;
  };
}

interface SearchResponse {
  query: string;
  channels: Channel[];
  videos: Video[];
  relatedTopics: string[];
}

export default function SearchResults({ dictionary, locale }: SearchResultsProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data = (await response.json()) as SearchResponse;
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
        setError(dictionary.search.noResults);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, dictionary.search.noResults]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold text-red-500">{error}</h2>
        <p className="mt-2">{dictionary.search.searchAgain}</p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">{dictionary.search.relatedTopics}</h2>
        <div className="flex flex-wrap gap-2">
          {results.relatedTopics.map((topic, index) => (
            <a 
              key={index}
              href={`/${locale}/search?q=${encodeURIComponent(topic)}`}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm"
            >
              {topic}
            </a>
          ))}
        </div>
      </section>

      {results.channels.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.channels.map((channel) => (
              <div key={channel.id.channelId} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {channel.snippet.thumbnails.medium && (
                      <img 
                        src={channel.snippet.thumbnails.medium.url} 
                        alt={channel.snippet.title}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <h3 className="font-bold">{channel.snippet.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{channel.snippet.description}</p>
                  <a 
                    href={`https://www.youtube.com/channel/${channel.id.channelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-blue-500 hover:underline text-sm"
                  >
                    View Channel
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.videos.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.videos.map((video) => (
              <div key={video.id.videoId} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                {video.snippet.thumbnails.medium && (
                  <img 
                    src={video.snippet.thumbnails.medium.url} 
                    alt={video.snippet.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold mb-1">{video.snippet.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.snippet.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(video.snippet.publishedAt).toLocaleDateString()}
                    </span>
                    <a 
                      href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Watch Video
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 text-center">
        <button 
          onClick={() => window.location.href = `/${locale}/outline?topic=${encodeURIComponent(query)}`}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition"
        >
          {dictionary.search.createOutline}
        </button>
      </div>
    </div>
  );
}
