import type { BadgeMap } from "../ui/Markdown";

export interface JournalConfig {
  id: "journalGeneral" | "journalMilitary";
  pageTitle: string;
  title: string;
  subtitle: string;
  tagline: string;
  disclaimerStrong: string;
  disclaimerText: string;
  topicLabel: string;
  topicPlaceholder: string;
  step2Title: string;
  loaderQuestions: string;
  loaderAnalysis: string;
  tips: string[];
  questionsPrompt: (topic: string) => string;
  mainPrompt: (topic: string, details: string, sources: string) => string;
  summaryHeading: RegExp; // e.g. /\n#\s+Journal Club Summary/i
  planHeading: RegExp; // fallback split when section markers are missing
  badges: BadgeMap;
  bottomLineTitle: string;
  tabs: [string, string, string];
  listenLabel: string;
  audioTitle: string;
  scriptStepText: string;
  scriptPrompt: (summary: string) => string;
  followUpPlaceholder: string;
  followUpPrompt: (context: string, question: string) => string;
  reportError: string;
}

/** Shared replacement for the website's "Use Google Search" line (Vantage has no live web search). */
export const NO_SEARCH_RULE = `SOURCES: You do not have live web search. Use only trials, guidelines, and dates you are confident are real. If a detail is uncertain, write "(verify)" next to it. Never invent a trial, author, or citation. If source text is pasted below, use it first and cite it.`;

export function sourcesBlock(sources: string): string {
  const s = sources.trim();
  return s ? `\nSOURCE TEXT PASTED BY THE USER (use first):\n"""\n${s.slice(0, 30000)}\n"""\n` : "";
}
