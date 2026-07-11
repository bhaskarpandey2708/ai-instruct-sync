#!/usr/bin/env python3
"""Render polished 16:9 product-demo frames for ai-setup-doctor."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
FRAMES = ROOT / "frames"
ASSETS = ROOT / "assets"
W, H = 1920, 1080

# Product palette
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


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
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
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size=size, index=0)
            except Exception:
                continue
    return ImageFont.load_default()


def new_canvas() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    # subtle grid / depth
    for y in range(0, H, 48):
        draw.line([(0, y), (W, y)], fill=(14, 16, 24), width=1)
    return img


def rounded_rect(draw, box, radius, fill, outline=None, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_window(draw, x, y, w, h, title: str):
    rounded_rect(draw, (x, y, x + w, y + h), 18, CARD, BORDER, 2)
    # title bar
    rounded_rect(draw, (x, y, x + w, y + 52), 18, (24, 28, 40), None)
    draw.rectangle((x, y + 36, x + w, y + 52), fill=(24, 28, 40))
    # traffic lights
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse((x + 22 + i * 28, y + 18, x + 38 + i * 28, y + 34), fill=c)
    f = font(22)
    tw = draw.textlength(title, font=f)
    draw.text((x + (w - tw) / 2, y + 14), title, fill=MUTED, font=f)
    return y + 68  # content start y


def normalize_icons(line: str) -> str:
    """Map CLI glyphs to fonts that always render (avoid tofu □)."""
    return (
        line.replace("✗", "ERR")
        .replace("⚠", "WARN")
        .replace("✓", " OK ")
        .replace("ℹ", "INFO")
        .replace("→", "->")
        .replace("·", "|")
    )


def colorize_line(line: str) -> tuple[str, tuple[int, int, int]]:
    s = normalize_icons(line.rstrip("\n"))
    stripped = s.lstrip()
    if stripped.startswith("ERR") or "Action needed" in s:
        return s, RED
    if stripped.startswith("WARN"):
        return s, YELLOW
    if stripped.startswith(" OK ") or stripped.startswith("OK "):
        return s, GREEN
    if stripped.startswith("INFO"):
        return s, CYAN
    if stripped.startswith("Score"):
        return s, WHITE
    if "->" in stripped[:8] or stripped.startswith("->"):
        return s, ACCENT
    if stripped.startswith("$") or stripped.startswith("npx ") or stripped.startswith("ai-setup"):
        return s, CYAN
    if "Looking decent" in s or "Setup looks healthy" in s:
        return s, GREEN
    return s, WHITE


def render_terminal(
    path: Path,
    lines: list[str],
    title: str = "terminal — ai-setup-doctor",
    prompt_line: str | None = None,
    badge: str | None = None,
    highlight_substrings: list[str] | None = None,
):
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    margin_x, margin_y = 80, 70
    content_y = draw_window(draw, margin_x, margin_y, W - 2 * margin_x, H - 2 * margin_y, title)

    mono = font(28)
    mono_sm = font(24)
    y = content_y + 8
    x = margin_x + 36
    line_h = 36

    if prompt_line:
        draw.text((x, y), prompt_line, fill=GREEN, font=mono)
        y += line_h + 10

    for raw in lines:
        text, color = colorize_line(raw)
        # soft highlight bar for key lines
        if highlight_substrings and any(h in raw for h in highlight_substrings):
            bb = draw.textbbox((x, y), text[:120], font=mono_sm)
            is_err = "ERR" in text or "Secret" in raw or "Invalid" in raw
            draw.rounded_rectangle(
                (x - 10, y - 4, min(W - margin_x - 40, bb[2] + 16), y + line_h - 4),
                radius=8,
                fill=(40, 28, 28) if is_err else (36, 32, 18),
            )
        # truncate long paths for readability
        display = text
        if len(display) > 95:
            display = display[:92] + "…"
        f = mono if text.startswith(("$", "Score", "ai-setup")) else mono_sm
        draw.text((x, y), display, fill=color, font=f)
        y += line_h
        if y > H - margin_y - 50:
            break

    if badge:
        bf = font(22, bold=True)
        bw = draw.textlength(badge, font=bf) + 36
        bx, by = W - margin_x - bw - 20, margin_y + 70
        rounded_rect(draw, (bx, by, bx + bw, by + 44), 12, (30, 27, 55), ACCENT, 2)
        draw.text((bx + 18, by + 10), badge, fill=ACCENT, font=bf)

    img.save(path, "PNG", optimize=True)
    print(f"wrote {path}")


def render_title(path: Path):
    img = new_canvas()
    draw = ImageDraw.Draw(img)

    # glow orb
    for r, a in [(420, 18), (300, 28), (180, 40)]:
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse(
            (W // 2 - r, H // 2 - r - 40, W // 2 + r, H // 2 + r - 40),
            fill=(99, 102, 241, a),
        )
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

    title_f = font(92, bold=True)
    sub_f = font(36)
    cmd_f = font(34)
    title = "ai-setup-doctor"
    tw = draw.textlength(title, font=title_f)
    draw.text(((W - tw) / 2, 320), title, fill=WHITE, font=title_f)

    sub = "One command to diagnose why your AI coding setup feels broken"
    sw = draw.textlength(sub, font=sub_f)
    draw.text(((W - sw) / 2, 440), sub, fill=MUTED, font=sub_f)

    # command pill
    cmd = "npx ai-setup-doctor@beta"
    cw = draw.textlength(cmd, font=cmd_f) + 64
    cx = (W - cw) / 2
    rounded_rect(draw, (cx, 540, cx + cw, 620), 16, (22, 26, 40), ACCENT, 2)
    draw.text((cx + 32, 560), cmd, fill=CYAN, font=cmd_f)

    pills = ["agents", "MCP", "secrets", "hygiene", "CI score"]
    pf = font(22)
    total = sum(draw.textlength(p, font=pf) + 40 for p in pills) + 16 * (len(pills) - 1)
    px = (W - total) / 2
    for p in pills:
        pw = draw.textlength(p, font=pf) + 40
        rounded_rect(draw, (px, 700, px + pw, 748), 20, (24, 28, 42), BORDER, 1)
        draw.text((px + 20, 712), p, fill=MUTED, font=pf)
        px += pw + 16

    img.save(path, "PNG", optimize=True)
    print(f"wrote {path}")


def render_end(path: Path):
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    title_f = font(72, bold=True)
    sub_f = font(32)
    cmd_f = font(30)

    t = "Ship a healthier AI setup"
    tw = draw.textlength(t, font=title_f)
    draw.text(((W - tw) / 2, 300), t, fill=WHITE, font=title_f)

    s = "Zero dependencies · read-only · CI-ready"
    sw = draw.textlength(s, font=sub_f)
    draw.text(((W - sw) / 2, 400), s, fill=MUTED, font=sub_f)

    cmds = [
        "npx ai-setup-doctor@beta",
        "npx ai-setup-doctor@beta --quiet --min-score 80",
        "npm i -g ai-setup-doctor@beta",
    ]
    y = 500
    for c in cmds:
        cw = draw.textlength(c, font=cmd_f) + 56
        cx = (W - cw) / 2
        rounded_rect(draw, (cx, y, cx + cw, y + 64), 14, CARD, BORDER, 2)
        draw.text((cx + 28, y + 16), c, fill=GREEN if c.startswith("npx ai-setup-doctor@beta") and "--" not in c else CYAN, font=cmd_f)
        y += 88

    foot = "github.com/bhaskarpandey2708/ai-instruct-sync  ·  npm: ai-setup-doctor"
    fw = draw.textlength(foot, font=font(22))
    draw.text(((W - fw) / 2, 900), foot, fill=DIM, font=font(22))

    img.save(path, "PNG", optimize=True)
    print(f"wrote {path}")


def render_callout(path: Path, eyebrow: str, headline: str, body: str, tone: str = "warn"):
    img = new_canvas()
    draw = ImageDraw.Draw(img)
    accent = {"error": RED, "warn": YELLOW, "ok": GREEN, "info": CYAN}.get(tone, ACCENT)

    rounded_rect(draw, (160, 220, W - 160, 860), 24, CARD, accent, 3)
    ef = font(28)
    draw.text((220, 280), eyebrow.upper(), fill=accent, font=ef)

    hf = font(56, bold=True)
    # wrap headline
    words = headline.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=hf) < W - 440:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    y = 360
    for ln in lines[:3]:
        draw.text((220, y), ln, fill=WHITE, font=hf)
        y += 72

    bf = font(30)
    words = body.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=bf) < W - 440:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    y += 24
    for ln in lines[:4]:
        draw.text((220, y), ln, fill=MUTED, font=bf)
        y += 44

    img.save(path, "PNG", optimize=True)
    print(f"wrote {path}")


def load_lines(name: str, max_lines: int = 22) -> list[str]:
    text = (ASSETS / name).read_text(encoding="utf-8")
    # shorten absolute fixture paths for on-screen clarity
    text = text.replace(
        "/Users/bhaskar_pandey/Documents/development/ai-setup-doctor/fixtures/",
        "./fixtures/",
    )
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip() or True]
    # drop empty trailing
    while lines and not lines[-1].strip():
        lines.pop()
    return lines[:max_lines]


def main():
    FRAMES.mkdir(parents=True, exist_ok=True)

    render_title(FRAMES / "01_title.png")
    render_callout(
        FRAMES / "02_problem.png",
        "The problem",
        "Rules missing. MCP JSON broken. Secrets in agent files.",
        "When AI coding tools fail, the error is rarely obvious. ai-setup-doctor is a health check for your whole setup.",
        "error",
    )

    render_terminal(
        FRAMES / "03_command.png",
        [
            "$ npx ai-setup-doctor@beta",
            "",
            "Checking runtime · agents · MCP · secrets · hygiene…",
        ],
        title="zsh — ~/my-app",
        badge="1 command",
    )

    # Curated issue-first views (demo is for understanding, not dumping full logs)
    render_terminal(
        FRAMES / "04_secrets.png",
        [
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
        title="ai-setup-doctor — secrets scan",
        badge="Score 42/100",
        highlight_substrings=["Secret scan", "Secrets: .env", "Possible secret", "Score 42"],
    )

    render_terminal(
        FRAMES / "05_mcp.png",
        [
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
        title="ai-setup-doctor — MCP configs",
        badge="Invalid JSON",
        highlight_substrings=["Invalid JSON", "trailing comma", "0 servers", "Score 59"],
    )

    render_terminal(
        FRAMES / "06_rules.png",
        [
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
        title="ai-setup-doctor — rule quality",
        badge="Contradictions",
        highlight_substrings=["contradiction", "always use npm", "Empty rules", "frontmatter"],
    )

    render_terminal(
        FRAMES / "07_healthy.png",
        [
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
        title="ai-setup-doctor — healthy project",
        badge="Score 92/100",
        highlight_substrings=["Score 92", "by category", "Looking decent"],
    )

    render_terminal(
        FRAMES / "08_ci.png",
        [
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
        title="CI gate - GitHub Actions / scripts",
        badge="--min-score 80",
        highlight_substrings=["exit 1", "Score 42", "--min-score"],
    )

    render_end(FRAMES / "09_end.png")
    print("All frames ready in", FRAMES)


if __name__ == "__main__":
    main()
