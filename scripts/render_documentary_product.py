#!/usr/bin/env python3
"""
Documentary-style 1080p social demos for suite products.

  python3 scripts/render_documentary_product.py --only shadow-ai,eval-harness
  python3 scripts/render_documentary_product.py --only auth-anomaly-radar,fraud-signal-kit
  python3 scripts/render_documentary_product.py --list
"""
from __future__ import annotations

import argparse
import math
import os
import random
import shutil
import struct
import subprocess
import wave
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H, FPS = 1920, 1080, 30
SR = 44100

BG = (8, 10, 16)
CARD = (16, 20, 30)
SURFACE = (22, 26, 38)
BORDER = (48, 56, 78)
WHITE = (238, 242, 250)
MUTED = (148, 158, 178)
DIM = (88, 96, 114)
CYAN = (94, 220, 240)
RED = (248, 113, 113)
AMBER = (251, 191, 36)
GREEN = (74, 222, 128)
LINE = (20, 24, 34)
PINK = (244, 114, 182)
ORANGE = (251, 146, 60)

_font_cache: dict = {}


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    key = (size, bold)
    if key in _font_cache:
        return _font_cache[key]
    paths = (
        ["/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/Library/Fonts/Arial Bold.ttf"]
        if bold
        else [
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Menlo.ttc",
            "/Library/Fonts/Arial.ttf",
        ]
    )
    f = ImageFont.load_default()
    for p in paths:
        if os.path.exists(p):
            try:
                f = ImageFont.truetype(p, size=size)
                break
            except Exception:
                continue
    _font_cache[key] = f
    return f


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def canvas() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=LINE, width=1)
    return img


def type_text(full: str, progress: float) -> str:
    n = max(0, int(len(full) * ease(progress)))
    return full[:n]


def wrap(d, text, f, max_w) -> list[str]:
    words = text.split()
    lines, cur = [], ""
    for w in words:
        t = f"{cur} {w}".strip()
        if d.textlength(t, font=f) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def lower_third(d, label: str, accent=CYAN):
    y = H - 90
    d.rectangle([80, y, 88, y + 42], fill=accent)
    d.text((110, y + 6), label, fill=MUTED, font=font(22))


def letterbox(d):
    d.rectangle([0, 0, W, 70], fill=(0, 0, 0))
    d.rectangle([0, H - 70, W, H], fill=(0, 0, 0))


@dataclass
class DocStory:
    slug: str
    npm: str
    accent: tuple
    cold_claim: str
    cold_cards: list  # (path, title, note, color)
    chapter1_title: str
    chapter1_lines: list[str]
    chapter2_title: str
    chapter2_lines: list[str]  # 2–3 stake lines
    proof_label: str
    discipline_title: str
    discipline_bullets: list[str]
    cta_line: str
    cta_cmd: str
    footer: str
    term_highlight: list[str] = field(default_factory=list)


