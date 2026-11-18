// Journal Club page (General and Military share this; each has its own settings file).
// Same steps and layout as the website: topic -> refining questions -> report with tabs,
// bottom line, follow-up discussion, copy buttons, and Listen.
// Vantage changes: no live web search (optional pasted sources instead), and Listen reads the
// AI-written script with the computer's built-in voice instead of Google's voice service.
import { useEffect, useRef, useState } from "react";
import { askText } from "../ai/api";
import { copyText } from "../ui/clipboard";
import { Icon } from "../ui/Icon";
import { Markdown } from "../ui/Markdown";
import { useSpeech } from "../ui/speech";
import { BackupNote, WaitHint } from "../ui/WaitHint";
import type { JournalConfig } from "./types";

type Step = "topic" | "refine" | "results";
type Tab = 0 | 1 | 2;

interface Parsed {
  thoughts: string;
  summary: string;
  plan: string;
  refs: string;
}

const MARK = {
  thoughts: "|||SECTION_THOUGHTS|||",
  summary: "|||SECTION_SUMMARY|||",
  plan: "|||SECTION_PLAN|||",
  refs: "|||SECTION_REFS|||",
};

/** Same LaTeX clean-up as the website. */
export function stripLatex(text: string): string {
  if (!text) return "";
  return text
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\text\s*\{([^}]+)\}/g, "$1")
    .replace(/\\geq/g, "≥")
    .replace(/\\leq/g, "≤")
    .replace(/\\approx/g, "≈")
    .replace(/\\pm/g, "±")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\times/g, "x")
    .replace(/\\cdot/g, "·")
    .replace(/\\%/g, "%")
    .replace(/\\([a-zA-Z]+)/g, " $1 ")
    .trim();
}

