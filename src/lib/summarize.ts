
// This is a placeholder for real summarization logic that would use a model like BART or T5
// In a real implementation, this would connect to a backend service or API

// Helper function to get a random delay between 1-3 seconds
const getRandomDelay = () => Math.floor(Math.random() * 2000) + 1000;

// Function to generate fake keywords based on input text
const generateFakeKeywords = (text: string): string[] => {
  const commonKeywords = [
    "artificial intelligence", "machine learning", "natural language processing",
    "data science", "technology", "innovation", "research", "development",
    "user experience", "algorithms", "neural networks", "deep learning"
  ];
  
  // Randomly select 4-8 keywords
  const numKeywords = Math.floor(Math.random() * 4) + 4;
  return commonKeywords.sort(() => 0.5 - Math.random()).slice(0, numKeywords);
};

// Function to generate different summary types
const generateSummaryByType = (text: string, type: string, tone: string, length: number): string => {
  // This would be replaced by actual AI summarization in a real app
  const wordCount = text.split(/\s+/).length;
  const targetLength = Math.max(20, Math.floor((wordCount * length) / 100));
  
  // Create a sample summary based on type
  switch (type) {
    case "bullets":
      return generateBulletPoints(text, tone, targetLength);
    case "tldr":
      return generateTLDR(text, tone, targetLength);
    case "paragraph":
    default:
      return generateParagraph(text, tone, targetLength);
  }
};

const generateParagraph = (text: string, tone: string, targetLength: number): string => {
  // In a real app, we would use an actual AI model here
  const tonePrefix = getTonePrefix(tone);
  
  // Generate fake paragraph (this is just placeholder text)
  return `${tonePrefix} This text discusses the development of advanced AI summarization technologies like QuickSum. It highlights the importance of creating user-friendly interfaces for complex natural language processing tasks. The article emphasizes how properly designed AI tools can save users significant time while maintaining comprehension of key concepts. Various summarization approaches are discussed, including extractive methods that preserve original phrasing and abstractive techniques that generate new text while maintaining meaning. The article also touches on the challenges of maintaining context and accuracy when condensing large documents.`;
};

const generateBulletPoints = (text: string, tone: string, targetLength: number): string => {
  // In a real app, we would use an actual AI model here
  const tonePrefix = getTonePrefix(tone);
  
  // Generate fake bullet points
  return `${tonePrefix}\n\n• AI summarization tools like QuickSum help users process large amounts of text quickly\n\n• Both extractive and abstractive summarization techniques have unique advantages\n\n• User experience is critical for making advanced NLP accessible to everyday users\n\n• Customizable summary formats allow for different reading preferences and use cases\n\n• Modern AI models can maintain context while significantly reducing text length`;
};

const generateTLDR = (text: string, tone: string, targetLength: number): string => {
  // In a real app, we would use an actual AI model here
  const tonePrefix = getTonePrefix(tone);
  
  // Generate fake TLDR
  return `${tonePrefix} AI-powered text summarization tools make reading more efficient by condensing content while preserving key information. These systems use natural language processing to understand context and generate concise summaries tailored to user preferences.`;
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

export const fakeSummarize = async (
  text: string,
  type: string = "paragraph",
  tone: string = "neutral",
  length: number = 50
): Promise<string> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const summary = generateSummaryByType(text, type, tone, length);
      resolve(summary);
    }, getRandomDelay());
  });
};

export const fakeKeywordExtraction = async (text: string): Promise<string[]> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const keywords = generateFakeKeywords(text);
      resolve(keywords);
    }, getRandomDelay());
  });
};
