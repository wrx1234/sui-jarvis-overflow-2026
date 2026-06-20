import { createHash } from "node:crypto";

export function createAuditRecord({ policy, intent, risk, source = "local-demo", walrusBlobId }) {
  const record = {
    schema: "sui-jarvis.audit.v1",
    source,
    eventType: "agent_intent_evaluated",
    policyId: policy.id,
    network: policy.network,
    actor: intent.actor,
    intentId: intent.id,
    action: intent.action,
    protocol: intent.protocol,
    recipient: intent.recipient,
    amountMist: intent.amountMist,
    allowed: risk.allowed,
    failedChecks: risk.failedChecks,
    createdAt: new Date("2026-06-20T00:00:00.000Z").toISOString()
  };

  const digest = sha256(canonicalJson(record));

  return {
    ...record,
    digest,
    walrusBlobId: walrusBlobId ?? `walrus://pending/${digest}`
  };
}

export function canonicalJson(value) {
  return JSON.stringify(sortKeys(value));
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, sortKeys(item)])
    );
  }
  return value;
}
