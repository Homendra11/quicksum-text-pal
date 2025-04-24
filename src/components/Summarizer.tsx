import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputSection from "./summarizer/InputSection";
import ControlSection from "./summarizer/ControlSection";
import SummaryResult from "./summarizer/SummaryResult";
import SummaryHistory from "./summarizer/SummaryHistory";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { useGemini } from "@/hooks/use-gemini";

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
  const [history, setHistory] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const { summarize: geminiSummarize, isLoading: geminiLoading } = useGemini({
    onSummaryStart: () => {
      setIsLoading(true);
    },
    onSummaryComplete: (summary, keywords) => {
      setSummaryResult(summary);
      setKeywords(keywords);
      setSummaryGenerated(true);
      setIsLoading(false);
    },
    onSummaryError: (error) => {
      setIsLoading(false);
      console.error("Gemini API error:", error);
    }
  });

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await (supabase as any)
        .from("summaries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setHistory(data);
    };
    fetchHistory();
  }, [summaryGenerated]);

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
    setFileName(file.name);
    toast({
      title: "File selected",
      description: `Processing ${file.name}...`,
    });
  };

  const handleSummarize = async () => {
    let inputText = "";
    
    if (activeTab === "text" && text.trim().length > 0) {
      inputText = text;
    } else if (activeTab === "url" && url.trim().length > 0) {
      toast({
        title: "URL Processing",
        description: "URL content extraction is in progress...",
      });
      try {
        inputText = `Content from URL: ${url}`;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch URL content.",
          variant: "destructive",
        });
        return;
      }
    } else if (activeTab === "file" && selectedFile) {
      if (selectedFile.type.includes("text")) {
        try {
          const text = await selectedFile.text();
          inputText = text;
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to read file content.",
            variant: "destructive",
          });
          return;
        }
      } else {
        toast({
          title: "Unsupported File",
          description: "Only text files can be processed directly.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!inputText) {
      toast({
        title: "Input required",
        description: "Please provide text, a URL, or upload a file to summarize.",
        variant: "destructive",
      });
      return;
    }

    const result = await geminiSummarize(inputText);
    
    if (result) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from("summaries").insert({
            user_id: user.id,
            summary_input_type: activeTab,
            input_raw: inputText,
            file_name: fileName,
            summary_result: result.summary,
            summary_type: summaryType,
            summary_tone: tone,
            summary_length: length[0],
            keywords: result.keywords,
          });
        }
      } catch (error) {
        console.error("Error saving to history:", error);
      }
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
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const evt = new CustomEvent("showDocChat", {});
                  window.dispatchEvent(evt);
                }}
              >
                <Upload className="w-4 h-4 mr-1" />
                Try Chat with Document
              </Button>
            </div>
            <InputSection
              activeTab={activeTab}
              text={text}
              url={url}
              onTextChange={handleTextChange}
              onUrlChange={handleUrlChange}
              onFileUpload={handleFileUpload}
              onTabChange={setActiveTab}
              fileName={fileName}
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
              disabled={isLoading || geminiLoading}
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

        <div className="mt-10">
          <SummaryHistory history={history} />
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
