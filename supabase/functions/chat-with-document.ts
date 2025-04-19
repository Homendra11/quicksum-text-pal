
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { question, docText, history } = await req.json();

    if (!question || !docText) {
      throw new Error("Missing question or doc text.");
    }

    // Prepare chat history for context
    const messages = [
      { role: "system", content: "You are a helpful assistant. Use only the text in the user's document as context for every answer. Keep answers relevant, extractive, and cite the context as needed. If asked, you can provide summaries, key points, or clarifications. If information isn't in the document, be honest." },
      { role: "system", content: "Document content: " + docText.slice(0, 10000) }
    ];
    // Add previous Q&A pairs (cap at 5)
    if (Array.isArray(history)) {
      history.slice(-5).forEach((item: any) => {
        messages.push({ role: item.role, content: item.content });
      });
    }
    messages.push({ role: "user", content: question });

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

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || "error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
