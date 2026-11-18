// AI bridge: replaces the old browser-to-Google calls.
// The widget sends ONE JSON string to Workshop (event "writeRequested"),
// Workshop recalculates the function variable (medconAsk -> Gemini 4 Hydrogen),
// and the answer comes back on the "writerResponse" parameter.
// Requests run one at a time; each carries a nonce so stale answers are ignored.

export type ChatRole = "user" | "assistant";

export interface AiMessage {
  role: ChatRole;
  content: string;
}

export interface AiRequest {
  task: string; // short label, e.g. "neurology.questions" (shows in function logs)
  system: string;
  messages: AiMessage[];
  json: boolean; // true = the model must return one JSON object
  reasoning?: "low" | "medium" | "high";
  preferFasterModel?: boolean;
}

export interface AiResult {
  text: string;
  modelUsed: string;
  usedBackupModel: boolean;
}

interface Job {
  req: AiRequest;
  resolve: (r: AiResult) => void;
  reject: (e: Error) => void;
}

interface InFlight {
  nonce: string;
  job: Job;
  startedAt: number;
  timer: ReturnType<typeof setTimeout>;
}

export interface BridgeStatus {
  busy: boolean;
  startedAt: number | null;
  usingFasterModel: boolean;
}

type Sender = (writerRequestJson: string) => void;

// Hydrogen 120 s + Sol 120 s + a little slack. Matches the function's chain.
const WAIT_LIMIT_MS = 300_000;
const GENERIC_ERROR = "Something went wrong. Please try again.";

function makeNonce(): string {
  return `write-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class AiBridge {
  private sender: Sender | null = null;
  private queue: Job[] = [];
  private current: InFlight | null = null;
  private listeners = new Set<() => void>();
  private status: BridgeStatus = { busy: false, startedAt: null, usingFasterModel: false };

  setSender(sender: Sender) {
    this.sender = sender;
    this.pump();
  }

  request(req: AiRequest): Promise<AiResult> {
    return new Promise<AiResult>((resolve, reject) => {
      this.queue.push({ req, resolve, reject });
      this.pump();
    });
  }

  /** Re-send the request that is waiting, asking the function to use the faster model. */
  useFasterModel() {
    if (!this.current) return;
    const job = this.current.job;
    clearTimeout(this.current.timer);
    this.current = null; // the old nonce will now be ignored if it ever answers
    this.start(job, true);
  }

  /** Called by Widget.tsx whenever the writerResponse parameter changes. */
  receive(raw: string) {
    if (!raw || !this.current) return;
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }
    if (!data || data.nonce !== this.current.nonce) return; // stale or unrelated
    const { job, timer } = this.current;
    clearTimeout(timer);
    this.current = null;
    if (data.ok === true) {
      job.resolve({
        text: typeof data.text === "string" ? data.text : JSON.stringify(data.text ?? ""),
        modelUsed: String(data.modelUsed ?? ""),
        usedBackupModel: Boolean(data.usedBackupModel),
      });
    } else {
      job.reject(new Error(typeof data.errorMessage === "string" && data.errorMessage ? data.errorMessage : GENERIC_ERROR));
    }
    this.setStatus({ busy: false, startedAt: null, usingFasterModel: false });
    this.pump();
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  getStatus(): BridgeStatus {
    return this.status;
  }

  private pump() {
    if (this.current || !this.sender || this.queue.length === 0) return;
    const job = this.queue.shift()!;
    this.start(job, false);
  }

  private start(job: Job, faster: boolean) {
    const nonce = makeNonce();
    const req: AiRequest = { ...job.req, preferFasterModel: Boolean(job.req.preferFasterModel || faster) };
    // Set the pending nonce BEFORE emitting the event.
    this.current = {
      nonce,
      job,
      startedAt: Date.now(),
      timer: setTimeout(() => this.timeout(nonce), WAIT_LIMIT_MS),
    };
    this.setStatus({ busy: true, startedAt: this.current.startedAt, usingFasterModel: faster });
    try {
      this.sender!(JSON.stringify({ nonce, ...req }));
    } catch {
      this.fail(nonce, GENERIC_ERROR);
    }
  }

  private timeout(nonce: string) {
    this.fail(nonce, "The AI took too long to answer. Please try again.");
  }

  private fail(nonce: string, message: string) {
    if (!this.current || this.current.nonce !== nonce) return;
    const { job, timer } = this.current;
    clearTimeout(timer);
    this.current = null;
    job.reject(new Error(message));
    this.setStatus({ busy: false, startedAt: null, usingFasterModel: false });
    this.pump();
  }

  private setStatus(s: BridgeStatus) {
    this.status = s;
    this.listeners.forEach((fn) => fn());
  }
}

export const aiBridge = new AiBridge();
