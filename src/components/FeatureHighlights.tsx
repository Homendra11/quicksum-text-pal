
import React from "react";
import { Check, Link, FileText, BookOpen, MessageSquare, Speech, Globe } from "lucide-react";

const FeatureHighlights = () => {
  const features = [
    {
      icon: <FileText className="h-6 w-6 text-primary mb-2" />,
      title: "Multiple Summary Styles",
      description: "Choose between bullet points, paragraphs, or casual TL;DRs to fit your reading preferences."
    },
    {
      icon: <Link className="h-6 w-6 text-primary mb-2" />,
      title: "URL Summarization",
      description: "Simply paste a link to a webpage, article, or blog post and get an instant summary."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-primary mb-2" />,
      title: "Document Upload",
      description: "Upload PDFs, Word documents, or text files and extract the key information in seconds."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary mb-2" />,
      title: "Chat with Content",
      description: "Ask specific questions about your text and get precise answers based on the content."
    },
    {
      icon: <Speech className="h-6 w-6 text-primary mb-2" />,
      title: "Audio Summary",
      description: "Convert audio into text and generate summaries of podcasts, lectures, or meetings."
    },
    {
      icon: <Globe className="h-6 w-6 text-primary mb-2" />,
      title: "Multiple Languages",
      description: "Summarize content in various languages and even translate summaries between languages."
    }
  ];

  return (
    <div className="bg-accent/50 py-16">
      <div className="container">
        <h2 className="text-3xl font-bold mb-12 text-center">Everything You Need to Save Time</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-background p-6 rounded-lg shadow-sm border border-primary/10 flex flex-col animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {feature.icon}
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureHighlights;
