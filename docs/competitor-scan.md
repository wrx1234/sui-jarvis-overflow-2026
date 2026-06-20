# Sui Overflow 2026 Public Project Scan

Date: 2026-06-20

## Sources

- DeepSurge hackathon metadata: `https://www.deepsurge.xyz/api/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf`
- DeepSurge project count: `https://www.deepsurge.xyz/api/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf/projects`
- DeepSurge public project list: `https://www.deepsurge.xyz/api/projects?hackathonId=b587dc0c-4cb8-4e63-ada5-519df38103bf&limit=50&after=...`
- GitHub search: `"Sui Overflow 2026"`, `"DeepBook Predict" "Sui Overflow"`, `"Agentic Web" "Sui" "Overflow"`

## What Was Scanned

DeepSurge currently reports 338 public projects for Sui Overflow 2026. I fetched 338 unique project cards through the public `after` cursor API.

Visible track distribution:

| Track | Count |
| --- | ---: |
| Special - Walrus | 98 |
| DeFi & Payments | 87 |
| The Agentic Web | 84 |
| Special - DeepBook | 60 |
| Release on May 7 | 8 |
| Prize Sponsor: OpenZeppelin | 1 |

Submission signal quality:

| Signal | Count |
| --- | ---: |
| GitHub link | 338 |
| Video or video-like link | 338 |
| Website / live demo | 291 |
| Package ID filled | 216 |
| Testnet marked | 243 |

GitHub search additionally returned 53 repositories containing the phrase `Sui Overflow 2026`.

## Relevant Patterns

### Agentic Web

Strong projects are not just chatbots. They expose bounded agent authority:

- Althea: AI trading agent with Move-enforced policy, zkLogin, DeepBook flow, revoke.
- Trading Panda: autonomous wallet with Move policy, training, inspectable trade facts.
- AI Agent Wallet: owner-defined spending limits, allow/block lists, cooldowns, clawback.
- PolicyPay Agent: recurring treasury flows, session capability, pause, revoke, expiry, nonce.
- Brief: autonomous workforce and policy-governed payment flow.
- SuiAgentWallet: direct naming overlap with the agent wallet theme.

Jarvis impact: ship a policy object first. Telegram can be the entrance, but the judging object is the policy proof.

### Walrus

Walrus projects have moved beyond "upload a file":

- Mnemosyne / Mnemo: verifiable memory, content hashes, Sui index objects.
- PaperProof Protocol: research artifacts with durable proof and mainnet claims.
- WALSEC: multi-agent audit artifacts published to Walrus.
- Walrus Memory Inspector: inspection tooling for stored agent memory.

Jarvis impact: use Walrus for action receipts and replayable audit trails. Do not reposition as a pure Walrus memory product unless the agent action story is already complete.

### DeepBook

DeepBook entries are specialized and polished:

- Stratos: multi-leg strategy templates, Move executor, testnet package, event feed.
- Strike5: BTC prediction arena.
- PredictGuard / VolShape Studio / PolySui / Helix: analytics and execution surfaces.
- SAGE and DeepPredict Chat: Telegram bot interfaces exist, but they are backed by DeepBook-specific product logic.

Jarvis impact: do not pivot into a full DeepBook product. Add DeepBook as an optional adapter or simulated route if time is short.

### DeFi & Payments

The strongest payment projects have a simple transaction story:

- x402-sui-stack: paid API call settlement.
- ProofPay / Splyt / Moocon / piper: focused payment flows.
- AI Agent Wallet overlaps heavily with Jarvis.

Jarvis impact: if submitting secondary DeFi & Payments, demo one narrow flow: agent pays or swaps within a signed policy, then emits a receipt.

## Recommendations For Jarvis

1. Main track should be The Agentic Web.
2. Build a policy object, not a generic AI trading bot.
3. Show pause or revoke, then show a blocked action.
4. Publish at least one testnet package and include package ID in DeepSurge.
5. Produce one live web page. Judges expect it now.
6. Keep Telegram as a fast demo surface after policy proof works.
7. Use Walrus for audit receipts: intent, risk result, PTB digest, Sui event, replay hash.
8. Do not copy the old repo's runtime files. The old repo contains live-looking bot credentials in logs/config areas and must be treated as contaminated until credentials are rotated.

## TG Bot Decision

Worth doing: yes, as a secondary interface.

Not worth doing: a standalone Telegram bot submission.

Reason: public competitors already have Telegram bots, live dashboards, package IDs, videos, and explicit Sui-native enforcement. A Jarvis bot only becomes competitive when it is the front end for bounded Sui authority.

