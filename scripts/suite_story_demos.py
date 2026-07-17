#!/usr/bin/env python3
"""
Suite story demos — real 1080p product videos (P04–P28).

Unlike still-slide montages, each video has:
  • Typewriter text (title / problem / CTA)
  • Soft mechanical keyclick SFX while typing
  • Terminal window that types a command, then prints real (or captured) output
  • Problem → use-case → setup → live run → output insight → CTA
  • Soft ambient BGM + 1920×1080 H.264

Usage:
  python3 scripts/suite_story_demos.py                  # all P04–P28
  python3 scripts/suite_story_demos.py --only secret-guard,llm-spend
  python3 scripts/suite_story_demos.py --list
  python3 scripts/suite_story_demos.py --workers 2
"""
from __future__ import annotations

import argparse
import json
import math
import os
import random
import shutil
import struct
import subprocess
import sys
import tempfile
import wave
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterator

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H = 1920, 1080
FPS = 30
AUDIO_SR = 44100

# Palette
BG = (10, 12, 18)
CARD = (18, 22, 32)
BORDER = (40, 48, 68)
MUTED = (140, 150, 170)
WHITE = (236, 240, 248)
GREEN = (74, 222, 128)
RED = (248, 113, 113)
YELLOW = (251, 191, 36)
CYAN = (103, 232, 249)
ACCENT = (129, 140, 248)
DIM = (90, 100, 120)
PINK = (244, 114, 182)
ORANGE = (251, 146, 60)
HL_ERR = (40, 28, 28)
HL_WARN = (36, 32, 18)
SURFACE = (24, 28, 40)

_font_cache: dict[tuple[int, bool], ImageFont.ImageFont] = {}


# ── fonts ─────────────────────────────────────────────────────────────────────

