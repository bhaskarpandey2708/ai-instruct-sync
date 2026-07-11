#!/usr/bin/env python3
"""
Product demo for ai-setup-doctor:
  - Typing effect (terminal + title/end cards)
  - Butter-smooth Ken Burns zoom (Python crop+LANCZOS, no ffmpeg zoompan jitter)

Output: ai-setup-doctor-demo.mp4
"""

from __future__ import annotations

import math
import os
import random
import struct
import subprocess
import sys
import wave
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterator

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "ai-setup-doctor-demo.mp4"
AUDIO_WAV = ROOT / "typing_track.wav"
W, H = 1920, 1080
FPS = 30
AUDIO_SR = 44100

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
HL_ERR = (40, 28, 28)
HL_WARN = (36, 32, 18)


# ── fonts ─────────────────────────────────────────────────────────────────────

_font_cache: dict[tuple[int, bool], ImageFont.ImageFont] = {}


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    key = (size, bold)
    if key in _font_cache:
        return _font_cache[key]
    candidates = [
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Supplemental/Andale Mono.ttf",
        "/Library/Fonts/JetBrainsMono-Regular.ttf",
        "/System/Library/Fonts/Monaco.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    if bold:
        candidates = [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            *candidates,
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


# ── easing / ken burns (jitter-free) ──────────────────────────────────────────

def ease_in_out_cubic(t: float) -> float:
    t = max(0.0, min(1.0, t))
    if t < 0.5:
        return 4 * t * t * t
    return 1 - (-2 * t + 2) ** 3 / 2


def ease_out_quad(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) * (1 - t)


def apply_ken_burns(
    img: Image.Image,
    t: float,
    z0: float,
    z1: float,
    fx: float,
    fy: float,
) -> Image.Image:
    """
    Smooth zoom toward focus (fx, fy) in 0..1.
    Integer pixel crop + LANCZOS → no subpixel vibration.
    """
    e = ease_in_out_cubic(t)
    z = z0 + (z1 - z0) * e
    z = max(1.001, z)

    iw, ih = img.size
    # Crop size in source pixels (even dimensions for encoder friendliness)
    cw = int(round(iw / z))
    ch = int(round(ih / z))
    cw = max(2, cw - (cw % 2))
    ch = max(2, ch - (ch % 2))

    # Focus point in source; keep crop fully inside
    cx = fx * iw
    cy = fy * ih
    left = int(round(cx - cw / 2))
    top = int(round(cy - ch / 2))
    left = max(0, min(iw - cw, left))
    top = max(0, min(ih - ch, top))

    crop = img.crop((left, top, left + cw, top + ch))
    return crop.resize((W, H), Image.Resampling.LANCZOS)


# ── drawing primitives ────────────────────────────────────────────────────────

def new_canvas() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    for y in range(0, H, 48):
        draw.line([(0, y), (W, y)], fill=(14, 16, 24), width=1)
    return img


def rounded_rect(draw, box, radius, fill, outline=None, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_window(draw, x, y, w, h, title: str) -> int:
    rounded_rect(draw, (x, y, x + w, y + h), 18, CARD, BORDER, 2)
    rounded_rect(draw, (x, y, x + w, y + 52), 18, (24, 28, 40), None)
    draw.rectangle((x, y + 36, x + w, y + 52), fill=(24, 28, 40))
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse((x + 22 + i * 28, y + 18, x + 38 + i * 28, y + 34), fill=c)
    f = font(22)
    tw = draw.textlength(title, font=f)
    draw.text((x + (w - tw) / 2, y + 14), title, fill=MUTED, font=f)
    return y + 68


def normalize_icons(line: str) -> str:
    return (
        line.replace("✗", "ERR")
        .replace("⚠", "WARN")
        .replace("✓", " OK ")
        .replace("ℹ", "INFO")
        .replace("→", "->")
        .replace("·", "|")
    )


def line_color(line: str) -> tuple[int, int, int]:
    s = normalize_icons(line)
    stripped = s.lstrip()
    if stripped.startswith("ERR") or "Action needed" in s:
        return RED
    if stripped.startswith("WARN"):
        return YELLOW
    if stripped.startswith(" OK ") or stripped.startswith("OK "):
        return GREEN
    if stripped.startswith("INFO"):
        return CYAN
    if stripped.startswith("Score"):
        return WHITE
    if stripped.startswith("->") or stripped.lstrip().startswith("->"):
        return ACCENT
    if stripped.startswith("$") or stripped.startswith("npx ") or stripped.startswith("ai-setup"):
        return CYAN
    if stripped.startswith("#"):
        return DIM
    if "Looking decent" in s or "Setup looks healthy" in s:
        return GREEN
    return WHITE


def should_highlight(line: str, keys: list[str] | None) -> bool:
    if not keys:
        return False
    return any(k in line for k in keys)


# ── full-frame composers ──────────────────────────────────────────────────────

def compose_terminal(
    lines: list[str],
    title: str,
    badge: str | None = None,
    highlight: list[str] | None = None,
    cursor_on: bool = False,
    typed_chars: int | None = None,
) -> Image.Image:
    """If typed_chars is set, only show the first N characters of the joined stream."""
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    mx, my = 80, 70
    content_y = draw_window(draw, mx, my, W - 2 * mx, H - 2 * my, title)

    mono = font(28)
    mono_sm = font(24)
    y = content_y + 8
    x = mx + 36
    line_h = 36

    # Build visible lines from character budget
    if typed_chars is None:
        visible = [(ln, True) for ln in lines]  # (text, complete)
        leftover_cursor = False
    else:
        visible = []
        remaining = typed_chars
        leftover_cursor = False
        for ln in lines:
            if remaining <= 0:
                break
            # +1 for newline between lines (except we don't count leading empties specially)
            n = len(ln)
            if remaining >= n:
                visible.append((ln, True))
                remaining -= n
                # consume newline budget
                if remaining > 0:
                    remaining -= 1
            else:
                visible.append((ln[:remaining], False))
                leftover_cursor = True
                remaining = 0
                break
        # if finished all lines exactly, optional cursor at end
        if remaining >= 0 and visible and visible[-1][1] and typed_chars > 0:
            leftover_cursor = cursor_on

    for raw, complete in visible:
        text = normalize_icons(raw)
        color = line_color(raw)
        if should_highlight(raw, highlight) and complete:
            bb = draw.textbbox((x, y), text[:120] if text else " ", font=mono_sm)
            is_err = "ERR" in text or "Secret" in raw or "Invalid" in raw or "exit 1" in raw
            draw.rounded_rectangle(
                (x - 10, y - 4, min(W - mx - 40, max(bb[2] + 16, x + 40)), y + line_h - 4),
                radius=8,
                fill=HL_ERR if is_err else HL_WARN,
            )
        display = text if len(text) <= 95 else text[:92] + "…"
        f = mono if text.startswith(("$", "Score", "ai-setup")) else mono_sm
        if display:
            draw.text((x, y), display, fill=color, font=f)
        # caret on incomplete line
        if not complete and cursor_on:
            tw = draw.textlength(display, font=f) if display else 0
            caret_x = x + tw + 2
            draw.rectangle((caret_x, y + 4, caret_x + 14, y + line_h - 8), fill=CYAN)
        y += line_h
        if y > H - my - 50:
            break

    # blinking caret after fully typed content
    if typed_chars is not None and leftover_cursor and visible and visible[-1][1] and cursor_on:
        # place at end of last line — approximate
        pass

    if badge:
        bf = font(22, bold=True)
        bw = draw.textlength(badge, font=bf) + 36
        bx, by = W - mx - bw - 20, my + 70
        # fade badge in only when enough typed
        rounded_rect(draw, (bx, by, bx + bw, by + 44), 12, (30, 27, 55), ACCENT, 2)
        draw.text((bx + 18, by + 10), badge, fill=ACCENT, font=bf)

    return img


def compose_title(progress: float, cursor_on: bool = False) -> Image.Image:
    """progress 0..1 reveals title elements with typing on the command pill."""
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    # glow
    for r, a in [(420, 18), (300, 28), (180, 40)]:
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse(
            (W // 2 - r, H // 2 - r - 40, W // 2 + r, H // 2 + r - 40),
            fill=(99, 102, 241, a),
        )
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

    title = "ai-setup-doctor"
    sub = "One command to diagnose why your AI coding setup feels broken"
    cmd_full = "npx ai-setup-doctor@beta"
    pills = ["agents", "MCP", "secrets", "hygiene", "CI score"]

    title_f = font(92, bold=True)
    sub_f = font(36)
    cmd_f = font(34)

    # staged reveal
    if progress >= 0.08:
        # type title
        t_prog = min(1.0, (progress - 0.08) / 0.25)
        n = max(1, int(len(title) * ease_out_quad(t_prog)))
        shown = title[:n]
        tw = draw.textlength(shown, font=title_f)
        draw.text(((W - tw) / 2, 320), shown, fill=WHITE, font=title_f)
        if t_prog < 1.0 and cursor_on:
            draw.rectangle((W / 2 + tw / 2 + 4, 340, W / 2 + tw / 2 + 18, 400), fill=CYAN)

    if progress >= 0.35:
        s_prog = min(1.0, (progress - 0.35) / 0.2)
        n = max(1, int(len(sub) * ease_out_quad(s_prog)))
        shown = sub[:n]
        sw = draw.textlength(shown, font=sub_f)
        draw.text(((W - sw) / 2, 440), shown, fill=MUTED, font=sub_f)

    if progress >= 0.55:
        c_prog = min(1.0, (progress - 0.55) / 0.25)
        n = max(1, int(len(cmd_full) * ease_out_quad(c_prog)))
        shown = cmd_full[:n]
        cw = draw.textlength(cmd_full, font=cmd_f) + 64  # full width pill
        cx = (W - cw) / 2
        rounded_rect(draw, (cx, 540, cx + cw, 620), 16, (22, 26, 40), ACCENT, 2)
        draw.text((cx + 32, 560), shown, fill=CYAN, font=cmd_f)
        if c_prog < 1.0 and cursor_on:
            tw = draw.textlength(shown, font=cmd_f)
            draw.rectangle((cx + 32 + tw + 2, 568, cx + 32 + tw + 14, 600), fill=CYAN)

    if progress >= 0.85:
        p_prog = min(1.0, (progress - 0.85) / 0.15)
        pf = font(22)
        total = sum(draw.textlength(p, font=pf) + 40 for p in pills) + 16 * (len(pills) - 1)
        px = (W - total) / 2
        n_show = max(1, int(len(pills) * p_prog + 0.01))
        for i, p in enumerate(pills[:n_show]):
            pw = draw.textlength(p, font=pf) + 40
            rounded_rect(draw, (px, 700, px + pw, 748), 20, (24, 28, 42), BORDER, 1)
            draw.text((px + 20, 712), p, fill=MUTED, font=pf)
            px += pw + 16

    return img


def compose_callout(progress: float) -> Image.Image:
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    accent = RED
    eyebrow = "THE PROBLEM"
    headline = "Rules missing. MCP JSON broken. Secrets in agent files."
    body = (
        "When AI coding tools fail, the error is rarely obvious. "
        "ai-setup-doctor is a health check for your whole setup."
    )

    # card fades in
    if progress < 0.05:
        return img

    rounded_rect(draw, (160, 220, W - 160, 860), 24, CARD, accent, 3)
    ef = font(28)
    draw.text((220, 280), eyebrow, fill=accent, font=ef)

    hf = font(56, bold=True)
    # type headline
    h_prog = min(1.0, max(0.0, (progress - 0.1) / 0.45))
    n = int(len(headline) * ease_out_quad(h_prog))
    typed_h = headline[:n]
    words = typed_h.split(" ") if typed_h else []
    # re-wrap typed portion
    lines, cur = [], ""
    for w in typed_h.split(" "):
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=hf) < W - 440:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    y = 360
    for ln in lines[:3]:
        draw.text((220, y), ln, fill=WHITE, font=hf)
        y += 72

    if progress >= 0.55:
        b_prog = min(1.0, (progress - 0.55) / 0.4)
        n = int(len(body) * ease_out_quad(b_prog))
        typed_b = body[:n]
        bf = font(30)
        lines, cur = [], ""
        for w in typed_b.split(" "):
            trial = (cur + " " + w).strip()
            if draw.textlength(trial, font=bf) < W - 440:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        y += 24
        for ln in lines[:4]:
            draw.text((220, y), ln, fill=MUTED, font=bf)
            y += 44

    return img


def compose_end(progress: float, cursor_on: bool = False) -> Image.Image:
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    title_f = font(72, bold=True)
    sub_f = font(32)
    cmd_f = font(30)

    t = "Ship a healthier AI setup"
    s = "Zero dependencies | read-only | CI-ready"
    cmds = [
        "npx ai-setup-doctor@beta",
        "npx ai-setup-doctor@beta --quiet --min-score 80",
        "npm i -g ai-setup-doctor@beta",
    ]
    foot = "github.com/bhaskarpandey2708/ai-instruct-sync  |  npm: ai-setup-doctor"

    if progress >= 0.05:
        tp = min(1.0, (progress - 0.05) / 0.25)
        n = max(1, int(len(t) * ease_out_quad(tp)))
        shown = t[:n]
        tw = draw.textlength(shown, font=title_f)
        draw.text(((W - tw) / 2, 300), shown, fill=WHITE, font=title_f)

    if progress >= 0.3:
        sp = min(1.0, (progress - 0.3) / 0.15)
        n = max(1, int(len(s) * ease_out_quad(sp)))
        shown = s[:n]
        sw = draw.textlength(shown, font=sub_f)
        draw.text(((W - sw) / 2, 400), shown, fill=MUTED, font=sub_f)

    y = 500
    for i, c in enumerate(cmds):
        start = 0.45 + i * 0.15
        if progress < start:
            break
        cp = min(1.0, (progress - start) / 0.12)
        n = max(1, int(len(c) * ease_out_quad(cp)))
        shown = c[:n]
        cw = draw.textlength(c, font=cmd_f) + 56
        cx = (W - cw) / 2
        color = GREEN if i == 0 else CYAN
        rounded_rect(draw, (cx, y, cx + cw, y + 64), 14, CARD, BORDER, 2)
        draw.text((cx + 28, y + 16), shown, fill=color, font=cmd_f)
        if cp < 1.0 and cursor_on:
            tw = draw.textlength(shown, font=cmd_f)
            draw.rectangle((cx + 28 + tw + 2, y + 22, cx + 28 + tw + 14, y + 50), fill=CYAN)
        y += 88

    if progress >= 0.95:
        fw = draw.textlength(foot, font=font(22))
        draw.text(((W - fw) / 2, 900), foot, fill=DIM, font=font(22))

    return img


# ── scene definitions ─────────────────────────────────────────────────────────

@dataclass
class Scene:
    name: str
    kind: str  # title | callout | terminal | end
    # terminal fields
    lines: list[str] = field(default_factory=list)
    title: str = ""
    badge: str | None = None
    highlight: list[str] = field(default_factory=list)
    # timing (seconds)
    type_seconds: float = 3.0
    hold_seconds: float = 0.8
    zoom_seconds: float = 2.5
    # ken burns
    z0: float = 1.0
    z1: float = 1.0
    fx: float = 0.5
    fy: float = 0.5
    # typing speed override (chars per second)
    cps: float = 42.0


def total_chars(lines: list[str]) -> int:
    # characters + newlines between lines
    if not lines:
        return 0
    return sum(len(ln) for ln in lines) + max(0, len(lines) - 1)


SCENES: list[Scene] = [
    Scene(
        name="title",
        kind="title",
        type_seconds=4.0,
        hold_seconds=1.0,
        zoom_seconds=2.0,
        z0=1.0,
        z1=1.10,
        fx=0.50,
        fy=0.48,
    ),
    Scene(
        name="problem",
        kind="callout",
        type_seconds=3.5,
        hold_seconds=0.8,
        zoom_seconds=1.8,
        z0=1.0,
        z1=1.12,
        fx=0.50,
        fy=0.50,
    ),
    Scene(
        name="command",
        kind="terminal",
        title="zsh — ~/my-app",
        badge="1 command",
        lines=[
            "$ npx ai-setup-doctor@beta",
            "",
            "Checking runtime | agents | MCP | secrets | hygiene…",
        ],
        type_seconds=2.2,
        hold_seconds=0.6,
        zoom_seconds=1.8,
        z0=1.0,
        z1=1.22,
        fx=0.38,
        fy=0.30,
        cps=28,
        highlight=["npx"],
    ),
    Scene(
        name="secrets",
        kind="terminal",
        title="ai-setup-doctor — secrets scan",
        badge="Score 42/100",
        lines=[
            "$ npx ai-setup-doctor@beta --only secrets -q",
            "",
            "ai-setup-doctor — ./fixtures/leaky-secrets",
            "",
            "  ERR Secrets: .env   .env exists but may not be gitignored",
            "      ./fixtures/leaky-secrets/.env",
            "      -> Add `.env*` to .gitignore immediately",
            "",
            "  ERR Secret scan     Possible secret material in 2 file(s)",
            "      aws-key + github-pat + openai  in  .cursor/rules/secrets.md",
            "      private-key  in  .github/copilot-instructions.md",
            "      -> Remove keys from rules; use env vars; rotate credentials",
            "",
            "Score 42/100   2 error  |  1 warn",
            "Action needed: fix secrets before they hit git history.",
        ],
        type_seconds=5.5,
        hold_seconds=0.7,
        zoom_seconds=3.2,
        z0=1.0,
        z1=1.42,
        fx=0.42,
        fy=0.38,
        cps=48,
        highlight=["Secret scan", "Secrets: .env", "Score 42"],
    ),
    Scene(
        name="mcp",
        kind="terminal",
        title="ai-setup-doctor — MCP configs",
        badge="Invalid JSON",
        lines=[
            "$ npx ai-setup-doctor@beta --only mcp -q",
            "",
            "ai-setup-doctor — ./fixtures/broken-mcp",
            "",
            "  ERR MCP: Cursor (project)   Invalid JSON (trailing comma)",
            "      ./.cursor/mcp.json  line 3",
            "      -> Validate JSON — trailing commas/comments break agents",
            "",
            "  WARN MCP: Claude Code       Config exists but defines 0 servers",
            "      ./.mcp.json",
            "      -> Add a server entry, or delete the empty file",
            "",
            "  INFO MCP multi-tool         Configs in multiple places can drift",
            "      -> Sync with mcp-sync if you maintain several clients",
            "",
            "Score 59/100   1 error  |  2 warn",
        ],
        type_seconds=5.0,
        hold_seconds=0.6,
        zoom_seconds=3.0,
        z0=1.0,
        z1=1.40,
        fx=0.42,
        fy=0.36,
        cps=48,
        highlight=["Invalid JSON", "0 servers", "Score 59"],
    ),
    Scene(
        name="rules",
        kind="terminal",
        title="ai-setup-doctor — rule quality",
        badge="Contradictions",
        lines=[
            "$ npx ai-setup-doctor@beta --only agents -q",
            "",
            "ai-setup-doctor — ./fixtures/rule-conflicts",
            "",
            "  WARN Rule contradictions   2 always/never conflict(s)",
            "      always use npm  vs  never use npm",
            "      always use both npm and yarn",
            "      -> Pick one package-manager policy",
            "",
            "  WARN Empty rules           empty-stub.md is nearly empty",
            "  WARN MDC frontmatter       Unclosed YAML in broken.mdc",
            "      -> Close frontmatter with a second --- line",
            "",
            "  INFO Legacy .cursorrules   prefer .cursor/rules or AGENTS.md",
            "",
            "Score 68/100   0 error  |  4 warn",
        ],
        type_seconds=5.0,
        hold_seconds=0.6,
        zoom_seconds=3.0,
        z0=1.0,
        z1=1.38,
        fx=0.42,
        fy=0.36,
        cps=48,
        highlight=["contradiction", "always use npm", "Empty rules"],
    ),
    Scene(
        name="healthy",
        kind="terminal",
        title="ai-setup-doctor — healthy project",
        badge="Score 92/100",
        lines=[
            "$ npx ai-setup-doctor@beta -q -v",
            "",
            "ai-setup-doctor — ./fixtures/healthy",
            "",
            "  WARN MCP pin: filesystem   Unpinned package (floating latest)",
            "      @modelcontextprotocol/server-filesystem",
            "      -> Pin e.g. @modelcontextprotocol/server-filesystem@0.6.2",
            "",
            "  INFO Multi-agent project   Rules can drift between tools",
            "      -> npx ai-instruct-sync@beta status",
            "",
            "Score 92/100   11 ok  |  1 info  |  1 warn  |  0 error",
            "  by category  runtime:0e  agents:0e  mcp:1w  secrets:0e",
            "",
            "Looking decent — address warnings when you can.",
        ],
        type_seconds=4.5,
        hold_seconds=0.6,
        zoom_seconds=3.0,
        z0=1.0,
        z1=1.38,
        fx=0.45,
        fy=0.58,
        cps=48,
        highlight=["Score 92", "by category", "Looking decent"],
    ),
    Scene(
        name="ci",
        kind="terminal",
        title="CI gate - GitHub Actions / scripts",
        badge="--min-score 80",
        lines=[
            "$ npx ai-setup-doctor@beta --quiet --min-score 80",
            "",
            "  ERR Secret scan  Possible secret material in 2 file(s)",
            "      -> Remove keys from rules/MCP configs; rotate credentials",
            "  ERR Secrets: .env  .env may not be gitignored",
            "      -> Add `.env*` to .gitignore immediately",
            "",
            "Score 42/100  |  exit 1  (below --min-score 80)",
            "",
            "# Gate PRs in CI - fail when setup health drops",
        ],
        type_seconds=4.0,
        hold_seconds=0.6,
        zoom_seconds=2.8,
        z0=1.0,
        z1=1.35,
        fx=0.42,
        fy=0.52,
        cps=40,
        highlight=["exit 1", "Score 42", "--min-score"],
    ),
    Scene(
        name="end",
        kind="end",
        type_seconds=4.5,
        hold_seconds=1.2,
        zoom_seconds=2.0,
        z0=1.0,
        z1=1.08,
        fx=0.50,
        fy=0.52,
    ),
]


# ── keyboard typing SFX (real mechanical samples) ─────────────────────────────

SFX_DIR = ROOT / "sfx"
KEY_SLICES_DIR = SFX_DIR / "key_slices"

# Cached pools of real key recordings (float mono @ AUDIO_SR)
_KEY_POOL: list[list[float]] = []
_SPACE_POOL: list[list[float]] = []
_ENTER_POOL: list[list[float]] = []


def _load_wav_mono(path: Path) -> list[float]:
    with wave.open(str(path), "rb") as w:
        sr = w.getframerate()
        ch = w.getnchannels()
        sw = w.getsampwidth()
        n = w.getnframes()
        raw = w.readframes(n)
    if sw != 2:
        # resample-ish: only support 16-bit
        return []
    samples: list[float] = []
    if ch == 1:
        for i in range(0, len(raw), 2):
            samples.append(struct.unpack_from("<h", raw, i)[0] / 32768.0)
    else:
        for i in range(0, len(raw), 2 * ch):
            left = struct.unpack_from("<h", raw, i)[0]
            right = struct.unpack_from("<h", raw, i + 2)[0]
            samples.append((left + right) / 2 / 32768.0)
    # resample if needed (simple linear)
    if sr != AUDIO_SR and samples:
        ratio = AUDIO_SR / sr
        out_n = int(len(samples) * ratio)
        out: list[float] = []
        for i in range(out_n):
            src = i / ratio
            j = int(src)
            f = src - j
            a = samples[j]
            b = samples[min(j + 1, len(samples) - 1)]
            out.append(a * (1 - f) + b * f)
        samples = out
    # trim trailing silence
    thr = 0.008
    end = len(samples)
    while end > 10 and abs(samples[end - 1]) < thr:
        end -= 1
    return samples[:end]


def load_key_samples() -> None:
    """Load real CherryMX Blue key slices (Mechvibes pack)."""
    global _KEY_POOL, _SPACE_POOL, _ENTER_POOL
    if _KEY_POOL:
        return
    paths = sorted(KEY_SLICES_DIR.glob("*.wav")) if KEY_SLICES_DIR.is_dir() else []
    loaded: list[list[float]] = []
    for p in paths:
        s = _load_wav_mono(p)
        if len(s) < 20:
            continue
        # normalize peak lightly so keys match volume
        peak = max(abs(x) for x in s) or 1.0
        gain = min(1.0, 0.75 / peak)
        loaded.append([x * gain for x in s])
    if not loaded:
        raise RuntimeError(
            f"No real key samples in {KEY_SLICES_DIR}. "
            "Run: unzip mechvibes pack and extract key_slices first."
        )
    # classify by duration: longer ones ≈ space / enter thuds
    loaded.sort(key=lambda s: len(s))
    _KEY_POOL = loaded
    # longest ~15% → space/enter variety
    cut = max(1, len(loaded) // 6)
    _SPACE_POOL = loaded[-cut:] or loaded
    _ENTER_POOL = loaded[-max(1, cut // 2) :] or loaded
    print(f"  loaded {len(_KEY_POOL)} real mechanical key samples from {KEY_SLICES_DIR.name}/")


def _key_click_samples(rng: random.Random, kind: str = "normal") -> list[float]:
    """Pick a real recorded key press (not a synth beep)."""
    load_key_samples()
    if kind == "space":
        pool = _SPACE_POOL
        vol = 0.95
    elif kind == "enter":
        pool = _ENTER_POOL
        vol = 1.0
    else:
        pool = _KEY_POOL
        vol = 0.85 + rng.uniform(0.0, 0.15)

    base = list(rng.choice(pool))
    # tiny pitch variation via crude resample (±4%)
    pitch = 1.0 + rng.uniform(-0.04, 0.04)
    if abs(pitch - 1.0) > 0.005:
        out_n = max(8, int(len(base) / pitch))
        pitched: list[float] = []
        for i in range(out_n):
            src = i * pitch
            j = int(src)
            f = src - j
            a = base[min(j, len(base) - 1)]
            b = base[min(j + 1, len(base) - 1)]
            pitched.append(a * (1 - f) + b * f)
        base = pitched
    return [x * vol for x in base]


def chars_for_progress(scene: Scene, progress: float) -> int:
    """How many 'typed' units are visible at this progress (for SFX sync)."""
    p = max(0.0, min(1.0, progress))
    pe = ease_out_quad(p) * 0.15 + p * 0.85

    if scene.kind == "terminal":
        total = total_chars(scene.lines)
        return int(round(pe * total))

    if scene.kind == "title":
        # mirror compose_title stages roughly
        title = "ai-setup-doctor"
        sub = "One command to diagnose why your AI coding setup feels broken"
        cmd = "npx ai-setup-doctor@beta"
        n = 0
        if pe >= 0.08:
            tp = min(1.0, (pe - 0.08) / 0.25)
            n += int(len(title) * ease_out_quad(tp))
        if pe >= 0.35:
            sp = min(1.0, (pe - 0.35) / 0.2)
            n += int(len(sub) * ease_out_quad(sp))
        if pe >= 0.55:
            cp = min(1.0, (pe - 0.55) / 0.25)
            n += int(len(cmd) * ease_out_quad(cp))
        if pe >= 0.85:
            n += int(5 * min(1.0, (pe - 0.85) / 0.15))  # pills
        return n

    if scene.kind == "callout":
        headline = "Rules missing. MCP JSON broken. Secrets in agent files."
        body = (
            "When AI coding tools fail, the error is rarely obvious. "
            "ai-setup-doctor is a health check for your whole setup."
        )
        n = 0
        if pe >= 0.1:
            n += int(len(headline) * ease_out_quad(min(1.0, (pe - 0.1) / 0.45)))
        if pe >= 0.55:
            n += int(len(body) * ease_out_quad(min(1.0, (pe - 0.55) / 0.4)))
        return n

    if scene.kind == "end":
        t = "Ship a healthier AI setup"
        s = "Zero dependencies | read-only | CI-ready"
        cmds = [
            "npx ai-setup-doctor@beta",
            "npx ai-setup-doctor@beta --quiet --min-score 80",
            "npm i -g ai-setup-doctor@beta",
        ]
        n = 0
        if pe >= 0.05:
            n += int(len(t) * ease_out_quad(min(1.0, (pe - 0.05) / 0.25)))
        if pe >= 0.3:
            n += int(len(s) * ease_out_quad(min(1.0, (pe - 0.3) / 0.15)))
        for i, c in enumerate(cmds):
            start = 0.45 + i * 0.15
            if pe >= start:
                n += int(len(c) * ease_out_quad(min(1.0, (pe - start) / 0.12)))
        return n

    return 0


def char_kind_at(scene: Scene, char_index: int) -> str:
    """Pick click flavor from the character being typed (terminal only)."""
    if scene.kind != "terminal" or not scene.lines:
        return "normal"
    # rebuild stream with newlines
    stream_parts: list[str] = []
    for i, ln in enumerate(scene.lines):
        stream_parts.append(ln)
        if i < len(scene.lines) - 1:
            stream_parts.append("\n")
    stream = "".join(stream_parts)
    if char_index < 0 or char_index >= len(stream):
        return "normal"
    ch = stream[char_index]
    if ch == " ":
        return "space"
    if ch == "\n":
        return "enter"
    return "normal"


def mix_clicks_into_buffer(
    buf: list[float],
    events: list[tuple[float, str]],
    rng: random.Random,
) -> None:
    """events: (time_seconds, kind)."""
    for t, kind in events:
        samples = _key_click_samples(rng, kind)
        start = int(t * AUDIO_SR)
        for i, s in enumerate(samples):
            idx = start + i
            if idx >= len(buf):
                break
            buf[idx] += s


def write_wav(path: Path, samples: list[float]) -> None:
    # soft limiter
    peak = max((abs(s) for s in samples), default=1.0)
    gain = 0.85 / peak if peak > 0.85 else 1.0
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(AUDIO_SR)
        frames = bytearray()
        for s in samples:
            v = max(-1.0, min(1.0, s * gain))
            frames += struct.pack("<h", int(v * 32767))
        w.writeframes(frames)


# ── frame generation ──────────────────────────────────────────────────────────

def frames_for_scene(scene: Scene) -> Iterator[tuple[Image.Image, int, list[str]]]:
    """
    Yield (frame, new_chars, kinds_for_each_new_char).
    new_chars drives typing SFX on that frame.
    """
    type_n = max(1, int(round(scene.type_seconds * FPS)))
    hold_n = max(1, int(round(scene.hold_seconds * FPS)))
    zoom_n = max(1, int(round(scene.zoom_seconds * FPS)))

    def base_at(progress: float, frame_i: int) -> Image.Image:
        cursor = (frame_i // (FPS // 2)) % 2 == 0  # ~2Hz blink
        if scene.kind == "title":
            return compose_title(progress, cursor_on=cursor)
        if scene.kind == "callout":
            return compose_callout(progress)
        if scene.kind == "end":
            return compose_end(progress, cursor_on=cursor)
        total = total_chars(scene.lines)
        chars = int(round(progress * total))
        badge = scene.badge if progress >= 0.7 else None
        return compose_terminal(
            scene.lines,
            scene.title,
            badge=badge,
            highlight=scene.highlight if progress >= 0.85 else None,
            cursor_on=cursor and progress < 1.0,
            typed_chars=chars if progress < 1.0 else None,
        )

    prev_chars = 0
    # 1) Typing phase — no zoom (stable)
    for i in range(type_n):
        p = (i + 1) / type_n
        pe = ease_out_quad(p) * 0.15 + p * 0.85
        pe = min(1.0, pe)
        chars = chars_for_progress(scene, pe)
        new_n = max(0, chars - prev_chars)
        kinds: list[str] = []
        for k in range(new_n):
            kinds.append(char_kind_at(scene, prev_chars + k))
        prev_chars = chars
        yield base_at(pe, i), new_n, kinds

    full = base_at(1.0, type_n)
    if scene.kind == "terminal":
        full = compose_terminal(
            scene.lines,
            scene.title,
            badge=scene.badge,
            highlight=scene.highlight,
            cursor_on=False,
            typed_chars=None,
        )

    # 2) Hold — still, no clicks
    for _ in range(hold_n):
        yield full.copy(), 0, []

    # 3) Smooth zoom
    if scene.z1 <= scene.z0 + 0.001:
        for _ in range(zoom_n):
            yield full.copy(), 0, []
        return

    for i in range(zoom_n):
        t = (i + 1) / zoom_n
        yield apply_ken_burns(full, t, scene.z0, scene.z1, scene.fx, scene.fy), 0, []


def encode_video_with_audio(
    frame_iter: Iterator[tuple[Image.Image, int, list[str]]],
    n_frames: int,
    dest: Path,
) -> None:
    silent = dest.with_name(dest.stem + ".silent.mp4")
    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{W}x{H}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        str(silent),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None

    duration = n_frames / FPS
    audio_buf = [0.0] * int(AUDIO_SR * duration) + [0.0] * int(AUDIO_SR * 0.05)
    rng = random.Random(42)
    written = 0
    click_events = 0

    try:
        for img, new_chars, kinds in frame_iter:
            if img.size != (W, H):
                img = img.resize((W, H), Image.Resampling.LANCZOS)
            if img.mode != "RGB":
                img = img.convert("RGB")
            proc.stdin.write(img.tobytes())

            # Place key clicks across this frame for new characters
            if new_chars > 0:
                t0 = written / FPS
                # spread clicks slightly within the frame for natural cadence
                for j in range(new_chars):
                    kind = kinds[j] if j < len(kinds) else "normal"
                    # skip pure empty-line spam a bit: still click on enter
                    offset = (j + 0.5) / max(1, new_chars) / FPS
                    # small human jitter
                    offset += rng.uniform(-0.004, 0.004)
                    mix_clicks_into_buffer(audio_buf, [(max(0.0, t0 + offset), kind)], rng)
                    click_events += 1

            written += 1
            if written % 30 == 0:
                pct = 100 * written / max(1, n_frames)
                print(f"\r  encoding… {written}/{n_frames} ({pct:.0f}%)", end="", flush=True)

        proc.stdin.close()
        rc = proc.wait()
        print()
        if rc != 0:
            raise RuntimeError(f"ffmpeg video failed: {rc}")
    except Exception:
        proc.kill()
        raise

    print(f"  video: {silent.name}  ({written} frames)")
    print(f"  typing clicks: {click_events}")

    write_wav(AUDIO_WAV, audio_buf)
    print(f"  audio: {AUDIO_WAV.name}")

    # Mux AAC audio
    mux = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(silent),
        "-i",
        str(AUDIO_WAV),
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        "-movflags",
        "+faststart",
        str(dest),
    ]
    subprocess.check_call(mux)
    try:
        silent.unlink(missing_ok=True)
    except Exception:
        pass
    print(f"  wrote {dest} (with keyboard typing SFX)")


def count_frames() -> int:
    n = 0
    for s in SCENES:
        n += max(1, int(round(s.type_seconds * FPS)))
        n += max(1, int(round(s.hold_seconds * FPS)))
        n += max(1, int(round(s.zoom_seconds * FPS)))
    return n


def main() -> int:
    print("ai-setup-doctor demo — typing + smooth zoom + keyboard SFX")
    n = count_frames()
    print(f"  scenes={len(SCENES)}  frames≈{n}  duration≈{n / FPS:.1f}s")

    def all_frames() -> Iterator[tuple[Image.Image, int, list[str]]]:
        for s in SCENES:
            print(f"  scene: {s.name} ({s.kind})")
            yield from frames_for_scene(s)

    encode_video_with_audio(all_frames(), n, OUT)

    try:
        out = subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=nw=1:nk=1",
                str(OUT),
            ],
            text=True,
        ).strip()
        # confirm audio stream exists
        streams = subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "stream=codec_type,codec_name",
                "-of",
                "csv=p=0",
                str(OUT),
            ],
            text=True,
        ).strip()
        print(f"  duration: {out}s  size: {OUT.stat().st_size / 1e6:.1f} MB")
        print(f"  streams:\n{streams}")
    except Exception:
        pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
