// Host wrapper: connects the MedCon app to Workshop.
// Sends AI requests out through the "writeRequested" event and feeds the
// "writerResponse" parameter back to the AI bridge. Never remounts the app.
import React, { useCallback, useEffect } from "react";
import { useFoundryWidgetContext } from "@osdk/widget.client-react";
import type MainConfig from "./main.config";
import { MedconApp } from "./medcon/App";
import { aiBridge } from "./medcon/ai/bridge";
import "./medcon/styles/portal.css";

const useMedconContext = useFoundryWidgetContext.withTypes<typeof MainConfig>();

export const Widget: React.FC = () => {
  const { parameters, emitEvent } = useMedconContext();
  // parameters.values can be undefined while Workshop is reloading the variable.
  const writerResponse = (parameters?.values as { writerResponse?: string } | undefined)?.writerResponse ?? "";

  const send = useCallback(
    (writerRequestJson: string) => {
      emitEvent("writeRequested", { parameterUpdates: { writerRequestJson } });
    },
    [emitEvent],
  );

  useEffect(() => {
    aiBridge.setSender(send);
  }, [send]);

  // Re-runs when the value returns after "loading", so a new answer is never missed.
  useEffect(() => {
    if (writerResponse) aiBridge.receive(writerResponse);
  }, [writerResponse]);

  return <MedconApp />;
};

export default Widget;
