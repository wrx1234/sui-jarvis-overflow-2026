# Submission Checklist

## Current Hackathon Metadata

Source: DeepSurge public hackathon API, checked 2026-06-20.

- Name: Sui Overflow 2026
- Status: ongoing
- Start: 2026-05-07 04:00 UTC
- End: 2026-06-21 15:00 UTC
- Prize amount shown by DeepSurge: 500000
- Tracks: The Agentic Web, DeFi & Payments, Special - Walrus, Special - DeepBook
- Core bounty listed: Core Track
- Handbook resource: `https://go.sui.io/overflow26-participant-handbook`

## DeepSurge Fields

- Project name: Sui Jarvis
- Track: The Agentic Web
- Secondary narrative: DeFi & Payments, only if payment/swap demo is real
- GitHub repo: new clean repo, not the old `sui-hackathon`
- Website: required for competitive polish
- Video: 3 to 5 minutes, show policy creation, allowed action, paused-action failure
- Package ID: required once testnet Move package is published
- Deploy network: Testnet unless mainnet is actually used
- Media: screenshots of policy dashboard, receipt, pause failure
- AI disclosure: include tools, generated code areas, human review boundaries

## Must Finish Before Submission

- Rotate any old Telegram token or credential from the previous repo before demo.
- Publish `agent_policy.move` to Sui testnet. Done: package `0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4`.
- Record package ID and at least one transaction digest. Done: publish, create policy, action, pause, and blocked retry digests are in `docs/evidence.md`.
- Store one action receipt on Walrus or clearly mark local proof fallback. Done: blob `IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU`.
- Build a minimal website with evidence links. Done: `https://wrx1234.github.io/sui-jarvis-overflow-2026/`.
- Record a short demo video.
- Add README section: "Why Sui", "Policy enforcement", "Audit receipts", "Security model".
- Run a secret scan before making the new repo public.

## Do Not Submit

- Old bot logs.
- Old `.env` values.
- Real Telegram token.
- Private keys, seed phrases, wallet JSON, cookies, or API keys.
- Claims that DeepBook, Cetus, or Walrus are fully integrated unless the demo proves it.
