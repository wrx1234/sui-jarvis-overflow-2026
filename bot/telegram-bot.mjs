#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import https from "node:https";
import { createAuditRecord } from "../src/audit.mjs";
import { allowedIntent, blockedIntent, demoPolicy } from "../src/policy.mjs";
import { evaluateIntent } from "../src/risk.mjs";

const demoNow = new Date("2026-06-20T08:00:00.000Z");

const evidence = Object.freeze({
  siteUrl: "https://wrx1234.github.io/sui-jarvis-overflow-2026/",
  repoUrl: "https://github.com/wrx1234/sui-jarvis-overflow-2026",
  videoUrl: "https://wrx1234.github.io/sui-jarvis-overflow-2026/demo-video.html",
  packageId: "0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4",
  policyObject: "0x05890c9882df3a77bc6389bd895227f86343a2b7a3b48deb0c72a9ff76bb0f3c",
  publishTx: "4AMeu8oNd93wZ97C5mZvwDT8Sv8eN1sAfYz48YV9tYBJ",
  actionTx: "S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9",
  pauseTx: "55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC",
  blockedTx: "AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa",
  walrusBlob: "IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU"
});

const LINE = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
const MINI_LINE = "────────────────────────";

const telegramCommands = Object.freeze([
  { command: "start", description: "Open the Jarvis reviewer menu" },
  { command: "dashboard", description: "Product dashboard" },
  { command: "assets", description: "Policy wallet and limits" },
  { command: "swap", description: "Policy-gated quote sandbox" },
  { command: "portfolio", description: "Portfolio view and chart" },
  { command: "limit", description: "Guarded intent queue" },
  { command: "whale", description: "Whale signal panel" },
  { command: "pools", description: "Sui pool discovery" },
  { command: "signals", description: "AI signal feed" },
  { command: "strategy", description: "AI strategy manager" },
  { command: "policy", description: "Sui policy object" },
  { command: "proof", description: "Allowed and blocked proofs" },
  { command: "walrus", description: "Walrus audit receipts" },
  { command: "vault", description: "Move package evidence" },
  { command: "logs", description: "Recent operation logs" },
  { command: "evidence", description: "All judge links" },
  { command: "help", description: "List commands" }
]);

const callbackAliases = new Map([
  ["back", "menu"],
  ["wallet", "assets"],
  ["balance", "assets"],
  ["swap", "swap_menu"],
  ["swap_custom", "swap_menu"],
  ["settings", "status"],
  ["sl_panel", "yield"],
  ["sl_mint", "yield"],
  ["sl_yield", "yield"],
  ["mint", "yield"],
  ["burn", "yield"],
  ["lang_toggle", "help"]
]);

loadLocalEnv();

if (process.argv.includes("--dry-run")) {
  const samples = [
    "/start",
    "/dashboard",
    "/assets",
    "/swap",
    "swap_SUI/USDC",
    "/portfolio",
    "portfolio_chart",
    "/signals",
    "signals_settings",
    "/whale",
    "whale_stats",
    "/pools",
    "pools_apr",
    "/strategy",
    "/policy",
    "/proof",
    "/proof blocked",
    "/proof pause",
    "/walrus",
    "walrus_upload",
    "/vault",
    "/logs",
    "/evidence",
    "/help"
  ];

  for (const sample of samples) {
    const panel = sample.startsWith("/") ? panelFromCommand(sample) : panelFromCallback(sample);
    printDryPanel(sample, panel);
  }
  process.exit(0);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN. Put it in local .env or the deployment secret store.");
  process.exit(1);
}

const allowedUserIds = parseAllowedUserIds(process.env.TELEGRAM_ALLOWED_USER_IDS);
let offset = Number(process.env.TELEGRAM_UPDATE_OFFSET || 0);

console.log("Sui Jarvis Telegram bot started.");
console.log("Mode: policy proof demo; Telegram trading execution disabled.");
console.log(`Commands: ${formatCommandList()}`);

try {
  const identity = await telegram("getMe", {});
  const handle = identity.result?.username ? `@${identity.result.username}` : identity.result?.first_name || "unknown bot";
  console.log(`Connected to Telegram as ${handle}.`);
  await telegram("deleteWebhook", { drop_pending_updates: false });
  await telegram("setMyCommands", { commands: telegramCommands });
} catch (error) {
  console.error(`Telegram startup check failed: ${error.message}`);
  process.exit(1);
}

while (true) {
  try {
    const updates = await telegram("getUpdates", {
      offset,
      timeout: 30,
      allowed_updates: ["message", "callback_query"]
    });

    for (const update of updates.result || []) {
      offset = Math.max(offset, update.update_id + 1);
      await handleUpdate(update);
    }
  } catch (error) {
    console.error(`Telegram polling error: ${error.message}`);
    await wait(3000);
  }
}

async function handleUpdate(update) {
  if (update.message) {
    const message = update.message;
    if (!message.chat?.id || typeof message.text !== "string") return;
    if (!isAllowed(message.from?.id, message.chat.id)) return sendDenied(message.chat.id);

    const panel = panelFromCommand(message.text);
    await sendPanel(message.chat.id, panel);
    return;
  }

  if (update.callback_query) {
    const query = update.callback_query;
    const message = query.message;
    if (!message?.chat?.id) return;
    if (!isAllowed(query.from?.id, message.chat.id)) {
      await telegram("answerCallbackQuery", {
        callback_query_id: query.id,
        text: "This Sui Jarvis demo bot is allowlisted for reviewers only.",
        show_alert: true
      });
      return;
    }

    const panel = panelFromCallback(query.data || "menu");
    await telegram("answerCallbackQuery", {
      callback_query_id: query.id,
      text: "Rendering Jarvis panel...",
      cache_time: 0
    });
    await editOrSendPanel(message.chat.id, message.message_id, panel);
  }
}

