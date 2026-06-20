# DeepSurge Form Copy

## Project Name

Sui Jarvis

## Track

Core Track

Note: If the UI exposes sub-track selection, choose `The Agentic Web`.

## Deployment Network

Testnet

## Package ID

0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4

## Project Repo

https://github.com/wrx1234/sui-jarvis-overflow-2026

## Website

https://wrx1234.github.io/sui-jarvis-overflow-2026/

## Demo Video

https://wrx1234.github.io/sui-jarvis-overflow-2026/demo-video.html

## Logo Upload

site/logo.png

## Media Images

Upload these in order:

1. `site/media/sui-jarvis-product-flow.png`
2. `site/media/sui-jarvis-main-visual.png`

Public URLs:

1. https://wrx1234.github.io/sui-jarvis-overflow-2026/media/sui-jarvis-product-flow.png
2. https://wrx1234.github.io/sui-jarvis-overflow-2026/media/sui-jarvis-main-visual.png

## Short Description

Sui Jarvis is a policy-bound agent wallet for Sui. Users delegate narrow, revocable authority to an AI agent through a Sui-native policy: spending caps, daily limits, protocol and recipient allowlists, expiry, and pause control. Every agent intent is checked by policy and risk rules before execution, and every decision produces a deterministic audit receipt that can be anchored on Sui and Walrus.

## Long Description

AI agents are becoming useful enough to operate wallets, but broad wallet custody is unsafe. Sui Jarvis turns agent authority into a bounded object. A user defines the rules first: max spend, daily cap, protocol allowlist, recipient allowlist, expiry, and pause/revoke. Jarvis can propose or execute only inside those rules.

The demo shows three proofs:

1. An allowlisted 0.3 SUI action passes policy and risk checks.
2. An oversized 1.2 SUI action is blocked by the per-action cap and risk score.
3. After the owner pauses the policy, the same small action fails before execution.

Each decision creates a receipt digest, so reviewers can verify what the agent intended, which checks ran, and why the action was allowed or blocked. This submission publishes the Move policy package to Sui testnet, stores one receipt JSON on Walrus, and exposes the proof through a public website, demo video, and optional Telegram command surface.

## Why Sui

Sui object ownership, shared objects, events, capabilities, and programmable transaction blocks are a natural fit for bounded agent authority. The policy can be represented as a Sui object, enforcement can happen before funds move, and audit receipts can link local agent intent to chain evidence.

## AI Disclosure

AI tools were used to accelerate research, planning, code scaffolding, documentation, static site adaptation, and demo video preparation. Final project direction, risk boundaries, public evidence, and submission strategy were human-reviewed. No real Telegram bot token, private key, seed phrase, wallet JSON, cookie, API key, or runtime log is committed.
