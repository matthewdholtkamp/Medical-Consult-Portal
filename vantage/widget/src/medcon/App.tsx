// MedCon Portal shell: sidebar, top bar, and views. Same layout as the website's index.html.
import { useEffect, useRef, useState } from "react";
import { ADTMC_PLUS } from "./consult/adtmcPlus";
import { ConsultFlow } from "./consult/ConsultFlow";
import { NEUROLOGY } from "./consult/neurology";
import { JOURNAL_GENERAL } from "./journal/general";
import { JournalClub } from "./journal/JournalClub";
import { JOURNAL_MILITARY } from "./journal/military";
import { SITE_CONTENT, SiteItem } from "./data/siteContent";
import { ConsultGenerator } from "./pages/ConsultGenerator";
import { Dashboard } from "./pages/Dashboard";
import { DisclaimerModal, JournalClubs, NotMovedYet, SearchResults } from "./pages/OtherViews";
import { openExternal } from "./ui/clipboard";
import { Icon } from "./ui/Icon";

type MainView = "dashboard" | "consults" | "journal" | "search";

const TITLES: Record<MainView, string> = {
  dashboard: "Dashboard",
  consults: "Consult Generator",
  journal: "Clinical Updates",
  search: "Search Results",
};

const CONSULT_PAGES = { adtmcPlus: ADTMC_PLUS, neurology: NEUROLOGY };
const JOURNAL_PAGES = { journalGeneral: JOURNAL_GENERAL, journalMilitary: JOURNAL_MILITARY };

const byTitle = (t: string) => SITE_CONTENT.find((s) => s.title === t)!;
const QUICK_REF = ["Tricare Formulary", "MedCalc", "OpenEvidence", "PubMed AI", "Ask Sage"].map(byTitle);
const MILITARY = ["Genesis (EMR)", "MODS", "Army Remote Dashboard"].map(byTitle);
const QUICK_LABELS: Record<string, string> = { "Tricare Formulary": "Formulary (DOD)", "Army Remote Dashboard": "Army Remote Dash" };