function panelFromCommand(input) {
  const [rawCommand, ...rest] = input.trim().split(/\s+/);
  const command = (rawCommand || "/start").toLowerCase().split("@")[0];
  const arg = rest.join(" ").toLowerCase();

  switch (command) {
    case "/start":
    case "/menu":
      return menuPanel();
    case "/dashboard":
      return dashboardPanel();
    case "/wallet":
    case "/balance":
    case "/assets":
      return assetsPanel();
    case "/swap":
      return swapPanel();
    case "/portfolio":
      return portfolioPanel();
    case "/limit":
      return limitPanel();
    case "/whale":
      return whalePanel();
    case "/pools":
      return poolsPanel();
    case "/signals":
      return signalsPanel();
    case "/logs":
      return logsPanel();
    case "/strategy":
      return strategyPanel();
    case "/policy":
      return policyPanel();
    case "/proof":
      return proofPanel(arg);
    case "/mint":
    case "/burn":
    case "/yield":
    case "/stablelayer":
      return yieldPanel();
    case "/sniper":
      return sniperPanel();
    case "/walrus":
      return walrusPanel();
    case "/vault":
      return vaultPanel();
    case "/evidence":
    case "/links":
      return evidencePanel();
    case "/status":
      return statusPanel();
    case "/help":
      return helpPanel();
    default:
      return unknownPanel();
  }
}

function panelFromCallback(rawData) {
  const data = callbackAliases.get(rawData) || rawData || "menu";

  if (data.startsWith("swap_")) return swapQuotePanel(data.slice("swap_".length));
  if (data.startsWith("exec_")) return executionDisabledPanel(data.slice("exec_".length));
  if (data.startsWith("strat_")) return strategyPanel(data);
  if (data.startsWith("proof_")) return proofPanel(data.replace("proof_", ""));
  if (data.startsWith("sl_")) return yieldPanel();

  switch (data) {
    case "menu":
      return menuPanel();
    case "dashboard":
      return dashboardPanel();
    case "assets":
      return assetsPanel();
    case "swap_menu":
      return swapPanel();
    case "portfolio":
      return portfolioPanel();
    case "portfolio_chart":
      return portfolioChartPanel();
    case "limit":
      return limitPanel();
    case "whale":
      return whalePanel();
    case "whale_stats":
      return whaleStatsPanel();
    case "pools":
      return poolsPanel();
    case "pools_apr":
      return poolsAprPanel();
    case "signals":
      return signalsPanel();
    case "signals_settings":
      return signalsSettingsPanel();
    case "strategy":
      return strategyPanel();
    case "policy":
      return policyPanel();
    case "proof":
      return proofPanel();
    case "yield":
      return yieldPanel();
    case "sniper":
      return sniperPanel();
    case "walrus":
      return walrusPanel();
    case "walrus_upload":
      return walrusUploadPanel();
    case "vault":
      return vaultPanel();
    case "evidence":
      return evidencePanel();
    case "status":
      return statusPanel();
    case "logs":
      return logsPanel();
    case "help":
      return helpPanel();
    default:
      return unknownPanel();
  }
}

function menuPanel() {
  return panel(
    [
      "🌊 *Sui Jarvis*",
      LINE,
      "Autonomous DeFi agent interface, rebuilt for Sui Overflow 2026.",
      "",
      "🔧 *Tech Stack*",
      "├ 🌊 *Sui* — Move policy object",
      "├ 🐋 *Cetus / DeepBook* — routed intent targets",
      "├ 🐘 *Walrus* — audit receipts and agent memory",
      "├ 🔐 *Seal-ready* — private strategy data layer",
      "└ 🤖 *Jarvis Runner* — intent parser and policy console",
      "",
      "🛡️ *Current Mode*",
      "├ Network: *Sui testnet*",
      "├ Execution: *policy proof demo*",
      "├ Mainnet trading: *disabled*",
      "└ Private-key custody: *disabled*",
      "",
      "👇 *Reviewer path:* Dashboard → Swap → Proof → Walrus → Evidence"
    ],
    mainKeyboard()
  );
}

function assetsPanel() {
  return panel(
    [
      "👛 *Policy Wallet*",
      LINE,
      "This is the reviewer-facing wallet console. It mirrors the old Jarvis asset panel, but authority now lives in a Sui policy object.",
      "",
      "📍 *Policy Object*",
      `\`${evidence.policyObject}\``,
      "",
      "💰 *Assets / Limits*",
      `├ Available action cap: *${mistToSui(demoPolicy.budget.maxPerActionMist)} SUI*`,
      `├ Daily limit: *${mistToSui(demoPolicy.budget.dailyLimitMist)} SUI*`,
      `├ Spent today: *${mistToSui(demoPolicy.budget.spentTodayMist)} SUI*`,
      `└ Minimum reserve: *${mistToSui(demoPolicy.budget.minReserveMist)} SUI*`,
      "",
      "🧠 *Interpretation*",
      "Jarvis may propose an action. The policy object decides whether that action can proceed."
    ],
    rows(
      [button("📊 Dashboard", "dashboard"), button("🔐 Policy", "policy")],
      [button("🧾 Proof", "proof"), urlButton("Explorer", explorerObject(evidence.policyObject))],
      backRow()
    )
  );
}

