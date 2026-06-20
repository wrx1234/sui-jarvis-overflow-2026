# Evidence

Checked: 2026-06-20

## Local Proof

Command:

```bash
npm test
```

Result:

- Allowed intent: `intent-swap-small`
- Allowed receipt digest: `5d01d64eb4479e8285f7968fc15f48444001deb42a86565432e42d6e7b13f312`
- Blocked intent: `intent-swap-oversize`
- Blocked checks: `per_action_cap`, `risk_score`
- Paused-policy blocked check: `policy_active`

## Local Site

Command:

```bash
npm run site
```

Local URL:

```text
http://localhost:4173
```

Browser check:

- Desktop DOM rendered from the restored Sui Jarvis website shell.
- Hero, Telegram Entry, Reviewer Dashboard, Watch Demo, and GitHub links are present.
- No old public Telegram bot URL or old `sui-hackathon` GitHub URL is present in the deployed site bundle.

Public URL:

```text
https://wrx1234.github.io/sui-jarvis-overflow-2026/
```

Demo video URL:

```text
https://wrx1234.github.io/sui-jarvis-overflow-2026/demo-video.html
```

GitHub Pages workflow: `Deploy demo site`

After each push, verify the latest workflow run in GitHub Actions and check the public URLs below.

## Sui Testnet

| Evidence | Value |
| --- | --- |
| Network | Sui testnet |
| Sui CLI | `1.73.0-homebrew` |
| Active address | `0x2b5c295689cc437ed9ae0b064a3ae78951a833c908da6ccf68a94b3fc77f2eb2` |
| Package ID | `0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4` |
| Upgrade cap | `0xc13dd5fe969589447831cdc58d9e57c24886ba84fbcab3e25816e3d50ec095b6` |
| Policy object | `0x05890c9882df3a77bc6389bd895227f86343a2b7a3b48deb0c72a9ff76bb0f3c` |
| Publish tx | `4AMeu8oNd93wZ97C5mZvwDT8Sv8eN1sAfYz48YV9tYBJ` |
| Policy created tx | `EgkEqzqQKaMxsZgLwMAkj9FioV6MXrQQ3G6vtAG2LU8C` |
| Action recorded tx | `S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9` |
| Pause tx | `55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC` |
| Post-pause blocked tx | `AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa` |
| Walrus receipt blob ID | `IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU` |
| Walrus blob object | `0x4e07753366b797e96754d6b00fae4e28b903b4558ecd0c8a213d07b3cf89e059` |
| Walrus certified epoch | `434` |

Explorer:

- Package: <https://suiscan.xyz/testnet/object/0x71bc67dfb5d5009c27d27f787f47493b11aeac21f23ec732c5623480bdd56fe4>
- Policy object: <https://suiscan.xyz/testnet/object/0x05890c9882df3a77bc6389bd895227f86343a2b7a3b48deb0c72a9ff76bb0f3c>
- Publish tx: <https://suiscan.xyz/testnet/tx/4AMeu8oNd93wZ97C5mZvwDT8Sv8eN1sAfYz48YV9tYBJ>
- Policy created tx: <https://suiscan.xyz/testnet/tx/EgkEqzqQKaMxsZgLwMAkj9FioV6MXrQQ3G6vtAG2LU8C>
- Action recorded tx: <https://suiscan.xyz/testnet/tx/S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9>
- Pause tx: <https://suiscan.xyz/testnet/tx/55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC>
- Blocked tx: <https://suiscan.xyz/testnet/tx/AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa>

## Policy State

After the demo sequence, the policy object is paused:

```json
{
  "paused": true,
  "spent_today_mist": "300000000",
  "max_per_action_mist": "500000000",
  "daily_limit_mist": "1500000000"
}
```

The blocked post-pause transaction aborts in `record_action` with code `3`, mapped to `E_PAUSED`.

## Pending Submission Evidence

- DeepSurge final submission confirmation URL or screenshot.

## Final Verification

Checked on 2026-06-20 after the public push:

- `npm test` passed.
- `sui move build` passed in `contracts/`.
- Public GitHub repo visibility is `PUBLIC`.
- GitHub Pages returned HTTP 200.
- Public site, JavaScript bundle, demo video page, and MP4 returned HTTP 200.
- Public bundle contains `Policy-Bound Agent Wallet`, `Telegram Entry`, `Reviewer Dashboard`, `Watch Demo`, the new GitHub URL, and `./demo-video.html`.
- Captioned demo video file is 184 seconds and under 5 minutes.
- Secret scan found no committed token/private-key material; the only match was `.gitignore` excluding `wallets.json`.

## GitHub

Public repo:

```text
https://github.com/wrx1234/sui-jarvis-overflow-2026
```

## Walrus Receipt

Uploaded file:

```text
receipts/allowed-action.audit.json
```

Blob ID:

```text
IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU
```

Blob object:

```text
0x4e07753366b797e96754d6b00fae4e28b903b4558ecd0c8a213d07b3cf89e059
```

Verification commands:

```bash
walrus list-blobs --context testnet --json
walrus read --context testnet IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU
```

Note: `walrus read` returned the receipt content, while one consistency check emitted a transient quorum warning. `walrus list-blobs` shows `certifiedEpoch: 434`.