/** Port of the website's parseSections + fallbacks. */
export function parseReport(raw: string, cfg: JournalConfig): Parsed {
  const res: Parsed = { thoughts: "", summary: "", plan: "", refs: "" };
  let temp = raw;
  if (temp.includes(MARK.thoughts)) {
    temp = temp.split(MARK.thoughts)[1];
    let end = temp.length;
    [MARK.summary, MARK.plan, MARK.refs].forEach((t) => {
      const i = temp.indexOf(t);
      if (i !== -1 && i < end) end = i;
    });
    res.thoughts = temp.substring(0, end).trim();
    temp = temp.substring(end);
  }
  if (temp.includes(MARK.summary)) temp = temp.split(MARK.summary)[1];
  let sumEnd = temp.length;
  [MARK.plan, MARK.refs].forEach((t) => {
    const i = temp.indexOf(t);
    if (i !== -1 && i < sumEnd) sumEnd = i;
  });
  if (!temp.startsWith(MARK.plan) && !temp.startsWith(MARK.refs)) res.summary = temp.substring(0, sumEnd).trim();
  temp = temp.substring(sumEnd);
  if (temp.includes(MARK.plan)) {
    temp = temp.split(MARK.plan)[1];
    let planEnd = temp.length;
    if (temp.indexOf(MARK.refs) !== -1) planEnd = temp.indexOf(MARK.refs);
    res.plan = temp.substring(0, planEnd).trim();
    temp = temp.substring(planEnd);
  }
  if (temp.includes(MARK.refs)) res.refs = temp.split(MARK.refs)[1].trim();

  // Fallback when the model skipped the markers
  if (!res.summary && !res.thoughts && !res.plan) {
    res.summary = raw;
    const pm = raw.match(cfg.planHeading);
    if (pm && pm.index !== undefined) {
      res.summary = raw.substring(0, pm.index);
      res.plan = raw.substring(pm.index + pm[0].length);
      const rm = res.plan.match(/\n(?:\|\|\|SECTION_REFS\|\|\||#\s*References)/i);
      if (rm && rm.index !== undefined) {
        res.refs = res.plan.substring(rm.index + rm[0].length);
        res.plan = res.plan.substring(0, rm.index);
      }
    }
  }
  // If the summary heading ended up inside the thoughts, move it back
  const hm = res.thoughts.match(cfg.summaryHeading);
  if (hm && hm.index !== undefined) {
    res.summary = res.thoughts.substring(hm.index).trim() + "\n" + res.summary;
    res.thoughts = res.thoughts.substring(0, hm.index).trim();
  }
  return res;
}

function bottomLine(summary: string): string {
  const m = summary.match(/##\s*Executive Summary\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  return m && m[1].trim() ? m[1].trim() : "";
}

const inputCls =
  "w-full bg-slate-800 border border-slate-600 rounded p-3 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";
const focusCls = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800";

export function JournalClub({ config }: { config: JournalConfig }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("topic");
  const [loading, setLoading] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(-1);
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [sources, setSources] = useState("");
  const [report, setReport] = useState<Parsed | null>(null);
  const [rawContext, setRawContext] = useState("");
  const [usedBackup, setUsedBackup] = useState(false);
  const [tab, setTab] = useState<Tab>(0);
  const [followQ, setFollowQ] = useState("");
  const [followA, setFollowA] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [audioPhase, setAudioPhase] = useState<"hidden" | "scripting" | "ready" | "error">("hidden");
  const [script, setScript] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [armNewTopic, setArmNewTopic] = useState(false);
  const speech = useSpeech();

  useEffect(() => {
    rootRef.current?.scrollIntoView({ block: "start" });
  }, [step]);

  // Rotate loading tips every 2.5 s like the website
  useEffect(() => {
    if (!loading) return;
    setTipIndex(-1);
    const t = setInterval(() => setTipIndex((i) => i + 1), 2500);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!armNewTopic) return;
    const t = setTimeout(() => setArmNewTopic(false), 3000);
    return () => clearTimeout(t);
  }, [armNewTopic]);

  // Step 1 -> 2
  const getQuestions = async () => {
    const t = topic.trim();
    if (!t || loading) return;
    setLoading(config.loaderQuestions);
    try {
      const res = await askText("", config.questionsPrompt(t), { task: `${config.id}.questions` });
      const qs = res.text
        .split("\n")
        .map((l) => l.replace(/^[Q\-*•0-9.): ]+/, "").trim())
        .filter((l) => l.length > 5)
        .slice(0, 5);
      if (!qs.length) throw new Error("No questions came back.");
      setQuestions(qs);
      setAnswers(qs.map(() => ""));
      setStep("refine");
    } catch (e: any) {
      setToast("Error generating questions. Please try again. " + (e?.message ?? ""));
    } finally {
      setLoading(null);
    }
  };

  // Step 2 -> 3
  const generate = async () => {
    if (loading) return;
    const details = questions.map((q, i) => `${q}: ${answers[i] ?? ""}`).join("\n");
    setLoading(config.loaderAnalysis);
    try {
      const res = await askText("", config.mainPrompt(topic.trim(), details, sources), { task: `${config.id}.report`, reasoning: "medium" });
      const parsed = parseReport(res.text, config);
      setReport(parsed);
      setRawContext(res.text);
      setUsedBackup(res.usedBackupModel);
      setTab(0);
      setFollowA(null);
      setFollowQ("");
      speech.stop();
      setScript("");
      setAudioPhase("hidden");
      setStep("results");
    } catch (e: any) {
      setToast(`${config.reportError} ${e?.message ?? ""}`);
    } finally {
      setLoading(null);
    }
  };

  const listen = async () => {
    if (audioPhase === "scripting" || !report) return;
    if (script) {
      setAudioPhase("ready");
      speech.play(script);
      return;
    }
    setAudioPhase("scripting");
    try {
      const res = await askText("", config.scriptPrompt(report.summary), { task: `${config.id}.audioScript` });
      setScript(res.text);
      setAudioPhase("ready");
      if (speech.supported) speech.play(res.text);
    } catch {
      setAudioPhase("error");
    }
  };

  const askFollowUp = async () => {
    const q = followQ.trim();
    if (!q || followBusy) return;
    setFollowBusy(true);
    setFollowA("");
    try {
      const res = await askText("", config.followUpPrompt(rawContext, q), { task: `${config.id}.followUp` });
      setFollowA(stripLatex(res.text));
    } catch {
      setFollowA("Error getting response.");
    } finally {
      setFollowBusy(false);
    }
  };

  const newTopic = () => {
    if (!armNewTopic) {
      setArmNewTopic(true);
      return;
    }
    speech.stop();
    setArmNewTopic(false);
    setStep("topic");
    setTopic("");
    setQuestions([]);
    setAnswers([]);
    setSources("");
    setReport(null);
    setRawContext("");
    setScript("");
    setAudioPhase("hidden");
    setFollowA(null);
    setFollowQ("");
  };

  const copy = async (text: string, msg: string) => {
    setToast((await copyText(text)) ? msg : "Copy was blocked. Select the text and copy it instead.");
  };

  const tip = tipIndex >= 0 ? config.tips[tipIndex % config.tips.length] : null;
  const summary = report ? stripLatex(report.summary) : "";
  const plan = report ? stripLatex(report.plan || "No plan section generated.") : "";
  const refs = report ? stripLatex(report.refs || "No references section generated.") : "";
  const bl = bottomLine(summary);

  return (
    <div ref={rootRef} className="jc-page min-h-full flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-500 tracking-tight mb-3">{config.title}</h1>
        <p className="text-blue-50 mt-2 text-2xl font-semibold leading-relaxed">{config.subtitle}</p>
        <p className="text-gray-500 text-sm mt-3 italic">{config.tagline}</p>
      </header>

      <main className="w-full max-w-4xl">
        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 mb-8 text-center text-xs text-blue-200">
          <strong>{config.disclaimerStrong}</strong> {config.disclaimerText}
        </div>

        {/* STEP 1 */}
        {!loading && step === "topic" && (
          <div className="glass-panel rounded-xl p-6 shadow-2xl mb-6 space-y-4">
            <div>
              <label className="block text-lg font-semibold mb-2" htmlFor="jc-topic">
                {config.topicLabel}
              </label>
              <input
                id="jc-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    getQuestions();
                  }
                }}
                placeholder={config.topicPlaceholder}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition"
              />
            </div>
            <button
              type="button"
              onClick={getQuestions}
              disabled={!topic.trim()}
              className={`w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${focusCls} focus-visible:ring-indigo-500`}
            >
              <span>Initialize Refinement</span>
              <Icon name="arrowRight" size={20} />
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {!loading && step === "refine" && (
          <div className="glass-panel rounded-xl p-6 shadow-2xl mb-6">
            <h3 className="text-xl font-bold text-orange-400 mb-4 border-b border-gray-700 pb-2">{config.step2Title}</h3>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i}>
                  <label className="block text-sm text-gray-400 mb-1" htmlFor={`jc-q${i}`}>
                    {q}
                  </label>
                  <input
                    id={`jc-q${i}`}
                    type="text"
                    value={answers[i] ?? ""}
                    onChange={(e) => setAnswers((a) => a.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder="Enter details..."
                    className={inputCls}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="jc-sources">
                  Source articles (optional)
                </label>
                <textarea
                  id="jc-sources"
                  rows={4}
                  value={sources}
                  onChange={(e) => setSources(e.target.value)}
                  placeholder="Paste abstracts or article text. Vantage AI can't search the web, so pasted sources make the citations more reliable."
                  className={`${inputCls} resize-y`}
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setStep("topic")} className={`w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg ${focusCls} focus-visible:ring-slate-500`}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={generate}
                  className={`w-2/3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition hover:scale-[1.01] ${focusCls} focus-visible:ring-slate-500`}
                >
                  Generate Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOADER */}
        {loading && (
          <div className="text-center py-12" role="status" aria-live="polite">
            <div className="pulse-ring" />
            <p className="mt-4 text-orange-400 font-mono text-sm animate-pulse whitespace-pre-line">{tip ? `${loading}\n\n(Step: ${tip})` : loading}</p>
            <WaitHint className="mt-4" />
          </div>
        )}

        {/* STEP 3: RESULTS */}
        {!loading && step === "results" && report && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-8 gap-2 mb-6 bg-slate-800/50 p-3 rounded-lg border border-slate-700 items-stretch">
              <button
                type="button"
                onClick={listen}
                disabled={audioPhase === "scripting"}
                className={`col-span-2 md:col-span-4 bg-teal-700 hover:bg-teal-600 text-white px-4 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all h-full disabled:opacity-60 ${focusCls} focus-visible:ring-teal-500`}
              >
                <Icon name="mic" size={24} /> {config.listenLabel}
              </button>
              <button
                type="button"
                onClick={newTopic}
                className={`md:col-span-1 bg-red-900/40 hover:bg-red-900/60 text-red-200 px-2 py-3 rounded-lg font-semibold text-xs md:text-sm border border-red-900/50 flex items-center justify-center h-full ${focusCls} focus-visible:ring-red-500`}
              >
                {armNewTopic ? "Click again to clear" : "New Topic"}
              </button>
              <button type="button" onClick={() => setStep("refine")} className={`md:col-span-1 bg-slate-700 hover:bg-slate-600 text-gray-200 px-2 py-3 rounded-lg font-medium text-xs md:text-sm flex items-center justify-center h-full ${focusCls} focus-visible:ring-slate-500`}>
                Back
              </button>
              <button type="button" onClick={() => copy(report.summary, "Summary copied!")} className={`md:col-span-1 bg-slate-700 hover:bg-slate-600 text-gray-200 px-2 py-3 rounded-lg font-medium text-xs md:text-sm flex items-center justify-center h-full ${focusCls} focus-visible:ring-slate-500`}>
                Copy Text
              </button>
              <button type="button" onClick={() => copy(plan, "Plan copied!")} className={`md:col-span-1 bg-slate-700 hover:bg-slate-600 text-gray-200 px-2 py-3 rounded-lg font-medium text-xs md:text-sm flex items-center justify-center h-full ${focusCls} focus-visible:ring-slate-500`}>
                Copy Plan
              </button>
            </div>

            {/* Audio */}
            {audioPhase !== "hidden" && (
              <div className="mb-6 p-4 bg-teal-900/30 border border-teal-800 rounded-lg">
                <p className="text-teal-200 text-sm mb-2 font-semibold">{config.audioTitle}</p>
                {audioPhase === "scripting" && (
                  <div className="mb-1">
                    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-teal-500 h-2.5 rounded-full jc-indeterminate" />
                    </div>
                    <p className="text-xs text-teal-400 text-center mt-1">{config.scriptStepText}</p>
                    <WaitHint className="mt-2" />
                  </div>
                )}
                {audioPhase === "error" && (
                  <div className="p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm" role="alert">
                    Couldn't write the audio script. Click {config.listenLabel} to try again.
                  </div>
                )}
                {audioPhase === "ready" && !speech.supported && (
                  <p className="text-sm text-teal-100">This browser can't read aloud. The script is below to read or copy.</p>
                )}
                {audioPhase === "ready" && speech.supported && (
                  <div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-3">
                      <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${Math.round(speech.progress * 100)}%` }} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {speech.state === "playing" && (
                        <button type="button" onClick={speech.pause} className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-semibold">
                          Pause
                        </button>
                      )}
                      {speech.state === "paused" && (
                        <button type="button" onClick={speech.resume} className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-semibold">
                          Resume
                        </button>
                      )}
                      {speech.state === "idle" && (
                        <button type="button" onClick={() => speech.play(script)} className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-semibold">
                          Play from start
                        </button>
                      )}
                      {speech.state !== "idle" && (
                        <button type="button" onClick={speech.stop} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-200 text-sm font-semibold">
                          Stop
                        </button>
                      )}
                      <button type="button" onClick={() => copy(script, "Script copied!")} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-200 text-sm font-semibold">
                        Copy Script
                      </button>
                      <span className="text-xs text-teal-300/80 ml-auto">{speech.voiceName ? `Voice: ${speech.voiceName} · 1.25x` : "1.25x"}</span>
                    </div>
                  </div>
                )}
                {audioPhase === "ready" && script && (
                  <details className="mt-3">
                    <summary className="text-xs text-teal-300 cursor-pointer">Show script</summary>
                    <div className="mt-2 text-sm text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto custom-scroll">{script}</div>
                  </details>
                )}
              </div>
            )}

            {/* Research logic */}
            {report.thoughts && (
              <div className="mb-6">
                <details className="group bg-slate-900/40 rounded-xl border border-slate-700/30 overflow-hidden">
                  <summary className="list-none p-3 cursor-pointer flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:bg-slate-800/50 transition-colors">
                    <span className="flex items-center gap-2">
                      <span className="text-sm text-blue-500/50" aria-hidden="true">
                        🧠
                      </span>
                      <span>View Research Logic</span>
                    </span>
                    <Icon name="chevronDown" className="group-open:rotate-180 transition-transform" size={16} />
                  </summary>
                  <div className="px-4 pb-4 text-xs text-slate-500 italic font-mono leading-relaxed bg-black/10">
                    <div className="pt-2 whitespace-pre-line">{report.thoughts}</div>
                  </div>
                </details>
              </div>
            )}

            {/* Follow-up */}
            <div className="mb-8 p-6 bg-slate-800/30 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-2">Interactive Discussion</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  aria-label="Follow-up question"
                  value={followQ}
                  onChange={(e) => setFollowQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      askFollowUp();
                    }
                  }}
                  placeholder={config.followUpPlaceholder}
                  className="flex-1 min-w-0 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-orange-500 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                />
                <button type="button" onClick={askFollowUp} disabled={followBusy} className={`bg-orange-600 hover:bg-orange-500 text-white px-6 rounded-lg font-bold disabled:opacity-60 ${focusCls} focus-visible:ring-orange-500`}>
                  Ask
                </button>
              </div>
              {followA !== null && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border-l-4 border-orange-500">
                  {followBusy ? (
                    <>
                      <span className="animate-pulse text-slate-300">Dr. Holtkamp is thinking...</span>
                      <WaitHint className="mt-2 items-start" />
                    </>
                  ) : (
                    <Markdown text={followA} className="jc-prose" badges={config.badges} />
                  )}
                </div>
              )}
            </div>

            {/* Bottom line */}
            {bl && (
              <div className="mb-8 p-6 bg-gradient-to-r from-orange-900/40 to-slate-900/40 border-l-4 border-orange-500 rounded-r-lg shadow-lg">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Icon name="lightbulb" size={20} /> {config.bottomLineTitle}
                </h3>
                <Markdown text={bl} className="jc-prose jc-bottom-line" badges={config.badges} />
              </div>
            )}

            {/* Tabs */}
            <div className="mb-4 border-b border-gray-700 flex gap-6 overflow-x-auto">
              {config.tabs.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTab(i as Tab)}
                  className={`pb-2 px-1 whitespace-nowrap ${tab === i ? "text-orange-500 border-b-2 border-orange-500 font-bold" : "text-gray-400 hover:text-white font-medium"} ${focusCls} focus-visible:ring-orange-500`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 0 && <Markdown text={summary} className="jc-prose text-gray-300 overflow-x-auto" badges={config.badges} />}
            {tab === 1 && <Markdown text={plan} className="jc-prose text-gray-300 overflow-x-auto" badges={config.badges} />}
            {tab === 2 && <div className="font-mono text-sm bg-black/30 p-4 rounded text-gray-400 whitespace-pre-wrap overflow-x-auto">{refs.trim()}</div>}
            <BackupNote used={usedBackup} />

            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setStep("refine")} className={`text-slate-500 hover:text-white underline text-sm flex items-center gap-1 ${focusCls} focus-visible:ring-slate-500`}>
                ← Back to Refinement
              </button>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className="jc-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
