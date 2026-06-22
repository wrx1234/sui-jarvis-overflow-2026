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

const callbackAliases = new Map([
  ["back", "menu"],
  ["dashboard", "menu"],
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
    "/assets",
    "/swap",
    "swap_SUI/USDC",
    "/portfolio",
    "/signals",
    "/strategy",
    "/policy",
    "/proof",
    "/proof blocked",
    "/proof pause",
    "/walrus",
    "/vault",
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
console.log("Commands: /start /assets /swap /portfolio /signals /strategy /policy /proof /walrus /vault /evidence /help");

try {
  const identity = await telegram("getMe", {});
  const handle = identity.result?.username ? `@${identity.result.username}` : identity.result?.first_name || "unknown bot";
  console.log(`Connected to Telegram as ${handle}.`);
  await telegram("deleteWebhook", { drop_pending_updates: false });
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
    await telegram("answerCallbackQuery", { callback_query_id: query.id });
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
    case "/strategy":
      return strategyPanel();
    case "/policy":
      return policyPanel();
    case "/proof":
      return proofPanel(arg);
    case "/mint":
    case "/burn":
    case "/yield":
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
    case "assets":
      return assetsPanel();
    case "swap_menu":
      return swapPanel();
    case "portfolio":
      return portfolioPanel();
    case "limit":
      return limitPanel();
    case "whale":
      return whalePanel();
    case "pools":
      return poolsPanel();
    case "signals":
      return signalsPanel();
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
    case "vault":
      return vaultPanel();
    case "evidence":
      return evidencePanel();
    case "status":
      return statusPanel();
    case "help":
      return helpPanel();
    default:
      return unknownPanel();
  }
}

function menuPanel() {
  return panel(
    [
      "Sui Jarvis",
      "Policy-bound Telegram agent for Sui Overflow 2026.",
      "",
      "Mode: reviewer proof demo",
      "Network: Sui testnet",
      "Execution: Telegram live trading disabled",
      "",
      "Use the old Jarvis-style menu below to inspect assets, quotes, signals, strategy, Walrus receipts, and policy controls."
    ],
    mainKeyboard()
  );
}

function assetsPanel() {
  return panel(
    [
      "Assets",
      "",
      "This reboot does not create per-user custodial wallets inside Telegram.",
      "",
      `Policy object: ${shortAddress(evidence.policyObject)}`,
      `Package: ${shortAddress(evidence.packageId)}`,
      `Max per action: ${mistToSui(demoPolicy.budget.maxPerActionMist)} SUI`,
      `Daily limit: ${mistToSui(demoPolicy.budget.dailyLimitMist)} SUI`,
      `Minimum reserve: ${mistToSui(demoPolicy.budget.minReserveMist)} SUI`,
      "",
      "Judge takeaway: Jarvis can propose actions, but Sui policy limits define what it is allowed to execute."
    ],
    rows(
      [button("Policy", "policy"), button("Proof", "proof")],
      [urlButton("Policy Object", explorerObject(evidence.policyObject))],
      backRow()
    )
  );
}

function swapPanel() {
  return panel(
    [
      "Swap Quote Sandbox",
      "",
      "Old Jarvis had a direct swap menu. In this Overflow version, the same entry first runs through policy gates.",
      "",
      "Adapters: Cetus / DeepBook simulation",
      "No mainnet funds are moved from Telegram.",
      "",
      "Choose a pair to see the guarded quote flow."
    ],
    rows(
      [button("SUI -> USDC", "swap_SUI/USDC"), button("USDC -> SUI", "swap_USDC/SUI")],
      [button("SUI -> CETUS", "swap_SUI/CETUS"), button("SUI -> DEEP", "swap_SUI/DEEP")],
      [button("Blocked 1.2 SUI", "proof_blocked"), button("Paused Proof", "proof_pause")],
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
      `Quote: ${pair}`,
      "",
      `Route: ${pair.includes("DEEP") ? "DeepBook adapter" : "Cetus adapter"} -> policy gate -> audit receipt`,
      `Intent amount: ${mistToSui(intent.amountMist)} SUI`,
      `Risk score: ${intent.riskScore}/${demoPolicy.maxRiskScore}`,
      `Decision: ${risk.allowed ? "ALLOW" : "BLOCK"}`,
      risk.failedChecks.length ? `Failed checks: ${risk.failedChecks.join(", ")}` : "Failed checks: none",
      `Receipt: ${shortDigest(receipt.digest)}`,
      "",
      "Execution is intentionally disabled in Telegram until the reviewer switches from proof mode to a funded test wallet."
    ],
    rows(
      [button("Policy", "policy"), button("Walrus", "walrus")],
      [button("Try another pair", "swap_menu")],
      backRow()
    )
  );
}

function portfolioPanel() {
  return panel(
    [
      "Portfolio",
      "",
      "Reviewer view for the policy wallet:",
      "",
      "SUI reserve: protected by minReserveMist",
      "Daily spent: 0.3 / 1.5 SUI",
      "Open risky actions: 0",
      "Paused state: true after demo pause tx",
      "",
      "This is deliberately object-first: the Sui policy object is the product state, Telegram is only the console."
    ],
    rows(
      [button("Assets", "assets"), button("Limit", "limit")],
      [button("Evidence", "evidence")],
      backRow()
    )
  );
}

function limitPanel() {
  return panel(
    [
      "Limit Orders",
      "",
      "Guarded-intent queue:",
      "",
      "1. Swap 0.3 SUI through allowlisted route - allowed proof",
      "2. Swap 1.2 SUI - blocked by per-action cap and risk score",
      "3. Any action after pause - blocked by policy_active",
      "",
      "Next implementation step: persist queued intents as Sui objects instead of local demo records."
    ],
    rows(
      [button("Allowed Proof", "proof_allowed"), button("Blocked Proof", "proof_blocked")],
      [button("Pause Proof", "proof_pause")],
      backRow()
    )
  );
}

function whalePanel() {
  return panel(
    [
      "Whale Tracker",
      "",
      "Old Jarvis used this as a market-intel screen.",
      "",
      "Overflow-safe version:",
      "Detect large Sui object movements -> classify risk -> suggest but do not auto-trade.",
      "",
      "Status: product direction kept; live data adapter not enabled for submission demo."
    ],
    rows(
      [button("Signals", "signals"), button("Strategy", "strategy")],
      backRow()
    )
  );
}

function poolsPanel() {
  return panel(
    [
      "Pools",
      "",
      "Pool discovery is useful, but not the main judging proof.",
      "",
      "Submission framing:",
      "Cetus / DeepBook pools are possible action targets.",
      "Jarvis proves whether an agent may use them under user-defined limits.",
      "",
      "Status: adapter stub; policy and audit proof are live."
    ],
    rows(
      [button("Swap Sandbox", "swap_menu"), button("Policy", "policy")],
      backRow()
    )
  );
}

function signalsPanel() {
  return panel(
    [
      "Signals",
      "",
      "Signal confidence is not authority.",
      "",
      "Example signal:",
      "Pair: SUI/USDC",
      "Action: quote only",
      "Risk score: 22",
      "Policy result: allowed under 0.5 SUI cap",
      "",
      "Judge takeaway: AI output is constrained by Sui-native guardrails before any execution."
    ],
    rows(
      [button("Run Proof", "proof"), button("Strategy", "strategy")],
      backRow()
    )
  );
}

function strategyPanel(selected = "") {
  const trend = selected === "strat_trend" ? "enabled for demo" : "watch only";
  const mean = selected === "strat_mean_reversion" ? "enabled for demo" : "watch only";
  const arb = selected === "strat_arbitrage" ? "enabled for demo" : "watch only";

  return panel(
    [
      "Strategy",
      "",
      `Trend following: ${trend}`,
      `Mean reversion: ${mean}`,
      `DEX arbitrage: ${arb}`,
      "",
      "The strategy layer can recommend an intent. The Sui policy object still decides whether that intent is valid.",
      "",
      "For the hackathon demo, one allowed intent, one oversized intent, and one paused-policy block are enough to show the control model."
    ],
    rows(
      [button("Trend", "strat_trend"), button("Mean Rev", "strat_mean_reversion")],
      [button("Arbitrage", "strat_arbitrage"), button("Proof", "proof")],
      backRow()
    )
  );
}

function policyPanel() {
  return panel(
    [
      "Policy Object",
      "",
      `Network: ${demoPolicy.network}`,
      `Status: ${demoPolicy.status}`,
      `Owner: ${shortAddress(demoPolicy.owner)}`,
      `Agent: ${shortAddress(demoPolicy.agent)}`,
      `Max per action: ${mistToSui(demoPolicy.budget.maxPerActionMist)} SUI`,
      `Daily limit: ${mistToSui(demoPolicy.budget.dailyLimitMist)} SUI`,
      `Spent today: ${mistToSui(demoPolicy.budget.spentTodayMist)} SUI`,
      `Minimum reserve: ${mistToSui(demoPolicy.budget.minReserveMist)} SUI`,
      `Max risk score: ${demoPolicy.maxRiskScore}`,
      `Allowlisted protocols: ${demoPolicy.allowlists.protocols.join(", ")}`,
      "",
      "Checks: active, expiry, agent match, protocol, recipient, cap, daily limit, reserve, risk score."
    ],
    rows(
      [button("Allowed Proof", "proof_allowed"), button("Blocked Proof", "proof_blocked")],
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
      "Proofs",
      "",
      allowedProofText().join("\n"),
      "",
      blockedProofText().join("\n"),
      "",
      pauseProofText().join("\n")
    ],
    rows(
      [button("Allowed", "proof_allowed"), button("Blocked", "proof_blocked")],
      [button("Paused", "proof_pause"), button("Walrus", "walrus")],
      backRow()
    )
  );
}

function allowedProofPanel() {
  return panel(allowedProofText(), rows([button("Policy", "policy"), button("Walrus", "walrus")], backRow()));
}

function blockedProofPanel() {
  return panel(blockedProofText(), rows([button("Policy", "policy"), button("Swap", "swap_menu")], backRow()));
}

function pauseProofPanel() {
  return panel(pauseProofText(), rows([button("Policy", "policy"), button("Evidence", "evidence")], backRow()));
}

function yieldPanel() {
  return panel(
    [
      "Yield / Mint",
      "",
      "The old bot had StableLayer-style mint and yield panels.",
      "",
      "For Overflow 2026, this route is intentionally reduced to a guarded DeFi adapter concept:",
      "1. User or AI proposes a DeFi intent.",
      "2. Policy object checks budget and allowlist.",
      "3. Allowed action emits an audit receipt.",
      "4. Telegram does not mint, burn, or move real funds in proof mode.",
      "",
      "Reason: reviewers should see bounded authority, not a broad trading bot."
    ],
    rows(
      [button("Policy", "policy"), button("Proof", "proof")],
      backRow()
    )
  );
}

function sniperPanel() {
  return panel(
    [
      "Sniper",
      "",
      "Old route kept as a familiar demo entry, but automatic sniping is disabled.",
      "",
      "Overflow framing:",
      "Signal -> intent -> policy gate -> audit receipt.",
      "",
      "Any high-risk or non-allowlisted action must be blocked before execution."
    ],
    rows(
      [button("Signals", "signals"), button("Blocked Proof", "proof_blocked")],
      backRow()
    )
  );
}

function walrusPanel() {
  return panel(
    [
      "Walrus Receipt",
      "",
      "Jarvis stores audit receipts as durable evidence.",
      "",
      `Blob ID: ${evidence.walrusBlob}`,
      "Content: allowed-action audit JSON",
      "Role: receipt / agent memory layer",
      "",
      "Use the demo site or repository evidence doc for the full verification commands."
    ],
    rows(
      [button("Evidence", "evidence"), button("Proof", "proof")],
      [urlButton("Demo Site", evidence.siteUrl)],
      backRow()
    )
  );
}

function vaultPanel() {
  return panel(
    [
      "Vault",
      "",
      "Move package: deployed",
      "Policy object: deployed",
      "Pause control: proven",
      "Post-pause block: proven",
      "",
      `Package: ${shortAddress(evidence.packageId)}`,
      `Policy: ${shortAddress(evidence.policyObject)}`,
      "",
      "This is the Sui-native core. Telegram is the reviewer-friendly control surface."
    ],
    rows(
      [urlButton("Package", explorerObject(evidence.packageId)), urlButton("Policy", explorerObject(evidence.policyObject))],
      [button("Evidence", "evidence")],
      backRow()
    )
  );
}

function evidencePanel() {
  return panel(
    [
      "Submission Evidence",
      "",
      `Website: ${evidence.siteUrl}`,
      `Demo video: ${evidence.videoUrl}`,
      `GitHub: ${evidence.repoUrl}`,
      `Package ID: ${evidence.packageId}`,
      `Policy object: ${evidence.policyObject}`,
      `Publish tx: ${evidence.publishTx}`,
      `Action tx: ${evidence.actionTx}`,
      `Pause tx: ${evidence.pauseTx}`,
      `Blocked tx: ${evidence.blockedTx}`,
      `Walrus blob: ${evidence.walrusBlob}`
    ],
    rows(
      [urlButton("Website", evidence.siteUrl), urlButton("GitHub", evidence.repoUrl)],
      [urlButton("Demo Video", evidence.videoUrl)],
      backRow()
    )
  );
}

function statusPanel() {
  return panel(
    [
      "Status",
      "",
      "Public site: live",
      "GitHub repo: public",
      "Move package: testnet deployed",
      "Walrus receipt: uploaded",
      "Telegram: deployable once TELEGRAM_BOT_TOKEN is set",
      "Mainnet trading: disabled",
      "Private-key custody: disabled",
      "",
      "Recommended reviewer path: /start -> Assets -> Swap -> Proof -> Walrus -> Evidence."
    ],
    rows(
      [button("Assets", "assets"), button("Proof", "proof")],
      [button("Evidence", "evidence")],
      backRow()
    )
  );
}

function helpPanel() {
  return panel(
    [
      "Help",
      "",
      "Commands:",
      "/start - main menu",
      "/assets - policy wallet view",
      "/swap - guarded quote sandbox",
      "/portfolio - policy wallet status",
      "/limit - guarded intent queue",
      "/whale - market intelligence panel",
      "/pools - pool adapter framing",
      "/signals - AI signal panel",
      "/strategy - strategy toggles",
      "/policy - Sui policy limits",
      "/proof - allowed / blocked / pause proofs",
      "/walrus - receipt evidence",
      "/vault - Move package and policy object",
      "/evidence - all judge links",
      "",
      "The old bot menu is preserved for the demo, but unsafe custody and live trading behavior are not enabled."
    ],
    rows(
      [button("Menu", "menu"), button("Evidence", "evidence")]
    )
  );
}

function unknownPanel() {
  return panel(
    [
      "Unknown command.",
      "",
      "Try /start, /swap, /policy, /proof, /walrus, or /evidence."
    ],
    rows([button("Menu", "menu"), button("Help", "help")])
  );
}

function executionDisabledPanel(pair) {
  return panel(
    [
      `Execute: ${pair}`,
      "",
      "Execution is disabled in the Telegram proof bot.",
      "",
      "Why:",
      "No reviewer should have to trust an AI bot with broad wallet custody.",
      "The demo proves the Sui policy gate, audit digest, pause, and block behavior first.",
      "",
      "Next step after submission: connect this button to a funded testnet wallet and emit a new on-chain action receipt."
    ],
    rows(
      [button("Policy", "policy"), button("Proof", "proof")],
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
    "Allowed Proof",
    `Intent: ${allowedIntent.note}`,
    `Amount: ${mistToSui(allowedIntent.amountMist)} SUI`,
    `Decision: ${risk.allowed ? "ALLOW" : "BLOCK"}`,
    `Receipt digest: ${shortDigest(receipt.digest)}`,
    `Walrus: ${receipt.walrusBlobId}`
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
    "Blocked Proof",
    `Intent: ${blockedIntent.note}`,
    `Amount: ${mistToSui(blockedIntent.amountMist)} SUI`,
    `Decision: ${risk.allowed ? "ALLOW" : "BLOCK"}`,
    `Failed checks: ${risk.failedChecks.join(", ")}`,
    `Receipt digest: ${shortDigest(receipt.digest)}`
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
    "Pause Proof",
    `Policy status: ${pausedPolicy.status}`,
    `Decision: ${risk.allowed ? "ALLOW" : "BLOCK"}`,
    `Failed checks: ${risk.failedChecks.join(", ")}`,
    `Receipt digest: ${shortDigest(receipt.digest)}`
  ];
}

function mainKeyboard() {
  return rows(
    [button("Assets", "assets"), button("Swap", "swap_menu")],
    [button("Portfolio", "portfolio"), button("Limit", "limit")],
    [button("Whale", "whale"), button("Pools", "pools")],
    [button("Signals", "signals"), button("Strategy", "strategy")],
    [button("Policy", "policy"), button("Proof", "proof")],
    [button("Yield", "yield"), button("Sniper", "sniper")],
    [button("Walrus", "walrus"), button("Vault", "vault")],
    [button("Evidence", "evidence"), button("Help", "help")]
  );
}

function backRow() {
  return [button("Back to Menu", "menu")];
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
  await telegram("sendMessage", {
    chat_id: chatId,
    text: item.text,
    reply_markup: item.reply_markup,
    disable_web_page_preview: true
  });
}

async function editOrSendPanel(chatId, messageId, item) {
  try {
    await telegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: item.text,
      reply_markup: item.reply_markup,
      disable_web_page_preview: true
    });
  } catch (error) {
    if (error.message.includes("message is not modified")) return;
    await sendPanel(chatId, item);
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
