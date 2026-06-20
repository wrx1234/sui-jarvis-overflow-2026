#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";

const dryRun = process.argv.includes("--dry-run");
const avatarArg = process.argv.find((arg) => arg.startsWith("--avatar="));
const avatarPath = resolve(avatarArg ? avatarArg.slice("--avatar=".length) : "site/telegram-bot-avatar.jpg");

const profile = Object.freeze({
  name: "Sui Jarvis",
  shortDescription: "Policy-bound Sui agent wallet for Overflow 2026.",
  description:
    "Sui Jarvis is a policy-bound Telegram agent for Sui. It proves AI actions can be capped, paused, blocked, and audited on Sui testnet with Walrus receipts.",
  commands: [
    { command: "start", description: "open the main menu" },
    { command: "assets", description: "inspect the policy wallet view" },
    { command: "swap", description: "open the guarded quote sandbox" },
    { command: "policy", description: "show Sui policy limits" },
    { command: "proof", description: "show allowed, blocked, and paused proofs" },
    { command: "walrus", description: "show audit receipt evidence" },
    { command: "evidence", description: "show judge links" },
    { command: "help", description: "list commands" }
  ]
});

loadLocalEnv();

if (!existsSync(avatarPath)) {
  console.error(`Missing avatar file: ${avatarPath}`);
  process.exit(1);
}

const avatar = {
  path: avatarPath,
  filename: basename(avatarPath),
  bytes: statSync(avatarPath).size,
  contentType: avatarPath.toLowerCase().endsWith(".jpg") || avatarPath.toLowerCase().endsWith(".jpeg")
    ? "image/jpeg"
    : "image/png"
};

if (dryRun) {
  console.log(JSON.stringify({
    action: "configure-telegram-profile",
    dryRun: true,
    profile,
    avatar: {
      path: avatar.path,
      filename: avatar.filename,
      bytes: avatar.bytes,
      contentType: avatar.contentType
    },
    needsEnv: "TELEGRAM_BOT_TOKEN"
  }, null, 2));
  process.exit(0);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN. Put it in local .env or the deployment secret store.");
  process.exit(1);
}

const identity = await telegramJson("getMe", {});
const handle = identity.result?.username ? `@${identity.result.username}` : identity.result?.first_name || "unknown bot";
console.log(`Configuring Telegram profile for ${handle}.`);

await telegramJson("setMyName", { name: profile.name });
console.log("Set bot name.");

await telegramJson("setMyShortDescription", { short_description: profile.shortDescription });
console.log("Set short description.");

await telegramJson("setMyDescription", { description: profile.description });
console.log("Set description.");

await telegramJson("setMyCommands", { commands: profile.commands });
console.log("Set commands.");

await setProfilePhoto(avatar);
console.log("Set profile photo.");

console.log("Telegram profile configuration complete.");

async function setProfilePhoto(file) {
  const form = new FormData();
  form.append("photo", JSON.stringify({
    type: "static",
    photo: "attach://profile_photo"
  }));
  form.append("profile_photo", new Blob([readFileSync(file.path)], { type: file.contentType }), file.filename);

  const response = await fetch(`https://api.telegram.org/bot${token}/setMyProfilePhoto`, {
    method: "POST",
    body: form
  });

  const json = await response.json().catch(() => undefined);
  if (!response.ok || !json?.ok) {
    throw new Error(json?.description || `Telegram setMyProfilePhoto failed with HTTP ${response.status}`);
  }
  return json;
}

async function telegramJson(method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await response.json().catch(() => undefined);
  if (!response.ok || !json?.ok) {
    throw new Error(json?.description || `Telegram ${method} failed with HTTP ${response.status}`);
  }
  return json;
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
