// MedCon Portal – Vantage function (TypeScript v1, in a copy of DPMAP Writer's functions repo).
// One function for every AI call in the portal. The widget sends one JSON string; this returns one JSON string.
//
// Model chain: Gemini 4 Hydrogen (primary) -> GPT-5.6 Sol (backup) -> GPT-5.6 Terra (fast / last resort).
//
// BEFORE PUBLISHING (Vantage AI does this):
//  1. Replace the three model imports below with the EXACT names from each model's sidebar snippet
//     in Vantage (the Phase 0 report). Keep the @Uses line listing all three.
//  2. If DPMAP's working function calls createChatCompletion with a different shape (params names,
//     response fields), copy DPMAP's shape into callModel() below. Change nothing else.
//
// Request (writerRequestJson):
//   { nonce, task, system, messages: [{role:"user"|"assistant", content}], json: boolean,
//     reasoning?: "low"|"medium"|"high", preferFasterModel?: boolean }
// Response (writerResponseJson):
//   { nonce, ok: true, text, modelUsed, usedBackupModel }   or   { nonce, ok: false, errorMessage }

import { Function, Uses } from "@foundry/functions-api";
// ↓↓↓ EXACT names from the Vantage sidebar snippets ↓↓↓
import { GEMINI_4_HYDROGEN, GPT_5_6_SOL, GPT_5_6_TERRA } from "@foundry/languagemodelservice/models";

type Role = "user" | "assistant";
interface MedconRequest {
  nonce: string;
  task?: string;
  system?: string;
  messages?: { role: Role; content: string }[];
  json?: boolean;
  reasoning?: "low" | "medium" | "high";
  preferFasterModel?: boolean;
}

interface ModelStep {
  label: string;
  model: any;
  waitMs: number;
  gpt: boolean;
  reasoning: "low" | "medium" | "high";
}

const HYDROGEN_WAIT_MS = 120_000; // Hydrogen is the lightweight model; usually far faster.
const SOL_WAIT_MS = 120_000;
const TERRA_WAIT_MS = 60_000;
const MAX_TOKENS = 8000;
const MAX_MESSAGES = 20; // keeps long Ask Dr. Holtkamp chats inside the model's limits

const ERROR_TEXT = "Something went wrong. Please try again.";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function stripFences(s: string): string {
  return s.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function isValidJson(s: string): boolean {
  const c = stripFences(s);
  try {
    JSON.parse(c);
    return true;
  } catch {
    const a = c.indexOf("{");
    const b = c.lastIndexOf("}");
    if (a < 0 || b <= a) return false;
    try {
      JSON.parse(c.slice(a, b + 1));
      return true;
    } catch {
      return false;
    }
  }
}

async function callModel(step: ModelStep, req: MedconRequest): Promise<string> {
  const system =
    (req.system ?? "") + (req.json ? "\n\nReturn ONLY one valid JSON object. No markdown fences, no text before or after it." : "");
  const history = (req.messages ?? []).slice(-MAX_MESSAGES);
  const messages = [
    { role: "SYSTEM", content: system },
    ...history.map((m) => ({ role: m.role === "assistant" ? "ASSISTANT" : "USER", content: String(m.content ?? "") })),
  ];

  const params: Record<string, unknown> = { maxTokens: MAX_TOKENS };
  if (step.gpt) {
    params.reasoningEffort = step.reasoning;
    if (req.json) params.responseFormat = { type: "json_object" };
  }

  const response: any = await withTimeout(step.model.createChatCompletion({ messages, params }), step.waitMs);
  if (response?.type && response.type !== "ok") {
    throw new Error(String(response.error ?? "model error"));
  }
  const value = response?.value ?? response;
  const text: string = value?.completion ?? value?.choices?.[0]?.message?.content ?? "";
  const finish: string | undefined = value?.finishReason ?? value?.choices?.[0]?.finishReason;
  if (!text) throw new Error("empty answer");
  if (finish && String(finish).toLowerCase() !== "stop") throw new Error(`finish reason ${finish}`);
  if (req.json && !isValidJson(text)) throw new Error("invalid JSON");
  return req.json ? stripFences(text) : text;
}

export class MedconFunctions {
  @Function()
  @Uses({ queries: [GEMINI_4_HYDROGEN, GPT_5_6_SOL, GPT_5_6_TERRA] })
  public async medconAsk(requestJson: string): Promise<string> {
    // Page load / empty variable: answer fast with no nonce (the widget ignores it).
    if (!requestJson || !requestJson.trim()) {
      return JSON.stringify({ nonce: "", ok: false, errorMessage: "EMPTY_REQUEST" });
    }

    let req: MedconRequest;
    try {
      req = JSON.parse(requestJson);
    } catch {
      return JSON.stringify({ nonce: "", ok: false, errorMessage: ERROR_TEXT });
    }
    const nonce = String(req.nonce ?? "");
    if (!req.messages || req.messages.length === 0) {
      return JSON.stringify({ nonce, ok: false, errorMessage: ERROR_TEXT });
    }

    const reasoning = req.reasoning ?? "low";
    const chain: ModelStep[] = req.preferFasterModel
      ? [{ label: "GPT-5.6 Terra", model: GPT_5_6_TERRA, waitMs: TERRA_WAIT_MS, gpt: true, reasoning: "low" }]
      : [
          { label: "Gemini 4 Hydrogen", model: GEMINI_4_HYDROGEN, waitMs: HYDROGEN_WAIT_MS, gpt: false, reasoning },
          { label: "GPT-5.6 Sol", model: GPT_5_6_SOL, waitMs: SOL_WAIT_MS, gpt: true, reasoning: "medium" },
          { label: "GPT-5.6 Terra", model: GPT_5_6_TERRA, waitMs: TERRA_WAIT_MS, gpt: true, reasoning: "low" },
        ];

    for (let i = 0; i < chain.length; i++) {
      const step = chain[i];
      // Retry once on a bad answer (invalid JSON / cut off); move on right away after a timeout.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const text = await callModel(step, req);
          return JSON.stringify({ nonce, ok: true, text, modelUsed: step.label, usedBackupModel: i > 0 || !!req.preferFasterModel });
        } catch (e: any) {
          if (String(e?.message) === "timeout") break;
        }
      }
    }
    return JSON.stringify({ nonce, ok: false, errorMessage: ERROR_TEXT });
  }
}