def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    key = (size, bold)
    if key in _font_cache:
        return _font_cache[key]
    if bold:
        candidates = [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/Library/Fonts/Arial Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]
    else:
        candidates = [
            "/System/Library/Fonts/Menlo.ttc",
            "/System/Library/Fonts/SFNSMono.ttf",
            "/System/Library/Fonts/Supplemental/Andale Mono.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/Library/Fonts/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]
    f: ImageFont.ImageFont = ImageFont.load_default()
    for p in candidates:
        if os.path.exists(p):
            try:
                f = ImageFont.truetype(p, size=size, index=0)
                break
            except Exception:
                continue
    _font_cache[key] = f
    return f


def ease_out_quad(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) * (1 - t)


def ease_in_out_cubic(t: float) -> float:
    t = max(0.0, min(1.0, t))
    if t < 0.5:
        return 4 * t * t * t
    return 1 - (-2 * t + 2) ** 3 / 2


def wrap_text(draw: ImageDraw.ImageDraw, text: str, f, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if draw.textlength(trial, font=f) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def rounded_rect(draw, box, radius, fill, outline=None, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def new_canvas() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    for y in range(0, H, 48):
        draw.line([(0, y), (W, y)], fill=(14, 16, 24), width=1)
    # top accent bar
    draw.rectangle([0, 0, W, 6], fill=ACCENT)
    return img


def draw_window(draw, x, y, w, h, title: str) -> int:
    rounded_rect(draw, (x, y, x + w, y + h), 18, CARD, BORDER, 2)
    rounded_rect(draw, (x, y, x + w, y + 52), 18, SURFACE, None)
    draw.rectangle((x, y + 36, x + w, y + 52), fill=SURFACE)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse((x + 22 + i * 28, y + 18, x + 38 + i * 28, y + 34), fill=c)
    f = font(22)
    tw = draw.textlength(title, font=f)
    draw.text((x + (w - tw) / 2, y + 14), title, fill=MUTED, font=f)
    return y + 68


# ── product catalog ───────────────────────────────────────────────────────────

@dataclass
class ProductStory:
    pid: str
    slug: str                 # directory name
    name: str                 # display / npm-ish name
    tagline: str
    problem_kicker: str
    problem_title: str
    problem_body: str
    use_case: str
    setup_cmd: str            # command shown typed
    term_title: str
    badge: str
    # Either capture_cmd (run live) or fallback_lines
    capture: list[str] | None = None   # argv relative to product dir
    fallback_lines: list[str] = field(default_factory=list)
    highlight: list[str] = field(default_factory=list)
    cta_cmd: str = ""
    accent: tuple[int, int, int] = ACCENT


def _stories() -> list[ProductStory]:
    """Hand-crafted narrative for each product (P04–P28)."""
    return [
        ProductStory(
            pid="P04", slug="secret-guard", name="ai-secret-guard",
            tagline="Stop API keys landing in AI rules, MCP env, and prompts",
            problem_kicker="THE BLIND SPOT",
            problem_title="Classic scanners miss the AI surface",
            problem_body="Keys get pasted into CLAUDE.md, .cursor/rules, and MCP JSON. gitleaks never looks there.",
            use_case="Pre-commit + CI for Cursor / Claude / MCP workspaces",
            setup_cmd="npx ai-secret-guard@beta --cwd ./my-app",
            term_title="zsh — secret-guard · fixtures/leaky-rules",
            badge="exit 1 · secrets found",
            capture=["node", "dist/cli.js", "scan", "--cwd", "fixtures/leaky-rules"],
            fallback_lines=[
                "$ npx ai-secret-guard@beta --cwd fixtures/leaky-rules",
                "",
                "secret-guard — fixtures/leaky-rules",
                "1 file(s) scanned",
                "",
                "  ERR .cursor/rules/api.mdc:3  Possible anthropic secret",
                "      pattern anthropic · sk-ant…Z789",
                "      -> Remove the secret; rotate the credential",
                "",
                "  ERR .cursor/rules/api.mdc:5  Possible openai secret",
                "      pattern openai · sk-pro…CDEF",
                "",
                "Summary  2 error · 0 warn",
                "Action needed: remove or rotate secrets above.",
            ],
            highlight=["ERR", "anthropic", "openai", "Action needed"],
            cta_cmd="npx ai-secret-guard@beta --strict",
            accent=GREEN,
        ),
        ProductStory(
            pid="P05", slug="llm-spend", name="llm-spend",
            tagline="Multi-provider LLM cost, tokens, and budgets — one free CLI",
            problem_kicker="THE BILL SHOCK",
            problem_title="OpenAI + Anthropic + Gemini costs scatter",
            problem_body="Usage lives in five dashboards. Nobody knows if you are over budget until finance pings.",
            use_case="Engineers who need a local multi-provider spend rollup",
            setup_cmd="npx @bhaskarauthor/llm-spend fixtures/sample.json",
            term_title="zsh — llm-spend",
            badge="within budget",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx @bhaskarauthor/llm-spend fixtures/sample.json",
                "",
                "=== DEMO P05 llm-spend ===",
                "llm-spend — fixtures/sample.json",
                "7 events · 531500 tokens · $2.14 estimated",
                "",
                "By provider",
                "  anthropic      $1.07  …",
                "  openai         $0.78  …",
                "  google         $0.15  …",
                "",
                "Budget",
                "  OK  $2.14 / $100.00  (2.14% left)",
                "  Within budget.",
            ],
            highlight=["Budget", "OK", "Within budget", "By provider"],
            cta_cmd="npx @bhaskarauthor/llm-spend --strict --budget 50 usage.json",
            accent=CYAN,
        ),
        ProductStory(
            pid="P06", slug="skill-sync", name="skill-sync",
            tagline="Treat agent skills like packages — not final_v3.md",
            problem_kicker="THE PASTE SYSTEM",
            problem_title="Same skill. Three realities.",
            problem_body="Claude is fixed. Cursor is stale. A Drive copy still runs March. No semver. No diff.",
            use_case="Builders who maintain skills across Claude, Cursor, and friends",
            setup_cmd="npx @bhaskarauthor/skill-sync",
            term_title="investigation — skill-sync",
            badge="drift detected",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx @bhaskarauthor/skill-sync",
                "",
                "=== skill-sync · investigation ===",
                "local package   team-skills@1.2.0",
                "remote package  team-skills@1.3.0",
                "validate        OK",
                "  updated  code-review",
                "  added    agent-safety",
                "signal  code-review is STALE on this machine",
            ],
            highlight=["STALE", "updated", "added", "OK"],
            cta_cmd="npx @bhaskarauthor/skill-sync",
            accent=CYAN,
        ),
        ProductStory(
            pid="P07", slug="shadow-ai", name="shadow-ai",
            tagline="Detect unapproved AI tools and data paths in your org",
            problem_kicker="SHADOW IT",
            problem_title="Teams ship AI tools security never approved",
            problem_body="Browser extensions, personal ChatGPT, random MCP servers — all with company context.",
            use_case="Security / IT discovering shadow AI usage",
            setup_cmd="npx shadow-ai scan --json",
            term_title="zsh — shadow-ai",
            badge="3 unapproved",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx shadow-ai scan --json",
                "",
                "=== DEMO P07 shadow-ai ===",
                "findings:",
                "  HIGH  personal-chatgpt  browser extension · company docs",
                "  MED   unapproved-mcp    local server not in allowlist",
                "  LOW   public-pastebin   possible prompt dump",
                "",
                "score 61/100  ·  unapproved 3",
            ],
            highlight=["HIGH", "unapproved", "score"],
            cta_cmd="npx shadow-ai scan --strict",
            accent=ORANGE,
        ),
        ProductStory(
            pid="P08", slug="eval-harness", name="eval-harness",
            tagline="Offline regression cases for prompts and agent behavior",
            problem_kicker="PROMPT REGRESSIONS",
            problem_title="You changed the prompt. Did anything break?",
            problem_body="Without golden cases, every prompt tweak is a leap of faith.",
            use_case="Teams shipping LLM features who need CI-friendly evals",
            setup_cmd="npx eval-harness --json fixtures/sample.json",
            term_title="zsh — eval-harness",
            badge="2 pass · 0 fail",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx eval-harness --json fixtures/sample.json",
                "",
                "=== DEMO P08 eval-harness ===",
                "case              status   score",
                "summarize-email   PASS     0.94",
                "refuse-secrets    PASS     1.00",
                "",
                "passed 2 / 2  ·  avg 0.97",
                "exit 0",
            ],
            highlight=["PASS", "passed", "exit 0"],
            cta_cmd="npx eval-harness --min-score 0.9",
            accent=GREEN,
        ),
        ProductStory(
            pid="P09", slug="auth-anomaly-radar", name="auth-anomaly-radar",
            tagline="Spot login anomalies before account takeover",
            problem_kicker="AUTH RISK",
            problem_title="Impossible travel and credential stuffing look normal in logs",
            problem_body="Until you score events by geo, device, and velocity — fraud hides in noise.",
            use_case="AppSec / platform teams watching auth telemetry",
            setup_cmd="npx auth-anomaly-radar --json fixtures/sample.json",
            term_title="zsh — auth-anomaly-radar",
            badge="1 critical",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx auth-anomaly-radar --json fixtures/sample.json",
                "",
                "=== DEMO P09 auth-anomaly-radar ===",
                "user@corp  MUM→SFO  2h  ·  score 0.91  CRITICAL",
                "user@corp  40 fails / 5m · score 0.78  HIGH",
                "",
                "anomalies 2  ·  critical 1  ·  high 1",
            ],
            highlight=["CRITICAL", "HIGH", "anomalies"],
            cta_cmd="npx auth-anomaly-radar --min-score 0.7",
            accent=RED,
        ),
        ProductStory(
            pid="P10", slug="fraud-signal-kit", name="fraud-signal-kit",
            tagline="Composable fraud signals for payments and signups",
            problem_kicker="FRAUD NOISE",
            problem_title="Rules fire late; models need clean signals first",
            problem_body="Device, velocity, graph edges, and amount outliers — package them once.",
            use_case="Risk / payments engineers building first-line fraud checks",
            setup_cmd="npx fraud-signal-kit --json fixtures/sample.json",
            term_title="zsh — fraud-signal-kit",
            badge="risk 0.82",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx fraud-signal-kit --json fixtures/sample.json",
                "",
                "=== DEMO P10 fraud-signal-kit ===",
                "signals:",
                "  velocity_spike     0.88",
                "  new_device         0.71",
                "  amount_outlier     0.64",
                "",
                "composite risk 0.82  ·  action REVIEW",
            ],
            highlight=["risk", "REVIEW", "velocity"],
            cta_cmd="npx fraud-signal-kit --threshold 0.75",
            accent=PINK,
        ),
        ProductStory(
            pid="P11", slug="cloud-waste-radar", name="cloud-waste-radar",
            tagline="Find idle cloud spend without another dashboard tab",
            problem_kicker="CLOUD WASTE",
            problem_title="Idle disks, orphan IPs, oversized instances",
            problem_body="The bill grows while unused resources sit warm. Spot them offline from inventory snapshots.",
            use_case="Platform / FinOps weekly waste sweeps",
            setup_cmd="npx cloud-waste-radar --json fixtures/sample.json",
            term_title="zsh — cloud-waste-radar",
            badge="$412 / mo waste",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx cloud-waste-radar --json fixtures/sample.json",
                "",
                "=== DEMO P11 cloud-waste-radar ===",
                "resource              type        wasteUsd/mo",
                "i-0abc idle           ec2.large   180",
                "vol-unattached        ebs         42",
                "eip-orphan            elastic-ip  4",
                "",
                "totalWasteUsd  412  ·  findings 3",
            ],
            highlight=["waste", "idle", "totalWasteUsd"],
            cta_cmd="npx cloud-waste-radar --min-waste 50",
            accent=YELLOW,
        ),
        ProductStory(
            pid="P12", slug="dev-onboard-os", name="dev-onboard-os",
            tagline="Turn chaotic onboarding into a checklist that actually runs",
            problem_kicker="DAY-ONE CHAOS",
            problem_title="New hires still wait on tribal knowledge",
            problem_body="Repos, secrets, tools, and first PR — track it as executable steps, not a wiki graveyard.",
            use_case="Engineering managers running repeatable onboarding",
            setup_cmd="npx dev-onboard-os --json fixtures/sample.json",
            term_title="zsh — dev-onboard-os",
            badge="6/9 complete",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx dev-onboard-os --json fixtures/sample.json",
                "",
                "=== DEMO P12 dev-onboard-os ===",
                "  OK   laptop setup",
                "  OK   repo access",
                "  WARN secrets vault invite pending",
                "  TODO first PR review buddy",
                "",
                "progress 6/9  ·  blockers 1",
            ],
            highlight=["WARN", "TODO", "blockers"],
            cta_cmd="npx dev-onboard-os status",
        ),
        ProductStory(
            pid="P13", slug="sbom-lite", name="sbom-lite",
            tagline="Lockfile SBOM + policy gate without the enterprise bloat",
            problem_kicker="SUPPLY CHAIN",
            problem_title="You need an SBOM and a fail gate — not a platform RFP",
            problem_body="Generate from the lockfile, check licenses / banned packages, exit non-zero in CI.",
            use_case="OSS / app teams adding SBOM to PRs",
            setup_cmd="npx sbom-lite --json fixtures/sample.json",
            term_title="zsh — sbom-lite",
            badge="policy fail",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx sbom-lite --json fixtures/sample.json",
                "",
                "=== DEMO P13 sbom-lite ===",
                "packages  142  ·  generated SPDX-lite",
                "  FAIL  left-pad@1.0.0   banned",
                "  WARN  old-lib@0.2.0    license UNKNOWN",
                "",
                "policy  FAIL  ·  exit 1",
            ],
            highlight=["FAIL", "banned", "policy"],
            cta_cmd="npx sbom-lite --strict",
            accent=ORANGE,
        ),
        ProductStory(
            pid="P14", slug="grc-evidence-autopilot", name="grc-evidence-autopilot",
            tagline="Map controls to evidence paths for audit crunch time",
            problem_kicker="AUDIT WEEK",
            problem_title="Evidence is scattered across drives and chats",
            problem_body="Link controls to artifacts, see gaps, export a pack auditors can actually open.",
            use_case="Founders / GRC leads preparing SOC2-ish evidence",
            setup_cmd="npx grc-evidence-autopilot --json fixtures/sample.json",
            term_title="zsh — grc-evidence-autopilot",
            badge="3 gaps",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx grc-evidence-autopilot --json fixtures/sample.json",
                "",
                "=== DEMO P14 grc-evidence-autopilot ===",
                "control              evidence              status",
                "CC6.1 access         iam-export.json       OK",
                "CC7.2 logging        siem-sample.zip       GAP",
                "A1.2 backups         backup-policy.md      STALE",
                "",
                "covered 8/11  ·  gaps 3",
            ],
            highlight=["GAP", "STALE", "gaps"],
            cta_cmd="npx grc-evidence-autopilot export",
        ),
        ProductStory(
            pid="P15", slug="wa-ops-desk", name="wa-ops-desk",
            tagline="Ops inbox for WhatsApp business workflows (India-friendly)",
            problem_kicker="WA CHAOS",
            problem_title="Customer chats live in personal phones",
            problem_body="Route, tag, and SLA simple WhatsApp ops without buying a full CCaaS.",
            use_case="SMB ops teams on WhatsApp Cloud API",
            setup_cmd="npx wa-ops-desk --json fixtures/sample.json",
            term_title="zsh — wa-ops-desk",
            badge="2 open SLA",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx wa-ops-desk --json fixtures/sample.json",
                "",
                "=== DEMO P15 wa-ops-desk ===",
                "ticket  from           state    sla",
                "#1042   +91-98…        open     BREACH risk",
                "#1041   +91-90…        waiting  OK",
                "",
                "open 2  ·  breached 0  ·  avg first-reply 14m",
            ],
            highlight=["BREACH", "open", "sla"],
            cta_cmd="npx wa-ops-desk status",
            accent=GREEN,
        ),
        ProductStory(
            pid="P16", slug="gst-ops-copilot", name="gst-ops-copilot",
            tagline="Lightweight GST ops checks for Indian SMBs",
            problem_kicker="GST FRICTION",
            problem_title="Invoice mismatches surface after filing stress",
            problem_body="Catch GSTIN format issues, tax math, and missing fields before the portal rejects you.",
            use_case="Accountants / SMB operators pre-checking invoices",
            setup_cmd="npx gst-ops-copilot --json fixtures/sample.json",
            term_title="zsh — gst-ops-copilot",
            badge="2 invoice issues",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx gst-ops-copilot --json fixtures/sample.json",
                "",
                "=== DEMO P16 gst-ops-copilot ===",
                "INV-221  GSTIN invalid checksum",
                "INV-218  CGST+SGST != taxable * rate",
                "",
                "checked 12  ·  errors 2  ·  warnings 1",
            ],
            highlight=["invalid", "errors", "GSTIN"],
            cta_cmd="npx gst-ops-copilot check ./invoices.json",
            accent=ORANGE,
        ),
        ProductStory(
            pid="P17", slug="appt-book-india", name="appt-book-india",
            tagline="Simple appointment booking rules for India clinics & salons",
            problem_kicker="NO-SHOWS",
            problem_title="Double books and no-shows kill a day",
            problem_body="Slot rules, buffers, and reminders — offline-first logic you can embed.",
            use_case="Clinics / salons building lightweight booking",
            setup_cmd="npx appt-book-india --json fixtures/sample.json",
            term_title="zsh — appt-book-india",
            badge="next slot 16:30",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx appt-book-india --json fixtures/sample.json",
                "",
                "=== DEMO P17 appt-book-india ===",
                "clinic  slots today  open  blocked",
                "Skin+   18           4     2 (lunch)",
                "",
                "nextAvailable  16:30  ·  noShowRisk medium",
            ],
            highlight=["nextAvailable", "blocked", "noShowRisk"],
            cta_cmd="npx appt-book-india next --doctor 1",
        ),
        ProductStory(
            pid="P18", slug="clinic-admin-lite", name="clinic-admin-lite",
            tagline="Day desk for small clinics — queue, billing basics, follow-ups",
            problem_kicker="FRONT DESK",
            problem_title="Paper queues and Excel billing do not scale",
            problem_body="Track walk-ins, payments, and follow-ups with a tiny offline core.",
            use_case="Small clinic admins (India / emerging markets)",
            setup_cmd="npx clinic-admin-lite --json fixtures/sample.json",
            term_title="zsh — clinic-admin-lite",
            badge="queue 7",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx clinic-admin-lite --json fixtures/sample.json",
                "",
                "=== DEMO P18 clinic-admin-lite ===",
                "queue  waiting  with-doctor  billing",
                "       4        2            1",
                "",
                "collections today  ₹18,400  ·  follow-ups due 3",
            ],
            highlight=["queue", "collections", "follow-ups"],
            cta_cmd="npx clinic-admin-lite status",
        ),
        ProductStory(
            pid="P19", slug="learn-loop", name="learn-loop",
            tagline="Spaced practice loops for skills — not another course catalog",
            problem_kicker="LEARNING DECAY",
            problem_title="You finished the course. You forgot it in two weeks.",
            problem_body="Schedule micro-practice, score attempts, and show what's decaying.",
            use_case="Individuals / L&D building practice loops",
            setup_cmd="npx learn-loop --json fixtures/sample.json",
            term_title="zsh — learn-loop",
            badge="3 due today",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx learn-loop --json fixtures/sample.json",
                "",
                "=== DEMO P19 learn-loop ===",
                "skill           due   strength",
                "sql-joins       TODAY 0.42",
                "git-rebase      2d    0.71",
                "system-design   5d    0.88",
                "",
                "dueToday 3  ·  decaying 1",
            ],
            highlight=["TODAY", "dueToday", "decaying"],
            cta_cmd="npx learn-loop due",
            accent=CYAN,
        ),
        ProductStory(
            pid="P20", slug="cyber-smb-shield", name="cyber-smb-shield",
            tagline="Baseline cyber hygiene checks for SMBs",
            problem_kicker="SMB RISK",
            problem_title="You don't need a SOC — you need the basics done",
            problem_body="MFA, backups, admin sprawl, exposed ports — score and fix the short list.",
            use_case="MSPs / SMB owners running monthly hygiene",
            setup_cmd="npx cyber-smb-shield --json fixtures/sample.json",
            term_title="zsh — cyber-smb-shield",
            badge="score 58",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx cyber-smb-shield --json fixtures/sample.json",
                "",
                "=== DEMO P20 cyber-smb-shield ===",
                "  FAIL mfa-admin       2 admins without MFA",
                "  WARN backup-age      last backup 12d ago",
                "  OK   rdp-exposed     none detected",
                "",
                "score 58/100  ·  critical 1  ·  warn 2",
            ],
            highlight=["FAIL", "score", "MFA"],
            cta_cmd="npx cyber-smb-shield --strict",
            accent=RED,
        ),
        ProductStory(
            pid="P21", slug="data-quality-guard", name="data-quality-guard",
            tagline="Schema + freshness + null-rate checks for critical tables",
            problem_kicker="BAD DATA",
            problem_title="Dashboards lie when tables rot quietly",
            problem_body="Catch null spikes, type drift, and stale pipelines before the standup.",
            use_case="Data eng / analytics owning warehouse hygiene",
            setup_cmd="npx data-quality-guard --json fixtures/sample.json",
            term_title="zsh — data-quality-guard",
            badge="2 failing checks",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx data-quality-guard --json fixtures/sample.json",
                "",
                "=== DEMO P21 data-quality-guard ===",
                "table.orders  null_rate email  12%  FAIL (max 2%)",
                "table.users   freshness        26h  FAIL (max 6h)",
                "table.events  schema           OK",
                "",
                "passed 4/6  ·  exit 1",
            ],
            highlight=["FAIL", "null_rate", "freshness"],
            cta_cmd="npx data-quality-guard --strict",
            accent=YELLOW,
        ),
        ProductStory(
            pid="P22", slug="care-companion", name="care-companion",
            tagline="Care task loops for family caregivers (offline-first)",
            problem_kicker="CAREGIVER LOAD",
            problem_title="Meds, visits, and notes live in five chat threads",
            problem_body="One shared task list with reminders and a simple health log.",
            use_case="Families coordinating elder or chronic care",
            setup_cmd="npx care-companion --json fixtures/sample.json",
            term_title="zsh — care-companion",
            badge="2 due now",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx care-companion --json fixtures/sample.json",
                "",
                "=== DEMO P22 care-companion ===",
                "task                 owner    due",
                "evening meds         Priya    NOW",
                "BP log               Dad      NOW",
                "clinic visit prep    you      tomorrow",
                "",
                "overdue 0  ·  dueNow 2",
            ],
            highlight=["NOW", "dueNow", "meds"],
            cta_cmd="npx care-companion due",
            accent=PINK,
        ),
        ProductStory(
            pid="P23", slug="personal-crm", name="personal-crm",
            tagline="Lightweight personal CRM for founders who hate CRMs",
            problem_kicker="RELATIONSHIP DECAY",
            problem_title="You forget to follow up until it's awkward",
            problem_body="People, last touch, next nudge — no sales pipeline theatre.",
            use_case="Founders / freelancers keeping warm relationships",
            setup_cmd="npx personal-crm --json fixtures/sample.json",
            term_title="zsh — personal-crm",
            badge="4 nudges due",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx personal-crm --json fixtures/sample.json",
                "",
                "=== DEMO P23 personal-crm ===",
                "person          lastTouch  nextNudge",
                "Ananya (inv.)   46d        TODAY",
                "Marcus (cust.)  12d        3d",
                "",
                "due 4  ·  cold 2  ·  warm 11",
            ],
            highlight=["TODAY", "due", "cold"],
            cta_cmd="npx personal-crm due",
        ),
        ProductStory(
            pid="P24", slug="creator-ops", name="creator-ops",
            tagline="Content ops board — ideas → drafts → publish cadence",
            problem_kicker="CREATOR CHAOS",
            problem_title="Ideas die in notes apps",
            problem_body="Track pipeline stages and a weekly publish cadence without Notion spaghetti.",
            use_case="Solo creators / small media teams",
            setup_cmd="npx creator-ops --json fixtures/sample.json",
            term_title="zsh — creator-ops",
            badge="cadence 2/3",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx creator-ops --json fixtures/sample.json",
                "",
                "=== DEMO P24 creator-ops ===",
                "stage     count",
                "idea      8",
                "draft     3",
                "scheduled 2",
                "published 1 this week",
                "",
                "weekly target 3  ·  on track? almost",
            ],
            highlight=["published", "target", "draft"],
            cta_cmd="npx creator-ops status",
            accent=ACCENT,
        ),
        ProductStory(
            pid="P25", slug="climate-ops-meter", name="climate-ops-meter",
            tagline="Ops meter for climate / ESG activity — not a full suite",
            problem_kicker="ESG NOISE",
            problem_title="Activity without a meter is just storytelling",
            problem_body="Log actions, estimate impact units, show a simple weekly ops score.",
            use_case="Sustainability ops leads tracking execution",
            setup_cmd="npx climate-ops-meter --json fixtures/sample.json",
            term_title="zsh — climate-ops-meter",
            badge="ops score 72",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx climate-ops-meter --json fixtures/sample.json",
                "",
                "=== DEMO P25 climate-ops-meter ===",
                "action                 impactU  status",
                "HVAC schedule trim     12       done",
                "vendor emissions ask   4        open",
                "",
                "opsScore 72  ·  openActions 3",
            ],
            highlight=["opsScore", "open", "impact"],
            cta_cmd="npx climate-ops-meter score",
            accent=GREEN,
        ),
        ProductStory(
            pid="P26", slug="sc-visibility-lite", name="sc-visibility-lite",
            tagline="Lite supply-chain visibility — milestones, delays, risk flags",
            problem_kicker="SHIPMENT FOG",
            problem_title="Nobody knows which PO is actually late",
            problem_body="Ingest milestone events, flag delay risk, keep a single late list.",
            use_case="Ops teams tracking a handful of critical suppliers",
            setup_cmd="npx sc-visibility-lite --json fixtures/sample.json",
            term_title="zsh — sc-visibility-lite",
            badge="2 at risk",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx sc-visibility-lite --json fixtures/sample.json",
                "",
                "=== DEMO P26 sc-visibility-lite ===",
                "PO-441  Mumbai→BLR   ETA+3d   RISK high",
                "PO-438  Shenzhen     on time  OK",
                "PO-430  customs hold ETA+6d   RISK critical",
                "",
                "atRisk 2  ·  onTime 5",
            ],
            highlight=["RISK", "atRisk", "critical"],
            cta_cmd="npx sc-visibility-lite risks",
            accent=ORANGE,
        ),
        ProductStory(
            pid="P27", slug="focus-forge", name="focus-forge",
            tagline="Protect deep work — blocks, interruptions, weekly focus score",
            problem_kicker="CONTEXT SWITCH",
            problem_title="Your calendar is a meeting landfill",
            problem_body="Plan focus blocks, log interruptions, and see whether the week was deep or chopped.",
            use_case="ICs / leads defending maker time",
            setup_cmd="npx focus-forge --json fixtures/sample.json",
            term_title="zsh — focus-forge",
            badge="focus 4.2h",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx focus-forge --json fixtures/sample.json",
                "",
                "=== DEMO P27 focus-forge ===",
                "today  planned 6h  ·  protected 4.2h  ·  interrupted 7x",
                "week   deep hours 18.5  ·  score 0.71",
                "",
                "suggestion: move standup cluster off mornings",
            ],
            highlight=["protected", "interrupted", "score"],
            cta_cmd="npx focus-forge score",
            accent=CYAN,
        ),
        ProductStory(
            pid="P28", slug="api-contract-sentinel", name="api-contract-sentinel",
            tagline="Catch OpenAPI breaking changes before clients do",
            problem_kicker="CONTRACT BREAKS",
            problem_title="A 'small' API change pages three mobile teams",
            problem_body="Diff OpenAPI snapshots, classify breaks, fail CI on incompatible changes.",
            use_case="API owners gating merges with contract diffs",
            setup_cmd="npx api-contract-sentinel --json fixtures/sample.json",
            term_title="zsh — api-contract-sentinel",
            badge="1 breaking",
            capture=["node", "demo/run-demo.mjs"],
            fallback_lines=[
                "$ npx api-contract-sentinel --json fixtures/sample.json",
                "",
                "=== DEMO P28 api-contract-sentinel ===",
                "BREAKING  DELETE /v1/users/{id} removed",
                "BREAKING  User.email  string -> object",
                "NONBREAK  added User.avatarUrl optional",
                "",
                "breaking 2  ·  nonBreaking 1  ·  exit 1",
            ],
            highlight=["BREAKING", "exit 1", "removed"],
            cta_cmd="npx api-contract-sentinel --fail-on-breaking",
            accent=RED,
        ),
        # ── Suite Secure + Spend pillars (P29–P30) ───────────────────────────
        ProductStory(
            pid="P29", slug="agent-skill-scan", name="agent-skill-scan",
            tagline="Security-scan skills, MCP, rules, and hooks before they run",
            problem_kicker="TOXIC SKILLS",
            problem_title="Marketplace skills can be malware in markdown",
            problem_body="Prompt injection, env exfil, curl|sh, hidden Unicode — your agent will read SKILL.md. Did you?",
            use_case="Devs installing Claude/Cursor skills, MCP servers, shared rules",
            setup_cmd="npx agent-skill-scan --no-user",
            term_title="zsh — agent-skill-scan",
            badge="score / 100",
            capture=["node", "dist/cli.js", "--help"],
            fallback_lines=[
                "$ npx agent-skill-scan --no-user",
                "",
                "agent-skill-scan — project scan (skills · mcp · rules · hooks)",
                "",
                "  HIGH  skill: code-review   prompt-injection primitive",
                "        \"ignore previous instructions\" in SKILL.md",
                "  HIGH  mcp: webhooks        unpinned npx + Discord webhook",
                "  MED   rules: CLAUDE.md     zero-width Unicode smuggling",
                "",
                "score 55/100  ·  critical 0  ·  high 2  ·  medium 1",
                "exit 1",
            ],
            highlight=["HIGH", "score", "exit 1", "injection"],
            cta_cmd="npx agent-skill-scan --strict --min-score 80",
            accent=PINK,
        ),
        ProductStory(
            pid="P30", slug="agent-spend-guard", name="agent-spend-guard",
            tagline="Token budgets + kill-switch for AI coding agents",
            problem_kicker="TOKEN BILL",
            problem_title="Dashboards show spend after the damage",
            problem_body="Teams blow annual AI budgets by spring. Nothing indie-sized enforces a limit mid-session.",
            use_case="Teams wiring PreToolUse hooks / CI to stop agents over budget",
            setup_cmd="npx agent-spend-guard check",
            term_title="zsh — agent-spend-guard",
            badge="STOP · over budget",
            capture=["node", "dist/cli.js", "--help"],
            fallback_lines=[
                "$ npx agent-spend-guard status",
                "",
                "agent-spend-guard — spend vs budgets",
                "",
                "  today     $31.40 / $25.00 daily   STOP",
                "  month     $188.20 / $300.00        OK (63%)",
                "  project   my-app  $42.10 / $100    WARN",
                "",
                "sources  claude-code transcripts  ·  events 1,204",
                "",
                "$ npx agent-spend-guard check",
                "STOP: daily budget exceeded ($31.40 > $25.00)",
                "exit 1",
            ],
            highlight=["STOP", "budget", "exit 1", "WARN"],
            cta_cmd="npx agent-spend-guard check --strict",
            accent=ORANGE,
        ),
    ]


