#!/usr/bin/env python3
"""
P06 skill-sync — documentary-style social demo (1080p).

Cold open → the paste system → the cost → live proof → turn → CTA.
Director bar: tech mini-doc, mute-safe titles, soft audio.
"""
from __future__ import annotations

import math
import os
import random
import struct
import subprocess
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PROD = ROOT / "skill-sync"
DEMO = PROD / "demo"
OUT = DEMO / "skill-sync-demo-1080p.mp4"
SOCIAL = DEMO / "social" / "skill-sync-social-1080p.mp4"
WORK = DEMO / "story_doc"
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

_font_cache: dict = {}


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    key = (size, bold)
    if key in _font_cache:
        return _font_cache[key]
    paths = (
        [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/Library/Fonts/Arial Bold.ttf",
        ]
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


def lower_third(d: ImageDraw.ImageDraw, label: str, y: int = H - 90):
    d.rectangle([80, y, 80 + 8, y + 42], fill=CYAN)
    d.text((110, y + 6), label, fill=MUTED, font=font(22))


def chapter_card(title: str, subtitle: str, progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    # film letterbox
    d.rectangle([0, 0, W, 70], fill=(0, 0, 0))
    d.rectangle([0, H - 70, W, H], fill=(0, 0, 0))
    a = ease(min(1.0, progress * 1.4))
    # chapter number fades
    d.text((120, 200), type_text(title, a), fill=CYAN, font=font(28, bold=True))
    body = type_text(subtitle, max(0.0, (progress - 0.15) / 0.85))
    # wrap-ish: draw as one block
    y = 280
    for line in wrap(d, body, font(52, bold=True), W - 240):
        d.text((120, y), line, fill=WHITE, font=font(52, bold=True))
        y += 70
    return img


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


def cold_open(progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 70], fill=(0, 0, 0))
    d.rectangle([0, H - 70, W, H], fill=(0, 0, 0))
    # three "files" as evidence cards
    cards = [
        ("claude / SKILL.md", "code-review · fixed yesterday", GREEN),
        ("cursor / rules", "code-review · last week", AMBER),
        ("drive / final_v3.md", "code-review · March copy", RED),
    ]
    p = ease(progress)
    for i, (path, note, col) in enumerate(cards):
        x = 120 + i * 560
        y = 280 + int((1 - p) * 40)
        alpha_gate = progress > i * 0.12
        if not alpha_gate:
            continue
        d.rounded_rectangle([x, y, x + 500, y + 280], 16, fill=CARD, outline=BORDER, width=2)
        d.rectangle([x, y, x + 500, y + 8], fill=col)
        d.text((x + 28, y + 40), path, fill=MUTED, font=font(22))
        d.text((x + 28, y + 110), "skill: code-review", fill=WHITE, font=font(28, bold=True))
        d.text((x + 28, y + 170), note, fill=col, font=font(24))
    if progress > 0.55:
        claim = type_text("Same skill. Three realities.", (progress - 0.55) / 0.45)
        tw = d.textlength(claim, font=font(40, bold=True))
        d.text(((W - tw) / 2, 160), claim, fill=WHITE, font=font(40, bold=True))
    lower_third(d, "COLD OPEN  ·  skill drift")
    return img


def paste_system(progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.text((120, 100), "01  ·  THE PASTE SYSTEM", fill=CYAN, font=font(24, bold=True))
    lines = [
        "Claude gets the good SKILL.md.",
        "Cursor gets last week’s version.",
        "A fork still runs the March draft.",
        "",
        "No semver.  No diff.  No source of truth.",
        "Only Slack, Drive, and hope.",
    ]
    y = 200
    full = "\n".join(lines)
    shown = type_text(full, progress)
    for line in shown.split("\n"):
        col = AMBER if "No semver" in line or "hope" in line else WHITE
        d.text((120, y), line, fill=col if line else WHITE, font=font(36, bold=True))
        y += 58
    lower_third(d, "HOW THE BROKEN SYSTEM WORKS")
    return img


def stakes(progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.text((120, 100), "02  ·  THE COST", fill=RED, font=font(24, bold=True))
    title = type_text("You fixed the skill.", min(1.0, progress * 1.5))
    d.text((120, 220), title, fill=WHITE, font=font(48, bold=True))
    if progress > 0.35:
        t2 = type_text("The bug came back in another tool.", (progress - 0.35) / 0.65)
        d.text((120, 320), t2, fill=AMBER, font=font(40, bold=True))
    if progress > 0.65:
        t3 = type_text("That wasn’t a model failure. It was packaging.", (progress - 0.65) / 0.35)
        for i, line in enumerate(wrap(d, t3, font(32), W - 240)):
            d.text((120, 440 + i * 48), line, fill=MUTED, font=font(32))
    lower_third(d, "STAKES")
    return img


def investigation(progress: float, term_lines: list[str]) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.text((120, 48), "03  ·  THE PROOF", fill=CYAN, font=font(22, bold=True))
    # window
    x, y, ww, hh = 100, 100, W - 200, H - 220
    d.rounded_rectangle([x, y, x + ww, y + hh], 18, fill=CARD, outline=BORDER, width=2)
    d.rounded_rectangle([x, y, x + ww, y + 52], 18, fill=SURFACE)
    d.rectangle([x, y + 36, x + ww, y + 52], fill=SURFACE)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse((x + 22 + i * 28, y + 16, x + 38 + i * 28, y + 32), fill=c)
    title = "investigation — skill-sync · fixtures/sample.json"
    tw = d.textlength(title, font=font(20))
    d.text((x + (ww - tw) / 2, y + 14), title, fill=MUTED, font=font(20))

    # progressive terminal reveal
    n = max(1, int(len(term_lines) * ease(progress)))
    ty = y + 80
    mono = font(26)
    for ln in term_lines[:n]:
        col = WHITE
        if "STALE" in ln or "missing" in ln:
            col = AMBER
        elif "OK" in ln and "validate" in ln:
            col = GREEN
        elif ln.startswith("===") or ln.startswith("discipline"):
            col = CYAN
        elif ln.startswith("  added") or ln.startswith("  updated"):
            col = WHITE
        d.text((x + 36, ty), ln[:100], fill=col, font=mono)
        ty += 36
        if ty > y + hh - 40:
            break
    # badge
    if progress > 0.5:
        d.rounded_rectangle([x + ww - 280, y + 70, x + ww - 40, y + 115], 12, fill=(30, 27, 55), outline=CYAN, width=2)
        d.text((x + ww - 250, y + 80), "drift detected", fill=CYAN, font=font(22, bold=True))
    lower_third(d, "LIVE EVIDENCE")
    return img


def turn(progress: float) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.text((120, 100), "04  ·  THE DISCIPLINE", fill=GREEN, font=font(24, bold=True))
    t1 = type_text("Treat agent skills like packages.", min(1.0, progress * 1.3))
    d.text((120, 260), t1, fill=WHITE, font=font(48, bold=True))
    if progress > 0.4:
        bullets = [
            "Validate  ·  name · version · skills[]",
            "Plan      ·  what would be added vs updated",
            "Local     ·  zero deps · nothing leaves the machine",
        ]
        y = 400
        bp = (progress - 0.4) / 0.6
        for i, b in enumerate(bullets):
            if bp > i * 0.25:
                d.text((120, y), "→  " + type_text(b, min(1.0, (bp - i * 0.25) * 3)), fill=MUTED, font=font(30))
                y += 56
    lower_third(d, "skill-sync  ·  free OSS alpha")
    return img


def cta(progress: float, cursor_on: bool) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 6], fill=CYAN)
    label = type_text("One command. Local. Free.", min(1.0, progress * 1.5))
    tw = d.textlength(label, font=font(36, bold=True))
    d.text(((W - tw) / 2, 280), label, fill=WHITE, font=font(36, bold=True))
    cmd = "npx @bhaskarauthor/skill-sync"
    shown = type_text(cmd, max(0.0, (progress - 0.25) / 0.5))
    if progress > 0.2:
        cw = d.textlength(cmd, font=font(40, bold=True)) + 80
        bx0, by0 = (W - cw) / 2, 400
        d.rounded_rectangle([bx0, by0, bx0 + cw, by0 + 90], 16, fill=CARD, outline=CYAN, width=2)
        d.text((bx0 + 40, by0 + 24), shown + ("▌" if cursor_on and progress < 0.85 else ""), fill=GREEN, font=font(36, bold=True))
    if progress > 0.75:
        foot = "MIT  ·  offline core  ·  validate + install plan  ·  not a registry SaaS"
        fw = d.textlength(foot, font=font(22))
        d.text(((W - fw) / 2, 560), foot, fill=DIM, font=font(22))
    if progress > 0.88:
        s = "stop the paste system"
        sw = d.textlength(s, font=font(24))
        d.text(((W - sw) / 2, 620), s, fill=MUTED, font=font(24))
    return img


def capture_term() -> list[str]:
    r = subprocess.run(
        ["node", "demo/run-demo.mjs"],
        cwd=str(PROD),
        capture_output=True,
        text=True,
        env={**os.environ, "NO_COLOR": "1"},
    )
    text = (r.stdout or r.stderr or "").strip()
    if not text:
        return [
            "=== skill-sync · investigation ===",
            "validate        OK",
            "  updated  code-review",
            "  added    agent-safety",
            "signal  code-review is STALE on this machine",
        ]
    return text.splitlines()


# ── audio ─────────────────────────────────────────────────────────────────────

KEY_G = 0.018


def mix_audio(duration: float, seed: int = 6) -> list[float]:
    rng = random.Random(seed)
    n = int(duration * SR)
    buf = [0.0] * n
    for i in range(n):
        t = i / SR
        # darker documentary bed
        bg = (
            0.04 * math.sin(2 * math.pi * 98 * t)
            + 0.03 * math.sin(2 * math.pi * 146.8 * t)
            + 0.02 * math.sin(2 * math.pi * 196 * t)
            + 0.012 * math.sin(2 * math.pi * 73.4 * t)
        )
        bg *= 0.5 + 0.12 * math.sin(2 * math.pi * 0.06 * t)
        fade = min(1.0, t / 1.5) * min(1.0, max(0.0, (duration - t) / 2.0))
        # dip under middle "proof" section slightly
        mid = 1.0 - 0.15 * math.exp(-((t - duration * 0.45) ** 2) / 30)
        buf[i] += bg * 0.38 * fade * mid
    # sparse soft ticks during type sections
    for t0 in [j * 0.09 for j in range(int(duration * 6))]:
        if rng.random() < 0.35:
            continue
        start = int(t0 * SR)
        dur = int(0.012 * SR)
        freq = 320 + rng.random() * 120
        for j in range(dur):
            if start + j >= n:
                break
            tt = j / SR
            env = math.exp(-tt * 200)
            buf[start + j] += KEY_G * env * math.sin(2 * math.pi * freq * tt)
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


def main() -> int:
    WORK.mkdir(parents=True, exist_ok=True)
    (DEMO / "social").mkdir(parents=True, exist_ok=True)
    term_lines = capture_term()
    print("term lines:", len(term_lines))

    # timeline beats (seconds)
    beats = [
        ("cold", 6.5),
        ("paste", 7.0),
        ("stakes", 6.5),
        ("invest", 14.0),
        ("turn", 6.5),
        ("cta", 7.0),
    ]
    duration = sum(d for _, d in beats)
    nframes = int(duration * FPS)
    print(f"duration={duration:.1f}s frames={nframes}")

    audio_path = WORK / "mix.wav"
    write_wav(audio_path, mix_audio(duration))

    # precompute cumulative
    edges = []
    t = 0.0
    for kind, dur in beats:
        edges.append((kind, t, t + dur))
        t += dur

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
            return cold_open(local)
        if kind == "paste":
            return paste_system(local)
        if kind == "stakes":
            return stakes(local)
        if kind == "invest":
            return investigation(local, term_lines)
        if kind == "turn":
            return turn(local)
        return cta(local, cursor)

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
        str(OUT),
    ]
    print("piping documentary frames…")
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    assert proc.stdin
    for fi in range(nframes):
        img = frame_at(fi)
        proc.stdin.write(img.tobytes())
        if fi % 150 == 0:
            print(f"  frame {fi}/{nframes}")
    proc.stdin.close()
    err = proc.stderr.read() if proc.stderr else b""
    rc = proc.wait(timeout=180)
    if rc != 0:
        raise SystemExit(f"ffmpeg failed: {err[-600:].decode(errors='replace')}")

    import shutil
    shutil.copy(OUT, SOCIAL)
    gif = DEMO / "skill-sync-preview.gif"
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(OUT), "-t", "6",
            "-vf", "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
            str(gif),
        ],
        check=True,
        capture_output=True,
    )
    print(f"DONE {OUT} ({OUT.stat().st_size/1e6:.1f} MB)")
    print(f"SOCIAL {SOCIAL}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
