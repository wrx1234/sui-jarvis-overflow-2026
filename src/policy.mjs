export const demoPolicy = Object.freeze({
  id: "local-policy-demo",
  owner: "0xowner_demo",
  agent: "0xagent_demo",
  network: "testnet",
  status: "active",
  maxRiskScore: 40,
  budget: {
    maxPerActionMist: 500_000_000,
    dailyLimitMist: 1_500_000_000,
    spentTodayMist: 250_000_000,
    minReserveMist: 200_000_000
  },
  allowlists: {
    protocols: ["cetus-sim", "deepbook-sim", "sui-transfer"],
    recipients: ["0xrecipient_demo", "0xdeepbook_pool_demo"]
  },
  expiresAt: "2026-06-21T15:00:00.000Z"
});

export const allowedIntent = Object.freeze({
  id: "intent-swap-small",
  actor: "0xagent_demo",
  action: "swap",
  protocol: "cetus-sim",
  recipient: "0xrecipient_demo",
  amountMist: 300_000_000,
  walletBalanceMist: 2_000_000_000,
  riskScore: 22,
  note: "Swap 0.3 SUI through an allowlisted protocol."
});

export const blockedIntent = Object.freeze({
  id: "intent-swap-oversize",
  actor: "0xagent_demo",
  action: "swap",
  protocol: "cetus-sim",
  recipient: "0xrecipient_demo",
  amountMist: 1_200_000_000,
  walletBalanceMist: 2_000_000_000,
  riskScore: 63,
  note: "Oversized swap that should be blocked by per-action and risk limits."
});

