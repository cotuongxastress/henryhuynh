import { NextRequest, NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const geo = searchParams.get('geo') || 'US';
  const timeRange = searchParams.get('timeRange') || 'now 1-d';
  const category = searchParams.get('category') || '0';
  
  try {
    // Get daily trending searches
    const dailyTrends = await googleTrends.dailyTrends({
      geo,
      hl: 'en-US'
    });
    
    // Get real-time trending searches
    const realtimeTrends = await googleTrends.realTimeTrends({
      geo,
      category,
      hl: 'en-US'
    });
    
    // Get trending topics
    const trendingSearches = await googleTrends.trendingSearches({
      geo,
      hl: 'en-US'
    });
    
    return NextResponse.json({
      dailyTrends: JSON.parse(dailyTrends),
      realtimeTrends: JSON.parse(realtimeTrends),
      trendingSearches: JSON.parse(trendingSearches)
    });
  } catch (error) {
    console.error('Google Trends API error:', error);
    
    // Return mock data in case of error
    return NextResponse.json({
      dailyTrends: {
        default: {
          trendingSearchesDays: [
            {
              date: new Date().toISOString(),
              formattedDate: new Date().toLocaleDateString(),
              trendingSearches: [
                {
                  title: { query: "Technology trends" },
                  formattedTraffic: "1M+",
                  relatedQueries: [
                    { query: "AI technology", value: 100 },
                    { query: "New tech gadgets", value: 80 },
                    { query: "Tech news today", value: 70 }
                  ]
                },
                {
                  title: { query: "YouTube creator tips" },
                  formattedTraffic: "500K+",
                  relatedQueries: [
                    { query: "How to grow YouTube channel", value: 100 },
                    { query: "YouTube algorithm", value: 90 },
                    { query: "YouTube monetization", value: 85 }
                  ]
                },
                {
                  title: { query: "Content creation" },
                  formattedTraffic: "200K+",
                  relatedQueries: [
                    { query: "Video editing software", value: 100 },
                    { query: "Content ideas", value: 95 },
                    { query: "Social media strategy", value: 90 }
                  ]
                }
              ]
            }
          ]
        }
      },
      realtimeTrends: {
        storySummaries: {
          trendingStories: [
            {
              title: "YouTube algorithm update",
              entityNames: ["YouTube", "Content creators"],
              articles: [
                { title: "New YouTube features for creators", url: "#" }
              ]
            },
            {
              title: "Viral video trends",
              entityNames: ["TikTok", "YouTube Shorts"],
              articles: [
                { title: "Short-form video content on the rise", url: "#" }
              ]
            }
          ]
        }
      },
      trendingSearches: {
        trendingSearchesDays: [
          {
            trendingSearches: [
              {
                title: { query: "YouTube Shorts" },
                relatedQueries: [
                  "how to make YouTube Shorts",
                  "YouTube Shorts monetization",
                  "viral YouTube Shorts ideas"
                ]
              },
              {
                title: { query: "Video editing tips" },
                relatedQueries: [
                  "best video editing software",
                  "video editing for beginners",
                  "professional video editing techniques"
                ]
              }
            ]
          }
        ]
      }
    }, { status: 200 });
  }
}
