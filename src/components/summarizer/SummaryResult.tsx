
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";

interface SummaryResultProps {
  summaryType: string;
  tone: string;
  length: number[];
  summaryResult: string;
  keywords: string[];
  onCopy: () => void;
  onRate: (liked: boolean) => void;
}

const SummaryResult = ({
  summaryType,
  tone,
  length,
  summaryResult,
  keywords,
  onCopy,
  onRate,
}: SummaryResultProps) => {
  return (
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
          <div className="whitespace-pre-wrap">{summaryResult}</div>
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
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onRate(true)}>
            <ThumbsUp className="h-4 w-4 mr-1" />
            Helpful
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onRate(false)}>
            <ThumbsDown className="h-4 w-4 mr-1" />
            Not helpful
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SummaryResult;
