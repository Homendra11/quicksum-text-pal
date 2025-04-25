
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { question, docText, history } = await req.json();

    if (!question || !docText) {
      throw new Error("Missing question or document text");
    }

    // If no API key, return placeholder response for development
    if (!openAIApiKey) {
      console.log("No OpenAI API key found, using placeholder response");
      return new Response(
        JSON.stringify({
          answer: `This is a placeholder response since no OpenAI API key was found. Your question was: "${question}". I would analyze the document text (${docText.slice(0, 50)}...) and provide a relevant answer based on its content.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare chat history for context
    const messages = [
      { role: "system", content: "You are a helpful assistant. Use only the text in the user's document as context for every answer. Keep answers relevant, extractive, and cite the context as needed." },
      { role: "system", content: "Document content: " + docText.slice(0, 10000) }
    ];
    
    // Add previous Q&A pairs (cap at 5)
    if (Array.isArray(history)) {
      history.slice(-5).forEach((item: any) => {
        if (item && item.role && item.content) {
          messages.push({ role: item.role, content: item.content });
        }
      });
    }
    
    messages.push({ role: "user", content: question });

    console.log("Sending request to OpenAI");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status}`, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? "";
    
    console.log("Successfully got response from OpenAI");
    
    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error in chat-with-document function:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Unknown error occurred" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
