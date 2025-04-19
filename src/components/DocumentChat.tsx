
import React, { useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPDF, extractTextFromDOC, processFile } from "@/lib/fileProcessor";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

const DocumentChat = () => {
  const [docText, setDocText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  // Handle file upload and extract text
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

  // Handle pasted text
  const onTextPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocText(e.target.value);
    setFileName("");
  };

  // Handle user message submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || !docText) return;
    setChat(chat => [...chat, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("/functions/v1/chat-with-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          docText,
          history: chat.filter(c => c.role === "user" || c.role === "assistant")
        }),
      });
      const data = await resp.json();
      if (data.answer) {
        setChat(chat => [...chat, { role: "assistant", content: data.answer }]);
      } else {
        setChat(chat => [...chat, { role: "assistant", content: "Sorry, I couldn't generate an answer." }]);
      }
    } catch (err) {
      setChat(chat => [...chat, { role: "assistant", content: "Error contacting the chat backend." }]);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Chat with Your Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
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
                  size="xs"
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
    </div>
  );
};

export default DocumentChat;