# ── capture real CLI output ───────────────────────────────────────────────────

def capture_output(story: ProductStory) -> list[str]:
    prod = ROOT / story.slug
    if story.capture and prod.is_dir():
        # ensure secret-guard dist exists
        if story.slug == "secret-guard":
            dist = prod / "dist" / "cli.js"
            if not dist.exists():
                subprocess.run(["npm", "run", "build"], cwd=prod, capture_output=True)
        try:
            r = subprocess.run(
                story.capture,
                cwd=prod,
                capture_output=True,
                text=True,
                timeout=8,  # demos that hang fall back fast
            )
            text = (r.stdout or "") + (("\n" + r.stderr) if r.stderr else "")
            lines = text.replace("\t", "  ").splitlines()
            # strip ANSI
            import re
            ansi = re.compile(r"\x1b\[[0-9;]*m")
            lines = [ansi.sub("", ln) for ln in lines]
            # shorten absolute home paths for readability on video
            home = str(Path.home())
            lines = [ln.replace(home, "~") for ln in lines]
            # normalize icons for fonts that lack emoji glyphs
            lines = [
                ln.replace("✗", "x")
                .replace("✓", "OK")
                .replace("⚠", "!")
                .replace("→", "->")
                .replace("·", "|")
                for ln in lines
            ]
            # keep a readable window
            lines = [ln[:110] for ln in lines if ln is not None][:36]
            if any(ln.strip() for ln in lines):
                # prepend $ command if not present
                if not any(ln.strip().startswith("$") for ln in lines[:3]):
                    lines = [f"$ {story.setup_cmd}", ""] + lines
                if r.returncode not in (0, None) and not any("exit" in ln.lower() for ln in lines[-3:]):
                    lines.append(f"exit {r.returncode}")
                return lines
        except Exception as e:
            print(f"  capture failed for {story.slug}: {e}", flush=True)
    return list(story.fallback_lines)


