// Read-aloud using the computer's built-in voice (Web Speech API).
// Replaces the website's Google text-to-speech, which Vantage blocks. Nothing leaves the computer.
import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechState = "idle" | "playing" | "paused";

const RATE = 1.25; // same speed as the website's player

/** Prefer a British male voice ("George"), then any British voice, then US English. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!voices.length) return null;
  const by = (fn: (v: SpeechSynthesisVoice) => boolean) => voices.find(fn) ?? null;
  return (
    by((v) => /george/i.test(v.name)) ||
    by((v) => /en-GB/i.test(v.lang) && /(daniel|arthur|ryan|thomas|oliver|male)/i.test(v.name)) ||
    by((v) => /en-GB/i.test(v.lang)) ||
    by((v) => /en-US/i.test(v.lang)) ||
    voices[0]
  );
}

/** Turn Markdown into plain sentences and split into short chunks (Chrome stops long utterances). */
export function toSpeechChunks(markdown: string): string[] {
  const plain = markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_>`|~]/g, " ")
    .replace(/\[(?:[A-Z]+)(?::\s*[A-Z ]+)?\]/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = plain.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [plain];
  const chunks: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + s).length > 220 && buf) {
      chunks.push(buf.trim());
      buf = "";
    }
    buf += s;
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

export function useSpeech() {
  const [state, setState] = useState<SpeechState>("idle");
  const [progress, setProgress] = useState(0); // 0..1
  const [voiceName, setVoiceName] = useState<string>("");
  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const runRef = useRef(0); // invalidates old utterance callbacks after stop()

  const speakFrom = useCallback((i: number, run: number) => {
    const synth = window.speechSynthesis;
    const chunks = chunksRef.current;
    if (run !== runRef.current) return;
    if (i >= chunks.length) {
      setState("idle");
      setProgress(1);
      return;
    }
    indexRef.current = i;
    setProgress(i / chunks.length);
    const u = new SpeechSynthesisUtterance(chunks[i]);
    const v = pickVoice();
    if (v) {
      u.voice = v;
      u.lang = v.lang;
      setVoiceName(v.name);
    }
    u.rate = RATE;
    u.onend = () => speakFrom(i + 1, run);
    u.onerror = () => {
      if (run === runRef.current) setState("idle");
    };
    synth.speak(u);
  }, []);

  const play = useCallback(
    (markdown: string) => {
      if (!speechSupported()) return;
      window.speechSynthesis.cancel();
      runRef.current += 1;
      chunksRef.current = toSpeechChunks(markdown);
      setState("playing");
      speakFrom(0, runRef.current);
    },
    [speakFrom],
  );

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setState("playing");
  }, []);

  const stop = useCallback(() => {
    runRef.current += 1;
    if (speechSupported()) window.speechSynthesis.cancel();
    setState("idle");
    setProgress(0);
  }, []);

  // Voices load late in some browsers; also stop talking if the page closes.
  useEffect(() => {
    if (!speechSupported()) return;
    const load = () => setVoiceName(pickVoice()?.name ?? "");
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", load);
      runRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, []);

  return { state, progress, voiceName, play, pause, resume, stop, supported: speechSupported() };
}