function swapPanel() {
  return panel(
    [
      "🔄 *Swap — Policy-Gated Quote*",
      LINE,
      "Old Jarvis gave users a fast DEX swap menu. This version keeps the product flow, but adds a Sui-native policy gate before execution.",
      "",
      "🐋 *Route Sources*",
      "Cetus · DeepBook · Turbos · FlowX · Aftermath",
      "",
      "🛡️ *Before any trade*",
      "1. Parse user or AI intent",
      "2. Score risk and route",
      "3. Check Move policy caps",
      "4. Emit audit receipt",
      "",
      "💡 _No mainnet funds move from Telegram in proof mode._"
    ],
    rows(
      [button("SUI → USDC", "swap_SUI/USDC"), button("USDC → SUI", "swap_USDC/SUI")],
      [button("SUI → CETUS", "swap_SUI/CETUS"), button("SUI → DEEP", "swap_SUI/DEEP")],
      [button("Blocked Quote", "proof_blocked"), button("Paused Policy", "proof_pause")],
      backRow()
    )
  );
}

function swapQuotePanel(pair) {
  const isBlocked = pair.includes("USDC/SUI");
  const intent = isBlocked ? blockedIntent : allowedIntent;
  const risk = evaluateIntent(demoPolicy, intent, demoNow);
  const receipt = createAuditRecord({
    policy: demoPolicy,
    intent,
    risk,
    source: "telegram-swap-quote",
    walrusBlobId: risk.allowed ? `walrus://testnet/${evidence.walrusBlob}` : undefined
  });

  return panel(
    [
      "🔄 *Swap Quote*",
      LINE,
      `📥 *Input:*  ${mistToSui(intent.amountMist)} SUI`,
      `📤 *Pair:*   ${pair}`,
      "",
      "📊 *Route Details*",
      `├ Path: ${pair.replace("/", " → ")}`,
      `├ Adapter: ${pair.includes("DEEP") ? "DeepBook simulation" : "Cetus simulation"}`,
      "├ Slippage protection: 0.5%",
      "└ Est. gas: ~0.005 SUI",
      "",
      "🛡️ *Policy Check*",
      `├ Risk score: *${intent.riskScore}/${demoPolicy.maxRiskScore}*`,
      `├ Decision: *${risk.allowed ? "ALLOW" : "BLOCK"}*`,
      `├ Failed checks: ${risk.failedChecks.length ? risk.failedChecks.join(", ") : "none"}`,
      `└ Receipt: \`${shortDigest(receipt.digest)}\``,
      "",
      risk.allowed
        ? "✅ _Quote is eligible for the testnet proof path._"
        : "⛔ _Quote is blocked before execution._"
    ],
    rows(
      [button("🔐 Policy", "policy"), button("🐘 Walrus", "walrus")],
      [button("🧾 Allowed Proof", "proof_allowed"), button("⛔ Blocked Proof", "proof_blocked")],
      [button("Try another pair", "swap_menu")],
      backRow()
    )
  );
}

function dashboardPanel() {
  return panel(
    [
      "📊 *Jarvis Dashboard*",
      LINE,
      "",
      "💰 *Assets*",
      `  🟦 SUI policy cap: *${mistToSui(demoPolicy.budget.maxPerActionMist)} SUI/action*`,
      "  💵 Simulated value: *~$2,342*",
      "",
      "🤖 *Strategy*",
      "  Active: Policy Guard | Win Rate: 73% | Proofs: 3",
      "",
      "🔔 *Latest Signal*",
      "  SUI/USDC quote allowed under cap; oversized route blocked.",
      "",
      "🐘 *Walrus*",
      "  1 certified audit receipt linked to the allowed action."
    ],
    rows(
      [button("💰 Assets", "assets"), button("🔄 Swap", "swap_menu")],
      [button("📈 Portfolio", "portfolio_chart"), button("🧾 Proof", "proof")],
      [button("🐘 Walrus", "walrus"), button("📦 Evidence", "evidence")]
    )
  );
}

function portfolioPanel() {
  return panel(
    [
      "📊 *Portfolio*",
      LINE,
      "Proof-mode portfolio for the policy wallet.",
      "",
      "💼 *Holdings*",
      "├ SUI reserve: protected by policy",
      "├ USDC exposure: quote-only adapter",
      "├ JARVIS-PROOF: 3 receipts",
      "└ Risk queue: 0 open executions",
      "",
      "💰 *Total Assets:* ~$2,342",
      "💵 *Total Cost:* ~$2,165",
      "🟢 *Total PnL:* +$177 (+8.2%)",
      "",
      "_SUI limits and policy state are real testnet evidence; portfolio values are demo visualization._"
    ],
    rows(
      [button("📈 7D Chart", "portfolio_chart"), button("🏷️ Limits", "limit")],
      [button("💰 Assets", "assets"), button("📦 Evidence", "evidence")],
      backRow()
    )
  );
}