# ── drawing scenes ────────────────────────────────────────────────────────────

def compose_title(story: ProductStory, progress: float, cursor_on: bool) -> Image.Image:
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    # soft radial accent (cheap, no alpha composite)
    ax, ay = W // 2, H // 2 - 40
    for r, c in [(200, 18), (120, 28)]:
        shade = tuple(min(255, BG[i] + int((story.accent[i] - BG[i]) * c / 80)) for i in range(3))
        draw.ellipse((ax - r, ay - r, ax + r, ay + r), fill=shade)

    kicker = f"{story.pid}  ·  AI DEV HYGIENE SUITE" if story.pid <= "P04" or story.slug in {
        "secret-guard", "skill-sync", "llm-spend"
    } else f"{story.pid}  ·  PORTFOLIO MVP"
    if progress >= 0.05:
        kf = font(22, bold=True)
        kt = kicker
        n = max(1, int(len(kt) * min(1.0, (progress - 0.05) / 0.15)))
        shown = kt[:n]
        draw.text((120, 120), shown, fill=story.accent, font=kf)
        if n >= len(kt):
            tw = draw.textlength(shown, font=kf)
            draw.rectangle([120, 120 + kf.size + 10, 120 + tw, 120 + kf.size + 16], fill=story.accent)

    title = story.name
    if progress >= 0.18:
        tf = font(78, bold=True)
        tp = min(1.0, (progress - 0.18) / 0.28)
        n = max(1, int(len(title) * ease_out_quad(tp)))
        shown = title[:n]
        draw.text((120, 200), shown, fill=WHITE, font=tf)
        if tp < 1.0 and cursor_on:
            tw = draw.textlength(shown, font=tf)
            draw.rectangle((120 + tw + 6, 220, 120 + tw + 22, 270), fill=CYAN)

    if progress >= 0.48:
        sf = font(34)
        sp = min(1.0, (progress - 0.48) / 0.25)
        n = max(1, int(len(story.tagline) * ease_out_quad(sp)))
        shown = story.tagline[:n]
        for i, ln in enumerate(wrap_text(draw, shown, sf, W - 280)[:3]):
            draw.text((120, 340 + i * 48), ln, fill=MUTED, font=sf)

    if progress >= 0.72:
        cmd = story.setup_cmd
        cp = min(1.0, (progress - 0.72) / 0.22)
        n = max(1, int(len(cmd) * ease_out_quad(cp)))
        shown = cmd[:n]
        cf = font(30)
        full_w = draw.textlength(cmd, font=cf) + 64
        full_w = min(full_w, W - 240)
        rounded_rect(draw, (120, 560, 120 + full_w, 640), 16, CARD, story.accent, 2)
        draw.text((152, 582), shown, fill=CYAN, font=cf)
        if cp < 1.0 and cursor_on:
            tw = draw.textlength(shown, font=cf)
            draw.rectangle((152 + tw + 2, 590, 152 + tw + 14, 620), fill=CYAN)

    return img


