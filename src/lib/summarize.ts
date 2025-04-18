
// Real text summarization implementation using a simple extractive approach
// In a production app, you would integrate with AI models or APIs

// Helper function to get a random delay between 1-3 seconds
const getRandomDelay = () => Math.floor(Math.random() * 2000) + 1000;

// Function to extract key sentences based on scoring
const extractKeyPhrases = (text: string, maxSentences: number): string[] => {
  // Split text into sentences (simple split by period, exclamation mark, or question mark)
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .filter(sentence => sentence.trim().length > 10);
  
  if (sentences.length <= maxSentences) {
    return sentences;
  }
  
  // Calculate sentence scores based on:
  // 1. Word count (middle length sentences are favored)
  // 2. Position (earlier sentences often contain key information)
  // 3. Keyword density (sentences with more common words from the text)
  
  // First, get the most common meaningful words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonStopWords.includes(word));
  
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort words by frequency
  const keywords = Object.keys(wordFrequency)
    .sort((a, b) => wordFrequency[b] - wordFrequency[a])
    .slice(0, 15);
  
  // Score each sentence
  const sentenceScores = sentences.map((sentence, index) => {
    const wordCount = sentence.split(/\s+/).length;
    const positionScore = 1 - (index / sentences.length); // Earlier sentences get higher score
    
    // Calculate keyword score
    const lowerSentence = sentence.toLowerCase();
    const keywordScore = keywords.reduce((score, keyword) => {
      return score + (lowerSentence.includes(keyword) ? 1 : 0);
    }, 0) / keywords.length;
    
    // Length score - favor medium length sentences
    const lengthScore = wordCount > 5 && wordCount < 40 ? 1 : 0.5;
    
    return {
      sentence,
      score: (positionScore * 0.3) + (keywordScore * 0.5) + (lengthScore * 0.2),
      index
    };
  });
  
  // Sort sentences by score and take the top ones
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index) // Resort by original position
    .map(item => item.sentence);
  
  return topSentences;
};

// Common English stop words to ignore
const commonStopWords = [
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because",
  "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down", "during",
  "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him",
  "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "me", "more", "most", "my", "myself", "no",
  "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then",
  "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were",
  "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself",
  "yourselves"
];

// Function to generate different summary types
const generateSummaryByType = (text: string, type: string, tone: string, length: number): string => {
  // Ensure we have valid input
  if (!text || text.trim().length < 50) {
    return "The provided text is too short for meaningful summarization.";
  }
  
  // Determine how many sentences to include based on the requested length
  const textWordCount = text.split(/\s+/).length;
  const sentenceCount = Math.max(2, Math.min(10, Math.floor(textWordCount * (length / 100) / 15)));
  
  // Extract key sentences
  const keySentences = extractKeyPhrases(text, sentenceCount);
  
  // If no sentences extracted, return a fallback message
  if (!keySentences.length) {
    return "Unable to generate a meaningful summary from the provided text.";
  }
  
  // Create a summary based on type
  switch (type) {
    case "bullets":
      return formatBulletPoints(keySentences, tone);
    case "tldr":
      return formatTLDR(keySentences, tone);
    case "paragraph":
    default:
      return formatParagraph(keySentences, tone);
  }
};

const formatParagraph = (sentences: string[], tone: string): string => {
  const tonePrefix = getTonePrefix(tone);
  return `${tonePrefix} ${sentences.join(" ")}`;
};

const formatBulletPoints = (sentences: string[], tone: string): string => {
  const tonePrefix = getTonePrefix(tone);
  const bullets = sentences.map(s => `• ${s.trim()}`).join("\n\n");
  return `${tonePrefix}\n\n${bullets}`;
};

const formatTLDR = (sentences: string[], tone: string): string => {
  const tonePrefix = getTonePrefix(tone);
  // For TLDR, use fewer sentences and join them
  const shortSummary = sentences.slice(0, Math.min(2, sentences.length)).join(" ");
  return `${tonePrefix} ${shortSummary}`;
};

// Helper function to add tone-specific prefixes
const getTonePrefix = (tone: string): string => {
  switch (tone) {
    case "formal":
      return "Based on a comprehensive analysis of the provided text, the following summary has been generated:";
    case "casual":
      return "So, here's the deal with this text:";
    case "friendly":
      return "Hey there! Here's what this text is all about:";
    case "neutral":
    default:
      return "Summary:";
  }
};

// Extract meaningful keywords from text
const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4 && !commonStopWords.includes(word));
  
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  // Sort by frequency and take top keywords
  return Object.keys(wordFrequency)
    .sort((a, b) => wordFrequency[b] - wordFrequency[a])
    .slice(0, 8);
};

// The main summarization function that will be used by the app
export const fakeSummarize = async (
  text: string,
  type: string = "paragraph",
  tone: string = "neutral",
  length: number = 50
): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const summary = generateSummaryByType(text, type, tone, length);
        resolve(summary);
      } catch (error) {
        console.error("Error during summarization:", error);
        resolve("An error occurred during summarization. Please try again with different text.");
      }
    }, getRandomDelay());
  });
};

export const fakeKeywordExtraction = async (text: string): Promise<string[]> => {
  // Using real keyword extraction instead of fake data
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const keywords = extractKeywords(text);
        resolve(keywords.length > 0 ? keywords : ["no", "keywords", "found"]);
      } catch (error) {
        console.error("Error during keyword extraction:", error);
        resolve(["error", "extraction", "failed"]);
      }
    }, getRandomDelay());
  });
};
