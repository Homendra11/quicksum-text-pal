
export interface GeminiOptions {
  apiKey: string;
  maxOutputTokens?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
}

export interface GeminiResponse {
  summary: string;
  keywords: string[];
}