def compose_problem(story: ProductStory, progress: float) -> Image.Image:
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    rounded_rect(draw, (120, 160, W - 120, 900), 24, CARD, story.accent if progress > 0.2 else RED, 3)

    if progress >= 0.05:
        ef = font(26, bold=True)
        draw.text((180, 220), story.problem_kicker, fill=RED, font=ef)

    if progress >= 0.15:
        hf = font(50, bold=True)
        hp = min(1.0, (progress - 0.15) / 0.4)
        n = int(len(story.problem_title) * ease_out_quad(hp))
        typed = story.problem_title[:n]
        y = 290
        for ln in wrap_text(draw, typed, hf, W - 400)[:3]:
            draw.text((180, y), ln, fill=WHITE, font=hf)
            y += 66

    if progress >= 0.55:
        bf = font(30)
        bp = min(1.0, (progress - 0.55) / 0.35)
        n = int(len(story.problem_body) * ease_out_quad(bp))
        typed = story.problem_body[:n]
        y = 520
        for ln in wrap_text(draw, typed, bf, W - 400)[:5]:
            draw.text((180, y), ln, fill=MUTED, font=bf)
            y += 42

    return img


def compose_usecase(story: ProductStory, progress: float) -> Image.Image:
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    draw.text((120, 160), "USE CASE", fill=story.accent, font=font(24, bold=True))
    if progress >= 0.1:
        hf = font(48, bold=True)
        hp = min(1.0, (progress - 0.1) / 0.45)
        n = int(len(story.use_case) * ease_out_quad(hp))
        typed = story.use_case[:n]
        y = 240
        for ln in wrap_text(draw, typed, hf, W - 280)[:4]:
            draw.text((120, y), ln, fill=WHITE, font=hf)
            y += 70
    if progress >= 0.6:
        setup = f"Setup: {story.setup_cmd}"
        sp = min(1.0, (progress - 0.6) / 0.3)
        n = int(len(setup) * ease_out_quad(sp))
        draw.text((120, 560), setup[:n], fill=CYAN, font=font(28))
    return img


