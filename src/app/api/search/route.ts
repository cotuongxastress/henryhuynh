import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY // Will be configured in environment variables
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Search for YouTube channels related to the query
    const channelResponse = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['channel'],
      maxResults: 5
    });

    // Search for YouTube videos related to the query
    const videoResponse = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: 10,
      order: 'viewCount'
    });

    // Get related topics/keywords
    const relatedTopics = await getRelatedTopics(query);

    return NextResponse.json({
      query,
      channels: channelResponse.data.items || [],
      videos: videoResponse.data.items || [],
      relatedTopics
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}

// Helper function to get related topics
async function getRelatedTopics(query: string) {
  try {
    // This would ideally use a proper API, but for now we'll return mock data
    // In a real implementation, this could use Google's Natural Language API or similar
    const mockRelatedTopics = [
      `${query} tutorial`,
      `${query} for beginners`,
      `${query} tips and tricks`,
      `${query} review`,
      `how to ${query}`,
      `best ${query} 2025`,
      `${query} explained`
    ];
    
    return mockRelatedTopics;
  } catch (error) {
    console.error('Error getting related topics:', error);
    return [];
  }
}
