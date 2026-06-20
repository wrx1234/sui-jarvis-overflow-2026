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
- GitHub repo: `https://github.com/wrx1234/sui-jarvis-overflow-2026`
- Website: `https://wrx1234.github.io/sui-jarvis-overflow-2026/`
- Video: `https://wrx1234.github.io/sui-jarvis-overflow-2026/demo-video.html`
- Logo: `https://wrx1234.github.io/sui-jarvis-overflow-2026/logo.svg`
- Package ID: `0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4`
- Deploy network: Testnet unless mainnet is actually used
- Media: screenshots of policy dashboard, receipt, pause failure
- AI disclosure: include tools, generated code areas, human review boundaries

## Must Finish Before Submission

- Done: clean public GitHub repo is separate from the old `sui-hackathon`.
- Done: `agent_policy.move` published to Sui testnet as package `0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4`.
- Done: publish, create policy, action, pause, and blocked retry digests are in `docs/evidence.md`.
- Done: one action receipt is stored on Walrus as blob `IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU`.
- Done: public Sui Jarvis website is deployed at `https://wrx1234.github.io/sui-jarvis-overflow-2026/` with demo video and GitHub links.
- Done: README includes positioning, Sui policy enforcement, audit receipts, and security rules.
- Done: secret scan found no committed token/private-key material; only `.gitignore` contains `wallets.json` as an excluded filename.
- Done: captioned fallback demo video is published and under 5 minutes.
- Optional before final judging: replace the fallback video with a narrated screen recording.
- Required before any Telegram demo: rotate any old Telegram token or credential from the previous repo.

## Do Not Submit

- Old bot logs.
- Old `.env` values.
- Real Telegram token.
- Private keys, seed phrases, wallet JSON, cookies, or API keys.
- Claims that DeepBook, Cetus, or Walrus are fully integrated unless the demo proves it.
