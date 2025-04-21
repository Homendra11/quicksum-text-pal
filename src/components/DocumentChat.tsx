import React, { useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPDF, extractTextFromDOC, processFile } from "@/lib/fileProcessor";
import { fakeSummarize } from "@/lib/summarize";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

function chunkDocument(text: string, maxChunkSize = 3000) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + maxChunkSize));
    i += maxChunkSize;
  }
  return chunks;
}

function findRelevantChunks(docText: string, question: string) {
  const chunks = chunkDocument(docText);
  if (chunks.length <= 4) return chunks;
  const questionWords = question.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  return chunks.filter(chunk => 
    questionWords.some(token => chunk.toLowerCase().includes(token))
  ).slice(0, 4) || chunks.slice(0, 2);
}

const DocumentChat = () => {
  const [docText, setDocText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenIndex, setRegenIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  function getEdgeFunctionUrl(fn: string): string {
    const origin = window.location.origin;
    let base = origin;
    if (origin.includes("lovableproject.com")) {
      base = origin.split("/")[0];
    } else if (import.meta.env.VITE_SUPABASE_URL) {
      base = import.meta.env.VITE_SUPABASE_URL;
    }
    return `${base}/functions/v1/${fn}`;
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setFileName(file.name);
    setDocText("");
    toast({ title: "File dropped", description: "Extracting content..." });
    try {
      const text = await processFile(file);
      setDocText(text);
      toast({ title: "Ready!", description: "Document content extracted." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to extract document text.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setFileName(file.name);
    setDocText("");
    toast({ title: "File selected", description: "Extracting content..." });
    try {
      const text = await processFile(file);
      setDocText(text);
      toast({ title: "Ready!", description: "Document content extracted." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to extract document text.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const onTextPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocText(e.target.value);
    setFileName("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || !docText) return;
    setChat(chat => [...chat, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    let answeredByAI = false;
    let apiError = null;

    try {
      let contextChunks = docText.length > 3500 ? findRelevantChunks(docText, question).join("\n---\n") : docText;
      const resp = await fetch(getEdgeFunctionUrl("chat-with-document"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          docText: contextChunks,
          history: chat.filter(c => c.role === "user" || c.role === "assistant")
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.answer) {
          setChat(chat => [...chat, { role: "assistant", content: data.answer }]);
          answeredByAI = true;
        } else if (data.error) {
          apiError = data.error;
        }
      } else {
        apiError = `Server responded: ${resp.status}`;
      }
    } catch (err: any) {
      apiError = "API request failed. Check your API Key in Supabase secrets.";
    }

    if (!answeredByAI) {
      if (apiError) {
        toast({ title: "AI chat error", description: apiError, variant: "destructive" });
      }
      let localSummary = "";
      try {
        if (/summarize|brief|overview/i.test(question)) {
          localSummary = await fakeSummarize(docText, "paragraph", "friendly", 45);
        } else if (/key\s*points|list/i.test(question)) {
          localSummary = await fakeSummarize(docText, "bullets", "neutral", 50);
        } else if (/main subject|who/i.test(question)) {
          localSummary = await fakeSummarize(docText, "tldr", "neutral", 25);
        } else {
          localSummary = await fakeSummarize(docText, "paragraph", "neutral", 40);
        }
      } catch (e) {
        localSummary = "Sorry, document could not be summarized.";
      }
      setChat(chat => [
        ...chat,
        { role: "assistant", content: localSummary || "Sorry, could not summarize. Try with a clearer document." }
      ]);
    }
    setLoading(false);
  };

  const triggerUpload = () => fileInput.current?.click();

  const sampleQuestions = [
    "Summarize this document.",
    "List the key points.",
    "Who is the main subject?",
    "Give a brief overview.",
    "What are important dates mentioned?",
    "Explain any complex concept here.",
  ];

  const chatAreaRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatAreaRef.current?.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length]);

  const onRegenerate = async (index: number) => {
    const lastUserIndex = chat.slice(0, index+1).reverse().findIndex(item => item.role === "user");
    if (lastUserIndex < 0) return;
    setRegenIndex(index);
    setLoading(true);
    let answeredByAI = false;
    let apiError = null;
    const qIndex = index - lastUserIndex;
    const question = chat[qIndex]?.content || "";
    try {
      let contextChunks = docText.length > 3500 ? findRelevantChunks(docText, question).join("\n---\n") : docText;
      const resp = await fetch(getEdgeFunctionUrl("chat-with-document"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          docText: contextChunks,
          history: chat.slice(0, qIndex).filter(c => c.role === "user" || c.role === "assistant"),
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.answer) {
          setChat(old =>
            old.map((item, idx) =>
              idx === index ? { role: "assistant", content: data.answer } : item
            )
          );
          answeredByAI = true;
        } else if (data.error) {
          apiError = data.error;
        }
      } else {
        apiError = `Server responded: ${resp.status}`;
      }
    } catch (err: any) {
      apiError = "API request failed. Check your API Key in Supabase secrets.";
    }
    setRegenIndex(null);
    setLoading(false);
    if (!answeredByAI && apiError) {
      toast({ title: "AI chat error", description: apiError, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Chat with Your Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="flex flex-col gap-4"
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
          >
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={triggerUpload}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-1" /> Upload PDF/DOC/TXT
              </Button>
              <input
                type="file"
                ref={fileInput}
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: "none" }}
                onChange={onFileUpload}
              />
              <span className="text-xs text-gray-500">{fileName}</span>
            </div>
            <Textarea
              value={docText}
              onChange={onTextPaste}
              placeholder="Or paste any paragraph/text here..."
              className="min-h-28"
              disabled={isUploading}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Try:</span>
              {sampleQuestions.map((q, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="ghost"
                  className="text-xs px-2"
                  onClick={() => setInput(q)}
                  type="button"
                  tabIndex={-1}
                >
                  {q}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <span>Tip: You can also drag and drop PDF, DOC, or TXT files above.</span>
            </div>
          </div>
          {docText && (
            <div
              ref={chatAreaRef}
              className="border rounded-lg mt-6 mb-3 p-4 bg-muted/30 max-h-80 overflow-y-auto"
              style={{ minHeight: 120 }}
            >
              {chat.length === 0 && (
                <div className="text-muted-foreground text-sm text-center">Ask any question about your document!</div>
              )}
              {chat.map((item, i) => (
                <div key={i} className={`mb-2 text-sm ${item.role === "user" ? "text-right" : "text-left"}`}>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg ${
                      item.role === "user" ? "bg-primary/10 text-primary" : "bg-secondary/60 text-gray-900"
                    }`}
                  >
                    {item.content}
                  </span>
                  {item.role === "assistant" && (
                    <Button
                      size="xs"
                      variant="ghost"
                      className="ml-2 text-[10px] px-1 py-0.5"
                      disabled={regenIndex === i || loading}
                      onClick={() => onRegenerate(i)}
                      title="Regenerate answer"
                    >
                      {regenIndex === i ? "Regenerating..." : "↻"}
                    </Button>
                  )}
                </div>
              ))}
              {loading && (
                <div className="italic text-xs text-muted-foreground">Thinking...</div>
              )}
            </div>
          )}
        </CardContent>
        <form onSubmit={onSubmit}>
          <CardFooter className="flex gap-2">
            <Input
              placeholder="Ask a question about the document"
              value={input}
              disabled={!docText || loading}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <Button type="submit" disabled={!input.trim() || !docText || loading}>Send</Button>
          </CardFooter>
        </form>
      </Card>
      <div className="mt-3 text-xs text-gray-500">
        {docText.length > 9500 && (
          <div className="text-red-500">
            Warning: Document is very large. Only key sections will be used to answer!
          </div>
        )}
        <div className="mt-1">
          If you keep getting errors, ensure your <b>OpenAI API key</b> is set in Supabase (Project Settings → Secrets → <code>OPENAI_API_KEY</code>).
        </div>
      </div>
    </div>
  );
};

export default DocumentChat;
