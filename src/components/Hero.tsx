
import React from "react";
import { FileText, Book, List, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="container py-12 md:py-20 text-center">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
        QuickSum
      </h1>
      <h2 className="text-xl md:text-2xl mb-6 max-w-2xl mx-auto">
        Your Friendly Text Buddy That Makes Long Content Short & Sweet
      </h2>
      <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
        Paste text, upload files, or drop links and get beautiful, human-like summaries in seconds.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <Button 
          className="group"
          size="lg" 
          onClick={() => document.getElementById('summarizer-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Summarize Now 
          <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
        </Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in">
        <FeatureCard 
          icon={<FileText className="h-8 w-8 text-primary mb-4" />}
          title="Multiple Formats"
          description="Get bullet points, paragraphs, or casual TL;DRs with custom length and tone options."
        />
        <FeatureCard 
          icon={<List className="h-8 w-8 text-primary mb-4" />}
          title="Smart Highlights"
          description="Automatically highlight keywords, entities, and important concepts in your text."
        />
        <FeatureCard 
          icon={<MessageSquare className="h-8 w-8 text-primary mb-4" />}
          title="Chat with Content"
          description="Ask questions about your documents and get intelligent answers based on the text."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-accent/50 p-6 rounded-lg border border-primary/10 hover:border-primary/20 transition-all">
    <div className="flex flex-col items-center">
      {icon}
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default Hero;
