"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Mode = "normal" | "hint1" | "hint2" | "hint3" | "solution";

export default function ChatPage() {
  
  const [topic, setTopic] = useState("General");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function send(mode: Mode) {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, sessionId, userMessage, mode }),
    });

    const data = await res.json();
    if (data.sessionId) setSessionId(data.sessionId);

    setMessages((m) => [...m, { role: "assistant", content: data.assistant ?? "Error" }]);
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tutor Chat</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm opacity-70">Topic</span>
          <input
            className="border rounded px-2 py-1 text-sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
      </div>

      <Separator className="my-4" />

      <Card className="p-4 space-y-3">
        <div className="space-y-3 max-h-[55vh] overflow-auto">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  "inline-block rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap " +
                  (m.role === "user" ? "bg-black text-white" : "bg-gray-100")
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm opacity-70">Thinking…</div>}
        </div>

        <Textarea
          placeholder="Ask a question, or paste your attempt…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => send("normal")}>Send</Button>
          <Button variant="outline" onClick={() => send("hint1")}>Hint 1</Button>
          <Button variant="outline" onClick={() => send("hint2")}>Hint 2</Button>
          <Button variant="outline" onClick={() => send("hint3")}>Hint 3</Button>
          <Button variant="destructive" onClick={() => send("solution")}>Show solution</Button>
        </div>

        <p className="text-xs opacity-70">
          Tip: paste your work first — the tutor is best at correcting your reasoning.
        </p>
      </Card>
    </div>
  );
}