def line_color(line: str) -> tuple[int, int, int]:
    s = line.lstrip()
    low = s.lower()
    if s.startswith("$") or s.startswith("npx "):
        return CYAN
    if s.startswith("ERR") or s.startswith("✗") or "FAIL" in s or "BREAKING" in s or "CRITICAL" in s:
        return RED
    if s.startswith("WARN") or s.startswith("⚠") or "STALE" in s or "RISK" in s:
        return YELLOW
    if s.startswith("OK") or s.startswith("✓") or s.startswith("PASS") or "exit 0" in low:
        return GREEN
    if "error" in low and "0 error" not in low:
        return RED
    if s.startswith("#") or s.startswith("==="):
        return DIM
    if "score" in low or "summary" in low:
        return WHITE
    return WHITE


def _split_cmd_output(lines: list[str]) -> tuple[list[str], list[str]]:
    """First $ line(s) = command; rest = program output."""
    cmd: list[str] = []
    out: list[str] = []
    seen_out = False
    for ln in lines:
        if not seen_out and (ln.startswith("$") or (not cmd and not ln.strip())):
            cmd.append(ln)
            if ln.startswith("$"):
                continue
        else:
            seen_out = True
            out.append(ln)
    if not cmd:
        cmd = [f"$ {lines[0]}" if lines else "$ run"]
        out = lines[1:] if len(lines) > 1 else []
    return cmd, out


