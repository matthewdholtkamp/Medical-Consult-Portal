// The 4-step consult page (Intake -> Q&A -> Review -> Final Note) shared by ADTMC+ and Neurology.
// Same layout and behavior as the website pages; AI calls go through Vantage.
// No <form> elements: Workshop's sandbox silently blocks form submit.
import { useEffect, useRef, useState } from "react";
import { askJson, askText } from "../ai/api";
import { Icon } from "../ui/Icon";
import { WaitHint } from "../ui/WaitHint";
import { copyText, openExternal } from "../ui/clipboard";
import type { ConsultConfig, GeneratedPlan, PlanCategory, PlanItem, Question, SelectedItem } from "./types";

type Step = "intake" | "questions" | "review" | "final";
const STEPS: Step[] = ["intake", "questions", "review", "final"];
const STEP_LABELS = ["Intake", "Q&A", "Review", "Final Note"];

interface Answer {
  checked: string[];
  other: boolean;
  text: string;
}

const PHI_IDENTIFIERS = [
  "Names",
  "Geographic subdivisions smaller than State",
  "All dates (except year) related to an individual",
  "Telephone numbers",
  "Fax numbers",
  "Email addresses",
  "Social Security numbers",
  "Medical Record numbers",
  "Health plan beneficiary numbers",
  "Account numbers",
  "Certificate/license numbers",
  "Vehicle identifiers (license plates)",
  "Device identifiers/serial numbers",
  "Web URLs",
  "IP address numbers",
  "Biometric identifiers (finger/voice prints)",
  "Full face photos",
  "Any other unique identifying number",
];

// ---------- AI answer clean-up ----------

function toItems(x: unknown): PlanItem[] {
  if (!x) return [];
  const arr = Array.isArray(x) ? x : [x];
  return arr
    .map((i: any) =>
      i && typeof i === "object"
        ? { intervention: String(i.intervention ?? i.name ?? ""), is_primary: Boolean(i.is_primary), rationale: i.rationale ? String(i.rationale) : undefined }
        : { intervention: String(i), is_primary: true },
    )
    .filter((i) => i.intervention);
}

function normalizePlan(raw: any): GeneratedPlan {
  if (!raw || typeof raw !== "object" || !raw.assessment || !raw.plan) {
    throw new Error("The AI answer was missing the assessment or plan.");
  }
  const prof = raw.plan.profile ?? {};
  return {
    thinking_process: raw.thinking_process ? String(raw.thinking_process) : undefined,
    subjective: {
      hpi_paragraph: String(raw.subjective?.hpi_paragraph ?? ""),
      ros_bullets: Array.isArray(raw.subjective?.ros_bullets) ? raw.subjective.ros_bullets.map(String) : [],
    },
    red_flags: Array.isArray(raw.red_flags) ? raw.red_flags.map(String).filter(Boolean) : [],
    assessment: {
      synthesis_statement: String(raw.assessment.synthesis_statement ?? ""),
      ddx: Array.isArray(raw.assessment.ddx)
        ? raw.assessment.ddx.map((d: any) => ({ name: String(d?.name ?? d), icd10: d?.icd10, desc: d?.desc, likelihood: d?.likelihood }))
        : [],
    },
    plan: {
      disposition: toItems(raw.plan.disposition),
      workup: toItems(raw.plan.workup),
      treatment: toItems(raw.plan.treatment),
      profile: {
        days: prof.days ?? "",
        limitations: toItems(prof.limitations ?? prof.commander_limitations),
        instructions: toItems(prof.instructions ?? prof.soldier_instructions),
      },
    },
    references: Array.isArray(raw.references)
      ? raw.references.filter((r: any) => r && r.title).map((r: any) => ({ title: String(r.title), url: String(r.url ?? "") }))
      : [],
  };
}

function normalizeQuestions(raw: any): Question[] {
  const list = Array.isArray(raw?.questions) ? raw.questions : [];
  const out = list
    .map((q: any) =>
      typeof q === "string"
        ? { question: q, options: [] }
        : { question: String(q?.question ?? ""), options: Array.isArray(q?.options) ? q.options.map(String) : [] },
    )
    .filter((q: Question) => q.question);
  if (!out.length) throw new Error("No questions came back.");
  return out;
}

