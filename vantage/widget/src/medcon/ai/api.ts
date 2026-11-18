// Drop-in replacements for the website's js/api.js (callGeminiApi / callGeminiText).
// Same idea, but every call goes through Vantage (Gemini 4 Hydrogen) instead of Google.

import { aiBridge, AiMessage } from "./bridge";

export interface AskOptions {
  task: string;
  reasoning?: "low" | "medium" | "high";
  history?: AiMessage[]; // earlier turns for multi-turn chat
}

export interface TextAnswer {
  text: string;
  modelUsed: string;
  usedBackupModel: boolean;
}

/** Ask for one JSON object (same as callGeminiApi). Throws if the answer isn't valid JSON. */
export async function askJson<T = any>(system: string, user: string, opts: AskOptions): Promise<T> {
  const res = await aiBridge.request({
    task: opts.task,
    system,
    messages: [...(opts.history ?? []), { role: "user", content: user }],
    json: true,
    reasoning: opts.reasoning ?? "low",
  });
  return parseJsonAnswer<T>(res.text);
}

/** Ask for plain text / Markdown (same as callGeminiText). */
export async function askText(system: string, user: string, opts: AskOptions): Promise<TextAnswer> {
  const res = await aiBridge.request({
    task: opts.task,
    system,
    messages: [...(opts.history ?? []), { role: "user", content: user }],
    json: false,
    reasoning: opts.reasoning ?? "low",
  });
  return { text: res.text || "No response.", modelUsed: res.modelUsed, usedBackupModel: res.usedBackupModel };
}

export function parseJsonAnswer<T = any>(raw: string): T {
  let cleaned = (raw ?? "").trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1)) as T;
    }
    throw new Error("The AI answer was not in the expected format. Please try again.");
  }
}