STORIES: dict[str, DocStory] = {
    "shadow-ai": DocStory(
        slug="shadow-ai",
        npm="@bhaskarauthor/shadow-ai",
        accent=ORANGE,
        cold_claim="IT never approved these. They still have company context.",
        cold_cards=[
            ("browser", "ChatGPT Free", "confidential · Notion paste", RED),
            ("mcp.json", "unpinned npx MCP", "local · uncatalogued", AMBER),
            ("web", "pastebin prompt dump", "exfil path · unknown", RED),
        ],
        chapter1_title="01  ·  THE SHADOW SURFACE",
        chapter1_lines=[
            "Personal ChatGPT with company docs.",
            "Random MCP servers nobody reviewed.",
            "Prompt dumps on public paste sites.",
            "",
            "Security’s inventory says “approved tools only.”",
            "The laptop says otherwise.",
        ],
        chapter2_title="02  ·  THE COST",
        chapter2_lines=[
            "You don’t lose control at the model.",
            "You lose it at the tool that never got a ticket.",
            "Shadow AI is an asset problem — with data classes attached.",
        ],
        proof_label="LIVE EVIDENCE  ·  inventory score",
        discipline_title="Inventory AI tools like assets.",
        discipline_bullets=[
            "Score unapproved tools · weight confidential data",
            "Severity band · riskScore / 100",
            "Local · zero deps · nothing leaves the machine",
        ],
        cta_line="See what left the approved surface.",
        cta_cmd="npx @bhaskarauthor/shadow-ai",
        footer="MIT  ·  offline inventory core  ·  not a full CASB",
        term_highlight=["HIGH", "CONF", "unauthorized", "severity", "riskScore"],
    ),
    "eval-harness": DocStory(
        slug="eval-harness",
        npm="@bhaskarauthor/eval-harness",
        accent=GREEN,
        cold_claim="You changed the prompt. Did anything break?",
        cold_cards=[
            ("case", "summarize-email", "expect: budget · LLM", GREEN),
            ("case", "refuse-secrets", "forbid: live key patterns", GREEN),
            ("case", "regression-trap", "FAIL · leaked demo key", RED),
        ],
        chapter1_title="01  ·  THE BLIND SHIP",
        chapter1_lines=[
            "Prompt tweak at 5pm.",
            "Ship at 6pm.",
            "Customer sees a secret refuse rule… gone.",
            "",
            "Without golden cases, every edit is a leap of faith.",
            "Vibes are not a test suite.",
        ],
        chapter2_title="02  ·  THE COST",
        chapter2_lines=[
            "Regressions don’t announce themselves.",
            "They show up as “the model got worse” — after users feel it.",
            "CI should fail the prompt the way it fails the build.",
        ],
        proof_label="LIVE EVIDENCE  ·  golden suite",
        discipline_title="Change the prompt. Re-run the suite.",
        discipline_bullets=[
            "expectContains · forbidContains per case",
            "PASS / FAIL table · suite GREEN or RED",
            "Wire exit codes into CI — not screenshots",
        ],
        cta_line="Catch the trap case before prod does.",
        cta_cmd="npx @bhaskarauthor/eval-harness",
        footer="MIT  ·  offline eval core  ·  not a hosted eval platform",
        term_highlight=["FAIL", "PASS", "RED", "GREEN", "regression", "forbidden"],
    ),
    "auth-anomaly-radar": DocStory(
        slug="auth-anomaly-radar",
        npm="@bhaskarauthor/auth-anomaly-radar",
        accent=RED,
        cold_claim="Mumbai → San Francisco in two hours. Same user.",
        cold_cards=[
            ("geo", "dev@corp.io", "Mumbai · MacBook-office", GREEN),
            ("geo", "dev@corp.io", "SFO · unknown-chrome · 2h", RED),
            ("auth", "ops@corp.io", "Delhi · failures=42", AMBER),
        ],
        chapter1_title="01  ·  THE QUIET LOGIN",
        chapter1_lines=[
            "Logs say: successful login.",
            "Physics says: impossible travel.",
            "Another account: 42 failures — stuffing noise.",
            "",
            "Volume dashboards call it traffic.",
            "Sequences call it an incident.",
        ],
        chapter2_title="02  ·  THE COST",
        chapter2_lines=[
            "Account takeover rarely looks loud in a single row.",
            "It looks normal — until you score velocity and geography.",
            "Flag the sequence, not the isolated 200 OK.",
        ],
        proof_label="LIVE EVIDENCE  ·  sequence score",
        discipline_title="Score login sequences — not rows.",
        discipline_bullets=[
            "Impossible travel via haversine + time",
            "Credential stuffing via failure bursts",
            "risk: low · medium · high",
        ],
        cta_line="Turn quiet logins into loud flags.",
        cta_cmd="npx @bhaskarauthor/auth-anomaly-radar",
        footer="MIT  ·  offline scoring core  ·  not a full SIEM",
        term_highlight=["CRITICAL", "HIGH", "impossible_travel", "credential_stuffing", "risk"],
    ),
    "fraud-signal-kit": DocStory(
        slug="fraud-signal-kit",
        npm="@bhaskarauthor/fraud-signal-kit",
        accent=PINK,
        cold_claim="Disposable email. Six actions in a minute. Composite: HIGH.",
        cold_cards=[
            ("email", "mailinator inbox", "disposable pattern · score↑", RED),
            ("velocity", "60s window", "signup→card→checkout×4", AMBER),
            ("blend", "composite", "0.6·email + 0.4·velocity", RED),
        ],
        chapter1_title="01  ·  THE CHEAP SIGNALS",
        chapter1_lines=[
            "Before heavy ML, the fraud is already loud:",
            "temp mail · burst velocity · payout change.",
            "",
            "Marketplaces and fintech burn cash",
            "when signals stay siloed in separate tools.",
        ],
        chapter2_title="02  ·  THE COST",
        chapter2_lines=[
            "One weak signal is a maybe.",
            "Composed signals are a hold.",
            "Step-up auth beats a chargeback narrative next month.",
        ],
        proof_label="LIVE EVIDENCE  ·  composite score",
        discipline_title="Compose cheap signals before heavy ML.",
        discipline_bullets=[
            "email risk · disposable / pattern heuristics",
            "velocity · actions in a rolling window",
            "blend → band for step-up or review",
        ],
        cta_line="Compose the risk. Then decide.",
        cta_cmd="npx @bhaskarauthor/fraud-signal-kit",
        footer="MIT  ·  offline signal core  ·  not a full fraud platform",
        term_highlight=["HIGH", "MEDIUM", "composite", "disposable", "velocity", "score"],
    ),
    "cloud-waste-radar": DocStory(
        slug="cloud-waste-radar",
        npm="@bhaskarauthor/cloud-waste-radar",
        accent=AMBER,
        cold_claim="The bill grew. The product didn’t. Something is idle.",
        cold_cards=[
            ("ebs", "vol-orphan-01", "unattached · $48/mo", RED),
            ("rds", "rds-staging-old", "0 conns · 21d idle · $180", RED),
            ("ec2", "ec2-ml-playground", "cpu 2.1% · rightsizing", AMBER),
        ],
        chapter1_title="01  ·  THE QUIET BILL",
        chapter1_lines=[
            "Orphan volumes. Dangling EIPs.",
            "Staging RDS with zero connections for weeks.",
            "A ‘temporary’ box still on m5.xlarge.",
            "",
            "Finance sees a line item.",
            "Engineering never got a waste ticket.",
        ],
        chapter2_title="02  ·  THE COST",
        chapter2_lines=[
            "Cloud waste is not a mystery — it’s unowned inventory.",
            "Every idle resource is a subscription you forgot to cancel.",
            "Score the estate before the CFO’s spreadsheet does.",
        ],
        proof_label="LIVE EVIDENCE  ·  waste findings",
        discipline_title="Score inventory for waste — monthly.",
        discipline_bullets=[
            "idle EBS · EIP · RDS · low-CPU EC2",
            "monthlySavingsUsd rollup",
            "Local · zero deps · offline inventory JSON",
        ],
        cta_line="Find the idle bill before finance does.",
        cta_cmd="npx @bhaskarauthor/cloud-waste-radar",
        footer="MIT  ·  offline waste core  ·  not a full FinOps suite",
        term_highlight=["idle", "savings", "rightsizing", "findings", "$"],
    ),
    "dev-onboard-os": DocStory(
        slug="dev-onboard-os",
        npm="@bhaskarauthor/dev-onboard-os",
        accent=CYAN,
        cold_claim="Day 4. Laptop works. Secrets still arrived in chat.",
        cold_cards=[
            ("hire", "Asha · backend", "day 4 of onboard", CYAN),
            ("done", "laptop · github · repo", "3/6 complete", GREEN),
            ("gap", "secrets · agents · PR", "AI/MCP still open risk", RED),
        ],
        chapter1_title="01  ·  THE WIKI HUNT",
        chapter1_lines=[
            "New hire opens five docs.",
            "Three are stale. One says “ask on Slack.”",
            "MCP and agent setup? Optional chrome — until it isn’t.",
            "",
            "Onboarding is not a scavenger hunt.",
            "It’s a checklist with a percent.",
        ],
        chapter2_title="02  ·  THE COST",
        chapter2_lines=[
            "Slow onboard is lost sprint capacity.",
            "Unsafe onboard is a secret in a DM.",
            "Ship day-one as an OS — not a vibe.",
        ],
        proof_label="LIVE EVIDENCE  ·  checklist progress",
        discipline_title="Onboard as a checklist OS.",
        discipline_bullets=[
            "laptop · github · repo · secrets · agents · first-pr",
            "pct complete · explicit blockers",
            "AI/MCP is day-one risk — not optional chrome",
        ],
        cta_line="See what’s still TODO on day four.",
        cta_cmd="npx @bhaskarauthor/dev-onboard-os",
        footer="MIT  ·  offline checklist core  ·  not an HRIS",
        term_highlight=["TODO", "DONE", "blockers", "secrets", "agents", "progress"],
    ),
    "sbom-lite": DocStory(
        slug="sbom-lite",
        npm="@bhaskarauthor/sbom-lite",
        accent=GREEN,
        cold_claim="GPL-3.0 and a denied package just entered main.",
        cold_cards=[
            ("lock", "package-lock graph", "components counted", CYAN),
            ("policy", "deny GPL-3.0", "license gate", AMBER),
            ("block", "leftpad-evil", "denied-package", RED),
        ],
        chapter1_title="01  ·  THE BLIND MERGE",
        chapter1_lines=[
            "PR is green on tests.",
            "Nobody opened the license field.",
            "A GPL dep and a denied name ride into production.",
            "",
            "SBOM without a gate is a PDF for auditors.",
            "SBOM with a gate is a merge blocker.",
        ],
        chapter2_title="02  ·  THE COST",
        chapter2_lines=[
            "License debt compounds quietly.",
            "Denied packages are supply-chain preference as code.",
            "Fail CI when policy fails — not the quarterly review.",
        ],
        proof_label="LIVE EVIDENCE  ·  SBOM + policy gate",
        discipline_title="Generate. Gate. Block the merge.",
        discipline_bullets=[
            "SBOM from package-lock style input",
            "denyLicenses · denyNames",
            "gate.ok false → CI red",
        ],
        cta_line="Fail the build on policy — not on vibes.",
        cta_cmd="npx @bhaskarauthor/sbom-lite",
        footer="MIT  ·  offline SBOM core  ·  not a full SCA platform",
        term_highlight=["FAIL", "PASS", "BLOCK", "violations", "GPL", "denied"],
    ),
    "grc-evidence-autopilot": DocStory(
        slug="grc-evidence-autopilot",
        npm="@bhaskarauthor/grc-evidence-autopilot",
        accent=(167, 139, 250),  # violet
        cold_claim="Audit week. Control P1.1 has zero artifacts.",
        cold_cards=[
            ("ctrl", "CC6.1 access", "okta review mapped", GREEN),
            ("ctrl", "CC7.2 monitoring", "anomaly export mapped", GREEN),
            ("gap", "P1.1 privacy", "0 artifacts · finding", RED),
        ],
        chapter1_title="01  ·  THE FOLDER PANIC",
        chapter1_lines=[
            "Controls live in a spreadsheet.",
            "Evidence lives in five drives.",
            "Week of audit: who has the screenshot?",
            "",
            "Coverage percent is the only honest dashboard.",
            "Empty control = auditor question.",
        ],
        chapter2_title="02  ·  THE COST",
        chapter2_lines=[
            "Evidence collected under panic is incomplete evidence.",
            "Map artifacts to controls continuously.",
            "Gaps should hurt before the auditor does.",
        ],
        proof_label="LIVE EVIDENCE  ·  control coverage",
        discipline_title="Map artifacts to controls — always on.",
        discipline_bullets=[
            "control id → artifact list",
            "coveragePct · explicit gaps",
            "Local · zero deps · offline JSON",
        ],
        cta_line="See which control is still empty.",
        cta_cmd="npx @bhaskarauthor/grc-evidence-autopilot",
        footer="MIT  ·  offline mapping core  ·  not a full GRC suite",
        term_highlight=["GAP", "OK", "coverage", "gaps", "arts="],
    ),
}