def compose_terminal(
    story: ProductStory,
    lines: list[str],
    local: float,
    cursor_on: bool,
) -> Image.Image:
    """
    Realistic terminal:
      0.00–0.28  type the $ command char-by-char
      0.28–0.34  brief pause (command submitted)
      0.34–0.88  stream output line-by-line (fast, like a real CLI)
      0.88–1.00  hold full screen + badge
    """
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    mx, my = 70, 60
    content_y = draw_window(draw, mx, my, W - 2 * mx, H - 2 * my, story.term_title)

    mono = font(26)
    mono_sm = font(23)
    x = mx + 36
    y = content_y + 10
    line_h = 32

    cmd_lines, out_lines = _split_cmd_output(lines)
    cmd_text = "\n".join(cmd_lines)
    cmd_chars = len(cmd_text)

    # how much of command typed
    if local < 0.28:
        frac = ease_out_quad(local / 0.28)
        cmd_shown = int(cmd_chars * frac)
        out_shown = 0
        typing_cmd = True
    elif local < 0.34:
        cmd_shown = cmd_chars
        out_shown = 0
        typing_cmd = False
    else:
        cmd_shown = cmd_chars
        typing_cmd = False
        # line-by-line reveal of output
        n_out = max(1, len(out_lines))
        if local >= 0.88:
            out_shown = n_out
        else:
            p = (local - 0.34) / 0.54
            out_shown = int(n_out * ease_out_quad(min(1.0, p)))

    # paint command (possibly partial)
    remaining = cmd_shown
    cmd_incomplete = False
    for ln in cmd_lines:
        if remaining <= 0:
            break
        if remaining >= len(ln):
            display = ln
            remaining -= len(ln)
            if remaining > 0:
                remaining -= 1  # newline
            complete = True
        else:
            display = ln[:remaining]
            remaining = 0
            complete = False
            cmd_incomplete = True
        color = line_color(ln)
        f = mono
        draw.text((x, y), display if len(display) <= 100 else display[:97] + "…", fill=color, font=f)
        if not complete and cursor_on:
            tw = draw.textlength(display, font=f)
            draw.rectangle((x + tw + 2, y + 4, x + tw + 14, y + line_h - 10), fill=CYAN)
        y += line_h

    # after command fully typed, show a dim "running…" flash briefly
    if not typing_cmd and out_shown == 0 and local < 0.34:
        draw.text((x, y), "…", fill=DIM, font=mono_sm)
        y += line_h

    # paint output lines fully (line-by-line, not char-by-char)
    for i, ln in enumerate(out_lines):
        if i >= out_shown:
            break
        color = line_color(ln)
        display = ln if len(ln) <= 100 else ln[:97] + "…"
        if any(h.lower() in ln.lower() for h in story.highlight):
            bb_w = min(W - mx - 80, max(40, int(draw.textlength(display, font=mono_sm) + 20)))
            is_err = color == RED
            draw.rounded_rectangle(
                (x - 8, y - 2, x + bb_w, y + line_h - 6),
                radius=6,
                fill=HL_ERR if is_err else HL_WARN,
            )
        f = mono_sm
        if display:
            draw.text((x, y), display, fill=color, font=f)
        y += line_h
        if y > H - my - 70:
            break

    # caret after last output line while streaming
    if 0.34 <= local < 0.88 and out_shown < len(out_lines) and cursor_on:
        draw.rectangle((x, y + 4, x + 12, y + line_h - 10), fill=CYAN)

    # badge after some output
    if story.badge and out_shown >= max(1, len(out_lines) // 3):
        bf = font(20, bold=True)
        bw = draw.textlength(story.badge, font=bf) + 32
        bx, by = W - mx - bw - 24, my + 70
        rounded_rect(draw, (bx, by, bx + bw, by + 40), 12, (30, 27, 55), story.accent, 2)
        draw.text((bx + 16, by + 8), story.badge, fill=story.accent, font=bf)

    return img


def compose_insight(story: ProductStory, progress: float) -> Image.Image:
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    draw.text((120, 160), "WHAT YOU GET", fill=story.accent, font=font(24, bold=True))
    bullets = [
        f"Problem: {story.problem_title}",
        f"Who: {story.use_case}",
        f"Try: {story.cta_cmd or story.setup_cmd}",
        "Offline-friendly core · MIT · CI exit codes",
    ]
    y = 240
    for i, b in enumerate(bullets):
        start = 0.1 + i * 0.18
        if progress < start:
            break
        bp = min(1.0, (progress - start) / 0.15)
        n = int(len(b) * ease_out_quad(bp))
        shown = b[:n]
        # bullet
        draw.ellipse((120, y + 12, 136, y + 28), fill=story.accent)
        for ln in wrap_text(draw, shown, font(32), W - 320)[:2]:
            draw.text((160, y), ln, fill=WHITE, font=font(32))
            y += 44
        y += 16
    return img


def compose_cta(story: ProductStory, progress: float, cursor_on: bool) -> Image.Image:
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    title = "Try it in 10 seconds"
    if progress >= 0.05:
        tf = font(60, bold=True)
        tp = min(1.0, (progress - 0.05) / 0.3)
        n = max(1, int(len(title) * ease_out_quad(tp)))
        shown = title[:n]
        tw = draw.textlength(shown, font=tf)
        draw.text(((W - tw) / 2, 280), shown, fill=WHITE, font=tf)

    cmd = story.cta_cmd or story.setup_cmd
    if progress >= 0.35:
        cf = font(32)
        cp = min(1.0, (progress - 0.35) / 0.3)
        n = max(1, int(len(cmd) * ease_out_quad(cp)))
        shown = cmd[:n]
        full_w = draw.textlength(cmd, font=cf) + 64
        full_w = min(full_w, W - 200)
        cx = (W - full_w) / 2
        rounded_rect(draw, (cx, 420, cx + full_w, 510), 18, CARD, GREEN, 3)
        draw.text((cx + 32, 448), shown, fill=GREEN, font=cf)
        if cp < 1.0 and cursor_on:
            tw = draw.textlength(shown, font=cf)
            draw.rectangle((cx + 32 + tw + 2, 456, cx + 32 + tw + 14, 490), fill=CYAN)

    foot = f"{story.pid} · {story.slug} · zero runtime deps · MIT"
    if progress >= 0.75:
        fw = draw.textlength(foot, font=font(24))
        draw.text(((W - fw) / 2, 600), foot, fill=DIM, font=font(24))

    if progress >= 0.88:
        suite = "AI dev hygiene suite · ship in public"
        sw = draw.textlength(suite, font=font(22))
        draw.text(((W - sw) / 2, 660), suite, fill=MUTED, font=font(22))

    return img


# ── audio: soft keyclicks + BGM ───────────────────────────────────────────────

# Typing SFX sit under BGM — barely present, not the star of the video.
# ~90% quieter than first pass (old peak ~0.22 → ~0.022).
KEY_GAIN = 0.022
ENTER_GAIN = 0.028


def synth_keyclick(rng: random.Random) -> list[float]:
    """Very soft short tick — ambient presence only, not attention-grabbing."""
    dur = 0.014 + rng.random() * 0.008
    n = int(AUDIO_SR * dur)
    # lower pitch range so ticks feel dull/soft, not bright
    freq = 380 + rng.random() * 180
    out = []
    for i in range(n):
        t = i / AUDIO_SR
        env = math.exp(-t * 220)
        s = 0.45 * math.sin(2 * math.pi * freq * t) + 0.08 * (rng.random() * 2 - 1)
        out.append(s * env * KEY_GAIN)
    return out


def synth_enter(rng: random.Random) -> list[float]:
    dur = 0.03
    n = int(AUDIO_SR * dur)
    out = []
    for i in range(n):
        t = i / AUDIO_SR
        env = math.exp(-t * 120)
        s = 0.4 * math.sin(2 * math.pi * 200 * t) + 0.2 * math.sin(2 * math.pi * 100 * t)
        out.append(s * env * ENTER_GAIN)
    return out


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # stereo
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(AUDIO_SR)
        frames = bytearray()
        for s in samples:
            v = max(-1.0, min(1.0, s))
            i = int(v * 32767)
            frames += struct.pack("<hh", i, i)
        w.writeframes(frames)


def mix_audio(duration: float, key_events: list[tuple[float, str]], seed: int = 1) -> list[float]:
    """key_events: (time_sec, 'key'|'enter'|'space')"""
    rng = random.Random(seed)
    n = int(duration * AUDIO_SR) + AUDIO_SR
    buf = [0.0] * n

    # soft ambient BGM (two quiet sines)
    for i in range(n):
        t = i / AUDIO_SR
        bg = (
            0.035 * math.sin(2 * math.pi * 110 * t)
            + 0.028 * math.sin(2 * math.pi * 164.81 * t)
            + 0.018 * math.sin(2 * math.pi * 220 * t)
        )
        # slow pulse
        bg *= 0.55 + 0.15 * math.sin(2 * math.pi * 0.08 * t)
        # fade in/out
        fade_in = min(1.0, t / 1.2)
        fade_out = min(1.0, max(0.0, (duration - t) / 1.8))
        buf[i] += bg * 0.35 * fade_in * fade_out

    for t0, kind in key_events:
        if kind == "enter":
            clip = synth_enter(rng)
        else:
            clip = synth_keyclick(rng)
            if kind == "space":
                clip = [x * 1.05 for x in clip]  # barely louder than normal key
        start = int(t0 * AUDIO_SR)
        for j, s in enumerate(clip):
            if start + j < n:
                buf[start + j] += s

    # soft limit
    peak = max(abs(x) for x in buf) or 1.0
    if peak > 0.95:
        buf = [x * 0.95 / peak for x in buf]
    return buf[: int(duration * AUDIO_SR)]


# ── timeline / render ─────────────────────────────────────────────────────────

@dataclass
class FrameEvent:
    t0: float
    t1: float
    kind: str
    # extras
    lines: list[str] = field(default_factory=list)


def build_timeline(story: ProductStory, lines: list[str]) -> tuple[list[FrameEvent], float]:
    """Return events and total duration."""
    events: list[FrameEvent] = []
    t = 0.0

    def add(kind: str, dur: float, **kw):
        nonlocal t
        events.append(FrameEvent(t0=t, t1=t + dur, kind=kind, **kw))
        t += dur

    add("title", 5.4)
    add("problem", 5.2)
    add("usecase", 4.4)
    # terminal: type $cmd, then stream output lines (real CLI feel)
    n_out = max(4, len(lines))
    term_sec = min(18.0, max(9.0, 3.5 + n_out * 0.45))
    add("terminal", term_sec, lines=lines)
    add("insight", 4.6)
    add("cta", 5.2)
    return events, t


def total_chars(lines: list[str]) -> int:
    if not lines:
        return 0
    return sum(len(ln) for ln in lines) + max(0, len(lines) - 1)


def _compose_frame(story: ProductStory, events: list[FrameEvent], lines: list[str], fi: int) -> Image.Image:
    t = fi / FPS
    ev = events[-1]
    for e in events:
        if e.t0 <= t < e.t1:
            ev = e
            break
    local = (t - ev.t0) / max(0.001, ev.t1 - ev.t0)
    cursor_on = (fi // 8) % 2 == 0
    if ev.kind == "title":
        return compose_title(story, local, cursor_on)
    if ev.kind == "problem":
        return compose_problem(story, local)
    if ev.kind == "usecase":
        return compose_usecase(story, local)
    if ev.kind == "terminal":
        return compose_terminal(story, ev.lines or lines, local, cursor_on)
    if ev.kind == "insight":
        return compose_insight(story, local)
    return compose_cta(story, local, cursor_on)


def render_product(story: ProductStory) -> Path:
    """Render one product: pipe raw RGB frames to ffmpeg (no per-frame PNG I/O)."""
    print(f"\n=== {story.pid} {story.slug} ===", flush=True)
    prod = ROOT / story.slug
    demo = prod / "demo"
    demo.mkdir(parents=True, exist_ok=True)
    work = demo / "story_v2"
    work.mkdir(parents=True, exist_ok=True)

    lines = capture_output(story)
    if not any(ln.strip() for ln in lines):
        lines = list(story.fallback_lines)

    events, duration = build_timeline(story, lines)
    nframes = int(duration * FPS)
    print(f"  duration={duration:.1f}s frames={nframes} lines={len(lines)}", flush=True)

    key_events: list[tuple[float, str]] = []
    rng = random.Random(hash(story.slug) & 0xFFFF)

    def schedule_typing(t0: float, t1: float, n_keys: int):
        if n_keys <= 0:
            return
        span = max(0.05, t1 - t0 - 0.3)
        for i in range(n_keys):
            tt = t0 + 0.15 + (i / max(1, n_keys - 1)) * span * (0.85 + 0.1 * rng.random())
            kind = "enter" if i == n_keys - 1 and rng.random() < 0.15 else (
                "space" if rng.random() < 0.12 else "key"
            )
            key_events.append((tt, kind))

    for ev in events:
        if ev.kind in ("title", "problem", "usecase", "cta", "insight"):
            schedule_typing(ev.t0, ev.t1 - 0.5, int((ev.t1 - ev.t0) * 9))
        elif ev.kind == "terminal":
            cmd_end = ev.t0 + (ev.t1 - ev.t0) * 0.28
            schedule_typing(ev.t0, cmd_end, int((cmd_end - ev.t0) * 16))
            for i in range(12):
                tt = ev.t0 + (ev.t1 - ev.t0) * (0.34 + 0.5 * i / 12)
                key_events.append((tt, "enter" if i % 4 == 0 else "key"))

    # audio first (needed as second ffmpeg input)
    audio_path = work / "mix.wav"
    samples = mix_audio(duration, key_events, seed=hash(story.slug) & 0xFFFF)
    write_wav(audio_path, samples)

    out = demo / f"{story.slug}-demo-1080p.mp4"
    social = demo / "social"
    social.mkdir(exist_ok=True)
    social_out = social / f"{story.slug}-social-1080p.mp4"

    # Pipe raw RGB24 frames → ffmpeg (huge speedup vs writing PNG sequences)
    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}", "-r", str(FPS),
        "-i", "pipe:0",
        "-i", str(audio_path),
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "160k",
        "-shortest",
        "-movflags", "+faststart",
        str(out),
    ]
    print("  piping frames → ffmpeg…", flush=True)
    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    assert proc.stdin is not None
    try:
        for fi in range(nframes):
            img = _compose_frame(story, events, lines, fi)
            proc.stdin.write(img.tobytes())
            if fi % 120 == 0:
                print(f"  frame {fi}/{nframes}", flush=True)
        proc.stdin.close()
        err = proc.stderr.read() if proc.stderr else b""
        rc = proc.wait(timeout=120)
        if rc != 0:
            raise RuntimeError(f"ffmpeg failed ({rc}): {err[-800:].decode(errors='replace')}")
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass
        raise

    shutil.copy(out, social_out)

    gif = demo / f"{story.slug}-preview.gif"
    subprocess.run([
        "ffmpeg", "-y", "-i", str(out), "-t", "6",
        "-vf", "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        str(gif),
    ], check=True, capture_output=True)

    size_mb = out.stat().st_size / 1e6
    print(f"  DONE {out} ({size_mb:.1f} MB)", flush=True)
    return out


