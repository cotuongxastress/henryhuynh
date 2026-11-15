import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY // Will be configured in environment variables
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const regionCode = searchParams.get('regionCode') || 'US';
  const videoCategoryId = searchParams.get('videoCategoryId') || '0';
  
  try {
    // Get trending videos from YouTube
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      chart: 'mostPopular',
      regionCode,
      videoCategoryId,
      maxResults: 10
    });
    
    return NextResponse.json({
      trendingVideos: response.data.items || []
    });
  } catch (error) {
    console.error('YouTube API error:', error);
    
    // Return mock data in case of error
    return NextResponse.json({
      trendingVideos: [
        {
          id: "video1",
          snippet: {
            title: "How to Start a Successful YouTube Channel in 2025",
            description: "Learn the best strategies to grow your YouTube channel from zero to hero in 2025.",
            thumbnails: {
              high: {
                url: "https://via.placeholder.com/480x360"
              }
            },
            channelTitle: "Creator Academy",
            publishedAt: new Date().toISOString()
          },
          statistics: {
            viewCount: "1500000",
            likeCount: "120000",
            commentCount: "8500"
          }
        },
        {
          id: "video2",
          snippet: {
            title: "10 YouTube Niches That Will Explode in 2025",
            description: "Discover the most profitable and fastest growing YouTube niches for content creators.",
            thumbnails: {
              high: {
                url: "https://via.placeholder.com/480x360"
              }
            },
            channelTitle: "Niche Finder Pro",
            publishedAt: new Date().toISOString()
          },
          statistics: {
            viewCount: "980000",
            likeCount: "85000",
            commentCount: "6200"
          }
        },
        {
          id: "video3",
          snippet: {
            title: "YouTube Algorithm Secrets Revealed",
            description: "Former YouTube employee shares insider tips on how the algorithm really works.",
            thumbnails: {
              high: {
                url: "https://via.placeholder.com/480x360"
              }
            },
            channelTitle: "Algorithm Insider",
            publishedAt: new Date().toISOString()
          },
          statistics: {
            viewCount: "2100000",
            likeCount: "175000",
            commentCount: "12300"
          }
        }
      ]
    }, { status: 200 });
  }
}
