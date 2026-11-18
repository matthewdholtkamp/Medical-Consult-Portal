// Widget config for MedCon Portal. Same parameter/event names as DPMAP Writer,
// so the Workshop wiring copies over unchanged.
import { defineConfig } from "@osdk/widget.client";

export default defineConfig({
  id: "medconPortal",
  name: "MedCon Portal",
  description: "AI medical specialist consult portal: home, ADTMC+, and Neurology.",
  type: "workshop",
  parameters: {
    writerRequestJson: { displayName: "Writer request JSON", type: "string" },
    writerResponse: { displayName: "Writer response JSON", type: "string" },
  },
  events: {
    writeRequested: { displayName: "Write requested", parameterUpdateIds: ["writerRequestJson"] },
  },
});
