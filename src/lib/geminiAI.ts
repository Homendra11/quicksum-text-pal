
// Gemini AI integration utilities

interface GeminiOptions {
  apiKey: string;
  maxOutputTokens?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
}

interface GeminiResponse {
  summary: string;
  keywords: string[];
}

/**
 * Summarizes text using Google Gemini Pro API
 */
export const summarizeWithGemini = async (
  text: string, 
  options: GeminiOptions
): Promise<GeminiResponse> => {
  try {
    const { apiKey, maxOutputTokens = 1024, temperature = 0.4, topK = 32, topP = 1 } = options;
    
    // Create the prompt for summarization and keyword extraction
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
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
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
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    try {
      // Extract the JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : null;
      
      if (!jsonString) {
        throw new Error("Could not extract JSON from response");
      }
      
      const parsedResponse = JSON.parse(jsonString) as GeminiResponse;
      
      return {
        summary: parsedResponse.summary,
        keywords: parsedResponse.keywords || []
      };
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