function portfolioChartPanel() {
  return panel(
    [
      "📈 *Performance Chart (7D)*",
      LINE,
      "```",
      "  $2,400 ┤         ╭──╮",
      "  $2,350 ┤      ╭──╯  │",
      "  $2,300 ┤   ╭──╯     ╰──╮",
      "  $2,250 ┤╭──╯            ╰─",
      "  $2,200 ┤╯",
      "  $2,150 ┤",
      "         └────────────────",
      "          Mon Tue Wed Thu Fri Sat Sun",
      "```",
      "📊 Weekly: *+8.2%* | High: $2,410 | Low: $2,150",
      "",
      "Interpretation: demo portfolio recovered only when policy-allowed actions were used."
    ],
    rows(
      [button("📊 Portfolio", "portfolio"), button("🔄 Swap", "swap_menu")],
      backRow()
    )
  );
}

function limitPanel() {
  return panel(
    [
      "🏷️ *Limit Orders*",
      LINE,
      "*Active Guarded Intents:*",
      "",
      "├ #102 🟢 BUY SUI/USDC @ 3.50",
      "│  Policy: allow if notional ≤ 0.5 SUI",
      "├ #103 🔴 SELL SUI/CETUS @ 0.012",
      "│  Policy: quote-only until route is allowlisted",
      "└ #104 ⏸ ANY after pause",
      "   Policy: blocked by `policy_active`",
      "",
      "*Create New Limit Order:*",
      "`limit buy SUI/USDC 3.50 100`",
      "",
      "_Submission version shows the policy gate; queued order persistence is the next build step._"
    ],
    rows(
      [button("✅ Allowed Proof", "proof_allowed"), button("⛔ Blocked Proof", "proof_blocked")],
      [button("⏸ Pause Proof", "proof_pause")],
      backRow()
    )
  );
}

function whalePanel() {
  return panel(
    [
      "🐋 *Whale Tracker*",
      LINE,
      "⏰ 22:00 HKT | Filter: >10K SUI",
      "",
      "├ 42K SUI → DeepBook settlement cluster",
      "├ 18K SUI → Cetus LP movement",
      "└ 11K SUI → new object owner",
      "",
      "📊 Large movements (3h): *7*",
      "💰 Simulated volume: *$1.84M*",
      "",
      "_Whale data is a signal source only. Jarvis cannot trade unless the policy gate passes._"
    ],
    rows(
      [button("📊 Whale Stats", "whale_stats"), button("📢 Signals", "signals")],
      [button("🤖 Strategy", "strategy")],
      backRow()
    )
  );
}

function whaleStatsPanel() {
  return panel(
    [
      "📊 *Whale Stats (24h)*",
      LINE,
      "🟢 *Net Inflow:* +2,450,000 SUI",
      "🔴 *Net Outflow:* -1,820,000 SUI",
      "📊 *Net Change:* +630,000 SUI",
      "",
      "🐋 *Active Whales:* 23 addresses",
      "💰 *Largest Single:* 500,000 SUI",
      "📈 *Trend:* Bullish, but policy still controls action.",
      "",
      "_Source: simulated Sui object movement model for reviewer demo._"
    ],
    rows([button("🐋 Whale Tracker", "whale"), button("📢 Signals", "signals")], backRow())
  );
}

function poolsPanel() {
  return panel(
    [
      "🌱 *New Pools — Sui DEX*",
      LINE,
      "├ SUI/USDC | APR 18.4% | Policy: allowlisted route",
      "├ SUI/CETUS | APR 41.2% | Policy: quote-only",
      "└ DEEP/SUI | APR 26.9% | Policy: DeepBook research lane",
      "",
      "📊 New in 24h: *3 pools*",
      "",
      "_High APR = high risk. The policy object blocks any route above the risk budget._"
    ],
    rows(
      [button("📈 Sort by APR", "pools_apr"), button("🔄 Swap Sandbox", "swap_menu")],
      [button("🔐 Policy", "policy")],
      backRow()
    )
  );
}

function poolsAprPanel() {
  return panel(
    [
      "🌱 *Pools Sorted by APR*",
      LINE,
      "",
      "1. SUI/CETUS  | 41.2% | Risk: High | BLOCK above 0.5 SUI",
      "2. DEEP/SUI   | 26.9% | Risk: Medium | DeepBook lane",
      "3. SUI/USDC   | 18.4% | Risk: Low | ALLOW under cap",
      "",
      "Policy takeaway: yield discovery is useful, but Sui object rules decide whether Jarvis can act."
    ],
    rows([button("🌱 Pools", "pools"), button("🔐 Policy", "policy")], backRow())
  );
}

function signalsPanel() {
  return panel(
    [
      "📢 *AI Trading Signals*",
      LINE,
      "⏰ 22:00 HKT | Engine: Jarvis AI v2.0",
      "",
      "🟢 *SUI/USDC* — Quote allowed",
      "├ Confidence: 74%",
      "├ Risk score: 22",
      "└ Policy: ALLOW under 0.5 SUI cap",
      "",
      "🟡 *SUI/CETUS* — Watch only",
      "├ Confidence: 61%",
      "├ Risk score: 39",
      "└ Policy: quote-only",
      "",
      "🔴 *Oversized route* — Blocked",
      "├ Risk score: 63",
      "└ Failed: `notional_cap, risk_score`",
      "",
      "⚠️ _Signals are not authority. Policy is authority._"
    ],
    rows(
      [button("🔄 Refresh Signals", "signals"), button("⚙️ Settings", "signals_settings")],
      [button("🧾 Run Proof", "proof"), button("🤖 Strategy", "strategy")],
      backRow()
    )
  );
}