def cold_open(story: DocStory, progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    letterbox(d)
    p = ease(progress)
    cards = story.cold_cards
    for i, (path, title, note, col) in enumerate(cards):
        if progress < i * 0.1:
            continue
        x = 120 + i * 560
        y = 300 + int((1 - p) * 30)
        d.rounded_rectangle([x, y, x + 500, y + 260], 16, fill=CARD, outline=BORDER, width=2)
        d.rectangle([x, y, x + 500, y + 8], fill=col)
        d.text((x + 28, y + 36), path, fill=MUTED, font=font(20))
        d.text((x + 28, y + 100), title[:28], fill=WHITE, font=font(28, bold=True))
        d.text((x + 28, y + 160), note[:36], fill=col, font=font(22))
    if progress > 0.5:
        claim = type_text(story.cold_claim, (progress - 0.5) / 0.5)
        for i, line in enumerate(wrap(d, claim, font(34, bold=True), W - 240)):
            tw = d.textlength(line, font=font(34, bold=True))
            d.text(((W - tw) / 2, 140 + i * 48), line, fill=WHITE, font=font(34, bold=True))
    lower_third(d, "COLD OPEN  ·  " + story.slug, story.accent)
    return img


def chapter_world(story: DocStory, progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.text((120, 100), story.chapter1_title, fill=story.accent, font=font(24, bold=True))
    y = 200
    full = "\n".join(story.chapter1_lines)
    shown = type_text(full, progress)
    for line in shown.split("\n"):
        col = AMBER if any(k in line.lower() for k in ("no ", "not ", "vibes", "otherwise", "leap")) else WHITE
        d.text((120, y), line, fill=col if line else WHITE, font=font(34, bold=True))
        y += 54
    lower_third(d, "HOW THE BROKEN SYSTEM WORKS", story.accent)
    return img


def chapter_stakes(story: DocStory, progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.text((120, 100), story.chapter2_title, fill=RED, font=font(24, bold=True))
    y = 240
    for i, line in enumerate(story.chapter2_lines):
        gate = i / max(1, len(story.chapter2_lines))
        if progress < gate * 0.85:
            continue
        local = min(1.0, (progress - gate * 0.85) / 0.25)
        text = type_text(line, local)
        col = WHITE if i == 0 else (AMBER if i == 1 else MUTED)
        for wl in wrap(d, text, font(36, bold=True), W - 240):
            d.text((120, y), wl, fill=col, font=font(36, bold=True))
            y += 52
        y += 16
    lower_third(d, "STAKES", story.accent)
    return img


def investigation(story: DocStory, progress: float, term_lines: list[str]) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.text((120, 48), "03  ·  THE PROOF", fill=story.accent, font=font(22, bold=True))
    x, y, ww, hh = 100, 100, W - 200, H - 220
    d.rounded_rectangle([x, y, x + ww, y + hh], 18, fill=CARD, outline=BORDER, width=2)
    d.rounded_rectangle([x, y, x + ww, y + 52], 18, fill=SURFACE)
    d.rectangle([x, y + 36, x + ww, y + 52], fill=SURFACE)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse((x + 22 + i * 28, y + 16, x + 38 + i * 28, y + 32), fill=c)
    title = f"investigation — {story.slug} · fixtures/sample.json"
    tw = d.textlength(title, font=font(20))
    d.text((x + (ww - tw) / 2, y + 14), title, fill=MUTED, font=font(20))

    # slower reveal: more time on each line
    n = max(1, int(len(term_lines) * ease(progress)))
    ty = y + 78
    mono = font(25)
    for ln in term_lines[:n]:
        col = WHITE
        low = ln.lower()
        if any(h.lower() in ln for h in story.term_highlight):
            if any(x in ln for x in ("FAIL", "CRITICAL", "HIGH", "RED", "STALE", "CONF")):
                col = AMBER if "HIGH" in ln or "STALE" in ln else RED
            elif any(x in ln for x in ("PASS", "OK", "GREEN", "low")):
                col = GREEN
            else:
                col = story.accent
        if ln.startswith("===") or ln.startswith("discipline"):
            col = story.accent
        if ln.startswith("signal"):
            col = AMBER
        d.text((x + 36, ty), ln[:110], fill=col, font=mono)
        ty += 34
        if ty > y + hh - 36:
            break

    if progress > 0.35:
        d.rounded_rectangle(
            [x + ww - 300, y + 68, x + ww - 36, y + 112],
            12,
            fill=(30, 27, 55),
            outline=story.accent,
            width=2,
        )
        d.text((x + ww - 270, y + 78), "investigating", fill=story.accent, font=font(20, bold=True))
    lower_third(d, story.proof_label, story.accent)
    return img


def turn(story: DocStory, progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.text((120, 100), "04  ·  THE DISCIPLINE", fill=GREEN, font=font(24, bold=True))
    t1 = type_text(story.discipline_title, min(1.0, progress * 1.3))
    for i, line in enumerate(wrap(d, t1, font(44, bold=True), W - 240)):
        d.text((120, 240 + i * 56), line, fill=WHITE, font=font(44, bold=True))
    if progress > 0.35:
        y = 420
        bp = (progress - 0.35) / 0.65
        for i, b in enumerate(story.discipline_bullets):
            if bp > i * 0.22:
                d.text(
                    (120, y),
                    "→  " + type_text(b, min(1.0, (bp - i * 0.22) * 3)),
                    fill=MUTED,
                    font=font(28),
                )
                y += 52
    lower_third(d, story.slug + "  ·  free OSS alpha", story.accent)
    return img


def cta(story: DocStory, progress: float, cursor_on: bool) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 6], fill=story.accent)
    label = type_text(story.cta_line, min(1.0, progress * 1.4))
    tw = d.textlength(label, font=font(34, bold=True))
    d.text(((W - tw) / 2, 260), label, fill=WHITE, font=font(34, bold=True))
    cmd = story.cta_cmd
    shown = type_text(cmd, max(0.0, (progress - 0.22) / 0.5))
    if progress > 0.18:
        cw = d.textlength(cmd, font=font(36, bold=True)) + 80
        bx0 = (W - cw) / 2
        d.rounded_rectangle([bx0, 380, bx0 + cw, 470], 16, fill=CARD, outline=story.accent, width=2)
        d.text(
            (bx0 + 40, 404),
            shown + ("▌" if cursor_on and progress < 0.85 else ""),
            fill=GREEN,
            font=font(34, bold=True),
        )
    if progress > 0.72:
        fw = d.textlength(story.footer, font=font(20))
        d.text(((W - fw) / 2, 540), story.footer, fill=DIM, font=font(20))
    return img


def capture_term(slug: str) -> list[str]:
    prod = ROOT / slug
    r = subprocess.run(
        ["node", "demo/run-demo.mjs"],
        cwd=str(prod),
        capture_output=True,
        text=True,
        env={**os.environ, "NO_COLOR": "1"},
    )
    text = (r.stdout or r.stderr or "").strip()
    return text.splitlines() if text else [f"=== {slug} ===", "(no output)"]


def mix_audio(duration: float, seed: int) -> list[float]:
    rng = random.Random(seed)
    n = int(duration * SR)
    buf = [0.0] * n
    for i in range(n):
        t = i / SR
        bg = (
            0.038 * math.sin(2 * math.pi * 98 * t)
            + 0.028 * math.sin(2 * math.pi * 146.8 * t)
            + 0.018 * math.sin(2 * math.pi * 196 * t)
        )
        bg *= 0.5 + 0.12 * math.sin(2 * math.pi * 0.055 * t)
        fade = min(1.0, t / 1.4) * min(1.0, max(0.0, (duration - t) / 2.0))
        mid = 1.0 - 0.18 * math.exp(-((t - duration * 0.48) ** 2) / 40)
        buf[i] += bg * 0.36 * fade * mid
    for t0 in [j * 0.1 for j in range(int(duration * 5))]:
        if rng.random() < 0.4:
            continue
        start = int(t0 * SR)
        for j in range(int(0.012 * SR)):
            if start + j >= n:
                break
            tt = j / SR
            buf[start + j] += 0.016 * math.exp(-tt * 200) * math.sin(2 * math.pi * (300 + rng.random() * 100) * tt)
    peak = max(abs(x) for x in buf) or 1.0
    if peak > 0.9:
        buf = [x * 0.9 / peak for x in buf]
    return buf


def write_wav(path: Path, samples: list[float]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for s in samples:
            v = int(max(-1, min(1, s)) * 32767)
            frames += struct.pack("<hh", v, v)
        w.writeframes(frames)


def render_one(slug: str) -> Path:
    story = STORIES[slug]
    prod = ROOT / slug
    demo = prod / "demo"
    social = demo / "social"
    work = demo / "story_doc"
    demo.mkdir(parents=True, exist_ok=True)
    social.mkdir(parents=True, exist_ok=True)
    work.mkdir(parents=True, exist_ok=True)

    term_lines = capture_term(slug)
    print(f"\n=== DOC {slug} === lines={len(term_lines)}", flush=True)

    # Longer proof beat for terminal depth
    beats = [
        ("cold", 6.5),
        ("world", 7.2),
        ("stakes", 6.8),
        ("invest", 16.5),  # tightened explanation time
        ("turn", 6.2),
        ("cta", 6.8),
    ]
    duration = sum(d for _, d in beats)
    nframes = int(duration * FPS)
    edges = []
    t = 0.0
    for kind, dur in beats:
        edges.append((kind, t, t + dur))
        t += dur

    audio_path = work / "mix.wav"
    write_wav(audio_path, mix_audio(duration, seed=hash(slug) & 0xFFFF))

    out = demo / f"{slug}-demo-1080p.mp4"
    social_out = social / f"{slug}-social-1080p.mp4"

    def frame_at(fi: int) -> Image.Image:
        sec = fi / FPS
        kind, t0, t1 = edges[-1]
        for k, a, b in edges:
            if a <= sec < b:
                kind, t0, t1 = k, a, b
                break
        local = (sec - t0) / max(0.001, t1 - t0)
        cursor = (fi // 8) % 2 == 0
        if kind == "cold":
            return cold_open(story, local)
        if kind == "world":
            return chapter_world(story, local)
        if kind == "stakes":
            return chapter_stakes(story, local)
        if kind == "invest":
            return investigation(story, local, term_lines)
        if kind == "turn":
            return turn(story, local)
        return cta(story, local, cursor)

    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}", "-r", str(FPS),
        "-i", "pipe:0",
        "-i", str(audio_path),
        "-c:v", "libx264", "-preset", "medium", "-crf", "17",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest", "-movflags", "+faststart",
        str(out),
    ]
    print(f"  duration={duration:.1f}s frames={nframes}", flush=True)
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    assert proc.stdin
    for fi in range(nframes):
        proc.stdin.write(frame_at(fi).tobytes())
        if fi % 180 == 0:
            print(f"  frame {fi}/{nframes}", flush=True)
    proc.stdin.close()
    err = proc.stderr.read() if proc.stderr else b""
    rc = proc.wait(timeout=200)
    if rc != 0:
        raise RuntimeError(err[-800:].decode(errors="replace"))

    shutil.copy(out, social_out)
    gif = demo / f"{slug}-preview.gif"
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(out), "-t", "6",
            "-vf", "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
            str(gif),
        ],
        check=True,
        capture_output=True,
    )
    print(f"  DONE {social_out} ({social_out.stat().st_size/1e6:.1f} MB)", flush=True)
    return social_out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--only",
        default="cloud-waste-radar,dev-onboard-os,sbom-lite,grc-evidence-autopilot",
    )
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()
    if args.list:
        for s in STORIES:
            print(s)
        return 0
    slugs = [s.strip() for s in args.only.split(",") if s.strip()]
    for slug in slugs:
        if slug not in STORIES:
            print("unknown", slug)
            return 1
        # fix orange reference
        render_one(slug)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
