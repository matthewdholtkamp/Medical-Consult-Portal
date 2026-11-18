import { useEffect, useState } from "react";
import { aiBridge, BridgeStatus } from "./bridge";

/** Live AI status plus seconds waited, for the "still writing" and "faster model" hints. */
export function useAiStatus(): BridgeStatus & { seconds: number } {
  const [status, setStatus] = useState<BridgeStatus>(aiBridge.getStatus());
  const [now, setNow] = useState(Date.now());

  useEffect(() => aiBridge.subscribe(() => setStatus(aiBridge.getStatus())), []);

  useEffect(() => {
    if (!status.busy) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [status.busy]);

  const seconds = status.busy && status.startedAt ? Math.max(0, Math.floor((now - status.startedAt) / 1000)) : 0;
  return { ...status, seconds };
}
