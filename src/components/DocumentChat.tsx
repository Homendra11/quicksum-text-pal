
import React, { useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, FileText, MessagesSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPDF, extractTextFromDOC, processFile } from "@/lib/fileProcessor";
import { motion } from "framer-motion";

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
  const chatAreaRef = useRef<HTMLDivElement>(null);

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
    
    // Add user message to chat
    setChat(chat => [...chat, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    
    try {
      console.log("Sending question to chat backend");
      const resp = await fetch("/functions/v1/chat-with-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          docText,
          history: chat.filter(c => c.role === "user" || c.role === "assistant")
        }),
      });
      
      if (!resp.ok) {
        const errorData = await resp.text();
        console.error("Chat backend error:", errorData);
        throw new Error(`Error ${resp.status}: ${errorData}`);
      }
      
      const data = await resp.json();
      
      if (data.answer) {
        setChat(chat => [...chat, { role: "assistant", content: data.answer }]);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Received empty response from chat backend");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChat(chat => [...chat, { 
        role: "assistant", 
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : "Unknown error"}`
      }]);
      toast({ 
        title: "Error", 
        description: "Failed to get response from chat backend.", 
        variant: "destructive" 
      });
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

  React.useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chat.length]);

  const dropZoneClasses = `
    flex flex-col gap-4 border-2 border-dashed rounded-lg p-4
    transition-colors duration-300 ease-in-out
    ${isUploading ? 'border-primary/50 bg-primary/5' : 'border-border'}
    dark:border-opacity-50 dark:hover:border-primary/40
    hover:border-primary/60 hover:bg-primary/5
  `;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="dark:bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5" />
              <span>Chat with Your Document</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className={dropZoneClasses}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              <div className="flex items-center gap-3 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerUpload}
                  disabled={isUploading}
                  className="transition-all duration-300"
                >
                  <Upload className="h-4 w-4 mr-1" /> Upload PDF/DOC/TXT/Image
                </Button>
                <input
                  type="file"
                  ref={fileInput}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                  style={{ display: "none" }}
                  onChange={onFileUpload}
                />
                {fileName && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground"
                  >
                    {fileName}
                  </motion.span>
                )}
                {isUploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>
              <Textarea
                value={docText}
                onChange={onTextPaste}
                placeholder="Or paste any paragraph/text here..."
                className="min-h-28 transition-colors focus:border-primary"
                disabled={isUploading}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {sampleQuestions.map((q, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="ghost"
                    className="text-xs px-2 transition-colors hover:bg-primary/20"
                    onClick={() => setInput(q)}
                    type="button"
                    tabIndex={-1}
                  >
                    {q}
                  </Button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                <span>Tip: You can also drag and drop PDF, DOC, TXT files, or even images above.</span>
              </div>
            </div>
            {docText && (
              <div
                ref={chatAreaRef}
                className="border rounded-lg mt-6 mb-3 p-4 bg-muted/30 dark:bg-muted/10 max-h-80 overflow-y-auto transition-all"
                style={{ minHeight: 120 }}
              >
                {chat.length === 0 && (
                  <div className="text-muted-foreground text-sm text-center">Ask any question about your document!</div>
                )}
                {chat.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * i }}
                    className={`mb-2 text-sm ${item.role === "user" ? "text-right" : "text-left"}`}
                  >
                    <span
                      className={`inline-block px-3 py-1 rounded-lg ${
                        item.role === "user" 
                          ? "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground" 
                          : "bg-secondary/80 text-secondary-foreground dark:bg-secondary/40"
                      } transition-colors`}
                    >
                      {item.content}
                    </span>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Processing your question...</span>
                  </motion.div>
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
                className="transition-colors focus-visible:ring-primary"
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || !docText || loading}
                className="transition-transform active:scale-95"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default DocumentChat;
