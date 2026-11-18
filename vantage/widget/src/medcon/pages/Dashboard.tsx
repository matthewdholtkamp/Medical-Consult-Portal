// Dashboard: "What's on your mind, Doc?" (Ask Dr. Holtkamp) + Fast Links.
import { useEffect, useRef, useState } from "react";
import { askText } from "../ai/api";
import type { AiMessage } from "../ai/bridge";
import { DR_HOLTKAMP_SYSTEM_INSTRUCTION, splitConsultTag } from "../ai/homePrompts";
import { findConsult, SITE_CONTENT, SiteItem } from "../data/siteContent";
import { copyText } from "../ui/clipboard";
import { Icon } from "../ui/Icon";
import { Markdown } from "../ui/Markdown";
import { BackupNote, WaitHint } from "../ui/WaitHint";
import { keyOpen, RecommendedCard } from "./ConsultCard";

type Entry =
  | { kind: "user"; text: string }
  | { kind: "ai"; text: string; consult: SiteItem | null; backup: boolean }
  | { kind: "error"; text: string };

const FAST_LINKS: { title: string; desc: string; icon: string; tone: string; hover: string }[] = [
  { title: "ADTMC", desc: "Medic sick call services.", icon: "medical", tone: "bg-green-500/10 group-hover:bg-green-500/20 text-green-400", hover: "hover:shadow-green-500/10" },
  { title: "ADTMC+", desc: "Sick call services for providers. Generate notes fast.", icon: "medical", tone: "bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400", hover: "hover:shadow-indigo-500/10" },
  { title: "General Journal Club", desc: "Evidence summaries and audio breakdowns.", icon: "book", tone: "bg-red-500/10 group-hover:bg-red-500/20 text-red-400", hover: "hover:shadow-red-500/10" },
];

export function Dashboard({ onOpen }: { onOpen: (i: SiteItem) => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "";
    if (input) el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [entries, busy]);

  const ask = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setEntries((e) => [...e, { kind: "user", text: q }]);
    try {
      const res = await askText(DR_HOLTKAMP_SYSTEM_INSTRUCTION, q, {
        task: "home.askDrHoltkamp",
        history,
        reasoning: thinking ? "high" : "low",
      });
      const { body, consult } = splitConsultTag(res.text);
      setHistory((h) => [...h, { role: "user", content: q }, { role: "assistant", content: res.text }]);
      setEntries((e) => [...e, { kind: "ai", text: body, consult: consult ? findConsult(consult) ?? null : null, backup: res.usedBackupModel }]);
    } catch (err: any) {
      setEntries((e) => [...e, { kind: "error", text: err?.message || "Something went wrong. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setEntries([]);
    setHistory([]);
    setInput("");
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-6 pb-32 h-full">
      <div className="max-w-6xl mx-auto w-full animate-fade-in space-y-8">
        {/* Hero / Chat */}
        <div className="relative rounded-3xl overflow-hidden p-8 border border-white/5 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-gemini-800 to-gemini-900 z-0" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">What's on your mind, Doc? </h2>
            <p className="text-slate-400 mb-8 max-w-2xl" />

            <div className="space-y-6 mb-6">
              {entries.map((e, i) =>
                e.kind === "user" ? (
                  <div key={i} className="flex justify-end animate-fade-in">
                    <div className="bg-slate-700/50 text-slate-200 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-slate-600/50 shadow-sm">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{e.text}</p>
                    </div>
                  </div>
                ) : e.kind === "error" ? (
                  <div key={i} className="p-4 bg-red-900/20 text-red-200 text-xs rounded-xl border border-red-500/30 animate-fade-in" role="alert">
                    <strong>Error:</strong> {e.text}
                  </div>
                ) : (
                  <AiAnswer key={i} entry={e} onOpen={onOpen} />
                ),
              )}
              {busy && (
                <div className="flex flex-col gap-2 animate-fade-in pl-2">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Icon name="brain" className="animate-brain" size={26} />
                    <span className="font-medium text-sm tracking-wide">Dr. Holtkamp is reviewing clinical guidelines...</span>
                  </div>
                  <WaitHint className="items-start" />
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Chat input */}
            <div className="bg-gemini-800/80 backdrop-blur-md border border-slate-600/50 rounded-2xl shadow-lg flex flex-col relative focus-within:ring-2 focus-within:ring-blue-500/30 transition-all max-w-3xl">
              <textarea
                ref={inputRef}
                aria-label="Clinical query"
                placeholder="Clinical query (e.g., 'Latest STEMI guidelines')..."
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask();
                  }
                }}
                className="w-full bg-transparent text-slate-200 placeholder-slate-500 p-4 pl-5 min-h-[60px] max-h-48 resize-none focus:outline-none rounded-2xl"
              />
              <div className="flex items-center justify-between px-3 pb-3 relative">
                {entries.length > 0 && !busy && (
                  <button
                    type="button"
                    onClick={reset}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-600/50 transition-colors"
                  >
                    <Icon name="refresh" size={14} /> New Question
                  </button>
                )}
                <div className="flex items-center gap-4 ml-auto">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="relative inline-flex">
                      <input type="checkbox" className="sr-only peer" checked={thinking} onChange={(e) => setThinking(e.target.checked)} aria-label="Toggle Thinking Mode" />
                      <span className="w-9 h-5 bg-slate-700 rounded-full peer-checked:bg-blue-600 transition-colors" />
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                    </span>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Thinking Mode</span>
                  </label>
                  <button
                    type="button"
                    onClick={ask}
                    disabled={!input.trim() || busy}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {busy ? "Consulting..." : "Ask Dr. H"}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 ml-1">Strictly evidence-based (guidelines/RCTs). No PHI.</p>
          </div>
        </div>

        {/* Fast Links */}
        <div>
          <h3 className="text-lg font-bold text-slate-300 mb-4 px-1">Fast Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FAST_LINKS.map((f) => {
              const item = SITE_CONTENT.find((s) => s.title === f.title)!;
              return (
                <div key={f.title} role="button" tabIndex={0} onClick={() => onOpen(item)} onKeyDown={keyOpen(() => onOpen(item))} className="block group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
                  <div className={`bg-gemini-800 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-5 h-full transition-all hover:shadow-lg hover:-translate-y-1 ${f.hover}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${f.tone}`}>
                      <Icon name={f.icon} size={22} />
                    </div>
                    <h4 className="text-base font-bold text-slate-100 mb-1">{f.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AiAnswer({ entry, onOpen }: { entry: Extract<Entry, { kind: "ai" }>; onOpen: (i: SiteItem) => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="bg-gemini-800/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-500/30 shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <Icon name="bot" className="text-blue-400" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2 gap-2">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Dr. Holtkamp Analysis</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">AI Reasoning Enabled</span>
                <button
                  type="button"
                  title="Copy to Clipboard"
                  aria-label="Copy response"
                  onClick={async () => {
                    if (await copyText(entry.text)) {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }
                  }}
                  className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-700"
                >
                  <Icon name={copied ? "clipboardCheck" : "copy"} size={16} />
                </button>
              </div>
            </div>
            <Markdown text={entry.text} className="text-slate-300 text-sm leading-relaxed" />
            <BackupNote used={entry.backup} />
          </div>
        </div>
      </div>
      {entry.consult && <RecommendedCard item={entry.consult} onOpen={onOpen} />}
    </div>
  );
}
