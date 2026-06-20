# Telegram Bot Deployment

This repo keeps Telegram as the reviewer-friendly command surface for Sui Jarvis. The old bot menu is reused as a product demo pattern, but this implementation does not copy old tokens, runtime logs, generated wallets, or private-key behavior.

## Current Scope

- Old-style main menu: Assets, Swap, Portfolio, Limit, Whale, Pools, Signals, Strategy, Yield, Sniper, Walrus, Vault, Evidence, Help.
- Policy proof screens for allowed, blocked, and paused actions.
- Testnet package, policy object, transaction, and Walrus evidence links.
- Telegram execution of live trades is disabled.
- Telegram custody of private keys is disabled.

## Local Setup

Create a local `.env` file. Do not commit it.

```bash
cp .env.example .env
```

Fill these values manually:

```text
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_ALLOWED_USER_IDS=
```

`TELEGRAM_ALLOWED_USER_IDS` is optional. Use comma-separated Telegram numeric user IDs if the bot should only answer reviewers or your own account.

## Dry Run

Dry run renders the command panels without contacting Telegram.

```bash
npm run bot:dry
```

Dry run the Telegram profile configuration:

```bash
npm run bot:profile:dry
```

## Configure Bot Profile

After `TELEGRAM_BOT_TOKEN` is set outside git, configure the Telegram profile directly through the Bot API:

```bash
npm run bot:profile
```

This sets:

- Bot name: `Sui Jarvis`
- Short description
- Full description
- Bot commands
- Profile photo from `site/telegram-bot-avatar.jpg`

## Start The Bot

```bash
npm run bot
```

The bot uses Telegram long polling and clears any existing webhook on startup. If another host is already running the same token, stop that process first.

Recommended reviewer path:

```text
/start -> Assets -> Swap -> Proof -> Walrus -> Evidence
```

Useful direct commands:

```text
/start
/assets
/swap
/portfolio
/signals
/strategy
/policy
/proof
/walrus
/vault
/evidence
/help
```

## BotFather Fallback

The direct profile script should be preferred. If the Bot API profile call fails for account-level reasons, use BotFather manually:

1. Open `@BotFather`.
2. Use `/setuserpic`.
3. Choose the Sui Jarvis bot.
4. Upload:

```text
site/telegram-bot-avatar.jpg
```

Suggested description:

```text
Sui Jarvis is a policy-bound Telegram agent for Sui. It proves AI actions can be capped, paused, blocked, and audited on Sui testnet with Walrus receipts.
```

Suggested about text:

```text
Policy-bound Sui agent wallet for Overflow 2026.
```

Suggested commands for `/setcommands`:

```text
start - open the main menu
assets - inspect the policy wallet view
swap - open the guarded quote sandbox
policy - show Sui policy limits
proof - show allowed, blocked, and paused proofs
walrus - show audit receipt evidence
evidence - show judge links
help - list commands
```

## Safety Rules

- Do not run the old `sui-hackathon` bot directly for public judging.
- Do not copy old bot tokens, logs, wallet files, or operation history into this repo.
- Keep `.env` local or use a deployment secret store.
- Keep live trading and private-key custody disabled until the test wallet flow is rebuilt deliberately.
