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
    const body = (await request.json()) as { topic?: string; duration?: string; language?: string };
    const { topic, duration, language } = body;
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Default to medium duration and English if not specified
    const videoDuration = duration || 'medium';
    const contentLanguage = language || 'en';
    
    // Generate video outline based on topic, duration, and language
    const outline = await generateOutline(topic, videoDuration, contentLanguage);
    
    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Outline generation error:', error);
    return NextResponse.json({ error: 'Failed to generate outline' }, { status: 500 });
  }
}

async function generateOutline(topic: string, duration: string, language: string) {
  try {
    // Determine outline complexity based on duration
    let sectionCount = 3; // Default for short videos
    let pointsPerSection = 2;
    
    if (duration === 'medium') {
      sectionCount = 5;
      pointsPerSection = 3;
    } else if (duration === 'long') {
      sectionCount = 7;
      pointsPerSection = 4;
    }
    
    // Prepare prompt based on language
    let prompt = '';
    
    if (language === 'en') {
      prompt = `Create a detailed YouTube video outline for a ${duration} video about "${topic}". 
      The outline should include:
      1. An engaging introduction
      2. ${sectionCount} main content sections
      3. A strong conclusion
      
      For each main section, provide ${pointsPerSection} key points or talking points.
      Format the response as a JSON object with the following structure:
      {
        "title": "Catchy video title",
        "introduction": "Brief description of what to cover in the intro",
        "sections": [
          {
            "title": "Section title",
            "points": ["Point 1", "Point 2", ...]
          }
        ],
        "conclusion": "Brief description of what to cover in the conclusion"
      }`;
    } else if (language === 'vi') {
      prompt = `Tạo dàn ý video YouTube chi tiết cho một video ${duration === 'short' ? 'ngắn' : duration === 'medium' ? 'trung bình' : 'dài'} về "${topic}".
      Dàn ý nên bao gồm:
      1. Phần giới thiệu hấp dẫn
      2. ${sectionCount} phần nội dung chính
      3. Phần kết luận mạnh mẽ
      
      Đối với mỗi phần chính, cung cấp ${pointsPerSection} điểm chính hoặc điểm nói.
      Định dạng phản hồi dưới dạng đối tượng JSON với cấu trúc sau:
      {
        "title": "Tiêu đề video hấp dẫn",
        "introduction": "Mô tả ngắn gọn về những gì cần đề cập trong phần giới thiệu",
        "sections": [
          {
            "title": "Tiêu đề phần",
            "points": ["Điểm 1", "Điểm 2", ...]
          }
        ],
        "conclusion": "Mô tả ngắn gọn về những gì cần đề cập trong phần kết luận"
      }`;
    } else if (language === 'es') {
      prompt = `Crea un esquema detallado de video de YouTube para un video ${duration === 'short' ? 'corto' : duration === 'medium' ? 'medio' : 'largo'} sobre "${topic}".
      El esquema debe incluir:
      1. Una introducción atractiva
      2. ${sectionCount} secciones principales de contenido
      3. Una conclusión sólida
      
      Para cada sección principal, proporciona ${pointsPerSection} puntos clave o puntos de conversación.
      Formatea la respuesta como un objeto JSON con la siguiente estructura:
      {
        "title": "Título atractivo del video",
        "introduction": "Breve descripción de lo que cubrir en la introducción",
        "sections": [
          {
            "title": "Título de la sección",
            "points": ["Punto 1", "Punto 2", ...]
          }
        ],
        "conclusion": "Breve descripción de lo que cubrir en la conclusión"
      }`;
    } else {
      // Default to English
      prompt = `Create a detailed YouTube video outline for a ${duration} video about "${topic}". 
      The outline should include:
      1. An engaging introduction
      2. ${sectionCount} main content sections
      3. A strong conclusion
      
      For each main section, provide ${pointsPerSection} key points or talking points.
      Format the response as a JSON object with the following structure:
      {
        "title": "Catchy video title",
        "introduction": "Brief description of what to cover in the intro",
        "sections": [
          {
            "title": "Section title",
            "points": ["Point 1", "Point 2", ...]
          }
        ],
        "conclusion": "Brief description of what to cover in the conclusion"
      }`;
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a YouTube content strategist who helps creators plan engaging videos."
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
    return parsedContent;
  } catch (error) {
    console.error('Error generating outline:', error);
    
    // Return mock data in case of error
    return {
      title: `${topic} - Complete Guide`,
      introduction: `An engaging introduction to ${topic}, explaining why it's important and what viewers will learn.`,
      sections: [
        {
          title: "Background and Context",
          points: [
            `History of ${topic}`,
            `Why ${topic} is relevant today`,
            `Common misconceptions about ${topic}`
          ]
        },
        {
          title: "Key Concepts",
          points: [
            `Main principles of ${topic}`,
            `Important terminology to understand`,
            `How ${topic} works in practice`
          ]
        },
        {
          title: "Benefits and Applications",
          points: [
            `How ${topic} can be useful`,
            `Real-world examples of ${topic} in action`,
            `Success stories related to ${topic}`
          ]
        },
        {
          title: "Challenges and Solutions",
          points: [
            `Common obstacles when dealing with ${topic}`,
            `Strategies to overcome these challenges`,
            `Tools and resources that can help`
          ]
        },
        {
          title: "Future Trends",
          points: [
            `Where ${topic} is heading`,
            `Upcoming innovations in the field`,
            `How to stay ahead of the curve`
          ]
        }
      ],
      conclusion: `A powerful conclusion summarizing the key points about ${topic} and encouraging viewers to take action.`
    };
  }
}
