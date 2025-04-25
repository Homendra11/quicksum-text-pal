
export const fakeSummarize = (
  text: string, 
  type: string = "paragraph", 
  tone: string = "neutral", 
  length: number = 50
): string => {
  // Basic implementation of summary generation
  const words = text.split(/\s+/);
  const maxWords = Math.floor(words.length * (length / 100));
  
  let summary = "";
  
  switch(type) {
    case "paragraph":
      summary = words.slice(0, maxWords).join(" ");
      break;
    case "bullets":
      summary = words.slice(0, maxWords)
        .map(word => `• ${word}`)
        .join("\n");
      break;
    case "tldr":
      summary = `TL;DR: ${words.slice(0, Math.min(maxWords, 20)).join(" ")}`;
      break;
    default:
      summary = words.slice(0, maxWords).join(" ");
  }
  
  // Apply tone (basic implementation)
  switch(tone) {
    case "formal":
      summary = summary.replace(/\b(cool|awesome)\b/gi, "excellent");
      break;
    case "casual":
      summary = summary.replace(/\b(excellent)\b/gi, "awesome");
      break;
    case "friendly":
      summary = `Hey there! Here's a quick summary: ${summary}`;
      break;
  }
  
  return summary;
};
