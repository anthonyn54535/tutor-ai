import { NextResponse } from "next/server";
import { llm } from "@/lib/llm";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/tutorPrompt";
import { prisma } from "@/lib/prisma";

type ReqBody = {
  sessionId?: string;
  topic: string;
  userMessage: string;
  mode?: "normal" | "hint1" | "hint2" | "hint3" | "solution";
};

function modeInstruction(mode: ReqBody["mode"]) {
  switch (mode) {
    case "hint1":
      return "Give ONLY Hint 1.";
    case "hint2":
      return "Give ONLY Hint 2.";
    case "hint3":
      return "Give ONLY Hint 3.";
    case "solution":
      return "Give a full solution, but still explain step-by-step and include a quick check question.";
    default:
      return "Tutor normally (attempt-first, Socratic).";
  }
}

export async function POST(req: Request) {

  const body = (await req.json()) as ReqBody;

  const topic = body.topic?.trim() || "General";
  const userMessage = body.userMessage?.trim() || "";
  const mode = body.mode ?? "normal";

  if (!userMessage) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  // Create or load session
  const session =
    body.sessionId
      ? await prisma.session.findUnique({
          where: { id: body.sessionId },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        })
      : await prisma.session.create({
          data: { topic },
          include: { messages: true },
        });

  const sessionId = session?.id;

  // Save user message
  await prisma.message.create({
    data: {
      role: "user",
      content: userMessage,
      session: { connect: { id: sessionId } },
    },
  });
  

  // Pull last ~12 messages for context
type HistoryRow = { role: "user" | "assistant"; content: string };

const history = (await prisma.message.findMany({
  where: { sessionId },
  orderBy: { createdAt: "asc" },
  take: 12,
  select: { role: true, content: true },
})) as HistoryRow[];

  
  
  

  const messages = [
    { role: "system" as const, content: TUTOR_SYSTEM_PROMPT },
    { role: "system" as const, content: `Topic: ${topic}. ${modeInstruction(mode)}` },
    ...history.map((m: HistoryRow) => ({ role: m.role, content: m.content }))
]


  const resp = await llm.chat.completions.create({
    model: process.env.OPENAI_MODEL || process.env.LM_MODEL || "gpt-4o-mini",
    messages,
  });
  

  const assistant = resp.choices[0]?.message?.content ?? "I’m not sure. Try again.";

  // Save assistant message
  await prisma.message.create({
    data: {
      role: "assistant",
      content: assistant,
      session: { connect: { id: sessionId } },
    },
  });
  

  return NextResponse.json({ sessionId, assistant });
}
