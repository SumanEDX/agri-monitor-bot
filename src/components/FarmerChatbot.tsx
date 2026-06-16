import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader as Loader2, Bot, User, Mic, MicOff, Camera, Upload, ImagePlus, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useI18n, type Language } from "@/lib/i18n";

type MessagePart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type Message = {
  role: "user" | "assistant";
  content: string | MessagePart[];
  imagePreview?: string;
};

export type FarmContext = {
  weather?: { temp: number; condition: string; humidity: number; feelsLike: number; wind: number };
  cropHealth?: { crop: string; health: number; area: string }[];
  stats?: { farmers: number; plots: number; tasks: number; waterSources: number };
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/farmer-chat`;

const langToBcp47: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
};

// Strip imagePreview (UI-only) before sending to API
function toApiMessages(messages: Message[]) {
  return messages.map(({ role, content }) => ({ role, content }));
}

async function compressImage(file: File): Promise<{ base64: string; preview: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 1024;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve({ base64: dataUrl.split(",")[1], preview: dataUrl, mimeType: "image/jpeg" });
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function streamChat({
  messages,
  language,
  farmContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  language: string;
  farmContext?: FarmContext;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: toApiMessages(messages), language, farmContext }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

type PendingImage = { base64: string; preview: string; mimeType: string };

const FarmerChatbot: React.FC<{ farmContext?: FarmContext }> = ({ farmContext }) => {
  const { t, language } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Close image menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
        setImageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleImageFile = async (file: File) => {
    setImageError(null);
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setImageError("Image is too large. Please choose an image under 20 MB.");
      return;
    }
    try {
      const result = await compressImage(file);
      setPendingImage(result);
    } catch {
      setImageError("Failed to process the image. Please try another photo.");
    }
  };

  const toggleVoice = useCallback(() => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert(t("voiceNotSupported"));
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = langToBcp47[language] || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, language, t]);

  const send = async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || loading) return;
    setInput("");
    setImageError(null);

    let userMsg: Message;

    if (pendingImage) {
      const parts: MessagePart[] = [
        {
          type: "text",
          text: text ||
            "Please analyze this crop image carefully. Identify any diseases, pest infestations, nutrient deficiencies, or environmental stress symptoms visible. Provide: 1) Diagnosis with confidence level, 2) Disease/issue description, 3) Recommended treatments, 4) Preventive measures.",
        },
        { type: "image_url", image_url: { url: `data:${pendingImage.mimeType};base64,${pendingImage.base64}` } },
      ];
      userMsg = { role: "user", content: parts, imagePreview: pendingImage.preview };
      setPendingImage(null);
      setAnalyzingImage(true);
    } else {
      userMsg = { role: "user", content: text };
    }

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        language,
        farmContext,
        onDelta: upsert,
        onDone: () => { setLoading(false); setAnalyzingImage(false); },
        onError: (err) => {
          upsert(`⚠️ ${err}`);
          setLoading(false);
          setAnalyzingImage(false);
        },
      });
    } catch {
      upsert(`⚠️ ${t("chatbotError")}`);
      setLoading(false);
      setAnalyzingImage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const getTextContent = (msg: Message): string => {
    if (typeof msg.content === "string") return msg.content;
    const textPart = (msg.content as MessagePart[]).find((p) => p.type === "text");
    return textPart?.type === "text" ? textPart.text : "";
  };

  const canSend = !loading && (input.trim().length > 0 || pendingImage !== null);

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); e.target.value = ""; }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); e.target.value = ""; }}
      />

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-24px)] h-[560px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">{t("chatbotTitle")}</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-80">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-6 space-y-3">
                <Bot className="w-10 h-10 mx-auto text-primary/60" />
                <p className="font-medium">{t("chatbotWelcome")}</p>
                <p className="text-xs">{t("chatbotHint")}</p>
                <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-3 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Leaf className="w-3.5 h-3.5" />
                    Crop Disease Detection
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tap the <Camera className="w-3 h-3 inline mx-0.5" /> camera icon to upload or capture a photo of your crop. The AI will diagnose diseases, pests, and deficiencies.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[78%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.imagePreview && (
                    <div className="mb-2 -mx-1">
                      <img
                        src={msg.imagePreview}
                        alt="Crop photo"
                        className="rounded-lg w-full max-h-44 object-cover border border-white/20"
                      />
                      <p className="text-[10px] mt-1 opacity-70 flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> Crop image for analysis
                      </p>
                    </div>
                  )}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2">
                      <ReactMarkdown>{getTextContent(msg)}</ReactMarkdown>
                    </div>
                  ) : (
                    <span>{getTextContent(msg)}</span>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {analyzingImage ? "Analyzing crop image..." : "Thinking..."}
                </div>
              </div>
            )}
          </div>

          {/* Pending image preview */}
          {pendingImage && (
            <div className="px-3 py-2 border-t border-border bg-muted/30 flex-shrink-0">
              <div className="relative inline-block">
                <img
                  src={pendingImage.preview}
                  alt="Selected crop"
                  className="h-16 w-20 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => { setPendingImage(null); setImageError(null); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center rounded-b-lg py-0.5">
                  Ready to send
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add a note or send directly for disease analysis.
              </p>
            </div>
          )}

          {/* Image error */}
          {imageError && (
            <div className="px-3 py-1.5 bg-destructive/10 border-t border-destructive/20 flex-shrink-0">
              <p className="text-xs text-destructive">{imageError}</p>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border p-3 flex gap-2 items-end flex-shrink-0">
            {/* Voice button */}
            <Button
              size="icon"
              variant={listening ? "destructive" : "outline"}
              onClick={toggleVoice}
              className="flex-shrink-0 h-9 w-9"
              title={t("voiceSearch")}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Camera / image button with menu */}
            <div className="relative flex-shrink-0" ref={imageMenuRef}>
              <Button
                size="icon"
                variant={pendingImage ? "default" : "outline"}
                onClick={() => setImageMenuOpen((v) => !v)}
                className="h-9 w-9"
                title="Add crop photo"
                disabled={loading}
              >
                {pendingImage ? <ImagePlus className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </Button>

              {imageMenuOpen && (
                <div className="absolute bottom-11 left-0 bg-background border border-border rounded-xl shadow-lg py-1 w-44 z-10">
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => { setImageMenuOpen(false); cameraInputRef.current?.click(); }}
                  >
                    <Camera className="w-4 h-4 text-primary" />
                    Take Photo
                  </button>
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => { setImageMenuOpen(false); galleryInputRef.current?.click(); }}
                  >
                    <Upload className="w-4 h-4 text-primary" />
                    Upload Image
                  </button>
                </div>
              )}
            </div>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                pendingImage
                  ? "Add a note (optional)..."
                  : listening
                  ? t("voiceListening")
                  : t("chatbotPlaceholder")
              }
              className="min-h-[36px] max-h-[80px] resize-none text-sm flex-1"
              rows={1}
            />

            <Button
              size="icon"
              onClick={send}
              disabled={!canSend}
              className="flex-shrink-0 h-9 w-9"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FarmerChatbot;
