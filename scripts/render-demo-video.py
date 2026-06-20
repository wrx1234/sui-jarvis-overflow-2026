#!/usr/bin/env python3
"""Render a short captioned demo video for the static GitHub Pages site."""

from pathlib import Path
import shutil
import subprocess
import tempfile
import textwrap

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "site" / "demo-video.mp4"
WIDTH = 1280
HEIGHT = 720


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


TITLE = font(62, True)
SUBTITLE = font(32, True)
BODY = font(29)
BODY_BOLD = font(29, True)
SMALL = font(23)
MONO = font(22)


COLORS = {
    "bg": (247, 249, 248),
    "ink": (23, 33, 28),
    "muted": (82, 97, 88),
    "line": (206, 218, 211),
    "accent": (15, 124, 103),
    "blue": (54, 90, 216),
    "danger": (163, 51, 61),
    "panel": (255, 255, 255),
}


SLIDES = [
    {
        "kicker": "Sui Overflow 2026 / The Agentic Web",
        "title": "Sui Jarvis",
        "subtitle": "Policy-Bound Agent Wallet",
        "bullets": [
            "A Sui-native policy object constrains what an AI agent can do.",
            "Every intent is checked, recorded, and tied to audit evidence.",
            "Submission repo, website, testnet package, and Walrus proof are public.",
        ],
        "footer": "GitHub: github.com/wrx1234/sui-jarvis-overflow-2026",
        "duration": 10,
    },
    {
        "kicker": "Problem",
        "title": "AI agents need bounded authority",
        "subtitle": "Not unlimited wallet custody",
        "bullets": [
            "A useful agent may propose swaps, transfers, or DeFi actions.",
            "A safe agent must be capped by spend limits, allowlists, expiry, and pause control.",
            "Jarvis makes the permission boundary visible and reviewable.",
        ],
        "footer": "Design target: revocable, auditable, policy-first wallet delegation.",
        "duration": 13,
    },
    {
        "kicker": "Sui-native core",
        "title": "Policy Object",
        "subtitle": "The user defines the rules before the agent acts",
        "bullets": [
            "Package: 0x71bc67df...56fe4",
            "Policy object: 0x05890c98...b0f3c",
            "Max per action: 0.5 SUI / daily limit: 1.5 SUI",
            "Owner can pause, unpause, and reset daily spend.",
        ],
        "footer": "Network: Sui testnet",
        "duration": 16,
    },
    {
        "kicker": "Demo flow",
        "title": "Intent -> Risk -> Policy -> Receipt",
        "subtitle": "A deterministic audit trail for agent decisions",
        "bullets": [
            "1. User intent enters the local proof runner.",
            "2. Risk and policy checks run before execution.",
            "3. Allowed actions emit Sui testnet evidence.",
            "4. Receipt JSON is stored on Walrus testnet.",
        ],
        "footer": "Local command: npm test",
        "duration": 14,
    },
    {
        "kicker": "Proof 1",
        "title": "Allowed action",
        "subtitle": "0.3 SUI action passes policy and risk checks",
        "bullets": [
            "Action recorded tx: S4XpXVw1dfHghfpW77RU5NVjnKSE5ki1VLkHPZ5sMS9",
            "Receipt digest: 5d01d64eb4479e8285f7968fc15f48444001deb42a86565432e42d6e7b13f312",
            "Result: allowed and recorded.",
        ],
        "footer": "The action is inside max-per-action and daily spend limits.",
        "duration": 16,
    },
    {
        "kicker": "Proof 2",
        "title": "Oversized action blocked",
        "subtitle": "A 1.2 SUI intent fails before execution",
        "bullets": [
            "Failed checks: per_action_cap, risk_score",
            "Blocked receipt digest: 2ac0ef49a0ed62f2a3cd40fa78a914d3b530c2d193f3b9136c50a8b094ffc3dc",
            "Result: no execution when requested authority exceeds policy.",
        ],
        "footer": "The agent cannot exceed the user's bounded delegation.",
        "duration": 16,
    },
    {
        "kicker": "Proof 3",
        "title": "Pause control works",
        "subtitle": "The owner can stop the agent after delegation",
        "bullets": [
            "Pause tx: 55hiHW7kTjhc2MmQGerFJTrKhv74Am1uDuxQ9D8iT8dC",
            "Post-pause retry tx: AnGDxCJ52A4xZbGWotqArHbbFvxvWvpAKJH8gAnNwzpa",
            "Failure: record_action abort code 3, mapped to E_PAUSED.",
        ],
        "footer": "Revocation is a core part of the product, not an afterthought.",
        "duration": 17,
    },
    {
        "kicker": "Walrus proof",
        "title": "Receipt stored on Walrus",
        "subtitle": "Audit evidence survives outside the app UI",
        "bullets": [
            "Blob ID: IkZI68QWcOPZxo64_mT4I8S3kdoMZbf21_5EZ8uaYjU",
            "Blob object: 0x4e077533...cf89e059",
            "Certified epoch: 434",
            "Stored file: receipts/allowed-action.audit.json",
        ],
        "footer": "Walrus is used as the receipt/audit layer for the demo.",
        "duration": 16,
    },
    {
        "kicker": "Reviewer surface",
        "title": "Public evidence is ready",
        "subtitle": "No private state is required for review",
        "bullets": [
            "Website: wrx1234.github.io/sui-jarvis-overflow-2026/",
            "README and docs/evidence.md list package, tx, policy, and Walrus evidence.",
            "AI_DISCLOSURE.md explains AI-assisted areas and human-reviewed boundaries.",
        ],
        "footer": "GitHub repo is public and separate from the old Telegram bot repo.",
        "duration": 15,
    },
    {
        "kicker": "Limitations",
        "title": "Honest scope",
        "subtitle": "A hackathon proof, not a production trading agent",
        "bullets": [
            "Execution is on Sui testnet.",
            "The demo records policy events and receipts instead of moving mainnet funds.",
            "Walrus stores one durable audit receipt, not a full production memory layer.",
            "Telegram is secondary and not required for the core proof.",
        ],
        "footer": "This protects the submission from overclaiming.",
        "duration": 15,
    },
    {
        "kicker": "Submission package",
        "title": "Ready for DeepSurge",
        "subtitle": "Only final platform submission remains",
        "bullets": [
            "Track: The Agentic Web",
            "GitHub, website, package ID, policy object, tx evidence, Walrus blob, and AI disclosure are ready.",
            "Use this captioned video URL, or replace it with a recorded walkthrough later.",
        ],
        "footer": "Sui Jarvis: policy-bound, revocable, auditable agent authority.",
        "duration": 12,
    },
]


