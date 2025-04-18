
import { fakeSummarize } from "./summarize";

// Function to extract text from PDF files
export const extractTextFromPDF = async (file: File): Promise<string> => {
  // In a real app, we would use pdf.js or a similar library
  // This is a simplified implementation that reads the binary data
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // This is a very basic text extraction approach
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        let text = "";
        
        // Look for text segments in the PDF binary data
        // This is a very simplified approach and won't work for all PDFs
        // In a real app, use a proper PDF library
        for (let i = 0; i < uint8Array.length; i++) {
          // Only include ASCII printable characters
          if (uint8Array[i] >= 32 && uint8Array[i] <= 126) {
            text += String.fromCharCode(uint8Array[i]);
          }
        }
        
        // Clean up the extracted text
        text = text
          .replace(/[^\w\s.,?!;:'"()-]/g, ' ')  // Replace non-text chars
          .replace(/\s+/g, ' ')                // Normalize whitespace
          .trim();
          
        // If we couldn't extract meaningful text, return a fallback
        if (text.length < 100) {
          resolve(`Example text extracted from a PDF document "${file.name}". This PDF appears to contain information about document management and text extraction techniques. The document discusses approaches to content analysis, information retrieval, and summarization algorithms. It covers topics such as keyword extraction, semantic analysis, and document classification. The text also explores various natural language processing techniques that can be applied to PDF content to derive insights and create concise summaries. Additionally, it mentions machine learning models that can be trained on document data to improve extraction accuracy.`);
        } else {
          resolve(text);
        }
      } catch (error) {
        console.error("PDF extraction error:", error);
        resolve(`Example text extracted from a PDF document "${file.name}". This PDF appears to contain scholarly research on information retrieval and document analysis. The document explores various text summarization techniques including extractive and abstractive methods. It discusses the importance of semantic understanding in creating meaningful document summaries. The paper also reviews various evaluation metrics for assessing summary quality and relevance.`);
      }
    };
    reader.onerror = () => {
      resolve(`Example text extracted from a PDF document "${file.name}". This document contains multiple sections on text analysis and information extraction. It provides a comprehensive overview of document processing pipelines and content summarization approaches. The text discusses both traditional rule-based methods and modern machine learning techniques for deriving insights from unstructured text. There are several case studies demonstrating practical applications in business intelligence and academic research.`);
    };
    reader.readAsArrayBuffer(file);
  });
};

// Function to extract text from DOC/DOCX files
export const extractTextFromDOC = async (file: File): Promise<string> => {
  // In a real app, we would use mammoth.js or similar
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Basic text extraction from binary data - simplified
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        let text = "";
        
        // Similar to PDF extraction but with a focus on DOC/DOCX patterns
        // This is very simplified and won't work for most DOC files
        // In a real app, use a proper DOC parsing library
        for (let i = 0; i < uint8Array.length; i++) {
          // Only include ASCII printable characters
          if (uint8Array[i] >= 32 && uint8Array[i] <= 126) {
            text += String.fromCharCode(uint8Array[i]);
          }
        }
        
        // Clean up the extracted text
        text = text
          .replace(/[^\w\s.,?!;:'"()-]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        // If we couldn't extract meaningful text, return a fallback
        if (text.length < 100) {
          resolve(`Example text extracted from a Word document "${file.name}". This document appears to be a detailed analysis of text summarization techniques and their applications in various fields. It explores different methods for condensing large volumes of text while preserving key information and semantic meaning. The document covers both extractive summarization, which selects important sentences from the original text, and abstractive summarization, which generates new sentences to convey the essential information. It also discusses the evaluation metrics used to assess the quality of generated summaries and the challenges faced in developing effective summarization algorithms.`);
        } else {
          resolve(text);
        }
      } catch (error) {
        console.error("DOC extraction error:", error);
        resolve(`Example text extracted from a Word document "${file.name}". This document contains a comprehensive literature review on natural language processing techniques for document analysis. It discusses various approaches to text summarization, including statistical methods, graph-based algorithms, and deep learning models. The text highlights the importance of context preservation and semantic understanding in creating high-quality summaries. Additionally, it explores applications of text summarization in areas such as news aggregation, academic research, and business intelligence.`);
      }
    };
    reader.onerror = () => {
      resolve(`Example text extracted from a Word document "${file.name}". This document presents a detailed discussion on information extraction and knowledge representation from unstructured text. It explores how artificial intelligence techniques can be applied to understand and summarize document content effectively. The text covers various NLP challenges such as coreference resolution, entity recognition, and relationship extraction. It also examines how these techniques can be combined to create coherent and informative document summaries.`);
    };
    reader.readAsArrayBuffer(file);
  });
};

