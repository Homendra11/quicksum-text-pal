import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Summarizer from "@/components/Summarizer";
import FeatureHighlights from "@/components/FeatureHighlights";
import Footer from "@/components/Footer";
import { useState } from "react";
import DocumentChat from "@/components/DocumentChat";

const Index = () => {
  const [showDocChat, setShowDocChat] = useState(false);

  React.useEffect(() => {
    const handler = () => setShowDocChat(true);
    window.addEventListener("showDocChat", handler);
    return () => window.removeEventListener("showDocChat", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        {!showDocChat && (
          <>
            <Summarizer />
            <div className="flex justify-center my-6">
              <button
                className="text-primary underline text-sm"
                onClick={() => setShowDocChat(true)}
              >
                Try "Chat with Document"
              </button>
            </div>
            <FeatureHighlights />
          </>
        )}
        {showDocChat && (
          <div className="mb-10">
            <DocumentChat />
            <div className="flex justify-center mt-6">
              <button
                className="text-muted-foreground underline text-sm"
                onClick={() => setShowDocChat(false)}
              >
                ← Back to Summarizer
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
