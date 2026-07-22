import assert from "node:assert/strict";
import test from "node:test";
import {
  ANALYTICS_MESSAGE_SOURCE,
  ANALYTICS_MESSAGE_TYPE,
  ANALYTICS_MESSAGE_VERSION,
  FUNNEL_EVENT_KEYS,
  normalizeFunnelEvent,
  normalizeGameAnalyticsMessage,
} from "../app/analytics/contract.mjs";

test("defines the exact anonymous play funnel", () => {
  assert.deepEqual(FUNNEL_EVENT_KEYS, [
    "page_view",
    "launch_clicked",
    "unity_loaded",
    "mission_started",
    "mission_completed",
    "mission_failed",
  ]);
  assert.deepEqual(normalizeFunnelEvent("page_view"), {
    event: "page_view",
    apiName: "pageview",
    properties: {},
  });
  assert.deepEqual(normalizeFunnelEvent("mission_completed", {
    mission_id: "mission-01",
  })?.properties, { mission_id: "mission-01", outcome: "success" });
  assert.deepEqual(normalizeFunnelEvent("mission_failed", {
    mission_id: "mission-01",
  })?.properties, { mission_id: "mission-01", outcome: "failure" });
});

test("rejects invalid stages, identifiers, outcomes and private gameplay fields", () => {
  assert.equal(normalizeFunnelEvent("player_name", {}), null);
  assert.equal(normalizeFunnelEvent("mission_started", { mission_id: "" }), null);
  assert.equal(normalizeFunnelEvent("mission_started", {
    mission_id: "mission-01",
    outcome: "success",
  }), null);
  assert.equal(normalizeFunnelEvent("mission_completed", {
    mission_id: "mission-01",
    outcome: "failure",
  }), null);
  assert.equal(normalizeFunnelEvent("mission_started", {
    mission_id: "mission-01",
    score: 9001,
  }), null);
  assert.equal(normalizeFunnelEvent("page_view", { email: "private" }), null);
});

test("accepts only the versioned game message envelope", () => {
  const valid = {
    source: ANALYTICS_MESSAGE_SOURCE,
    type: ANALYTICS_MESSAGE_TYPE,
    version: ANALYTICS_MESSAGE_VERSION,
    event: "mission_completed",
    mission_id: "mission-01",
    outcome: "success",
  };
  assert.deepEqual(normalizeGameAnalyticsMessage(valid), {
    event: "mission_completed",
    apiName: "mission_completed",
    properties: { mission_id: "mission-01", outcome: "success" },
  });
  assert.equal(normalizeGameAnalyticsMessage({ ...valid, version: 2 }), null);
  assert.equal(normalizeGameAnalyticsMessage({ ...valid, source: "unknown" }), null);
  assert.equal(normalizeGameAnalyticsMessage({ ...valid, score: 5 }), null);
  assert.equal(normalizeGameAnalyticsMessage({ ...valid, event: "launch_clicked" }), null);
});