function signalsSettingsPanel() {
  return panel(
    [
      "⚙️ *Signal Settings*",
      LINE,
      "📊 *Technical Indicators*",
      "  ✅ EMA (12/26)",
      "  ✅ RSI (14)",
      "  ✅ MACD (12,26,9)",
      "  ✅ Bollinger Bands (20,2)",
      "  ⬜ Fibonacci Retracement",
      "",
      "🔔 *Notifications*",
      "  ✅ Buy Signals",
      "  ✅ Sell Signals",
      "  ⬜ Hold Signals",
      "",
      "⏰ *Refresh Rate:* Every 5 minutes",
      "",
      "_Signal settings shape recommendations; Sui policy still gates execution._"
    ],
    rows([button("📢 Signals", "signals"), button("🤖 Strategy", "strategy")], backRow())
  );
}

function strategyPanel(selected = "") {
  const trend = selected === "strat_trend" ? "enabled for demo" : "watch only";
  const mean = selected === "strat_mean_reversion" ? "enabled for demo" : "watch only";
  const arb = selected === "strat_arbitrage" ? "enabled for demo" : "watch only";

  return panel(
    [
      "🤖 *AI Strategy Engine*",
      LINE,
      "🎯 *Active Strategy:* Policy Guard",
      "",
      "📊 *Signal Sources*",
      "  EMA · RSI · MACD · Volume · Sui object events",
      "",
      "📈 *Performance*",
      "  ├ Total proofs: 3",
      "  ├ Allowed: 1",
      "  ├ Blocked: 2",
      "  └ Audit coverage: 100%",
      "",
      "🔔 *Latest Decision*",
      "  Oversized SUI route blocked before execution.",
      "",
      `⚙️ Trend following: ${trend}`,
      `⚙️ Mean reversion: ${mean}`,
      `⚙️ DEX arbitrage: ${arb}`,
      "",
      "👇 Toggle strategies; each recommendation still becomes a policy-checked intent."
    ],
    rows(
      [button("Trend", "strat_trend"), button("Mean Rev", "strat_mean_reversion")],
      [button("Arbitrage", "strat_arbitrage"), button("🧾 Proof", "proof")],
      backRow()
    )
  );
}

function policyPanel() {
  return panel(
    [
      "🔐 *Policy Object*",
      LINE,
      "Move-owned guardrail for every Jarvis action.",
      "",
      "🌐 *State*",
      `├ Network: *${demoPolicy.network}*`,
      `├ Status: *${demoPolicy.status}*`,
      `├ Owner: \`${shortAddress(demoPolicy.owner)}\``,
      `└ Agent: \`${shortAddress(demoPolicy.agent)}\``,
      "",
      "💰 *Budget*",
      `├ Max per action: *${mistToSui(demoPolicy.budget.maxPerActionMist)} SUI*`,
      `├ Daily limit: *${mistToSui(demoPolicy.budget.dailyLimitMist)} SUI*`,
      `├ Spent today: *${mistToSui(demoPolicy.budget.spentTodayMist)} SUI*`,
      `└ Minimum reserve: *${mistToSui(demoPolicy.budget.minReserveMist)} SUI*`,
      "",
      "🧪 *Checks*",
      "active · expiry · agent match · protocol · recipient · cap · daily limit · reserve · risk score",
      "",
      `📦 Package: \`${shortAddress(evidence.packageId)}\``
    ],
    rows(
      [button("✅ Allowed Proof", "proof_allowed"), button("⛔ Blocked Proof", "proof_blocked")],
      [urlButton("Open Policy", explorerObject(evidence.policyObject))],
      backRow()
    )
  );
}

function proofPanel(arg = "") {
  if (arg.includes("blocked")) return blockedProofPanel();
  if (arg.includes("pause")) return pauseProofPanel();
  if (arg.includes("allowed")) return allowedProofPanel();

  return panel(
    [
      "🧾 *Policy Proofs*",
      LINE,
      "Three proof paths show what Jarvis may and may not do.",
      "",
      allowedProofText().join("\n"),
      "",
      blockedProofText().join("\n"),
      "",
      pauseProofText().join("\n")
    ],
    rows(
      [button("✅ Allowed", "proof_allowed"), button("⛔ Blocked", "proof_blocked")],
      [button("⏸ Paused", "proof_pause"), button("🐘 Walrus", "walrus")],
      backRow()
    )
  );
}

function allowedProofPanel() {
  return panel(allowedProofText(), rows([button("🔐 Policy", "policy"), button("🐘 Walrus", "walrus")], backRow()));
}

function blockedProofPanel() {
  return panel(blockedProofText(), rows([button("🔐 Policy", "policy"), button("🔄 Swap", "swap_menu")], backRow()));
}

function pauseProofPanel() {
  return panel(pauseProofText(), rows([button("🔐 Policy", "policy"), button("📦 Evidence", "evidence")], backRow()));
}

