import assert from "node:assert/strict";
import { createAuditRecord } from "./audit.mjs";
import { allowedIntent, blockedIntent, demoPolicy } from "./policy.mjs";
import { evaluateIntent } from "./risk.mjs";

const now = new Date("2026-06-20T08:00:00.000Z");

const allowedRisk = evaluateIntent(demoPolicy, allowedIntent, now);
const allowedReceipt = createAuditRecord({
  policy: demoPolicy,
  intent: allowedIntent,
  risk: allowedRisk,
  walrusBlobId: "walrus://testnet/IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU"
});

const blockedRisk = evaluateIntent(demoPolicy, blockedIntent, now);
const blockedReceipt = createAuditRecord({
  policy: demoPolicy,
  intent: blockedIntent,
  risk: blockedRisk
});

const pausedPolicy = { ...demoPolicy, status: "paused" };
const pausedRisk = evaluateIntent(pausedPolicy, allowedIntent, now);
const pausedReceipt = createAuditRecord({
  policy: pausedPolicy,
  intent: allowedIntent,
  risk: pausedRisk,
  source: "local-demo-paused-policy"
});

assert.equal(allowedRisk.allowed, true, "small allowlisted action should pass");
assert.equal(blockedRisk.allowed, false, "oversized action should be blocked");
assert.equal(pausedRisk.allowed, false, "paused policy must block all agent actions");
assert.ok(blockedRisk.failedChecks.includes("per_action_cap"));
assert.ok(blockedRisk.failedChecks.includes("risk_score"));
assert.ok(pausedRisk.failedChecks.includes("policy_active"));

console.log(JSON.stringify({
  project: "Sui Jarvis Overflow 2026",
  proof: "bounded-agent-policy-local-demo",
  allowed: {
    intentId: allowedIntent.id,
    receiptDigest: allowedReceipt.digest,
    walrusBlobId: allowedReceipt.walrusBlobId
  },
  blocked: {
    intentId: blockedIntent.id,
    failedChecks: blockedRisk.failedChecks,
    receiptDigest: blockedReceipt.digest
  },
  pauseProof: {
    failedChecks: pausedRisk.failedChecks,
    receiptDigest: pausedReceipt.digest
  }
}, null, 2));
