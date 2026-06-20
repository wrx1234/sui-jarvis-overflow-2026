# Demo Video Script

Target length: 4:30 to 5:00.

## 0:00 - 0:20 Title

Show the local or public site.

Say:

> This is Sui Jarvis, a policy-bound agent wallet for Sui Overflow 2026, submitted to The Agentic Web track.

## 0:20 - 0:55 Problem

Show the policy panel.

Say:

> The problem is not whether an AI can propose wallet actions. The problem is how to restrict, revoke, and audit the authority we give it. Sui Jarvis turns agent authority into a Sui policy object.

## 0:55 - 1:35 Policy

Show:

- Max per action: 0.5 SUI.
- Daily limit: 1.5 SUI.
- Allowlisted protocols.
- Owner pause control.

Say:

> The agent can only act inside these limits. The owner can pause the policy at any time.

## 1:35 - 2:10 Local Proof

Run:

```bash
npm test
```

Show:

- Allowed action digest.
- Blocked oversized action.
- Pause proof.

Say:

> The local proof runner gives deterministic policy and risk results.

## 2:10 - 3:10 Testnet Evidence

Open `docs/evidence.md`.

Show:

- Package ID: `0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4`
- Policy object: `0x05890c9882df3a77bc6389bd895227f86343a2b7a3b48deb0c72a9ff76bb0f3c`
- Action recorded tx: `S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9`
- Pause tx: `55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC`

Say:

> This is not only a frontend proof. The Move package is published on Sui testnet and emits policy events.

## 3:10 - 3:55 Revocation Proof

Show:

- Blocked tx: `AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa`
- Abort code: `3`, mapped to `E_PAUSED`.

Say:

> After pause, the same record action fails on chain with E_PAUSED before it can record a new agent action.

## 3:55 - 4:25 Walrus Receipt

Show:

- Receipt file: `receipts/allowed-action.audit.json`
- Blob ID: `IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU`

Say:

> The audit receipt is also stored on Walrus. This ties the agent decision, receipt digest, and chain evidence into a replayable artifact.

## 4:25 - 4:50 Close

Return to the site.

Say:

> Sui Jarvis is not a bot with broad wallet custody. It is a bounded, revocable, auditable agent wallet built around Sui objects, Move events, and Walrus receipts.

## Recording Checklist

- Browser shows the site without horizontal overflow.
- Terminal font is readable.
- Do not show `.env`, shell history, wallet config, private keys, tokens, cookies, or old bot logs.
- Keep video under 5 minutes.
- Upload the video as public or unlisted and paste the URL into DeepSurge.

