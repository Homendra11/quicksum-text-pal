
import { useState } from "react";
import { summarizeWithGemini } from "@/lib/geminiAI";
import { toast } from "@/hooks/use-toast";

interface UseGeminiOptions {
  onSummaryStart?: () => void;
  onSummaryComplete?: (summary: string, keywords: string[]) => void;
  onSummaryError?: (error: Error) => void;
}

export const useGemini = (options: UseGeminiOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const summarize = async (text: string) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    
    if (!apiKey) {
      const noKeyError = new Error("No API key found. Please set your Gemini API key in settings.");
      setError(noKeyError);
      if (options.onSummaryError) {
        options.onSummaryError(noKeyError);
      }
      toast({
        title: "API Key Missing",
        description: "Please set your Gemini API key in the settings to use the summarization feature.",
        variant: "destructive",
      });
      return null;
    }

    if (!text.trim()) {
      const emptyTextError = new Error("Please provide text to summarize");
      setError(emptyTextError);
      if (options.onSummaryError) {
        options.onSummaryError(emptyTextError);
      }
      toast({
        title: "Empty Text",
        description: "Please provide text to summarize",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (options.onSummaryStart) {
        options.onSummaryStart();
      }

      const result = await summarizeWithGemini(text, { apiKey });
      
      if (options.onSummaryComplete) {
        options.onSummaryComplete(result.summary, result.keywords);
      }
      
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error occurred");
      setError(err);
      
      if (options.onSummaryError) {
        options.onSummaryError(err);
      }
      
      toast({
        title: "Summarization Failed",
        description: err.message,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summarize,
    isLoading,
    error
  };
};
