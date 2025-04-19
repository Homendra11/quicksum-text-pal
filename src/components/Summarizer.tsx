
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { processInputAndSummarize } from "@/lib/fileProcessor";
import { useToast } from "@/hooks/use-toast";
import InputSection from "./summarizer/InputSection";
import ControlSection from "./summarizer/ControlSection";
import SummaryResult from "./summarizer/SummaryResult";

const Summarizer = () => {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [summaryType, setSummaryType] = useState("paragraph");
  const [tone, setTone] = useState("neutral");
  const [length, setLength] = useState([50]);
  const [summaryResult, setSummaryResult] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    toast({
      title: "File selected",
      description: `Processing ${file.name}...`,
    });
  };

  const handleSummarize = async () => {
    let inputToProcess: string | File | null = null;
    
    if (activeTab === "text" && text.trim().length > 0) {
      inputToProcess = text;
    } else if (activeTab === "url" && url.trim().length > 0) {
      inputToProcess = url;
    } else if (activeTab === "file" && selectedFile) {
      inputToProcess = selectedFile;
    }

    if (!inputToProcess) {
      toast({
        title: "Input required",
        description: "Please provide text, a URL, or upload a file to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await processInputAndSummarize(inputToProcess, summaryType, tone, length[0]);
      setSummaryResult(result);
      
      // Set sample keywords if we don't have real ones
      if (typeof inputToProcess === "string" && !inputToProcess.startsWith("http")) {
        // Extract simple keywords from the text
        const words = inputToProcess.toLowerCase()
          .replace(/[^\w\s]/g, " ")
          .split(/\s+/)
          .filter(word => word.length > 4)
          .reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
        const extractedKeywords = Object.entries(words)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(entry => entry[0]);
          
        setKeywords(extractedKeywords.length > 0 ? extractedKeywords : ["document", "content", "summary"]);
      } else {
        setKeywords(["document", "content", "analysis", "summary", "information", "extraction"]);
      }
      
      setSummaryGenerated(true);
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryResult);
    toast({
      title: "Copied!",
      description: "Summary copied to clipboard",
    });
  };

  const rateSummary = (liked: boolean) => {
    toast({
      title: liked ? "Thanks for the feedback!" : "We'll do better next time",
      description: liked ? "We're glad you liked the summary!" : "Your feedback helps us improve.",
    });
  };

  return (
    <div id="summarizer-section" className="container py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Summarize Your Text</h2>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Input Content</CardTitle>
            <CardDescription>
              Paste text, enter a URL, or upload a document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InputSection
              activeTab={activeTab}
              text={text}
              url={url}
              onTextChange={handleTextChange}
              onUrlChange={handleUrlChange}
              onFileUpload={handleFileUpload}
              onTabChange={setActiveTab}
            />
            <ControlSection
              summaryType={summaryType}
              tone={tone}
              length={length}
              onSummaryTypeChange={setSummaryType}
              onToneChange={setTone}
              onLengthChange={setLength}
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSummarize} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Summarizing..." : "Generate Summary"}
            </Button>
          </CardFooter>
        </Card>

        {summaryGenerated && (
          <SummaryResult
            summaryType={summaryType}
            tone={tone}
            length={length}
            summaryResult={summaryResult}
            keywords={keywords}
            onCopy={copyToClipboard}
            onRate={rateSummary}
          />
        )}
      </div>
    </div>
  );
};

export default Summarizer;
