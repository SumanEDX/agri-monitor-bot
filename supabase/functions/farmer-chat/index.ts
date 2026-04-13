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

function buildContextBlock(farmContext: any): string {
  if (!farmContext) return "";
  const parts: string[] = ["\n\n--- LIVE FARM DATA (use this to give accurate, real-time advice) ---"];

  if (farmContext.weather) {
    const w = farmContext.weather;
    parts.push(`Current Weather in Nashik: ${w.temp}°C, ${w.condition}, Humidity: ${w.humidity}%, Feels like: ${w.feelsLike}°C, Wind: ${w.wind} km/h`);
  }

  if (farmContext.stats) {
    const s = farmContext.stats;
    parts.push(`Farm Stats: ${s.farmers} farmers, ${s.plots} active plots, ${s.tasks} tasks, ${s.waterSources} water sources`);
  }

  if (farmContext.cropHealth && farmContext.cropHealth.length > 0) {
    const crops = farmContext.cropHealth.map((c: any) => `${c.crop} (${c.area}) - Health: ${c.health}%`).join("; ");
    parts.push(`Crop Health: ${crops}`);
  }

  parts.push("--- END LIVE DATA ---");
  return parts.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language = "en", farmContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstruction = langInstructions[language] || langInstructions.en;
    const contextBlock = buildContextBlock(farmContext);

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
            content: `You are SmartFarm AI Assistant, a helpful agricultural expert chatbot for Indian farmers. You have access to LIVE, REAL-TIME farm data shown below. Always reference this data when answering questions about weather, crops, or farm status — never make up numbers.

You specialize in:
- Crop management and best practices
- Irrigation and water management based on current weather conditions
- Soil health and fertilization
- Pest and disease identification and control
- Weather-based farming advice using the LIVE weather data provided
- Government schemes and subsidies for farmers
- Market prices and selling strategies
- Organic farming techniques

When a farmer asks about weather, crops, or farm status, use the LIVE DATA below to give specific, actionable advice. For example, if humidity is high, warn about fungal diseases. If temperature is extreme, suggest protective measures.

Keep answers practical, concise, and farmer-friendly. Use simple language.

${langInstruction}
${contextBlock}`,
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
