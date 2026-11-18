// Journal Clubs grid, Search Results, the "not moved yet" page, and the PHI disclaimer.
import { useState } from "react";
import { cardColor } from "../data/colors";
import { SITE_CONTENT, SiteItem, WEBSITE_BASE } from "../data/siteContent";
import { openExternal } from "../ui/clipboard";
import { Icon } from "../ui/Icon";
import { keyOpen } from "./ConsultCard";

export function JournalClubs({ onOpen }: { onOpen: (i: SiteItem) => void }) {
  const general = SITE_CONTENT.find((s) => s.title === "General Journal Club")!;
  const mil = SITE_CONTENT.find((s) => s.title === "Military Medicine")!;
  return (
    <div className="overflow-y-auto custom-scroll p-6 h-full">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(general)}
            onKeyDown={keyOpen(() => onOpen(general))}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 to-slate-900 border border-red-500/30 p-8 shadow-2xl group transition-all hover:border-red-500/60 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-red-600/20 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-500/20 p-2 rounded-lg text-red-400">
                  <Icon name="book" size={22} />
                </span>
                <h3 className="text-2xl font-bold text-white">General Journal Club</h3>
              </div>
              <p className="text-slate-300 text-lg mb-8">Evidence summaries and audio breakdowns, and landmark trials across all specialties.</p>
              <span className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/30">Open Journal Club</span>
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(mil)}
            onKeyDown={keyOpen(() => onOpen(mil))}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/30 p-8 shadow-2xl group transition-all hover:border-emerald-500/60 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-600/20 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                  <Icon name="medical" size={22} />
                </span>
                <h3 className="text-2xl font-bold text-white">Military Medicine</h3>
              </div>
              <p className="text-slate-300 text-lg mb-8">Operational medicine updates, TCCC guidelines, and deployment health resources.</p>
              <span className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30">Open Military Journal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchResults({ term, onOpen }: { term: string; onOpen: (i: SiteItem) => void }) {
  const t = term.toLowerCase();
  const results = SITE_CONTENT.filter((i) => i.title.toLowerCase().includes(t) || i.desc.toLowerCase().includes(t) || i.tags.toLowerCase().includes(t));
  return (
    <div className="overflow-y-auto custom-scroll p-6 h-full">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
              <Icon name="searchOff" className="mb-4 opacity-50" size={40} />
              <p>No matching resources found for "{term}"</p>
            </div>
          ) : (
            results.map((item) => {
              const c = cardColor(item.color);
              const isLink = item.type === "tool" || item.type === "military";
              return (
                <div
                  key={item.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(item)}
                  onKeyDown={keyOpen(() => onOpen(item))}
                  className="card bg-gemini-800 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none border border-slate-700/50 rounded-xl p-5 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${isLink ? "bg-slate-700/50 text-slate-300" : `${c.iconBg} ${c.text}`}`}>
                      <Icon name={isLink ? item.icon ?? "link" : item.type === "journal" ? "book" : "medical"} size={20} />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 border border-slate-700 px-2 py-0.5 rounded">{item.type}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-100 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/** Shown for portal pages that have not been moved into Vantage yet. */
export function NotMovedYet({ item, onBack }: { item: SiteItem; onBack: () => void }) {
  const c = cardColor(item.color);
  return (
    <div className="h-full overflow-y-auto custom-scroll bg-slate-900 p-6 flex items-start justify-center">
      <div className="max-w-xl w-full mt-12 bg-gemini-800 border border-slate-700/50 rounded-2xl p-8 shadow-2xl animate-fade-in">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${c.iconBg} ${c.text}`}>
          <Icon name="clock" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{item.title} is not in Vantage yet</h2>
        <p className="text-slate-400 mb-6">This page is still being moved. The web version still works.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {item.webPath && (
            <button
              type="button"
              onClick={() => openExternal(WEBSITE_BASE + item.webPath)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
            >
              Open the web version <Icon name="externalLink" size={16} />
            </button>
          )}
          <button type="button" onClick={onBack} className="flex-1 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/** PHI disclaimer shown on every visit (Vantage widgets cannot remember "don't show again"). */
export function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  const [ack, setAck] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-labelledby="mc-disclaimer-title">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gemini-800 border border-slate-700 p-6 text-left text-slate-100 shadow-2xl ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="mc-disclaimer-title" className="text-2xl font-bold mb-1 text-white">
              Quick challenge — one small step
            </h2>
            <p className="text-sm text-slate-400">Use only de-identified examples. You'll be prompted if something looks like PHI.</p>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium text-xs uppercase tracking-wider">Safety First</span>
        </div>
        <hr className="my-4 border-slate-700/60" />
        <p className="text-sm text-slate-300 mb-3 leading-relaxed">
          This site generates consult drafts and provides clinical decision support. It does <strong>not</strong> replace your clinical judgment. Enter only de-identified information here.
        </p>
        <div className="bg-amber-950/30 border-l-4 border-amber-500 p-3 mb-4 rounded-r">
          <p className="text-sm font-semibold text-amber-200">
            Do <strong>NOT</strong> enter PHI. Use de-identified information only.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-700/60">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="h-5 w-5 accent-amber-500" />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">I confirm I will not enter PHI.</span>
          </label>
          <button
            type="button"
            onClick={onAccept}
            disabled={!ack}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-amber-600 text-white font-semibold shadow-lg shadow-amber-900/20 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            I Understand — Continue
          </button>
        </div>
      </div>
    </div>
  );
}
