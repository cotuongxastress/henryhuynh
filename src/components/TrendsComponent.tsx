'use client';

import { useState, useEffect } from 'react';
import { Locale } from '../app/i18n/settings';

interface TrendsComponentProps {
  dictionary: any;
  locale: Locale;
}

interface GoogleTrend {
  title: { query: string };
  formattedTraffic?: string;
  relatedQueries: Array<{ query: string; value: number } | string>;
}

interface YouTubeTrend {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export default function TrendsComponent({ dictionary, locale }: TrendsComponentProps) {
  const [googleTrends, setGoogleTrends] = useState<GoogleTrend[]>([]);
  const [youtubeTrends, setYoutubeTrends] = useState<YouTubeTrend[]>([]);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const [activeTab, setActiveTab] = useState('google');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoogleTrends();
    fetchYoutubeTrends();
  }, []);

  const fetchGoogleTrends = async () => {
    setIsLoadingGoogle(true);
    setError(null);
    
    try {
      // Map locale to Google Trends geo parameter
      const geoMap: Record<Locale, string> = {
        en: 'US',
        vi: 'VN',
        es: 'ES'
      };
      
      const geo = geoMap[locale] || 'US';
      const response = await fetch(`/api/trends/google?geo=${geo}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Google trends');
      }
      
      const data = await response.json();
      
      // Extract trending searches from the response
      const trendingSearches = data.dailyTrends?.default?.trendingSearchesDays[0]?.trendingSearches || [];
      setGoogleTrends(trendingSearches);
    } catch (err) {
      console.error('Error fetching Google trends:', err);
      setError('Failed to load Google trends');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const fetchYoutubeTrends = async () => {
    setIsLoadingYoutube(true);
    setError(null);
    
    try {
      // Map locale to YouTube regionCode parameter
      const regionMap: Record<Locale, string> = {
        en: 'US',
        vi: 'VN',
        es: 'ES'
      };
      
      const regionCode = regionMap[locale] || 'US';
      const response = await fetch(`/api/trends/youtube?regionCode=${regionCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube trends');
      }
      
      const data = await response.json();
      setYoutubeTrends(data.trendingVideos || []);
    } catch (err) {
      console.error('Error fetching YouTube trends:', err);
      setError('Failed to load YouTube trends');
    } finally {
      setIsLoadingYoutube(false);
    }
  };

  const formatNumber = (num: string) => {
    const n = parseInt(num, 10);
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return n.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'google' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('google')}
        >
          {dictionary.trends.googleTrends}
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'youtube' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('youtube')}
        >
          {dictionary.trends.youtubeTrends}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {activeTab === 'google' && (
        <div className="space-y-6">
          {isLoadingGoogle ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{dictionary.trends.dailyTrends}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {googleTrends.map((trend, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{trend.title.query}</h3>
                      {trend.formattedTraffic && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {trend.formattedTraffic}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="font-medium text-sm text-gray-700 mb-1">{dictionary.trends.relatedQueries}</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(trend.relatedQueries) && trend.relatedQueries.map((query, qIndex) => (
                          <a
                            key={qIndex}
                            href={`/${locale}/search?q=${encodeURIComponent(typeof query === 'string' ? query : query.query)}`}
                            className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs"
                          >
                            {typeof query === 'string' ? query : query.query}
                          </a>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <a
                        href={`/${locale}/search?q=${encodeURIComponent(trend.title.query)}`}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        {dictionary.common.search}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'youtube' && (
        <div className="space-y-6">
          {isLoadingYoutube ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{dictionary.trends.youtubeTrends}</h2>
              <div className="space-y-4">
                {youtubeTrends.map((video) => (
                  <div key={video.id} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img
                          src={video.snippet.thumbnails.high.url}
                          alt={video.snippet.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="p-4 md:w-2/3">
                        <h3 className="font-bold text-lg mb-1">{video.snippet.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{video.snippet.channelTitle}</p>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.snippet.description}</p>
                        
                        <div className="flex gap-4 text-sm text-gray-500 mb-3">
                          <span>{formatNumber(video.statistics.viewCount)} views</span>
                          <span>{formatNumber(video.statistics.likeCount)} likes</span>
                          <span>{formatNumber(video.statistics.commentCount)} comments</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(video.snippet.publishedAt).toLocaleDateString()}
                          </span>
                          <div className="space-x-2">
                            <a
                              href={`https://www.youtube.com/watch?v=${video.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm"
                            >
                              Watch Video
                            </a>
                            <a
                              href={`/${locale}/outline?topic=${encodeURIComponent(video.snippet.title)}`}
                              className="text-green-500 hover:underline text-sm"
                            >
                              {dictionary.search.createOutline}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
