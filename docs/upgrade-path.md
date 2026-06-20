# Upgrade Path

## Decision

Do not keep modifying `/Users/xuan/Documents/Sui/sui-hackathon` for the final submission. Use this clean repo as the competition repo.

Old repo value:

- Reference for Telegram interaction patterns.
- Reference for prior Sui Jarvis narrative and docs.
- Reference for already-known UI/domain work.

Old repo risk:

- Runtime logs and bot files contain live-looking credentials.
- Old story is tied to earlier OpenClaw / trading bot framing.
- It may overclaim integrations that need fresh proof for Sui Overflow 2026.

## 48 Hour Route

1. Make `npm run demo:proof` the evidence baseline.
2. Publish the Move policy package to testnet.
3. Build a minimal dashboard around policy status and receipts.
4. Add one Telegram command that calls the same policy/risk engine.
5. Store one receipt on Walrus.
6. Record a video with allowed action plus pause failure.

## Seven Day Route

1. Replace simulated route with one real Sui PTB.
2. Add Cetus or DeepBook adapter behind the same policy interface.
3. Add receipt replay page: paste digest, verify checks.
4. Add AI disclosure and threat model.
5. Add CI: `npm test`, secret scan, Move build.
6. Polish website and DeepSurge media.

## Product Sentence

Sui Jarvis lets users delegate narrow, revocable on-chain authority to an AI agent, with every action constrained by a Sui policy object and every decision recorded as a verifiable receipt.

