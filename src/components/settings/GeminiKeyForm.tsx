
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Key } from "lucide-react";

const GeminiKeyForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully",
      });
      setIsOpen(false);
    } else {
      toast({
        title: "Empty API Key",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    toast({
      title: "API Key Cleared",
      description: "Your Gemini API key has been removed",
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => setIsOpen(true)}
      >
        <Key className="h-4 w-4" />
        {localStorage.getItem("gemini_api_key") ? "Update API Key" : "Set API Key"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Google Gemini API Key</DialogTitle>
            <DialogDescription>
              Enter your Gemini API key to enable AI summarization. 
              The key will be stored only in your browser.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Don't have an API key?{" "}
              <a
                href="https://ai.google.dev/tutorials/setup"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Get one from Google AI Studio
              </a>
            </p>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {localStorage.getItem("gemini_api_key") && (
              <Button variant="outline" onClick={handleClearKey}>
                Clear Key
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveKey}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GeminiKeyForm;
