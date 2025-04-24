
import React, { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, FileText, LinkIcon } from "lucide-react";

interface InputSectionProps {
  activeTab: string;
  text: string;
  url: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTabChange: (value: string) => void;
  fileName?: string;
}

const InputSection = ({
  activeTab,
  text,
  url,
  onTextChange,
  onUrlChange,
  onFileUpload,
  onTabChange,
  fileName = "",
}: InputSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event to pass to onFileUpload
      const fileInputEvent = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onFileUpload(fileInputEvent);
      onTabChange('file');
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="text" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Text
        </TabsTrigger>
        <TabsTrigger value="url" className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
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
          onChange={onTextChange}
        />
      </TabsContent>

      <TabsContent value="url" className="mt-0">
        <Input
          type="url"
          placeholder="Enter a URL (e.g., https://example.com/article)"
          value={url}
          onChange={onUrlChange}
        />
      </TabsContent>

      <TabsContent value="file" className="mt-0">
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
          } rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors`}
          onClick={triggerFileUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={`h-10 w-10 mb-2 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600 mb-1">
            {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-400">
            Support for PDF, DOC, DOCX, TXT files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={onFileUpload}
          />
          {fileName && (
            <p className="mt-3 text-primary font-medium text-sm truncate max-w-xs">
              Uploaded: {fileName}
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default InputSection;
