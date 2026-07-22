export const ANALYTICS_MESSAGE_SOURCE = "operation-steel-raven-game";
export const ANALYTICS_MESSAGE_TYPE = "analytics";
export const ANALYTICS_MESSAGE_VERSION = 1;

export const FUNNEL_EVENT_KEYS = Object.freeze([
  "page_view",
  "launch_clicked",
  "unity_loaded",
  "mission_started",
  "mission_completed",
  "mission_failed",
]);

const eventKeys = new Set(FUNNEL_EVENT_KEYS);
const terminalOutcomes = Object.freeze({
  mission_completed: "success",
  mission_failed: "failure",
});
const missionIdPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;

/**
 * Reduces every analytics call to the deliberately small public contract.
 * Unknown fields fail closed so names, checkpoint data, scores, free text and
 * other gameplay state cannot accidentally reach the analytics provider.
 */
export function normalizeFunnelEvent(event, rawProperties = {}) {
  if (!eventKeys.has(event) || !isPlainObject(rawProperties)) return null;

  const propertyKeys = Object.keys(rawProperties);
  if (propertyKeys.some((key) => key !== "mission_id" && key !== "outcome")) {
    return null;
  }

  if (event === "page_view") {
    return propertyKeys.length === 0
      ? { event, apiName: "pageview", properties: {} }
      : null;
  }

  const missionId = rawProperties.mission_id;
  if (typeof missionId !== "string" || !missionIdPattern.test(missionId)) return null;

  const expectedOutcome = terminalOutcomes[event];
  if (!expectedOutcome && Object.hasOwn(rawProperties, "outcome")) return null;
  if (expectedOutcome && Object.hasOwn(rawProperties, "outcome") &&
      rawProperties.outcome !== expectedOutcome) {
    return null;
  }

  const properties = { mission_id: missionId };
  if (expectedOutcome) properties.outcome = expectedOutcome;
  return { event, apiName: event, properties };
}

export function normalizeGameAnalyticsMessage(value) {
  if (!isPlainObject(value) ||
      value.source !== ANALYTICS_MESSAGE_SOURCE ||
      value.type !== ANALYTICS_MESSAGE_TYPE ||
      value.version !== ANALYTICS_MESSAGE_VERSION ||
      value.event === "page_view" || value.event === "launch_clicked") {
    return null;
  }

  const rawProperties = {};
  if (Object.hasOwn(value, "mission_id")) rawProperties.mission_id = value.mission_id;
  if (Object.hasOwn(value, "outcome")) rawProperties.outcome = value.outcome;

  const allowedEnvelopeKeys = new Set([
    "source",
    "type",
    "version",
    "event",
    "mission_id",
    "outcome",
  ]);
  if (Object.keys(value).some((key) => !allowedEnvelopeKeys.has(key))) return null;

  return normalizeFunnelEvent(value.event, rawProperties);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
