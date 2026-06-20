export function evaluateIntent(policy, intent, now = new Date()) {
  const checks = [
    check("policy_active", policy.status === "active", `policy status is ${policy.status}`),
    check("policy_not_expired", now <= new Date(policy.expiresAt), `policy expires at ${policy.expiresAt}`),
    check("agent_match", intent.actor === policy.agent, "intent actor must match delegated agent"),
    check("protocol_allowed", policy.allowlists.protocols.includes(intent.protocol), `${intent.protocol} must be allowlisted`),
    check("recipient_allowed", policy.allowlists.recipients.includes(intent.recipient), `${intent.recipient} must be allowlisted`),
    check("per_action_cap", intent.amountMist <= policy.budget.maxPerActionMist, "amount must be under maxPerActionMist"),
    check(
      "daily_cap",
      policy.budget.spentTodayMist + intent.amountMist <= policy.budget.dailyLimitMist,
      "spentTodayMist plus amount must be under dailyLimitMist"
    ),
    check(
      "reserve_floor",
      intent.walletBalanceMist - intent.amountMist >= policy.budget.minReserveMist,
      "wallet balance after action must stay above minReserveMist"
    ),
    check("risk_score", intent.riskScore <= policy.maxRiskScore, "risk score must stay under maxRiskScore")
  ];

  const failed = checks.filter((item) => !item.pass);

  return {
    allowed: failed.length === 0,
    failedChecks: failed.map((item) => item.name),
    checks
  };
}

function check(name, pass, detail) {
  return { name, pass, detail };
}