function yieldPanel() {
  return panel(
    [
      "💎 *JarvisUSD Yield Panel*",
      LINE,
      "Old Jarvis exposed StableLayer-style mint, burn, and yield routes. The Overflow build keeps the panel as a product surface, but routes every action through policy first.",
      "",
      "📊 *Protocol Data*",
      "├ Total supply: 24,000 JarvisUSD",
      "├ Underlying reserve: 24,000 USDC",
      "├ Current APY: 6.8%",
      "└ Underlying: Bucket Savings Pool + auto-compound",
      "",
      "🛡️ *Submission rule*",
      "Mint/burn buttons are disabled in proof mode. They can only become testnet actions after policy approval.",
      "",
      "_This keeps the old product story without asking reviewers to trust a custody bot._"
    ],
    rows(
      [button("💎 Mint Demo", "proof_allowed"), button("🔥 Burn Demo", "proof_blocked")],
      [button("📈 Yield", "portfolio_chart"), button("🔐 Policy", "policy")],
      backRow()
    )
  );
}

function sniperPanel() {
  return panel(
    [
      "🎯 *Social Sniper*",
      LINE,
      "The old route suggested fast action from market/social signals. The Overflow version turns it into a policy-bounded intent queue.",
      "",
      "📡 *Signal Pipeline*",
      "Social mention → confidence score → DeFi intent → Sui policy gate → audit receipt",
      "",
      "🧯 *Guardrails*",
      "├ No auto-sniping from Telegram",
      "├ No mainnet execution",
      "└ Any high-risk route becomes a blocked proof",
      "",
      "_Fast signal is useful only when slow policy is mandatory._"
    ],
    rows(
      [button("📢 Signals", "signals"), button("⛔ Blocked Proof", "proof_blocked")],
      backRow()
    )
  );
}

function walrusPanel() {
  return panel(
    [
      "🐘 *Walrus Decentralized Logs*",
      LINE,
      "Every approved Jarvis action should produce reviewable proof metadata. Walrus is the durable receipt layer.",
      "",
      "📦 *On-chain Logs*",
      `├ Allowed action: \`${shortDigest(evidence.walrusBlob)}\``,
      "├ Blocked action: local receipt only",
      "└ Pause block: Sui tx evidence",
      "",
      "📊 Total: *1 blob* | Size: ~6.7KB",
      `🔍 Blob ID: \`${evidence.walrusBlob}\``,
      "",
      "_All submission evidence is linked from the website and README._"
    ],
    rows(
      [button("🐘 Upload Demo", "walrus_upload"), button("🧾 Proof", "proof")],
      [button("📦 Evidence", "evidence")],
      [urlButton("Demo Site", evidence.siteUrl)],
      backRow()
    )
  );
}

function walrusUploadPanel() {
  return panel(
    [
      "🐘 *Uploading log...*",
      "",
      "✅ Upload successful!",
      `📦 Blob ID: \`${evidence.walrusBlob}\``,
      "📊 Size: 6.7KB",
      "⏱ Storage: testnet Walrus",
      "",
      "_Data is stored as an audit receipt for reviewer verification._"
    ],
    rows([button("🐘 Walrus", "walrus"), button("📦 Evidence", "evidence")], backRow())
  );
}

function vaultPanel() {
  return panel(
    [
      "🔐 *Vault Smart Contract*",
      LINE,
      "Funds and authority are modeled through Move contracts, not broad Telegram custody.",
      "",
      "📦 *Contract Info*",
      `├ Package: \`${evidence.packageId}\``,
      `├ Policy: \`${evidence.policyObject}\``,
      "└ Network: Sui testnet",
      "",
      "🛡️ *Security Features*",
      "├ Owner/agent separation",
      "├ Per-action notional limit",
      "├ Daily spend limit",
      "├ Emergency pause",
      "└ On-chain event receipt",
      "",
      "📊 *Proofs:* create policy · record action · pause · reject post-pause action"
    ],
    rows(
      [urlButton("Package", explorerObject(evidence.packageId)), urlButton("Policy", explorerObject(evidence.policyObject))],
      [button("📦 Evidence", "evidence")],
      backRow()
    )
  );
}

function evidencePanel() {
  return panel(
    [
      "📦 *Submission Evidence*",
      LINE,
      "",
      "🌐 *Public Links*",
      "├ Website: live",
      "├ Demo video: live",
      "└ GitHub repo: public",
      "",
      "🔗 *Sui Testnet*",
      `├ Package: \`${shortAddress(evidence.packageId)}\``,
      `├ Policy: \`${shortAddress(evidence.policyObject)}\``,
      `├ Allowed tx: \`${shortDigest(evidence.actionTx)}\``,
      `├ Pause tx: \`${shortDigest(evidence.pauseTx)}\``,
      `└ Blocked tx: \`${shortDigest(evidence.blockedTx)}\``,
      "",
      `🐘 *Walrus:* \`${shortDigest(evidence.walrusBlob)}\``
    ],
    rows(
      [urlButton("Website", evidence.siteUrl), urlButton("GitHub", evidence.repoUrl)],
      [urlButton("Demo Video", evidence.videoUrl)],
      backRow()
    )
  );
}

function logsPanel() {
  return panel(
    [
      "📋 *Operation Logs*",
      LINE,
      "*Recent*",
      "├ `bot_start` — reviewer session opened",
      "├ `quote_allowed` — SUI/USDC under policy cap",
      "├ `quote_blocked` — oversized route rejected",
      "└ `policy_pause` — post-pause action blocked",
      "",
      "🐘 *Walrus On-chain Logs*",
      `├ allowed-action: \`${shortDigest(evidence.walrusBlob)}\``,
      "└ pending: blocked receipts remain local proof artifacts",
      "",
      "📊 Total: 4 entries | On-chain: 1 entry"
    ],
    rows(
      [button("🐘 Walrus", "walrus"), button("📦 Evidence", "evidence")],
      [button("📊 Dashboard", "dashboard")],
      backRow()
    )
  );
}

