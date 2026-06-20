# AI Disclosure

Project: Sui Jarvis Overflow 2026

Hackathon: Sui Overflow 2026

## Summary

AI tools were used to accelerate research, planning, code scaffolding, and documentation. The final project direction, risk boundaries, and submission strategy are human-reviewed.

## AI-Assisted Areas

- Research synthesis for Sui Overflow 2026 tracks, public project patterns, and submission expectations.
- Refactoring the project narrative from a Telegram DeFi bot into a policy-bound Sui agent wallet.
- Drafting the local policy/risk/audit proof runner.
- Drafting the static demo site.
- Drafting README, competitor scan, demo script, and submission checklist.

## Human-Reviewed Areas

- Final track choice: The Agentic Web.
- Safety decision to avoid copying old bot runtime data, logs, tokens, private keys, or generated wallets.
- Decision to keep Telegram as a secondary command surface instead of the core submission.
- Known limitations and evidence status.

## Known Limitations

- The Move policy package is published on Sui testnet, but the demo intentionally limits execution to policy events and receipt proofs instead of live fund movement.
- The Walrus receipt stores one audit JSON proof for the allowed action; it is not a full production agent memory system yet.
- The static site displays deterministic local proof evidence plus linked testnet/Walrus evidence; it is not a live indexer.
- Telegram remains a planned thin command surface and is not part of the core submitted proof.

## Sensitive Data Handling

No real Telegram bot token, private key, seed phrase, wallet JSON, cookie, API key, or full runtime log should be committed. The new repo was created separately from the older Sui Jarvis repository to avoid carrying old runtime data into the public submission.
