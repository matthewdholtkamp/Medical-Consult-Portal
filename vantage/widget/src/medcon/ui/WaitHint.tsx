import { aiBridge } from "../ai/bridge";
import { useAiStatus } from "../ai/useAiStatus";

/** Shown under any loading message: "still writing" after 20 s, faster-model link after 30 s. */
export function WaitHint({ className = "" }: { className?: string }) {
  const s = useAiStatus();
  if (!s.busy) return null;
  return (
    <div className={`flex flex-col items-center gap-2 text-xs text-slate-400 ${className}`}>
      {s.seconds >= 20 && <span>Still writing – this can take a few minutes when the system is busy.</span>}
      {s.seconds >= 30 && !s.usingFasterModel && (
        <button type="button" className="text-sky-400 underline hover:text-sky-300" onClick={() => aiBridge.useFasterModel()}>
          Use the faster model instead.
        </button>
      )}
    </div>
  );
}

/** Small note when a backup model answered. */
export function BackupNote({ used }: { used: boolean }) {
  if (!used) return null;
  return <p className="text-[11px] text-slate-500 mt-2">Written with backup model.</p>;
}
