
import { fakeSummarize } from "./summarize";

// Function to extract text from PDF files
export const extractTextFromPDF = async (file: File): Promise<string> => {
  // In a real app, we would use pdf.js or a similar library
  // This is a placeholder that simulates PDF text extraction
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate extracting text from a PDF
      setTimeout(() => {
        resolve("This is extracted text from a PDF document. In a real implementation, we would use proper PDF parsing libraries to extract the actual text content from the document.");
      }, 1000);
    };
    reader.readAsArrayBuffer(file);
  });
};

// Function to extract text from DOC/DOCX files
export const extractTextFromDOC = async (file: File): Promise<string> => {
  // In a real app, we would use mammoth.js or similar
  // This is a placeholder that simulates DOC text extraction
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate extracting text from a DOC
      setTimeout(() => {
        resolve("This is extracted text from a Word document. In a real implementation, we would use proper DOC/DOCX parsing libraries to extract the actual text content from the document.");
      }, 1000);
    };
    reader.readAsArrayBuffer(file);
  });
};

// Function to extract text from URLs
export const extractTextFromURL = async (url: string): Promise<string> => {
  // In a real app, we would use a backend service to fetch and parse the URL
  // This is a placeholder that simulates URL content extraction
  return new Promise((resolve) => {
    // Simulate fetching content from URL
    setTimeout(() => {
      resolve(`This is extracted text from the URL: ${url}. In a real implementation, we would fetch the actual webpage content and extract meaningful text from it, removing navigation, ads, and other non-content elements.`);
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
    throw new Error("Unsupported file type");
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
