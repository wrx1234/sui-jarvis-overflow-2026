# Five Minute Demo Script

## Goal

Show bounded autonomy on Sui:

User creates a policy. Jarvis proposes an action. Risk checks pass. A receipt is created. Then the user pauses the policy and the same agent action fails.

## Flow

### 0:00 - 0:30 Open

Open the live site and show:

- Project name: Sui Jarvis.
- Track: The Agentic Web.
- Network: Sui testnet.
- Package ID and latest receipt digest.

### 0:30 - 1:15 Create Policy

Show policy settings:

- Agent address.
- Max per action.
- Daily cap.
- Protocol allowlist.
- Recipient allowlist.
- Expiry.
- Pause / revoke control.

Create or load the policy object.

### 1:15 - 2:00 Agent Intent

Use either web input or Telegram:

```text
/plan swap 0.3 SUI to USDC via Cetus
```

Jarvis returns:

- Parsed intent.
- Policy checks.
- Risk score.
- Estimated route.
- Human-readable summary.

### 2:00 - 3:00 Execute Or Simulate

Best version:

- Build and submit a Sui PTB on testnet.
- Emit `ActionRecorded`.
- Link transaction digest.

Fallback version:

- Run `npm run demo:proof`.
- Show deterministic receipt hash.
- Make clear that testnet publish is the next step.

### 3:00 - 4:00 Walrus Receipt

Show receipt JSON:

- Intent hash.
- Risk result.
- Policy ID.
- Sui transaction digest or local proof digest.
- Walrus blob ID.

Explain that the receipt lets a reviewer replay what Jarvis was allowed to know and do.

### 4:00 - 4:45 Pause Proof

Pause the policy.

Run the same action again.

Expected result:

- Action blocked by `policy_active`.
- No transfer or swap is executed.
- A blocked-action receipt is still recorded for audit.

### 4:45 - 5:00 Close

Show DeepSurge evidence fields:

- GitHub.
- Website.
- Video.
- Package ID.
- Network.
- Walrus blob.
- AI disclosure.