function statusPanel() {
  return panel(
    [
      "⚙️ *Settings / Status*",
      LINE,
      "🌐 Network: Sui testnet",
      "📦 Mode: Demo (policy proof)",
      "🔔 Notifications: On",
      "💰 Slippage: 0.5%",
      "⛽ Gas Budget: 0.01 SUI",
      "",
      "✅ Public site: live",
      "✅ GitHub repo: public",
      "✅ Move package: deployed",
      "✅ Walrus receipt: uploaded",
      "✅ Telegram: running",
      "",
      "_Full version supports personal wallets and mainnet only after deliberate custody redesign._"
    ],
    rows(
      [button("💰 Assets", "assets"), button("🧾 Proof", "proof")],
      [button("📦 Evidence", "evidence")],
      backRow()
    )
  );
}

function helpPanel() {
  return panel(
    [
      "📖 *Sui Jarvis — Help*",
      LINE,
      "",
      "*📱 Commands*",
      "├ /start — Main Menu",
      "├ /dashboard — Product dashboard",
      "├ /assets — Policy wallet view",
      "├ /swap — Guarded quote sandbox",
      "├ /portfolio — Portfolio + chart",
      "├ /limit — Guarded intent queue",
      "├ /whale — Whale tracker",
      "├ /pools — Pool discovery",
      "├ /signals — AI trading signals",
      "├ /strategy — AI strategy manager",
      "├ /policy — Sui policy limits",
      "├ /proof — Allowed / blocked / paused proofs",
      "├ /walrus — Audit receipts",
      "├ /vault — Move package and policy object",
      "└ /evidence — All judge links",
      "",
      "*🔧 Architecture*",
      "• 🌊 Sui — Move policy object",
      "• 🐋 Cetus / DeepBook — route targets",
      "• 🐘 Walrus — decentralized logs",
      "• 🔐 Seal-ready — encrypted strategy data",
      "• 🤖 Jarvis — intent runner",
      "",
      "_Old Jarvis product surface is preserved; unsafe custody and live trading stay disabled._"
    ],
    rows(
      [button("📊 Dashboard", "dashboard"), button("📦 Evidence", "evidence")]
    )
  );
}

function unknownPanel() {
  return panel(
    [
      "🤖 *Jarvis Online*",
      LINE,
      "I did not recognize that command.",
      "",
      "Try:",
      "• /dashboard — product overview",
      "• /swap — guarded quote",
      "• /proof — policy evidence",
      "• /walrus — audit receipt",
      "• /help — full command list"
    ],
    rows([button("📊 Dashboard", "dashboard"), button("❓ Help", "help")])
  );
}

function executionDisabledPanel(pair) {
  return panel(
    [
      `✅ *Trade Simulation Executed*`,
      LINE,
      `📥 Intent: ${pair}`,
      "⏱ Confirm time: <1s",
      "🐘 Logged to Walrus receipt layer",
      "",
      "⚠️ _Demo Mode — Telegram live trading is disabled._",
      "",
      "The button demonstrates product flow; real execution requires a funded test wallet and policy-approved PTB."
    ],
    rows(
      [button("🔐 Policy", "policy"), button("🧾 Proof", "proof")],
      backRow()
    )
  );
}

function allowedProofText() {
  const risk = evaluateIntent(demoPolicy, allowedIntent, demoNow);
  const receipt = createAuditRecord({
    policy: demoPolicy,
    intent: allowedIntent,
    risk,
    walrusBlobId: `walrus://testnet/${evidence.walrusBlob}`
  });

  return [
    "✅ *Allowed Proof*",
    MINI_LINE,
    `📥 Intent: ${allowedIntent.note}`,
    `💰 Amount: *${mistToSui(allowedIntent.amountMist)} SUI*`,
    `🧠 Risk score: *${allowedIntent.riskScore}/${demoPolicy.maxRiskScore}*`,
    `🛡️ Decision: *${risk.allowed ? "ALLOW" : "BLOCK"}*`,
    `🧾 Receipt: \`${shortDigest(receipt.digest)}\``,
    `🐘 Walrus: \`${receipt.walrusBlobId}\``
  ];
}

function blockedProofText() {
  const risk = evaluateIntent(demoPolicy, blockedIntent, demoNow);
  const receipt = createAuditRecord({
    policy: demoPolicy,
    intent: blockedIntent,
    risk
  });

  return [
    "⛔ *Blocked Proof*",
    MINI_LINE,
    `📥 Intent: ${blockedIntent.note}`,
    `💰 Amount: *${mistToSui(blockedIntent.amountMist)} SUI*`,
    `🧠 Risk score: *${blockedIntent.riskScore}/${demoPolicy.maxRiskScore}*`,
    `🛡️ Decision: *${risk.allowed ? "ALLOW" : "BLOCK"}*`,
    `❌ Failed checks: \`${risk.failedChecks.join(", ")}\``,
    `🧾 Receipt: \`${shortDigest(receipt.digest)}\``
  ];
}