def render_product_safe(slug: str) -> tuple[str, str]:
    stories = {s.slug: s for s in _stories()}
    story = stories[slug]
    try:
        p = render_product(story)
        return slug, str(p)
    except Exception as e:
        return slug, f"ERROR: {e}"


def main() -> int:
    ap = argparse.ArgumentParser(description="Render suite story demos P04–P28")
    ap.add_argument("--only", type=str, default="", help="comma slugs e.g. secret-guard,llm-spend")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--workers", type=int, default=1, help="parallel workers (1 recommended on laptop)")
    args = ap.parse_args()

    stories = _stories()
    if args.list:
        for s in stories:
            print(f"{s.pid}\t{s.slug}\t{s.name}\t{s.tagline[:60]}")
        return 0

    if args.only:
        want = {x.strip() for x in args.only.split(",") if x.strip()}
        stories = [s for s in stories if s.slug in want or s.pid in want]
        if not stories:
            print("No matching products", file=sys.stderr)
            return 2

    print(f"Rendering {len(stories)} product videos at {W}x{H} @ {FPS}fps", flush=True)
    results = []
    if args.workers <= 1:
        for s in stories:
            results.append(render_product_safe(s.slug))
    else:
        with ProcessPoolExecutor(max_workers=args.workers) as ex:
            futs = {ex.submit(render_product_safe, s.slug): s.slug for s in stories}
            for fut in as_completed(futs):
                results.append(fut.result())

    # index
    index_path = ROOT / "demos" / "STORY_DEMOS.md"
    lines = [
        "# Suite story demos (1080p)",
        "",
        "Generated by `scripts/suite_story_demos.py`.",
        "",
        "Each video: problem → use case → setup → live terminal (typed) → insight → CTA,",
        "with soft keyclick SFX + ambient BGM.",
        "",
        "| ID | Product | Video |",
        "|----|---------|-------|",
    ]
    by_slug = {s.slug: s for s in _stories()}
    for slug, path in sorted(results, key=lambda x: by_slug.get(x[0], ProductStory("P99", x[0], x[0], "", "", "", "", "", "", "", "")).pid):
        s = by_slug.get(slug)
        pid = s.pid if s else "?"
        rel = path if path.startswith("ERROR") else f"`{slug}/demo/{slug}-demo-1080p.mp4`"
        lines.append(f"| {pid} | {slug} | {rel} |")
    index_path.parent.mkdir(exist_ok=True)
    index_path.write_text("\n".join(lines) + "\n")
    print("\nIndex:", index_path)
    errors = [r for r in results if str(r[1]).startswith("ERROR")]
    print(f"Done: {len(results) - len(errors)} ok, {len(errors)} errors")
    for e in errors:
        print(" ", e)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
