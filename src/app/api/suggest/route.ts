import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Create the OpenAI client lazily, inside the request handler, so that
// importing this route at build time does not require OPENAI_API_KEY.
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Configured via environment variables
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { category?: string; language?: string };
    const { category, language } = body;
    
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Default to English if no language specified
    const contentLanguage = language || 'en';
    
    // Generate AI suggestions based on category
    const suggestions = await generateSuggestions(category, contentLanguage);
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('AI suggestion error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}

async function generateSuggestions(category: string, language: string) {
  try {
    // Prepare prompt based on language
    let prompt = '';
    
    if (language === 'en') {
      prompt = `Generate 5 YouTube video topic ideas for the category "${category}" that have high potential to go viral. For each topic, provide a catchy title and a brief description of what the video would cover. Format the response as a JSON array of objects with "title" and "description" fields.`;
    } else if (language === 'vi') {
      prompt = `Tạo 5 ý tưởng chủ đề video YouTube cho danh mục "${category}" có tiềm năng viral cao. Đối với mỗi chủ đề, cung cấp một tiêu đề hấp dẫn và mô tả ngắn gọn về nội dung video. Định dạng phản hồi dưới dạng mảng JSON của các đối tượng với các trường "title" và "description".`;
    } else if (language === 'es') {
      prompt = `Genera 5 ideas de temas de videos de YouTube para la categoría "${category}" que tengan un alto potencial de volverse virales. Para cada tema, proporciona un título atractivo y una breve descripción de lo que cubriría el video. Formatea la respuesta como un array JSON de objetos con campos "title" y "description".`;
    } else {
      prompt = `Generate 5 YouTube video topic ideas for the category "${category}" that have high potential to go viral. For each topic, provide a catchy title and a brief description of what the video would cover. Format the response as a JSON array of objects with "title" and "description" fields.`;
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a YouTube content strategy expert who helps creators find viral niches and topics."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsedContent = JSON.parse(content);
    return parsedContent.suggestions || [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    
    // Return mock data in case of error
    return [
      {
        title: `${category} Explained in 5 Minutes`,
        description: `A concise explanation of ${category} that anyone can understand.`
      },
      {
        title: `10 Amazing Facts About ${category}`,
        description: `Surprising and little-known facts about ${category} that will blow your mind.`
      },
      {
        title: `How ${category} Is Changing Our World`,
        description: `An exploration of the impact of ${category} on society and daily life.`
      },
      {
        title: `${category} Myths Debunked`,
        description: `Addressing common misconceptions about ${category} with evidence and facts.`
      },
      {
        title: `The Future of ${category}`,
        description: `Predictions and trends about where ${category} is heading in the next few years.`
      }
    ];
  }
}
