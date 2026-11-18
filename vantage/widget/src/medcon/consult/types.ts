import type { ReactNode } from "react";

/** Accent classes for one consult page (written out in full so Tailwind keeps them). */
export interface Accent {
  progress: string;
  stepActive: string;
  badge: string;
  label: string;
  questionText: string;
  focusRing: string;
  inputFocus: string;
  startBtn: string;
  primaryBtn: string;
  refineBtn: string;
  refineLabel: string;
  checkbox: string;
  bullet: string;
  introBorder: string;
  spinnerColor: string; // hex for the spinner arc
  thinkingIcon: string;
}

export interface QuickTemplate {
  key: string;
  label: string;
  icon: string;
  iconClass: string;
  text: string;
}

export interface Question {
  question: string;
  options: string[];
}

export interface PlanItem {
  intervention: string;
  is_primary?: boolean;
  rationale?: string;
}

export interface Ddx {
  name: string;
  icd10?: string;
  desc?: string;
  likelihood?: string;
}

export interface GeneratedPlan {
  thinking_process?: string;
  subjective: { hpi_paragraph: string; ros_bullets: string[] };
  red_flags?: string[];
  assessment: { synthesis_statement: string; ddx: Ddx[] };
  plan: {
    disposition: PlanItem[];
    workup: PlanItem[];
    treatment: PlanItem[];
    profile: {
      days: number | string;
      limitations: PlanItem[]; // "commander_limitations" (ADTMC+) or "limitations" (Neuro), normalized
      instructions: PlanItem[]; // "soldier_instructions" or "instructions", normalized
    };
  };
  references: { title: string; url: string }[];
}

export type PlanCategory = "disposition" | "workup" | "treatment" | "profile";

export interface SelectedItem {
  val: string;
  rationale: string;
}

export interface NoteInput {
  location: string;
  vignette: string;
  plan: GeneratedPlan;
  disposition: SelectedItem[];
  workup: SelectedItem[];
  treatment: SelectedItem[];
  profile: string[];
  days: string;
}

export interface LocationBanner {
  tone: "acute" | "clinic";
  title: string;
  text: string;
  workupTag: string;
  medsTag: string;
}

export interface ConsultConfig {
  id: "adtmcPlus" | "neurology";
  pageTitle: string;
  variant: "adtmc" | "neuro";
  accent: Accent;
  header: ReactNode;
  maxWidth: string;
  intakeCardClass: string;
  sectionCardClass: string;
  location: {
    label: string;
    hint?: string;
    withIcon: boolean;
    boxClass: string;
    selectClass: string;
    options: { value: string; label: string }[];
  };
  phiExtraLine?: string;
  vignettePlaceholder: string;
  templates: QuickTemplate[];
  startLabel: string;
  loading: { questions: string; plan: string };
  questions: { title: string; icon: string; intro: string; prompt: string; failMessage: string };
  plan: { system: string; buttonLabel: string; failMessage: string };
  review: {
    assessmentTitle: string;
    workupTitle: string;
    treatmentTitle: string;
    dispositionTitle: string;
    profileTitle?: string;
    profileDaysLabel: string;
    locationBanner?: (location: string) => LocationBanner;
  };
  final: {
    title: string;
    watermark?: string;
    refineLabel: string;
    refinePlaceholder: string;
    refineSystem: string;
    refineContext: (vignette: string, plan: GeneratedPlan, question: string) => string;
    refineWaiting: string;
    refinePrefix: string;
    refineError: string;
    copyDone: string;
    referencesTitle: string;
    referencesHint?: string;
    buildNote: (n: NoteInput) => string;
  };
}