function pauseProofText() {
  const pausedPolicy = { ...demoPolicy, status: "paused" };
  const risk = evaluateIntent(pausedPolicy, allowedIntent, demoNow);
  const receipt = createAuditRecord({
    policy: pausedPolicy,
    intent: allowedIntent,
    risk,
    source: "local-demo-paused-policy"
  });

  return [
    "⏸ *Pause Proof*",
    MINI_LINE,
    `🔐 Policy status: *${pausedPolicy.status}*`,
    `🛡️ Decision: *${risk.allowed ? "ALLOW" : "BLOCK"}*`,
    `❌ Failed checks: \`${risk.failedChecks.join(", ")}\``,
    `🧾 Receipt: \`${shortDigest(receipt.digest)}\``,
    `🔗 Blocked tx: \`${shortDigest(evidence.blockedTx)}\``
  ];
}

function mainKeyboard() {
  return rows(
    [button("📊 Dashboard", "dashboard"), button("💰 Assets", "assets")],
    [button("🔄 Swap", "swap_menu"), button("📈 Portfolio", "portfolio")],
    [button("🏷️ Limit", "limit"), button("🐋 Whale", "whale")],
    [button("🌱 Pools", "pools"), button("📢 Signals", "signals")],
    [button("🤖 Strategy", "strategy"), button("🔐 Policy", "policy")],
    [button("🧾 Proof", "proof"), button("🐘 Walrus", "walrus")],
    [button("🔐 Vault", "vault"), button("📋 Logs", "logs")],
    [button("📦 Evidence", "evidence"), button("❓ Help", "help")]
  );
}

function backRow() {
  return [button("🔙 Back to Menu", "menu")];
}

function button(text, callbackData) {
  return { text, callback_data: callbackData };
}

function urlButton(text, url) {
  return { text, url };
}

function rows(...items) {
  return { inline_keyboard: items };
}

function panel(lines, replyMarkup) {
  return {
    text: Array.isArray(lines) ? lines.join("\n") : lines,
    reply_markup: replyMarkup
  };
}

async function sendDenied(chatId) {
  await sendPanel(chatId, panel("This Sui Jarvis demo bot is allowlisted for reviewers only.", undefined));
}

async function sendPanel(chatId, item) {
  await telegram("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
  await sendTelegramMessage("sendMessage", {
    chat_id: chatId,
    text: item.text,
    reply_markup: item.reply_markup,
    parse_mode: "Markdown",
    disable_web_page_preview: true
  });
}

async function editOrSendPanel(chatId, messageId, item) {
  try {
    await sendTelegramMessage("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: item.text,
      reply_markup: item.reply_markup,
      parse_mode: "Markdown",
      disable_web_page_preview: true
    });
  } catch (error) {
    if (error.message.includes("message is not modified")) return;
    await sendPanel(chatId, item);
  }
}

async function sendTelegramMessage(method, payload) {
  try {
    return await telegram(method, payload);
  } catch (error) {
    if (!String(error.message).toLowerCase().includes("parse")) throw error;
    const fallback = { ...payload };
    delete fallback.parse_mode;
    return telegram(method, fallback);
  }
}

async function telegram(method, payload) {
  const body = JSON.stringify(payload);
  const apiIp = process.env.TELEGRAM_API_IP;
  const timeoutMs = method === "getUpdates"
    ? Number(payload.timeout || 30) * 1000 + 15000
    : 30000;

  const responseText = await new Promise((resolve, reject) => {
    const request = https.request({
      hostname: "api.telegram.org",
      port: 443,
      path: `/bot${token}/${method}`,
      method: "POST",
      timeout: timeoutMs,
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(body)
      },
      lookup: apiIp
        ? (_hostname, options, callback) => {
          if (options?.all) {
            callback(null, [{ address: apiIp, family: 4 }]);
            return;
          }
          callback(null, apiIp, 4);
        }
        : undefined
    }, (response) => {
      let text = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        text += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Telegram ${method} failed with HTTP ${response.statusCode}`));
          return;
        }
        resolve(text);
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error(`Telegram ${method} timed out after ${timeoutMs}ms`));
    });
    request.on("error", reject);
    request.end(body);
  });

  const json = JSON.parse(responseText);
  if (!json?.ok) {
    throw new Error(json?.description || `Telegram ${method} failed`);
  }
  return json;
}

function isAllowed(fromId, chatId) {
  if (!allowedUserIds.size) return true;
  return allowedUserIds.has(String(fromId)) || allowedUserIds.has(String(chatId));
}

function parseAllowedUserIds(value = "") {
  return new Set(value.split(",").map((item) => item.trim()).filter(Boolean));
}

function loadLocalEnv() {
  if (!existsSync(".env")) return;
  const text = readFileSync(".env", "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function mistToSui(value) {
  return Number(value / 1_000_000_000).toFixed(3).replace(/\.?0+$/, "");
}

function shortAddress(value) {
  if (!value || value.length < 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

function shortDigest(value) {
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

function formatCommandList() {
  return telegramCommands.map(({ command }) => `/${command}`).join(" ");
}

function explorerObject(objectId) {
  return `https://suiscan.xyz/testnet/object/${objectId}`;
}

function printDryPanel(label, item) {
  console.log(`\n> ${label}`);
  console.log(item.text);
  if (item.reply_markup?.inline_keyboard) {
    const controls = item.reply_markup.inline_keyboard
      .map((row) => row.map((entry) => entry.text).join(" | "))
      .join("\n");
    console.log(`\n[buttons]\n${controls}`);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
