
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
          resolve(`This document appears to be a PDF file named "${file.name}". The content might be image-based or protected, making text extraction difficult without specialized libraries. In a production version, we would integrate with PDF.js or a server-side PDF parser to properly extract the textual content.`);
        } else {
          resolve(text);
        }
      } catch (error) {
        console.error("PDF extraction error:", error);
        resolve(`Failed to extract text from PDF file "${file.name}". In a production app, we would use a specialized PDF parsing library.`);
      }
    };
    reader.onerror = () => {
      resolve(`Failed to read the PDF file "${file.name}". The file might be corrupted or too large.`);
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
          resolve(`This document appears to be a Word document named "${file.name}". In a production version, we would use mammoth.js or other Word document parsing libraries to properly extract the textual content.`);
        } else {
          resolve(text);
        }
      } catch (error) {
        console.error("DOC extraction error:", error);
        resolve(`Failed to extract text from Word file "${file.name}". In a production app, we would use a specialized Word document parsing library.`);
      }
    };
    reader.onerror = () => {
      resolve(`Failed to read the Word file "${file.name}". The file might be corrupted or too large.`);
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
        
        // Generate some content based on the URL/domain
        const urlBasedText = `This appears to be content from ${domain}. The URL ${url} would typically contain various sections like headers, navigation, main content, sidebars, and footers. In a production version of QuickSum, we would send this URL to a backend service that would fetch the content, remove navigation and ads, and extract the main article text using techniques like DOM traversal, content density analysis, and semantic HTML structure analysis. We might identify the main content by looking for article tags, content containers, and text density patterns while filtering out navigation, comments, ads, and other non-content elements. The extracted text would then be processed by our summarization pipeline to generate a concise summary.

For educational websites, we might extract learning materials, course descriptions, and key educational concepts. For news sites, we'd focus on extracting the article body, quotes, and key facts. For blog posts, we'd extract the main narrative and key arguments. For e-commerce sites, we might extract product descriptions, features, and specifications.

Additional techniques like removing boilerplate content, handling pagination, and extracting images with captions would ensure comprehensive content analysis. Modern web scraping techniques also consider responsive designs and dynamic content loaded via JavaScript.`;
        
        resolve(urlBasedText);
      } catch (error) {
        console.error("URL extraction error:", error);
        resolve(`Failed to extract content from URL ${url}. Please check the URL and try again.`);
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
      reader.onload = (e) => resolve(e.target?.result as string || "");
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
    throw error;
  }
};