function answerText(q: Question, a: Answer): string {
  let text = a.checked.join(", ");
  if (q.options.length === 0) return a.text.trim();
  if (a.other && a.text.trim()) text = text ? `${text}, ${a.text.trim()}` : a.text.trim();
  return text;
}

// ---------- Small pieces ----------

function Stepper({ step, accent }: { step: Step; accent: ConsultConfig["accent"] }) {
  const active = STEPS.indexOf(step);
  const width = ["0%", "33%", "66%", "100%"][active];
  return (
    <div className="mb-8 w-full max-w-3xl mx-auto px-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-slate-700 z-0" />
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full z-0 transition-all duration-500 ${accent.progress}`} style={{ width }} />
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold border-4 border-slate-900 transition-colors duration-300 ${
                i <= active ? accent.stepActive : "bg-slate-700 text-slate-300"
              }`}
            >
              {i + 1}
            </div>
            <div className={`text-[10px] sm:text-xs font-semibold mt-2 uppercase tracking-wider text-center transition-colors duration-300 ${i <= active ? "text-slate-200" : "text-slate-400"}`}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhiWarning({ extraLine, focusRing }: { extraLine?: string; focusRing: string }) {
  return (
    <details className="bg-slate-800 border border-slate-600 rounded-md mb-8 shadow-lg">
      <summary className={`font-semibold text-slate-300 p-4 cursor-pointer text-lg flex justify-between items-center transition rounded-md focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}>
        <span className="flex items-center">
          <Icon name="shield" className="mr-2 text-blue-400" size={18} /> NON-HIPAA Compliance
        </span>
        <span className="text-xs bg-red-900/80 text-red-100 px-2 py-1 rounded border border-red-500">Required Check</span>
      </summary>
      <div className="p-4 border-t border-slate-600 text-sm bg-slate-900/50">
        <p className="font-bold text-red-400 mb-3">YOU MUST REMOVE THE FOLLOWING 18 IDENTIFIERS:</p>
        <ul className="list-disc ml-5 space-y-1 text-slate-400 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
          {PHI_IDENTIFIERS.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        {extraLine && <p className="mt-3 font-bold text-red-400">{extraLine}</p>}
      </div>
    </details>
  );
}

function ContextPanel({ location, vignette, focusRing }: { location: string; vignette: string; focusRing: string }) {
  return (
    <details className="bg-slate-900 border border-slate-700 rounded-md mb-6 group">
      <summary className={`font-semibold text-slate-300 p-3 cursor-pointer text-sm flex justify-between items-center hover:bg-slate-800 transition rounded-md focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}>
        <span className="flex items-center">
          <Icon name="fileMedical" className="text-slate-400 mr-2" size={16} /> Patient Context
        </span>
        <Icon name="chevronDown" className="text-slate-500 group-open:rotate-180 transition-transform" size={16} />
      </summary>
      <div className="p-3 border-t border-slate-700 text-sm text-slate-300 bg-slate-800/50 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
        {`Location: ${location}\n\nClinical Information:\n${vignette}`}
      </div>
    </details>
  );
}

function ErrorBox({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className="error-box" role="alert" aria-live="assertive">
      {msg}
    </div>
  );
}

function PlanChecklist({
  items,
  checks,
  onToggle,
  accent,
}: {
  items: PlanItem[];
  checks: boolean[];
  onToggle: (i: number) => void;
  accent: ConsultConfig["accent"];
}) {
  if (!items.length) return <span className="text-slate-500 text-sm italic">None</span>;
  return (
    <>
      {items.map((it, i) => (
        <label key={i} className="flex items-start gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer group border border-transparent hover:border-slate-700 transition-colors">
          <input type="checkbox" checked={!!checks[i]} onChange={() => onToggle(i)} className={`mt-1 h-4 w-4 shrink-0 ${accent.checkbox}`} />
          <div className="flex flex-col">
            <span className={`text-sm leading-snug group-hover:text-white transition-colors ${checks[i] ? "text-slate-200 font-medium" : "text-slate-400"}`}>{it.intervention}</span>
            {it.rationale && (
              <span className="text-xs text-slate-400 italic mt-1 leading-tight group-hover:text-slate-300 transition-colors">
                <Icon name="lightbulb" className="text-yellow-500/50 mr-1 inline-block align-[-2px]" size={12} />
                {it.rationale}
              </span>
            )}
          </div>
        </label>
      ))}
    </>
  );
}

// ---------- Page ----------

export function ConsultFlow({ config }: { config: ConsultConfig }) {
  const a = config.accent;
  const rootRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<Step>("intake");
  const [loading, setLoading] = useState<string | null>(null);
  const [location, setLocation] = useState(config.location.options[0].value);
  const [vignette, setVignette] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [checks, setChecks] = useState<Record<PlanCategory, boolean[]>>({ disposition: [], workup: [], treatment: [], profile: [] });
  const [days, setDays] = useState("");
  const [errors, setErrors] = useState<{ intake?: string; questions?: string }>({});
  const [note, setNote] = useState("");
  const [refineQ, setRefineQ] = useState("");
  const [refineAnswer, setRefineAnswer] = useState<string | null>(null);
  const [refineBusy, setRefineBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    rootRef.current?.scrollIntoView({ block: "start" });
  }, [step, loading]);

  // auto-size the vignette box like the website
  useEffect(() => {
    const el = vignetteRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 200)}px`;
  }, [vignette, step]);

  const goto = (s: Step) => {
    setLoading(null);
    setStep(s);
  };

  // Step 1 -> 2
  const startAssessment = async () => {
    setErrors({});
    const v = vignette.trim();
    if (v.length < 10) {
      setErrors({ intake: "Please enter a detailed clinical vignette." });
      return;
    }
    setLoading(config.loading.questions);
    const context = `\nLocation: ${location}\nClinical Data: ${v}\n`;
    try {
      const raw = await askJson(config.questions.prompt, context, { task: `${config.id}.questions` });
      const qs = normalizeQuestions(raw);
      setQuestions(qs);
      setAnswers(qs.map(() => ({ checked: [], other: false, text: "" })));
      goto("questions");
    } catch (e) {
      console.error(e);
      setErrors({ intake: config.questions.failMessage });
      goto("intake");
    }
  };

  // Step 2 -> 3
  const generatePlan = async () => {
    setErrors({});
    setLoading(config.loading.plan);
    let contextData = `Location: ${location}\nClinical Data: ${vignette.trim()}\n`;
    questions.forEach((q, i) => (contextData += `Q: ${q.question} A: ${answerText(q, answers[i])}\n`));
    try {
      const raw = await askJson(config.plan.system, contextData, { task: `${config.id}.plan` });
      const p = normalizePlan(raw);
      setPlan(p);
      setChecks({
        disposition: p.plan.disposition.map((i) => !!i.is_primary),
        workup: p.plan.workup.map((i) => !!i.is_primary),
        treatment: p.plan.treatment.map((i) => !!i.is_primary),
        profile: p.plan.profile.limitations.map((i) => !!i.is_primary),
      });
      setDays(String(p.plan.profile.days ?? ""));
      goto("review");
    } catch (e) {
      console.error(e);
      setErrors({ questions: config.plan.failMessage });
      goto("questions");
    }
  };

  // Step 3 -> 4
  const finalize = () => {
    if (!plan) return;
    const pick = (cat: Exclude<PlanCategory, "profile">): SelectedItem[] =>
      plan.plan[cat].filter((_, i) => checks[cat][i]).map((i) => ({ val: i.intervention, rationale: i.rationale ?? "" }));
    setNote(
      config.final.buildNote({
        location,
        vignette: vignette.trim(),
        plan,
        disposition: pick("disposition"),
        workup: pick("workup"),
        treatment: pick("treatment"),
        profile: plan.plan.profile.limitations.filter((_, i) => checks.profile[i]).map((i) => i.intervention),
        days,
      }),
    );
    goto("final");
  };

  const askRefine = async () => {
    const q = refineQ.trim();
    if (!q || !plan || refineBusy) return;
    setRefineBusy(true);
    setRefineAnswer(config.final.refineWaiting);
    try {
      const ans = await askText(config.final.refineSystem, config.final.refineContext(vignette.trim(), plan, q), { task: `${config.id}.refine` });
      setRefineAnswer(`${config.final.refinePrefix}${ans.text}`);
    } catch {
      setRefineAnswer(config.final.refineError);
    } finally {
      setRefineBusy(false);
    }
  };

  const copyNote = async () => {
    if (await copyText(note)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startOver = () => {
    setStep("intake");
    setLoading(null);
    setVignette("");
    setLocation(config.location.options[0].value);
    setQuestions([]);
    setAnswers([]);
    setPlan(null);
    setNote("");
    setRefineQ("");
    setRefineAnswer(null);
    setErrors({});
  };

  const toggle = (cat: PlanCategory, i: number) =>
    setChecks((c) => ({ ...c, [cat]: c[cat].map((v, j) => (j === i ? !v : v)) }));

  const setAnswer = (i: number, fn: (x: Answer) => Answer) => setAnswers((all) => all.map((x, j) => (j === i ? fn(x) : x)));

  const banner = plan && config.review.locationBanner ? config.review.locationBanner(location) : null;
  const btnFocus = `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800`;

  return (
    <div ref={rootRef} className="consult-page bg-slate-900 text-slate-200 min-h-full">
      <div className={`${config.maxWidth} mx-auto p-4 sm:p-8`}>
        {config.header}
        <Stepper step={step} accent={a} />
        <PhiWarning extraLine={config.phiExtraLine} focusRing={a.focusRing} />

        {loading && (
          <div className="flex flex-col justify-center items-center p-12 gap-4" role="status" aria-live="polite">
            <div className="mc-spinner" style={{ borderLeftColor: a.spinnerColor }} />
            <p className="text-xl font-semibold text-slate-300 animate-pulse">{loading}</p>
            <WaitHint />
          </div>
        )}

        {/* STEP 1: INTAKE */}
        {!loading && step === "intake" && (
          <div className={config.intakeCardClass}>
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
              <span className={`${a.badge} text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm`}>1</span>
              Clinical Context &amp; Intake
            </h2>
            <ErrorBox msg={errors.intake} />

            <div className={config.location.boxClass}>
              <label htmlFor="mc-location" className={`block text-sm font-bold ${a.label} mb-1 uppercase tracking-wide`}>
                {config.location.withIcon && <Icon name="hospital" className="mr-1 inline-block align-[-3px]" size={16} />} {config.location.label}
              </label>
              {config.location.hint && <p className="text-xs text-slate-500 mb-2">{config.location.hint}</p>}
              <select id="mc-location" value={location} onChange={(e) => setLocation(e.target.value)} className={config.location.selectClass}>
                {config.location.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="mc-vignette" className="block text-sm font-bold text-white mb-2">
                Clinical Information (Paste H&amp;P or Vignette):
              </label>
              <p className="text-xs text-slate-400 mb-3">Include all relevant de-identified data (HPI, Vitals, Exam, Meds, Allergies, PMH, etc.)</p>
              <textarea
                id="mc-vignette"
                ref={vignetteRef}
                rows={8}
                value={vignette}
                onChange={(e) => setVignette(e.target.value)}
                placeholder={config.vignettePlaceholder}
                className={`w-full p-4 border border-slate-600 rounded-lg focus:ring-2 focus:outline-none bg-slate-700 text-white placeholder-slate-400 text-base leading-relaxed overflow-hidden resize-none ${a.inputFocus}`}
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {config.templates.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setVignette(t.text)}
                    className={`text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-full border border-slate-600 transition-colors focus-visible:ring-2 focus-visible:outline-none inline-flex items-center ${a.focusRing}`}
                  >
                    <Icon name={t.icon} className={`mr-1 ${t.iconClass}`} size={12} /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={startAssessment}
              disabled={vignette.trim().length < 10}
              className={`w-full bg-gradient-to-r ${a.startBtn} text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg transition-all hover:-translate-y-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 ${btnFocus} focus-visible:ring-slate-500`}
            >
              <span className="mr-3">{config.startLabel}</span>
              <Icon name="arrowRight" size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: QUESTIONS */}
        {!loading && step === "questions" && (
          <div className={config.sectionCardClass}>
            <ContextPanel location={location} vignette={vignette.trim()} focusRing={a.focusRing} />
            <h2 className="text-xl font-semibold mb-4 text-white border-b border-slate-700 pb-2 flex items-center">
              <Icon name={config.questions.icon} className={`${a.bullet} mr-2`} size={20} /> {config.questions.title}
            </h2>
            <p className={`text-sm text-slate-400 mb-6 bg-slate-900 p-3 rounded border-l-4 ${a.introBorder}`}>{config.questions.intro}</p>
            <ErrorBox msg={errors.questions} />

            <div className="space-y-5 mb-8">
              {questions.map((q, qi) => {
                const ans = answers[qi];
                const textEnabled = q.options.length === 0 || ans.other;
                return (
                  <div key={qi} className="bg-slate-900 p-4 rounded border border-slate-700">
                    <p className={`block text-sm ${a.questionText} mb-3 font-medium`}>{q.question}</p>
                    {q.options.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt) => (
                          <label key={opt} className="flex items-start gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer group border border-transparent hover:border-slate-700 transition-all">
                            <input
                              type="checkbox"
                              checked={ans.checked.includes(opt)}
                              onChange={(e) =>
                                setAnswer(qi, (x) => ({
                                  ...x,
                                  checked: e.target.checked ? [...x.checked, opt] : x.checked.filter((c) => c !== opt),
                                }))
                              }
                              className={`mt-1 h-4 w-4 shrink-0 ${a.checkbox}`}
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors leading-tight">{opt}</span>
                          </label>
                        ))}
                        <label className="flex items-start gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer group border border-transparent hover:border-slate-700 transition-all">
                          <input
                            type="checkbox"
                            checked={ans.other}
                            onChange={(e) => setAnswer(qi, (x) => ({ ...x, other: e.target.checked }))}
                            className={`mt-1 h-4 w-4 shrink-0 ${a.checkbox}`}
                          />
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors leading-tight">Other (Type below)</span>
                        </label>
                      </div>
                    )}
                    <input
                      type="text"
                      aria-label={q.question}
                      value={ans.text}
                      disabled={!textEnabled}
                      onChange={(e) => setAnswer(qi, (x) => ({ ...x, text: e.target.value }))}
                      placeholder={q.options.length > 0 ? (ans.other ? "Type your answer here..." : "Check an option above, or check Other to type...") : "Type answer..."}
                      className={`w-full p-2 border border-slate-600 rounded bg-slate-700 text-white outline-none transition-colors focus:ring-2 ${a.inputFocus} ${textEnabled ? "" : "opacity-50 cursor-not-allowed"}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button type="button" onClick={() => goto("intake")} className={`flex-1 bg-slate-700 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-600 transition ${btnFocus} focus-visible:ring-slate-400`}>
                Back
              </button>
              <button type="button" onClick={generatePlan} className={`flex-[2] ${a.primaryBtn} text-white font-bold py-3 rounded-lg transition shadow-lg ${btnFocus} ${a.focusRing}`}>
                {config.plan.buttonLabel}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {!loading && step === "review" && plan && (
          <div className={config.sectionCardClass}>
            <ContextPanel location={location} vignette={vignette.trim()} focusRing={a.focusRing} />

            {plan.red_flags && plan.red_flags.length > 0 && (
              <div className="mb-6">
                <div className="bg-red-900/50 border-l-4 border-red-500 p-4 rounded shadow-lg animate-pulse">
                  <div className="flex items-center">
                    <Icon name="alert" className="text-red-500 mr-4 shrink-0" size={28} />
                    <div>
                      <h3 className="font-bold text-red-200 uppercase tracking-wider text-sm">Critical Safety Alerts</h3>
                      <ul className="list-disc ml-5 text-red-100 text-sm font-semibold mt-1">
                        {plan.red_flags.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {banner && (
              <div
                className={`mb-6 p-4 rounded-md flex items-start ${
                  banner.tone === "acute" ? "bg-red-900/40 border border-red-600 text-red-200" : "bg-green-900/40 border border-green-600 text-green-200"
                }`}
              >
                <Icon name={banner.tone === "acute" ? "ambulance" : "user"} className="mt-1 mr-3 shrink-0" size={18} />
                <div>
                  <strong>{banner.title}</strong>
                  <br />
                  <span className="text-sm">{banner.text}</span>
                </div>
              </div>
            )}

            <div className="text-xl font-semibold mb-4 text-white pb-2 flex justify-between items-center gap-4 flex-wrap">
              <h2>Review Recommendations</h2>
              <details className="bg-slate-900 border border-slate-700 rounded-md text-sm cursor-pointer">
                <summary className={`font-semibold text-slate-300 p-2 hover:bg-slate-800 transition rounded-md flex items-center select-none focus-visible:outline-none focus-visible:ring-2 ${a.focusRing}`}>
                  <Icon name="brain" className={`${a.thinkingIcon} mr-2`} size={16} /> Thinking Process
                  <Icon name="chevronDown" className="text-slate-500 ml-2" size={14} />
                </summary>
                <div className="p-4 border-t border-slate-700 text-slate-300 bg-slate-800/50 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed max-w-xl">
                  {plan.thinking_process || "No detailed thinking process provided by the model."}
                </div>
              </details>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h3 className={config.variant === "neuro" ? `font-bold ${a.label} mb-2 uppercase text-xs tracking-wider` : `font-bold ${a.label} mb-2 border-b border-slate-700 pb-1`}>
                    {config.review.assessmentTitle}
                  </h3>
                  <p className="text-sm text-slate-200 mb-3 italic leading-relaxed">{plan.assessment.synthesis_statement}</p>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mt-2">{config.variant === "neuro" ? "Differential Diagnosis" : "Differential (DDx) & Probability"}</h4>
                  <ul className="text-sm text-slate-400 list-none space-y-2 mt-2">
                    {plan.assessment.ddx.map((d, i) =>
                      config.variant === "neuro" ? (
                        <li key={i} className="flex justify-between items-start border-b border-slate-800 pb-1 gap-2">
                          <span>
                            <span className="text-indigo-400 font-bold">{d.name}</span> <span className="text-slate-600 text-xs">[{d.icd10}]</span>
                          </span>
                          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 shrink-0">{d.likelihood}</span>
                        </li>
                      ) : (
                        <li key={i} className="flex items-start p-1 border-b border-slate-800">
                          <span className={`${a.bullet} mr-2 font-bold`}>•</span>
                          <div className="flex-1">
                            <div className="flex justify-between gap-2">
                              <strong className="text-white">
                                {d.name} <span className="text-slate-500 text-xs font-normal ml-1">[{d.icd10}]</span>
                              </strong>
                              <span className="text-xs font-mono text-orange-300 bg-slate-800 px-2 rounded shrink-0">{d.likelihood}</span>
                            </div>
                            {d.desc && <p className="text-slate-400 text-xs">{d.desc}</p>}
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <SectionTitle cfg={config} text={config.review.workupTitle} tag={banner?.workupTag} />
                  <div className="space-y-2">
                    <PlanChecklist items={plan.plan.workup} checks={checks.workup} onToggle={(i) => toggle("workup", i)} accent={a} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <SectionTitle cfg={config} text={config.review.treatmentTitle} tag={banner?.medsTag} />
                  <div className="space-y-2">
                    <PlanChecklist items={plan.plan.treatment} checks={checks.treatment} onToggle={(i) => toggle("treatment", i)} accent={a} />
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <SectionTitle cfg={config} text={config.review.dispositionTitle} />
                  {config.variant === "neuro" ? (
                    <div className="mb-3">
                      <div className="text-xs text-slate-500 block mb-1">Disposition Options</div>
                      <div className="space-y-2">
                        <PlanChecklist items={plan.plan.disposition} checks={checks.disposition} onToggle={(i) => toggle("disposition", i)} accent={a} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      <PlanChecklist items={plan.plan.disposition} checks={checks.disposition} onToggle={(i) => toggle("disposition", i)} accent={a} />
                    </div>
                  )}
                  {config.review.profileTitle && <SectionTitle cfg={config} text={config.review.profileTitle} />}
                  <div className="space-y-2">
                    <PlanChecklist items={plan.plan.profile.limitations} checks={checks.profile} onToggle={(i) => toggle("profile", i)} accent={a} />
                  </div>
                  <div className="mt-3 flex items-center bg-slate-800 p-2 rounded">
                    <label htmlFor="mc-days" className="text-xs text-slate-400 mr-2 font-bold uppercase">
                      {config.review.profileDaysLabel}
                    </label>
                    <input
                      id="mc-days"
                      type="number"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className={`w-20 bg-slate-700 border border-slate-600 text-white text-center text-sm p-1 rounded outline-none focus-visible:ring-2 ${a.focusRing}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button type="button" onClick={() => goto("questions")} className={`flex-1 bg-slate-700 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-600 ${btnFocus} focus-visible:ring-slate-400`}>
                Back
              </button>
              <button type="button" onClick={finalize} className={`flex-1 bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-600 shadow-lg ${btnFocus} focus-visible:ring-green-500`}>
                Finalize Note
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL NOTE */}
        {!loading && step === "final" && plan && (
          <div className={config.sectionCardClass}>
            <h2 className="text-xl font-semibold mb-4 text-white border-b border-slate-700 pb-2">{config.final.title}</h2>

            <div className="bg-slate-700 p-4 rounded-md mb-6 border border-slate-600">
              <label htmlFor="mc-refine" className={`block text-xs font-bold ${a.refineLabel} mb-2 uppercase`}>
                {config.final.refineLabel}
              </label>
              <div className="flex gap-2">
                <input
                  id="mc-refine"
                  type="text"
                  value={refineQ}
                  onChange={(e) => setRefineQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      askRefine();
                    }
                  }}
                  placeholder={config.final.refinePlaceholder}
                  className={`flex-1 p-2 bg-slate-900 border border-slate-600 rounded text-white text-sm outline-none focus-visible:ring-2 ${a.focusRing}`}
                />
                <button type="button" onClick={askRefine} disabled={refineBusy} className={`${a.refineBtn} text-white px-4 rounded font-medium text-sm disabled:opacity-60 ${btnFocus} ${a.focusRing}`}>
                  Ask
                </button>
              </div>
              {refineAnswer && (
                <div className="mt-3 p-3 bg-slate-800 rounded text-sm text-slate-300 border border-slate-600 italic whitespace-pre-wrap">
                  {refineAnswer}
                  {refineBusy && <WaitHint className="mt-2 not-italic" />}
                </div>
              )}
            </div>

            <div className="note-preview bg-white text-black p-6 rounded-md shadow-inner max-h-[600px] overflow-y-auto font-mono text-sm leading-tight border-2 border-slate-500 mb-4 relative">
              {config.final.watermark && <div className="absolute top-2 right-2 text-[10px] text-gray-400">{config.final.watermark}</div>}
              <pre className="whitespace-pre-wrap font-mono">{note}</pre>
            </div>

            <button
              type="button"
              onClick={copyNote}
              className={`w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg border border-slate-500 flex items-center justify-center mb-2 ${btnFocus} focus-visible:ring-slate-400`}
            >
              <Icon name="copy" className="mr-2" size={18} /> Copy to Clipboard
            </button>
            <p className={`mt-2 mb-4 text-center text-green-400 font-semibold text-sm ${copied ? "" : "invisible"}`} role="status" aria-live="polite">
              {config.final.copyDone}
            </p>

            {plan.references.length > 0 && (
              <div className="bg-slate-900 p-4 rounded border border-slate-600 mb-8">
                <h3 className={`${a.label} font-bold mb-2 ${config.variant === "neuro" ? "text-xs uppercase" : "border-b border-slate-700 pb-1"} flex items-center`}>
                  <Icon name="book" className="mr-2" size={16} /> {config.final.referencesTitle}
                </h3>
                {config.final.referencesHint && <p className="text-xs text-slate-500 mb-3">{config.final.referencesHint}</p>}
                <ul className="list-disc ml-5 text-sm space-y-2 text-slate-400">
                  {plan.references.map((r, i) => (
                    <li key={i}>
                      {/^https?:\/\//i.test(r.url) ? (
                        <button type="button" onClick={() => openExternal(r.url)} className="text-blue-400 hover:underline text-left">
                          {r.title}
                        </button>
                      ) : (
                        r.title
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-center gap-6">
              <button type="button" onClick={() => goto("review")} className={`text-slate-500 hover:text-white underline text-sm rounded px-2 py-1 ${btnFocus} focus-visible:ring-slate-400`}>
                Back to Review
              </button>
              <button type="button" onClick={startOver} className={`text-slate-500 hover:text-white underline text-sm rounded px-2 py-1 ${btnFocus} focus-visible:ring-slate-400`}>
                Start New Consult
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ cfg, text, tag }: { cfg: ConsultConfig; text: string; tag?: string }) {
  const a = cfg.accent;
  if (cfg.variant === "neuro") {
    return (
      <h3 className={`font-bold ${a.label} mb-2 uppercase text-xs tracking-wider flex justify-between`}>
        <span>{text}</span>
        {tag && <span className="text-[10px] px-2 rounded bg-slate-800 border border-slate-600">{tag}</span>}
      </h3>
    );
  }
  return <h3 className={`font-bold ${a.label} mb-2 border-b border-slate-700 pb-1`}>{text}</h3>;
}