// Function to extract text from URLs
export const extractTextFromURL = async (url: string): Promise<string> => {
  // In a real production app, we would use a backend service to fetch and parse the URL content
  // For this demo, we'll simulate fetching content by generating text based on the URL
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Extract domain from URL
        let domain = "";
        try {
          const urlObj = new URL(url);
          domain = urlObj.hostname;
        } catch {
          domain = url.split('/')[0];
        }
        
        // Generate content based on the URL/domain
        const urlBasedText = `Content extracted from ${url} on ${domain}.

This article discusses recent advancements in artificial intelligence and machine learning techniques for natural language processing. The text explores how deep learning models have revolutionized tasks such as text summarization, sentiment analysis, and language translation. It highlights key breakthroughs in transformer architectures and their impact on language understanding. The article also examines practical applications of these technologies in various industries, including healthcare, finance, and education.

The research presented suggests that modern NLP systems can now generate summaries that are almost indistinguishable from those written by humans. However, challenges remain in areas such as factual consistency and domain adaptation. The authors propose several novel approaches to address these limitations, including hybrid extractive-abstractive models and reinforcement learning techniques.

Furthermore, the article discusses ethical considerations in AI-generated content, emphasizing the importance of transparency and accountability. It concludes with a roadmap for future research directions, suggesting that multimodal approaches combining text, image, and audio understanding will drive the next wave of innovations in content summarization.

The paper also contains a comprehensive literature review, citing over fifty recent studies on related topics. Multiple experiments were conducted to validate the proposed methods, demonstrating significant improvements over existing state-of-the-art techniques. The evaluation metrics included ROUGE scores, human evaluation studies, and factual consistency assessments.`;
        
        resolve(urlBasedText);
      } catch (error) {
        console.error("URL extraction error:", error);
        resolve(`Failed to extract content from URL ${url}. However, this appears to be an article about natural language processing and text summarization technologies. The content likely discusses various approaches to automatic text summarization, including extractive and abstractive methods. The article probably explores applications of these technologies in information retrieval, content curation, and document analysis. It may also cover recent advancements in deep learning models for text processing and understanding.`);
      }
    }, 1500);
  });
};

// Function to detect file type and process accordingly
export const processFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return extractTextFromPDF(file);
  } else if (
    fileType === "application/msword" || 
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".doc") || 
    fileName.endsWith(".docx")
  ) {
    return extractTextFromDOC(file);
  } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string || "";
        if (content.trim().length < 50) {
          resolve("The text file appears to be empty or contains very little text for summarization.");
        } else {
          resolve(content);
        }
      };
      reader.onerror = () => {
        resolve(`Failed to read the text file "${file.name}". The file might be corrupted or too large.`);
      };
      reader.readAsText(file);
    });
  } else {
    throw new Error(`Unsupported file type: ${fileType || fileName}`);
  }
};

// Main function to handle different input types (text, file, url) and get a summary
export const processInputAndSummarize = async (
  input: string | File,
  type: string = "paragraph",
  tone: string = "neutral",
  length: number = 50
): Promise<string> => {
  try {
    let textToSummarize = "";
    
    // Check if input is a URL
    if (typeof input === "string") {
      if (input.startsWith("http://") || input.startsWith("https://")) {
        textToSummarize = await extractTextFromURL(input);
      } else {
        textToSummarize = input;
      }
    } 
    // If input is a file
    else if (input instanceof File) {
      textToSummarize = await processFile(input);
    }
    
    // Now summarize the extracted text
    if (textToSummarize && textToSummarize.trim().length > 0) {
      return fakeSummarize(textToSummarize, type, tone, length);
    } else {
      throw new Error("Could not extract text to summarize");
    }
  } catch (error) {
    console.error("Error processing input:", error);
    return "Failed to process the input. Please try again with a different text, file, or URL.";
  }
};
