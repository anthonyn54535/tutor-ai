"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ThemeLogo } from "@/components/ThemeLogo";

type Mode = "normal" | "hint1" | "hint2" | "hint3" | "solution";
type Msg = { role: "user" | "assistant"; content: string };

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7.5 7.5 0 1 0 21 14.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChatPage() {
  const [topic, setTopic] = useState("General");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Theme (light/dark) ---
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;

    // Default to system theme if nothing saved
    const systemDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial = saved ?? (systemDark ? "dark" : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  async function send(mode: Mode) {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, sessionId, userMessage, mode }),
      });

      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);

      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.assistant ?? "Error" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const hasMessages = messages.length > 0;

  const groupedButtons = useMemo(
    () => [
      { label: "Send", mode: "normal" as const, variant: "default" as const },
      { label: "Hint 1", mode: "hint1" as const, variant: "outline" as const },
      { label: "Hint 2", mode: "hint2" as const, variant: "outline" as const },
      { label: "Hint 3", mode: "hint3" as const, variant: "outline" as const },
      { label: "Show solution", mode: "solution" as const, variant: "destructive" as const },
    ],
    []
  );
  
  return (
    
    <div className="min-h-screen bg-white text-black dark:bg-zinc-950 dark:text-zinc-50">
      {/* Top bar */}
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          {/* Fixed top-left logo */}
<div className="fixed top-6 left-6 z-50 pointer-events-none">
  <ThemeLogo
    theme={theme}
    lightSrc="/logo-dark.png"
    darkSrc="/logo-light.png"
    alt="EverMind"
    className="h-10 w-10"
  />
</div>

            <h1 className="text-xl font-semibold tracking-tight">EverMind</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm opacity-70">Topic</span>
              <input
                className="w-48 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm outline-none
                           focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-700"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
            </Button>
          </div>
        </div>

        <Separator className="my-4 dark:bg-zinc-800" />
      </div>

      {/* Center area */}
      <div className="mx-auto max-w-5xl px-6">
        {!hasMessages ? (
          // Landing / idle state
          <div className="grid place-items-center pt-20">
            <div className="text-center">
            <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
  <div className="-translate-y-20">
    <ThemeLogo
      theme={theme}
      lightSrc="/logo-dark.png"
      darkSrc="/logo-light.png"
      alt="EverMind"
      className="h-120 w-120"
    />
  </div>
</div>



              <h2 className="text-3xl font-semibold tracking-tight">Ask anything.</h2>
              <p className="mt-2 text-sm opacity-70">
                Drop a question, paste your work, or ask for hints.
              </p>
            </div>
          </div>
        ) : (
          // Messages view (centered)
          <div className="pb-44">
            <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="p-4 sm:p-6">
                <div className="space-y-3 max-h-[65vh] overflow-auto pr-1">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={[
                          "max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed",
                          m.role === "user"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-zinc-100 text-black dark:bg-zinc-900 dark:text-zinc-50",
                        ].join(" ")}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="text-sm opacity-70">Thinking…</div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom input dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-5xl px-6 pb-6">
          <Card className="border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="p-4 sm:p-5 space-y-3">
              {/* On mobile, show Topic here too */}
              <div className="flex sm:hidden items-center gap-2">
                <span className="text-sm opacity-70">Topic</span>
                <input
                  className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm outline-none
                             focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-700"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <Textarea
                placeholder="Ask a question, or paste your attempt…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[90px] resize-none bg-white dark:bg-zinc-950"
              />

              <div className="flex flex-wrap gap-2">
                {groupedButtons.map((b) => (
                  <Button
                    key={b.label}
                    variant={b.variant}
                    onClick={() => send(b.mode)}
                    disabled={loading}
                  >
                    {b.label}
                  </Button>
                ))}
              </div>

              <p className="text-xs opacity-70">
                Tip: paste your work first — the tutor is best at correcting your reasoning.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