export function MedconApp() {
  const [accepted, setAccepted] = useState(false);
  const [view, setView] = useState<MainView>("dashboard");
  const [page, setPage] = useState<SiteItem | null>(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, like the website
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const switchView = (v: MainView) => {
    setView(v);
    setPage(null);
    if (v !== "search") setSearch("");
    setSidebarOpen(false);
  };

  const open = (item: SiteItem) => {
    if (item.url) {
      openExternal(item.url);
      return;
    }
    setPage(item);
    setSidebarOpen(false);
  };

  const onSearch = (term: string) => {
    setSearch(term);
    setPage(null);
    setView(term.trim() ? "search" : "dashboard");
  };

  const navBtn = (v: MainView, label: string, icon: string, hoverTone: string) => {
    const active = !page && view === v;
    return (
      <button
        type="button"
        onClick={() => switchView(v)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          active ? "text-white bg-blue-600/10 border border-blue-600/20" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
        }`}
      >
        <Icon name={icon} className={active ? "text-blue-400" : `text-slate-500 ${hoverTone}`} size={20} />
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  };

  const pageBtn = (title: string, label: string, icon: string, hoverTone: string) => {
    const item = byTitle(title);
    const active = page?.title === title;
    return (
      <button
        type="button"
        onClick={() => open(item)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          active ? "text-white bg-blue-600/10 border border-blue-600/20" : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
        }`}
      >
        <Icon name={icon} className={`text-slate-500 ${hoverTone}`} size={20} />
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  };

  const linkBtn = (item: SiteItem) => (
    <button
      key={item.title}
      type="button"
      onClick={() => openExternal(item.url!)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <Icon name={item.icon ?? "link"} className="text-slate-500 group-hover:text-slate-300" size={18} />
      <span className="text-sm truncate">{QUICK_LABELS[item.title] ?? item.title}</span>
    </button>
  );

  const pageId = page?.pageId;
  const consultConfig = pageId && pageId in CONSULT_PAGES ? CONSULT_PAGES[pageId as keyof typeof CONSULT_PAGES] : null;
  const journalConfig = pageId && pageId in JOURNAL_PAGES ? JOURNAL_PAGES[pageId as keyof typeof JOURNAL_PAGES] : null;

  return (
    <div className="medcon-root bg-gemini-900 text-gray-200 h-full min-h-0 overflow-hidden flex relative">
      <div className="background-overlay" />

      {!accepted && <DisclaimerModal onAccept={() => setAccepted(true)} />}

      {/* SIDEBAR */}
      <aside
        className={`w-64 bg-gemini-800 flex-col border-r border-white/5 transition-all duration-300 z-40 h-full ${
          sidebarOpen ? "flex fixed inset-y-0 left-0 shadow-2xl" : "hidden md:flex md:relative"
        }`}
      >
        <div className="p-6 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Icon name="medical" className="text-white" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 tracking-tight">MedCon Portal</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">MTF Provider Portal</span>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white rounded p-1" aria-label="Close sidebar">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll px-3 py-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Main Menu</div>
          <nav className="space-y-1 mb-8">
            {navBtn("dashboard", "Dashboard", "dashboard", "group-hover:text-blue-400")}
            {navBtn("consults", "Consult Generator", "clinicalNotes", "group-hover:text-teal-400")}
            {navBtn("journal", "Journal Clubs", "book", "group-hover:text-amber-400")}
            {pageBtn("Live Ai Consults", "Live Ai Consults", "mic", "group-hover:text-rose-400")}
            {pageBtn("AI Imaging Vision", "AI Imaging Vision", "image", "group-hover:text-indigo-400")}
            {pageBtn("Cognitive Assessment", "Cognitive Assessment", "brain", "group-hover:text-indigo-400")}
          </nav>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Quick Reference</div>
          <nav className="space-y-1 mb-6">{QUICK_REF.map(linkBtn)}</nav>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3 border-t border-white/5 pt-4">Military (CAC Required)</div>
          <nav className="space-y-1">{MILITARY.map(linkBtn)}</nav>
        </div>
      </aside>

      {sidebarOpen && <div role="button" tabIndex={0} aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} onKeyDown={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />}

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative h-full min-w-0 bg-gemini-900">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-gemini-900/95 backdrop-blur-sm z-30 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button type="button" onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white rounded p-1" aria-label="Open sidebar">
              <Icon name="menu" size={22} />
            </button>
            <h1 className="text-xl font-bold text-slate-100 truncate">{page ? page.title : TITLES[view]}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64 hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="text-slate-500" size={16} />
              </div>
              <input
                ref={searchRef}
                type="text"
                aria-label="Search protocols"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search ( Press / to focus )"
                className="glass-search border border-slate-700 text-slate-200 text-sm rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 block w-full pl-10 p-2 placeholder-slate-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="border border-slate-600 rounded px-1.5 text-[10px] font-medium text-slate-400 bg-slate-800/50">/</kbd>
              </div>
            </div>
            {page && (
              <button
                type="button"
                onClick={() => switchView(view === "search" ? "dashboard" : view)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors text-xs font-medium"
              >
                <Icon name="close" size={14} />
                <span>Close View</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {/* Main views stay mounted (hidden) so the Ask Dr. H chat survives navigation, like the website. */}
          <div className={`absolute inset-0 flex flex-col ${!page && view === "dashboard" ? "" : "hidden"}`}>
            <Dashboard onOpen={open} />
          </div>
          <div className={`absolute inset-0 ${!page && view === "consults" ? "" : "hidden"}`}>
            <ConsultGenerator onOpen={open} />
          </div>
          <div className={`absolute inset-0 ${!page && view === "journal" ? "" : "hidden"}`}>
            <JournalClubs onOpen={open} />
          </div>
          {!page && view === "search" && (
            <div className="absolute inset-0">
              <SearchResults term={search} onOpen={open} />
            </div>
          )}

          {page && (
            <div className="absolute inset-0 flex flex-col bg-slate-900">
              <div className="w-full h-1 flex-shrink-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="flex-1 overflow-y-auto custom-scroll">
                {consultConfig ? (
                  <ConsultFlow key={page.title} config={consultConfig} />
                ) : journalConfig ? (
                  <JournalClub key={page.title} config={journalConfig} />
                ) : (
                  <NotMovedYet item={page} onBack={() => switchView("dashboard")} />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