def draw_wrapped(draw, xy, text, font_obj, fill, width_chars, line_gap=8):
    x, y = xy
    for paragraph in text.split("\n"):
        for line in textwrap.wrap(paragraph, width=width_chars):
            draw.text((x, y), line, font=font_obj, fill=fill)
            bbox = draw.textbbox((x, y), line, font=font_obj)
            y += bbox[3] - bbox[1] + line_gap
        y += line_gap
    return y


def render_slide(slide, index, total, output):
    image = Image.new("RGB", (WIDTH, HEIGHT), COLORS["bg"])
    draw = ImageDraw.Draw(image)

    margin = 74
    draw.rounded_rectangle(
        (margin - 18, 52, WIDTH - margin + 18, HEIGHT - 58),
        radius=18,
        fill=COLORS["panel"],
        outline=COLORS["line"],
        width=2,
    )

    draw.text((margin, 78), slide["kicker"].upper(), font=SMALL, fill=COLORS["accent"])
    draw.text((margin, 120), slide["title"], font=TITLE, fill=COLORS["ink"])
    draw.text((margin, 202), slide["subtitle"], font=SUBTITLE, fill=COLORS["blue"])

    y = 282
    for bullet in slide["bullets"]:
        draw.ellipse((margin + 2, y + 12, margin + 14, y + 24), fill=COLORS["accent"])
        y = draw_wrapped(draw, (margin + 34, y), bullet, BODY, COLORS["ink"], 70, 7)
        y += 12

    draw.line((margin, HEIGHT - 132, WIDTH - margin, HEIGHT - 132), fill=COLORS["line"], width=2)
    draw_wrapped(draw, (margin, HEIGHT - 112), slide["footer"], SMALL, COLORS["muted"], 95, 4)

    progress_w = int((WIDTH - margin * 2) * ((index + 1) / total))
    draw.rounded_rectangle((margin, HEIGHT - 34, WIDTH - margin, HEIGHT - 26), radius=4, fill=(226, 233, 229))
    draw.rounded_rectangle((margin, HEIGHT - 34, margin + progress_w, HEIGHT - 26), radius=4, fill=COLORS["accent"])
    draw.text((WIDTH - margin - 112, HEIGHT - 62), f"{index + 1}/{total}", font=MONO, fill=COLORS["muted"])

    image.save(output)


def main():
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg is required to render the demo video")

    with tempfile.TemporaryDirectory(prefix="sui-jarvis-demo-video-") as tmp:
        tmpdir = Path(tmp)
        manifest = tmpdir / "slides.txt"
        lines = []

        for idx, slide in enumerate(SLIDES):
            frame = tmpdir / f"slide_{idx:02d}.png"
            render_slide(slide, idx, len(SLIDES), frame)
            lines.append(f"file '{frame}'")
            lines.append(f"duration {slide['duration']}")

        last = tmpdir / f"slide_{len(SLIDES) - 1:02d}.png"
        lines.append(f"file '{last}'")
        manifest.write_text("\n".join(lines) + "\n", encoding="utf-8")

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "warning",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(manifest),
                "-vf",
                "fps=30,format=yuv420p",
                "-c:v",
                "libx264",
                "-crf",
                "24",
                "-movflags",
                "+faststart",
                str(OUT),
            ],
            check=True,
        )

    print(f"Rendered {OUT}")


if __name__ == "__main__":
    main()
