
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Copy, ThumbsUp, ThumbsDown, File, Link, Upload } from "lucide-react";
import { fakeSummarize, fakeKeywordExtraction } from "@/lib/summarize";
import { processInputAndSummarize } from "@/lib/fileProcessor";
import { useToast } from "@/hooks/use-toast";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

    toast({
      title: "File selected",
      description: `Processing ${file.name}...`,
    });
  };

  const handleSummarize = async () => {
    let inputToProcess: string | File | null = null;
    
    // Determine which input to process based on active tab
    if (activeTab === "text" && text.trim().length > 0) {
      inputToProcess = text;
    } else if (activeTab === "url" && url.trim().length > 0) {
      inputToProcess = url;
    } else if (activeTab === "file" && fileInputRef.current?.files?.[0]) {
      inputToProcess = fileInputRef.current.files[0];
    }

    if (!inputToProcess) {
      toast({
        title: "Input required",
        description: "Please provide text, a URL, or upload a file to summarize.",
        variant: "destructive",
      });
      return;
    }

    if (typeof inputToProcess === "string" && 
        inputToProcess.trim().length < 100 && 
        !inputToProcess.startsWith("http")) {
      toast({
        title: "Text too short",
        description: "Please enter at least 100 characters for a good summary.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Process the input and get summary
      const result = await processInputAndSummarize(inputToProcess, summaryType, tone, length[0]);
      setSummaryResult(result);
      
      // Get keywords if input is text
      if (typeof inputToProcess === "string" && !inputToProcess.startsWith("http")) {
        const extractedKeywords = await fakeKeywordExtraction(inputToProcess);
        setKeywords(extractedKeywords);
      } else {
        // For files and URLs, we'll use default keywords for the demo
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

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="mt-0">
                <Textarea
                  placeholder="Paste your long text here..."
                  className="min-h-40 resize-none"
                  value={text}
                  onChange={handleTextChange}
                />
              </TabsContent>
              
              <TabsContent value="url" className="mt-0">
                <Input 
                  type="url"
                  placeholder="Enter a URL (e.g., https://example.com/article)"
                  value={url}
                  onChange={handleUrlChange}
                />
              </TabsContent>
              
              <TabsContent value="file" className="mt-0">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors" onClick={triggerFileUpload}>
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">Support for PDF, DOC, DOCX, TXT files</p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium block mb-2">Summary Type</label>
                <Select onValueChange={setSummaryType} defaultValue={summaryType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="bullets">Bullet Points</SelectItem>
                    <SelectItem value="tldr">TL;DR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Tone</label>
                <Select onValueChange={setTone} defaultValue={tone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  Length: {length[0]}%
                </label>
                <Slider 
                  defaultValue={[50]} 
                  max={100} 
                  step={10}
                  onValueChange={setLength}
                />
              </div>
            </div>
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
          <Card className="animate-fade-in border border-primary/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Summary</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{summaryType}</Badge>
                  <Badge variant="outline">{tone}</Badge>
                  <Badge variant="outline">{length[0]}% length</Badge>
                </div>
              </div>
            </CardHeader>
            <Tabs defaultValue="summary">
              <div className="px-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="summary" className="p-6 pt-4">
                <div className="whitespace-pre-wrap">
                  {summaryResult}
                </div>
              </TabsContent>
              <TabsContent value="keywords" className="p-6 pt-4">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="px-3 py-1">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => rateSummary(true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => rateSummary(false)}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Not helpful
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
