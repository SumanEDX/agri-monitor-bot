import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

const responses: { keywords: string[]; reply: string }[] = [
  { keywords: ["pm-kisan", "pm kisan", "kisan samman"], reply: "PM-KISAN gives Rs 6,000/year to landholding farmers. Apply at pmkisan.gov.in with Aadhaar and land records." },
  { keywords: ["kcc", "credit card", "kisan credit"], reply: "Apply for a Kisan Credit Card at any bank branch with ID proof, address proof, and land documents. Loans up to Rs 3 lakh at 4% interest." },
  { keywords: ["loan waiver", "karj mafi", "mjpsky"], reply: "MJPSKY waives short-term crop loans up to Rs 2 lakh for eligible Maharashtra farmers as of 30 Sept 2019." },
  { keywords: ["insurance", "pmfby", "crop insurance"], reply: "PMFBY covers crop loss at 2% premium for Kharif, 1.5% for Rabi. Enrol at pmfby.gov.in or any bank/CSC." },
  { keywords: ["solar", "pump", "saur"], reply: "Maharashtra Saur Krushi Pump Yojana offers 90-95% subsidy on solar pumps. Apply at mahaurja.com." },
  { keywords: ["drip", "irrigation", "pmksy"], reply: "PMKSY provides 45-55% subsidy on micro-irrigation. Apply via your State Agriculture Department." },
  { keywords: ["soil"], reply: "Soil Health Card is free and issued every 3 years via your Krishi Vigyan Kendra." },
  { keywords: ["helpline", "contact", "number"], reply: "Kisan Call Centre: 1800-180-1551. Maharashtra Krishi: 1800-233-4000." },
];

type Msg = { from: "bot" | "user"; text: string };

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Namaste! Ask me about any farmer welfare scheme. Try: 'What is PM-KISAN?'" },
  ]);

  const respond = (q: string) => {
    const lower = q.toLowerCase();
    const hit = responses.find((r) => r.keywords.some((k) => lower.includes(k)));
    return hit?.reply ?? "I can help with PM-KISAN, KCC, PMFBY, loan waiver, solar pumps, drip irrigation, soil health, and helplines. Please rephrase.";
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }, { from: "bot", text: respond(text) }]);
    setInput("");
  };

  return (
    <>
      <button
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-full p-4 shadow-xl transition-all hover:scale-105"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[90vw] h-[460px] bg-white dark:bg-[#22223b] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="bg-[#2d6a4f] text-white p-3 flex items-center justify-between">
            <div className="font-semibold">KrishiSeva Assistant</div>
            <button aria-label="Close" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#f8f9f0] dark:bg-[#1a1a2e]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.from === "user" ? "bg-[#52b788] text-white rounded-br-sm" : "bg-white dark:bg-slate-800 dark:text-slate-100 shadow-sm rounded-bl-sm"}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#52b788]"
            />
            <button onClick={send} className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-3 rounded-lg">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;