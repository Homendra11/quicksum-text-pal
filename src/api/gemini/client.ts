
// Move Gemini API integration code to dedicated API folder
import { GeminiResponse, GeminiOptions } from '@/types/gemini';

export const summarizeWithGemini = async (
  text: string, 
  options: GeminiOptions
): Promise<GeminiResponse> => {
  try {
    const { apiKey, maxOutputTokens = 1024, temperature = 0.4, topK = 32, topP = 1 } = options;
    
    const prompt = `
      Please analyze the following text and provide:
      1. A concise summary capturing the main points.
      2. A list of 5-7 important keywords.
      
      Format your response as JSON with the following structure exactly:
      {
        "summary": "Your summary text here...",
        "keywords": ["keyword1", "keyword2", "keyword3", ...]
      }
      
      The text to summarize is:
      ${text}
    `;
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens,
          temperature,
          topK,
          topP,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error("Invalid response format from Gemini API");
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : null;
      
      if (!jsonString) {
        throw new Error("Could not extract JSON from response");
      }
      
      return JSON.parse(jsonString) as GeminiResponse;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      return {
        summary: responseText,
        keywords: []
      };
    }
  } catch (error) {
    console.error("Error in summarizeWithGemini:", error);
    throw error;
  }
};
