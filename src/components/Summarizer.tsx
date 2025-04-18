
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { fakeSummarize } from "@/lib/summarize";
import { useToast } from "@/hooks/use-toast";

const Summarizer = () => {
  const [text, setText] = useState("");
  const [summaryType, setSummaryType] = useState("paragraph");
  const [tone, setTone] = useState("neutral");
  const [length, setLength] = useState([50]);
  const [summaryResult, setSummaryResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (text.trim().length < 100) {
      toast({
        title: "Text too short",
        description: "Please enter at least 100 characters for a good summary.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await fakeSummarize(text, summaryType, tone, length[0]);
      setSummaryResult(result);
      setSummaryGenerated(true);
    } catch (error) {
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
            <CardTitle>Input Text</CardTitle>
            <CardDescription>
              Paste your text below or 
              <Button variant="link" className="px-1 py-0 h-auto font-normal">
                upload a file
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your long text here..."
              className="min-h-40 mb-4 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              disabled={isLoading || text.length < 10}
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
                  {["artificial intelligence", "summarization", "NLP", "user experience", "content", "accessibility"].map((keyword) => (
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
