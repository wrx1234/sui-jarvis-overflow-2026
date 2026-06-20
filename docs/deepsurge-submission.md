# DeepSurge Submission Draft

## Project Name

Sui Jarvis

## Track

The Agentic Web

## Short Description

Sui Jarvis is a policy-bound agent wallet for Sui. Users delegate narrow, revocable authority to an AI agent through a Sui-native policy: spending caps, daily limits, protocol and recipient allowlists, expiry, and pause control. Every agent intent is checked by policy and risk rules before execution, and every decision produces a deterministic audit receipt that can be anchored on Sui and Walrus.

## Long Description

AI agents are becoming useful enough to operate wallets, but broad wallet custody is unsafe. Sui Jarvis turns agent authority into a bounded object. A user defines the rules first: max spend, daily cap, protocol allowlist, recipient allowlist, expiry, and pause/revoke. Jarvis can propose or execute only inside those rules.

The demo shows three proofs:

1. An allowlisted 0.3 SUI action passes policy and risk checks.
2. An oversized 1.2 SUI action is blocked by the per-action cap and risk score.
3. After the owner pauses the policy, the same small action fails before execution.

Each decision creates a receipt digest, so reviewers can verify what the agent intended, which checks ran, and why the action was allowed or blocked. This submission publishes the Move policy package to Sui testnet, stores one receipt JSON on Walrus, and exposes the proof through a minimal web dashboard and optional Telegram command surface.

## Why Sui

Sui object ownership, shared objects, events, capabilities, and programmable transaction blocks are a natural fit for bounded agent authority. The policy can be represented as a Sui object, enforcement can happen before funds move, and audit receipts can link local agent intent to chain evidence.

## Current Evidence

- Local proof runner: `npm run demo:proof`
- Static demo site: `npm run site`
- Move module: `contracts/sources/agent_policy.move`
- Package ID: `0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4`
- Policy object: `0x05890c9882df3a77bc6389bd895227f86343a2b7a3b48deb0c72a9ff76bb0f3c`
- Publish tx: `4AMeu8oNd93wZ97C5mZvwDT8Sv8eN1sAfYz48YV9tYBJ`
- Action recorded tx: `S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9`
- Pause tx: `55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC`
- Post-pause blocked tx: `AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa`
- Walrus blob ID: `IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU`
- Walrus blob object: `0x4e07753366b797e96754d6b00fae4e28b903b4558ecd0c8a213d07b3cf89e059`
- GitHub URL: `https://github.com/wrx1234/sui-jarvis-overflow-2026`
- Website URL: `https://wrx1234.github.io/sui-jarvis-overflow-2026/`
- Video URL: pending upload

## Known Limitations

- Demo execution is on Sui testnet and focuses on policy events, pause control, and audit receipts rather than live mainnet trading.
- Walrus is used for one durable audit receipt, not a full production memory layer.
- Telegram is intentionally secondary; the core proof is the Sui policy object plus deterministic risk/audit flow.

## Demo Video Script

1. Open the static site and show the project status.
2. Show policy limits and allowlists.
3. Run `npm run demo:proof`.
4. Show allowed action receipt digest.
5. Show oversized action blocked.
6. Show paused policy blocking the same small action.
7. Show testnet package, policy object, action event, pause event, post-pause abort transaction, and Walrus receipt blob.
