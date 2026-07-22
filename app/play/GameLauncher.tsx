"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeGameAnalyticsMessage } from "../analytics/contract.mjs";
import { trackAnalyticsEvent } from "../analytics/client";
import type { FunnelEvent } from "../analytics/client";

type LauncherState = "checking" | "ready" | "preparing";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function GameLauncher() {
  const [state, setState] = useState<LauncherState>("checking");
  const [launched, setLaunched] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const unityLoadedRef = useRef(false);
  const missionRunningRef = useRef(false);

  useEffect(() => {
    let active = true;
    fetch(`${basePath}/game/manifest.json`, { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        setState(response.ok ? "ready" : "preparing");
      })
      .catch(() => active && setState("preparing"));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!launched) return;

    function handleGameMessage(message: MessageEvent) {
      if (message.origin !== window.location.origin ||
          message.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const normalized = normalizeGameAnalyticsMessage(message.data);
      if (!normalized || !("mission_id" in normalized.properties)) return;
      const missionId = normalized.properties.mission_id;

      if (normalized.event === "unity_loaded") {
        if (unityLoadedRef.current) return;
        unityLoadedRef.current = true;
      } else if (normalized.event === "mission_started") {
        if (!unityLoadedRef.current || missionRunningRef.current) return;
        missionRunningRef.current = true;
      } else {
        if (!unityLoadedRef.current || !missionRunningRef.current) return;
        missionRunningRef.current = false;
      }

      const outcome = "outcome" in normalized.properties &&
        (normalized.properties.outcome === "success" ||
         normalized.properties.outcome === "failure")
        ? normalized.properties.outcome
        : undefined;
      trackAnalyticsEvent(normalized.event as FunnelEvent, {
        mission_id: missionId,
        ...(outcome ? { outcome } : {}),
      });
    }

    window.addEventListener("message", handleGameMessage);
    return () => window.removeEventListener("message", handleGameMessage);
  }, [launched]);

  function launchMission() {
    unityLoadedRef.current = false;
    missionRunningRef.current = false;
    trackAnalyticsEvent("launch_clicked", { mission_id: "mission-01" });
    setLaunched(true);
  }

  function exitGame() {
    setLaunched(false);
    unityLoadedRef.current = false;
    missionRunningRef.current = false;
  }

  if (launched && state === "ready") {
    return (
      <div className="game-frame-shell">
        <iframe
          ref={iframeRef}
          className="game-frame"
          src={`${basePath}/game/index.html`}
          title="Operation Steel Raven — Mission 1"
          allow="fullscreen; gamepad; autoplay"
        />
        <button className="exit-game" onClick={exitGame} type="button">
          Exit game view
        </button>
      </div>
    );
  }

  return (
    <section className="launcher-panel" aria-live="polite" role="status">
      <div className="launcher-scan" aria-hidden="true" />
      <div className="launcher-status">
        <span className={state === "ready" ? "status-dot" : "status-dot status-dot-amber"} />
        {state === "checking" && "Checking deployment package"}
        {state === "ready" && "Mission package verified"}
        {state === "preparing" && "Browser package is being prepared"}
      </div>
      <p className="launcher-code">OP-01 // KORONA CORRIDOR // BLACK PINES</p>
      <h1>{state === "ready" ? "Ready to deploy." : "Stand by, Raven."}</h1>
      <p className="launcher-copy">
        {state === "ready"
          ? "Mission 1 is loaded. Enter fullscreen, click inside the game and begin the operation."
          : "The public operations room is online. The optimized Mission 1 game package is completing its browser build and will appear here automatically."}
      </p>
      {state === "ready" ? (
        <button className="primary-action launcher-button" onClick={launchMission} type="button">
          Launch Mission 1 <span aria-hidden="true">→</span>
        </button>
      ) : (
        <div className="build-progress" aria-label="Browser package preparation in progress">
          <span />
        </div>
      )}
      <div className="launcher-specs">
        <div><span>Recommended</span><strong>Desktop Chrome, Edge, Firefox or Safari</strong></div>
        <div><span>Input</span><strong>Mouse &amp; keyboard / controller</strong></div>
        <div><span>Audio</span><strong>Headphones recommended</strong></div>
      </div>
    </section>
  );
}
