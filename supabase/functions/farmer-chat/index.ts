import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const langInstructions: Record<string, string> = {
  en: "Respond in English.",
  hi: "कृपया हिंदी में उत्तर दें। Respond in Hindi.",
  mr: "कृपया मराठीत उत्तर द्या। Respond in Marathi.",
  ta: "தமிழில் பதிலளிக்கவும். Respond in Tamil.",
  te: "దయచేసి తెలుగులో సమాధానం ఇవ్వండి. Respond in Telugu.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = langInstructions[language] || langInstructions.en;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are SmartFarm AI Assistant, a helpful agricultural expert chatbot for Indian farmers. You specialize in:
- Crop management and best practices
- Irrigation and water management
- Soil health and fertilization
- Pest and disease identification and control
- Weather-based farming advice
- Government schemes and subsidies for farmers
- Market prices and selling strategies
- Organic farming techniques

Keep answers practical, concise, and farmer-friendly. When relevant, consider the Indian agricultural context (monsoon seasons, local crops like rice, wheat, sugarcane, cotton, etc.). Use simple language that farmers can easily understand.

${langInstruction}`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
