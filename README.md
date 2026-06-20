# Sui Jarvis Overflow 2026

Clean reboot of the older Sui Jarvis / Telegram bot work for Sui Overflow 2026.

The old repository remains reference-only at:

`/Users/xuan/Documents/Sui/sui-hackathon`

Do not copy old runtime data, logs, `.env` files, bot tokens, private keys, or generated wallet files into this repo.

## Position

Sui Jarvis is a bounded agent wallet for Sui.

The user defines a Sui-native policy: max spend, daily cap, protocol allowlist, recipient allowlist, expiry, pause, and revoke. Jarvis can then propose or execute actions only inside that policy. Each action produces a deterministic risk result and an audit receipt that can be anchored to Sui and Walrus.

## Track Strategy

Primary track: The Agentic Web.

Secondary narrative: DeFi & Payments, only if the demo shows an actual payment or swap flow.

Walrus is a proof layer for receipts and agent memory. DeepBook or Cetus should be an adapter, not the whole project, unless we can ship a real trading flow in time.

## Why Not A Pure Telegram Bot

Telegram is a useful demo entrance, not the product. The competitive set already includes projects with testnet packages, live websites, videos, package IDs, policy objects, and revocation flows. A Telegram-only bot will look thin unless it proves bounded authority on Sui.

## Current Repo Status

This repo is a clean MVP scaffold:

- Local proof runner for policy enforcement and audit receipt hashing.
- Move contract scaffold for a shared policy object.
- Submission checklist, competitor scan, and demo script.
- No secrets and no copied old bot data.

Public links:

- GitHub: `https://github.com/wrx1234/sui-jarvis-overflow-2026`
- Demo site: `https://wrx1234.github.io/sui-jarvis-overflow-2026/`

Verified locally:

- `npm test` passes.
- `npm run site` serves the local judge-facing proof dashboard.
- `sui move build` passes with Sui CLI `1.73.0-homebrew`.
- `sui client publish` succeeded on Sui testnet.

## Testnet Evidence

| Item | Value |
| --- | --- |
| Network | Sui testnet |
| Package ID | `0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4` |
| Publish tx | `4AMeu8oNd93wZ97C5mZvwDT8Sv8eN1sAfYz48YV9tYBJ` |
| Policy object | `0x05890c9882df3a77bc6389bd895227f86343a2b7a3b48deb0c72a9ff76bb0f3c` |
| Policy created tx | `EgkEqzqQKaMxsZgLwMAkj9FioV6MXrQQ3G6vtAG2LU8C` |
| Action recorded tx | `S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9` |
| Pause tx | `55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC` |
| Post-pause blocked tx | `AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa` |
| Block reason | `record_action` abort code `3`, mapped to `E_PAUSED` |
| Walrus receipt blob | `IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU` |
| Walrus blob object | `0x4e07753366b797e96754d6b00fae4e28b903b4558ecd0c8a213d07b3cf89e059` |
| Demo site | `https://wrx1234.github.io/sui-jarvis-overflow-2026/` |

Explorer links:

- Package: `https://suiscan.xyz/testnet/object/0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4`
- Policy object: `https://suiscan.xyz/testnet/object/0x05890c9882df3a77bc6389bd895227f86343a2b7a3b48deb0c72a9ff76bb0f3c`
- Publish tx: `https://suiscan.xyz/testnet/tx/4AMeu8oNd93wZ97C5mZvwDT8Sv8eN1sAfYz48YV9tYBJ`
- Action recorded tx: `https://suiscan.xyz/testnet/tx/S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9`
- Pause tx: `https://suiscan.xyz/testnet/tx/55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC`
- Blocked tx: `https://suiscan.xyz/testnet/tx/AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa`

## Run The Local Proof

```bash
npm run demo:proof
```

To run the local proof dashboard:

```bash
npm run site
```

Expected result:

- One allowed intent passes policy checks.
- One oversized intent is blocked.
- One paused-policy attempt is blocked.
- Audit receipt digests are deterministic SHA-256 hashes.

## Delivery Targets

1. Deploy the static dashboard publicly.
2. Record a demo video with the package, policy, action, pause, and blocked transaction evidence.
3. Add Telegram as a thin command surface after policy proof is working.
4. Put package ID, transaction digest, Walrus blob ID, website, GitHub, and video in DeepSurge.

Receipt ready for Walrus upload:

`receipts/allowed-action.audit.json`

Uploaded Walrus blob:

`IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU`

## Security Rules

- Never commit real `TELEGRAM_BOT_TOKEN`, private keys, seed phrases, cookies, or API keys.
- Never commit bot logs, generated wallets, or user operation history.
- Keep `.env.example` placeholder-only.
- If using the old bot as reference, rotate old bot credentials before any public demo.
