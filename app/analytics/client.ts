import { normalizeFunnelEvent } from "./contract.mjs";

export type FunnelEvent =
  | "page_view"
  | "launch_clicked"
  | "unity_loaded"
  | "mission_started"
  | "mission_completed"
  | "mission_failed";

export type FunnelProperties = {
  mission_id?: string;
  outcome?: "success" | "failure";
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() ?? "";
const plausibleEndpoint = process.env.NEXT_PUBLIC_PLAUSIBLE_ENDPOINT?.trim() ||
  "https://plausible.io/api/event";
const safeAttributionParameters = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
]);
const sentPageViews = new Set<string>();

export function trackPageView(): void {
  if (typeof window === "undefined") return;
  const analyticsUrl = buildAnalyticsUrl();
  if (sentPageViews.has(analyticsUrl)) return;
  sentPageViews.add(analyticsUrl);
  trackAnalyticsEvent("page_view");
}

export function trackAnalyticsEvent(
  event: FunnelEvent,
  properties: FunnelProperties = {},
): void {
  if (typeof window === "undefined") return;

  const normalized = normalizeFunnelEvent(event, properties);
  if (!normalized) return;

  window.dispatchEvent(new CustomEvent("steel-raven:analytics", {
    detail: {
      event: normalized.event,
      properties: normalized.properties,
    },
  }));

  if (!analyticsCollectionAllowed()) return;

  const body = {
    domain: plausibleDomain,
    name: normalized.apiName,
    url: buildAnalyticsUrl(),
    referrer: buildSafeReferrer(),
    props: normalized.properties,
    interactive: normalized.event === "launch_clicked" ||
      normalized.event === "mission_started",
  };

  void fetch(plausibleEndpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
    credentials: "omit",
    keepalive: true,
    referrerPolicy: "no-referrer",
  }).catch(() => {
    // Analytics is observational and must never interrupt the game or portal.
  });
}

function analyticsCollectionAllowed(): boolean {
  if (!plausibleDomain || typeof navigator === "undefined") return false;
  if (navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true) {
    return false;
  }

  const hostname = window.location.hostname.toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1" ||
      hostname === "::1" || hostname.endsWith(".local")) {
    return false;
  }

  const configuredHost = plausibleDomain
    .replace(/^https?:\/\//i, "")
    .split("/")[0]
    .toLowerCase();
  if (configuredHost !== hostname) return false;

  try {
    return new URL(plausibleEndpoint).protocol === "https:";
  } catch {
    return false;
  }
}

function buildAnalyticsUrl(): string {
  const url = new URL(window.location.href);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (!safeAttributionParameters.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  return url.toString();
}

function buildSafeReferrer(): string {
  if (!document.referrer) return "";
  try {
    const referrer = new URL(document.referrer);
    return `${referrer.origin}${referrer.pathname}`;
  } catch {
    return "";
  }
}
