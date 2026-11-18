// Consult Generator: "Let me help you find the right doc" router + All Consult Specialties grid.
import { useMemo, useState } from "react";
import { askText } from "../ai/api";
import { ROUTER_PROMPT, splitConsultTag } from "../ai/homePrompts";
import { findConsult, SITE_CONTENT, SiteItem } from "../data/siteContent";
import { Icon } from "../ui/Icon";
import { WaitHint } from "../ui/WaitHint";
import { ConsultCard, RouterCard } from "./ConsultCard";

type RouterState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; reasoning: string; title: string | null; item: SiteItem | null }
  | { kind: "error" };

export function ConsultGenerator({ onOpen }: { onOpen: (i: SiteItem) => void }) {
  const consults = useMemo(() => SITE_CONTENT.filter((s) => s.type === "consult"), []);
  const categories = useMemo(() => ["All", ...Array.from(new Set(consults.map((c) => c.category)))], [consults]);
  const [tab, setTab] = useState("All");
  const [input, setInput] = useState("");
  const [router, setRouter] = useState<RouterState>({ kind: "idle" });

  const shown = tab === "All" ? consults : consults.filter((c) => c.category === tab);

  const route = async () => {
    const q = input.trim();
    if (!q || router.kind === "loading") return;
    setRouter({ kind: "loading" });
    try {
      const res = await askText(ROUTER_PROMPT, q, { task: "home.router", reasoning: "low" });
      const { body, consult } = splitConsultTag(res.text);
      setRouter({ kind: "done", reasoning: body, title: consult, item: consult ? findConsult(consult) ?? null : null });
    } catch {
      setRouter({ kind: "error" });
    }
  };

  return (
    <div className="overflow-y-auto custom-scroll p-6 h-full">
      <div className="max-w-7xl mx-auto">
        {/* Smart router */}
        <div className="mb-12 relative rounded-3xl overflow-hidden p-8 border border-white/5 shadow-2xl bg-gradient-to-br from-gemini-800 to-slate-900">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <Icon name="route" className="text-teal-400" size={26} />
                Let me help you find the right doc
              </h2>
              <p className="text-slate-400 mb-6 text-sm">
                Enter your clinical question, chief complaint, or scenario. Dr. Holtkamp will recommend the most appropriate specialty consult for note generation.
              </p>
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl shadow-inner flex flex-col relative focus-within:ring-2 focus-within:ring-teal-500/30 transition-all">
                <textarea
                  aria-label="Clinical scenario for routing"
                  placeholder="e.g., '65M with history of Afib presenting with shortness of breath and leg swelling...'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      route();
                    }
                  }}
                  className="w-full bg-transparent text-slate-200 placeholder-slate-500 p-4 min-h-[80px] max-h-48 resize-y focus:outline-none rounded-2xl"
                />
                <div className="flex items-center justify-between px-3 pb-3">
                  {router.kind !== "idle" && router.kind !== "loading" && (
                    <button
                      type="button"
                      onClick={() => {
                        setInput("");
                        setRouter({ kind: "idle" });
                      }}
                      className="text-slate-400 hover:text-white text-xs font-medium px-2 py-1 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={route}
                    disabled={!input.trim() || router.kind === "loading"}
                    className="ml-auto px-5 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {router.kind === "loading" ? "Routing..." : "Find Consultant"}
                  </button>
                </div>
              </div>
            </div>

            {router.kind !== "idle" && (
              <div className="flex-1 w-full">
                <div className="bg-slate-800/80 rounded-2xl p-6 border border-teal-500/30 shadow-lg relative h-full">
                  {router.kind === "loading" && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                      <Icon name="brain" className="animate-brain text-teal-400" size={40} />
                      <span className="text-sm text-slate-400 animate-pulse">Analyzing clinical scenario...</span>
                      <WaitHint />
                    </div>
                  )}
                  {router.kind === "error" && (
                    <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30" role="alert">
                      Failed to analyze scenario. Please try again.
                    </div>
                  )}
                  {router.kind === "done" && (
                    <div className="h-full flex flex-col">
                      <div className="mb-4">
                        <h4 className="text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">Triage Reasoning</h4>
                        <p className="text-slate-300 text-sm italic">{router.reasoning}</p>
                      </div>
                      {router.item ? (
                        <RouterCard item={router.item} onOpen={onOpen} />
                      ) : router.title ? (
                        <p className="text-red-400 text-sm mt-4">Could not find a matching consult for: {router.title}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold text-slate-300">All Consult Specialties</h3>
          <div className="h-px bg-slate-700 flex-grow" />
        </div>

        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setTab(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                cat === tab ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 animate-fade-in">
          {shown.map((item) => (
            <ConsultCard key={item.title} item={item} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </div>
  );
}
