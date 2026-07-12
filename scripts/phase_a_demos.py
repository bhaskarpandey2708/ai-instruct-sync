#!/usr/bin/env python3
"""
Phase A demos:
  1) secret-guard 1080p story MP4
  2) agent-skill-scan 1080p story MP4
  3) GIF demos for eval-harness, sbom-lite, api-contract-sentinel

Usage:
  python3 scripts/phase_a_demos.py
  python3 scripts/phase_a_demos.py --only secret-guard
"""
from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
W, H = 1920, 1080
FPS = 30
BG = (12, 12, 20)
FG = (230, 233, 245)
MUTED = (160, 168, 196)
ACCENT = (137, 180, 250)
OK = (166, 227, 161)
WARN = (249, 226, 175)
PINK = (243, 139, 168)
SURFACE = (28, 28, 44)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def run(cmd: list[str], cwd: Path | None = None) -> None:
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, cwd=cwd, check=True)


def wrap(draw: ImageDraw.ImageDraw, text: str, f, max_w: int) -> list[str]:
    words = text.split()
    lines, cur = [], ""
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


def slide_png(path: Path, kicker: str | None, title: str, body: list[str], footer: str | None = None, accent=ACCENT) -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 8], fill=accent)
    y = 120
    if kicker:
        fk = font(28, bold=True)
        d.text((120, y), kicker, font=fk, fill=accent)
        tw = d.textlength(kicker, font=fk)
        d.rectangle([120, y + fk.size + 10, 120 + tw, y + fk.size + 16], fill=accent)
        y += 100
    ft = font(56, bold=True)
    for line in wrap(d, title, ft, W - 240):
        d.text((120, y), line, font=ft, fill=FG)
        y += int(ft.size * 1.3)
    y += 40
    fb = font(32)
    for para in body:
        for line in wrap(d, para, fb, W - 240):
            d.text((120, y), line, font=fb, fill=MUTED)
            y += int(fb.size * 1.35)
        y += 24
    if footer:
        ff = font(28, bold=True)
        d.rounded_rectangle([100, H - 180, W - 100, H - 80], radius=24, fill=SURFACE, outline=OK, width=4)
        tw = d.textlength(footer, font=ff)
        d.text(((W - tw) / 2, H - 150), footer, font=ff, fill=OK)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG")


def typewriter_slide(out_dir: Path, base: Image.Image, text_blocks: list[tuple[str, int, tuple]], hold: float = 1.5) -> list[Path]:
    """Simple typewriter: redraw base each frame with progressive text. text_blocks: (text, y, color)"""
    out_dir.mkdir(parents=True, exist_ok=True)
    frames: list[Path] = []
    f = font(40, bold=True)
    full = " ".join(t for t, _, _ in text_blocks)  # not used
    # type title first block only for simplicity
    title, y0, color = text_blocks[0]
    n = max(1, len(title))
    type_frames = max(n, int(n / 24 * FPS))
    for i in range(type_frames + 1):
        chars = int(n * i / type_frames)
        img = base.copy()
        d = ImageDraw.Draw(img)
        shown = title[:chars]
        d.text((120, y0), shown, font=f, fill=color)
        if chars < n and (i // 6) % 2 == 0:
            tw = d.textlength(shown, font=f)
            d.rectangle([120 + tw + 4, y0 + 8, 120 + tw + 18, y0 + f.size - 4], fill=ACCENT)
        # static secondary lines after half typed
        if chars >= n * 0.85:
            for t, y, c in text_blocks[1:]:
                d.text((120, y), t, font=font(28), fill=c)
        p = out_dir / f"f{len(frames):05d}.png"
        img.save(p)
        frames.append(p)
    hold_n = int(hold * FPS)
    last = frames[-1]
    for _ in range(hold_n):
        p = out_dir / f"f{len(frames):05d}.png"
        shutil.copy(last, p)
        frames.append(p)
    return frames


def frames_to_mp4(frame_dir: Path, out: Path, audio: Path | None = None) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-framerate", str(FPS),
        "-i", str(frame_dir / "f%05d.png"),
        "-vf", "format=yuv420p",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
    ]
    if audio and audio.exists():
        cmd += ["-i", str(audio), "-shortest", "-c:a", "aac", "-b:a", "128k"]
    else:
        cmd += ["-an"]
    cmd.append(str(out))
    run(cmd)


def synth_bgm(path: Path, seconds: float = 90) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"sine=frequency=110:sample_rate=44100:duration={seconds}",
        "-f", "lavfi", "-i", f"sine=frequency=165:sample_rate=44100:duration={seconds}",
        "-filter_complex",
        "[0]volume=0.03[a];[1]volume=0.02[b];[a][b]amix=inputs=2,afade=t=in:d=1.5,volume=0.5",
        "-ac", "2", str(path),
    ])


def concat_mp4s(clips: list[Path], out: Path, bgm: Path | None = None) -> None:
    lst = out.parent / "concat.txt"
    lst.write_text("".join(f"file '{c.resolve()}'\n" for c in clips))
    raw = out.parent / "raw.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(raw)])
    if bgm and bgm.exists():
        dur = subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(raw)],
            text=True,
        ).strip()
        run([
            "ffmpeg", "-y", "-i", str(raw), "-stream_loop", "-1", "-i", str(bgm),
            "-filter_complex",
            f"[1:a]volume=0.12,atrim=0:{dur},afade=t=in:d=1,afade=t=out:st={max(0, float(dur)-2)}:d=2[bg];"
            f"[0:a]anull[fg];[fg][bg]amix=inputs=2:duration=first[a]",
            "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-shortest", str(out),
        ])
    else:
        shutil.copy(raw, out)


def still_to_clip(png: Path, out: Path, seconds: float = 2.5) -> None:
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(png),
        "-t", str(seconds), "-vf", "format=yuv420p,fps=30",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-pix_fmt", "yuv420p", str(out),
    ])


def capture_cli_gif(cwd: Path, cmd: list[str], gif: Path, title: str) -> None:
    """Run CLI, render output as a simple dark terminal PNG sequence → GIF."""
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    text = (r.stdout or "") + (r.stderr or "")
    if not text.strip():
        text = f"$ {' '.join(cmd)}\n(no output)\nexit {r.returncode}"
    lines = text.replace("\t", "  ").splitlines()[:28]
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 64], fill=SURFACE)
    d.text((40, 18), title, font=font(26, bold=True), fill=ACCENT)
    y = 100
    f = font(26)
    for line in lines:
        # truncate long lines
        while d.textlength(line, font=f) > W - 80 and len(line) > 10:
            line = line[:-4] + "…"
        d.text((40, y), line[:200], font=f, fill=OK if line.strip().startswith("✓") or "ok" in line.lower() else FG)
        y += 34
        if y > H - 60:
            break
    png = gif.with_suffix(".png")
    png.parent.mkdir(parents=True, exist_ok=True)
    img.save(png)
    # animate slight hold as gif
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(png),
        "-t", "3.5", "-vf", "fps=10,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        str(gif),
    ])
    print("wrote", gif)


def build_secret_guard() -> Path:
    demo = ROOT / "secret-guard" / "demo"
    story = demo / "story"
    story.mkdir(parents=True, exist_ok=True)
    slides = story / "slides"
    slides.mkdir(exist_ok=True)

    specs = [
        ("01-open", "SHIPPED ON NPM", "ai-secret-guard",
         ["Stop API keys landing in CLAUDE.md, .cursor/rules, and MCP env.", "Pre-commit & CI friendly. Zero dependencies."],
         "npx ai-secret-guard@0.1.0-beta.1"),
        ("02-problem", "THE LEAK SURFACE", "Classic scanners miss AI paths",
         ["Keys get pasted into agent rules and MCP JSON.", "gitleaks / GitHub scanning often never look there."],
         None),
        ("03-live", "LIVE SCAN", "Findings on a leaky workspace",
         ["Scan agent files + MCP configs.", "Redacted snippets. Exit 1 for CI."],
         None),
        ("04-safe", "SAFE BY DEFAULT", "Examples & placeholders ignored",
         ["sk-ant-api03-example stays quiet.", "Real-looking keys do not."],
         None),
        ("05-cta", "TRY IT", "10 seconds. No install.",
         ["Wire into pre-commit or GitHub Actions."],
         "npx ai-secret-guard --strict"),
    ]
    clips = []
    for i, (sid, kicker, title, body, footer) in enumerate(specs):
        png = slides / f"{sid}.png"
        slide_png(png, kicker, title, body, footer, accent=OK if "CTA" in kicker or "TRY" in kicker or "SAFE" in kicker else (WARN if "PROBLEM" in kicker or "LEAK" in kicker else ACCENT))
        clip = story / f"{sid}.mp4"
        still_to_clip(png, clip, 2.8 if i else 3.2)
        clips.append(clip)

    # Live CLI segment as video frames
    fix = ROOT / "secret-guard" / "fixtures" / "leaky-rules"
    r = subprocess.run(
        [sys.executable and "node", str(ROOT / "secret-guard" / "dist" / "cli.js"), "--cwd", str(fix), "--quiet"],
        capture_output=True, text=True,
    )
    # rebuild dist if needed
    if r.returncode is None or not (ROOT / "secret-guard" / "dist" / "cli.js").exists():
        run(["npm", "run", "build"], cwd=ROOT / "secret-guard")
        r = subprocess.run(
            ["node", str(ROOT / "secret-guard" / "dist" / "cli.js"), "--cwd", str(fix), "--quiet"],
            capture_output=True, text=True,
        )
    term_png = slides / "live-term.png"
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 64], fill=SURFACE)
    d.text((40, 18), "secret-guard · fixtures/leaky-rules", font=font(24, bold=True), fill=WARN)
    y = 100
    for line in ((r.stdout or "") + (r.stderr or "")).splitlines()[:22]:
        d.text((40, y), line[:110], font=font(24), fill=PINK if "✗" in line or "error" in line.lower() else FG)
        y += 36
    img.save(term_png)
    term_mp4 = story / "live-term.mp4"
    still_to_clip(term_png, term_mp4, 4.5)
    clips.insert(3, term_mp4)

    bgm = story / "bgm.wav"
    synth_bgm(bgm, 60)
    # add silent audio to clips without audio for concat consistency
    norm = []
    for c in clips:
        n = story / f"n_{c.name}"
        run([
            "ffmpeg", "-y", "-i", str(c),
            "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
            "-shortest", "-c:v", "copy", "-c:a", "aac", str(n),
        ])
        norm.append(n)
    out = demo / "secret-guard-demo-1080p.mp4"
    concat_mp4s(norm, out, bgm)
    # preview gif
    gif = demo / "secret-guard-preview.gif"
    run([
        "ffmpeg", "-y", "-i", str(out), "-t", "8",
        "-vf", "fps=10,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        str(gif),
    ])
    print("DONE secret-guard", out)
    return out


def build_skill_scan() -> Path:
    demo = ROOT / "agent-skill-scan" / "demo"
    story = demo / "story"
    story.mkdir(parents=True, exist_ok=True)
    slides = story / "slides"
    slides.mkdir(exist_ok=True)

    specs = [
        ("01-open", "ALPHA ON NPM", "agent-skill-scan",
         ["Catch toxic AI skills before they run.", "Injection · exfil · curl|bash · hardcoded secrets."],
         "npx agent-skill-scan@0.1.0-alpha.1"),
        ("02-problem", "SUPPLY CHAIN", "Skills can be malware in markdown",
         ["Prompt injection, hidden hooks, env harvesting.", "Looks helpful. Behaves hostile."],
         None),
        ("03-scan", "WHAT IT CHECKS", "Skills · MCP · rules · hooks",
         ["Read-only. Zero dependencies.", "Score out of 100 with severities."],
         None),
        ("04-cta", "TRY IT", "Scan your agent workspace",
         ["Works on Claude skills, Cursor rules, MCP configs."],
         "npx agent-skill-scan --no-user"),
    ]
    clips = []
    for i, (sid, kicker, title, body, footer) in enumerate(specs):
        png = slides / f"{sid}.png"
        slide_png(png, kicker, title, body, footer, accent=PINK if "PROBLEM" in kicker else ACCENT)
        clip = story / f"{sid}.mp4"
        still_to_clip(png, clip, 3.0)
        clips.append(clip)

    # Ensure built + help as terminal still
    if not (ROOT / "agent-skill-scan" / "dist" / "cli.js").exists():
        run(["npm", "run", "build"], cwd=ROOT / "agent-skill-scan")
    r = subprocess.run(
        ["node", str(ROOT / "agent-skill-scan" / "dist" / "cli.js"), "--help"],
        capture_output=True, text=True,
    )
    term_png = slides / "help.png"
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 64], fill=SURFACE)
    d.text((40, 18), "agent-skill-scan --help", font=font(24, bold=True), fill=ACCENT)
    y = 100
    for line in (r.stdout or "agent-skill-scan").splitlines()[:24]:
        d.text((40, y), line[:110], font=font(24), fill=FG)
        y += 34
    img.save(term_png)
    term_mp4 = story / "help.mp4"
    still_to_clip(term_png, term_mp4, 4.0)
    clips.insert(3, term_mp4)

    bgm = story / "bgm.wav"
    synth_bgm(bgm, 50)
    norm = []
    for c in clips:
        n = story / f"n_{c.name}"
        run([
            "ffmpeg", "-y", "-i", str(c),
            "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
            "-shortest", "-c:v", "copy", "-c:a", "aac", str(n),
        ])
        norm.append(n)
    out = demo / "agent-skill-scan-demo-1080p.mp4"
    concat_mp4s(norm, out, bgm)
    gif = demo / "agent-skill-scan-preview.gif"
    run([
        "ffmpeg", "-y", "-i", str(out), "-t", "8",
        "-vf", "fps=10,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        str(gif),
    ])
    print("DONE skill-scan", out)
    return out


def build_alpha_gifs() -> list[Path]:
    out_dir = ROOT / "demos" / "phase-a-gifs"
    out_dir.mkdir(parents=True, exist_ok=True)
    jobs = [
        ("eval-harness", ROOT / "eval-harness", ["node", "src/cli.js", "--json", "fixtures/sample.json"], "eval-harness · offline regression cases"),
        ("sbom-lite", ROOT / "sbom-lite", ["node", "src/cli.js", "--json", "fixtures/sample.json"], "sbom-lite · lockfile SBOM + policy gate"),
        ("api-contract-sentinel", ROOT / "api-contract-sentinel", ["node", "src/cli.js", "--json", "fixtures/sample.json"], "api-contract-sentinel · OpenAPI breaking diffs"),
    ]
    paths = []
    for name, cwd, cmd, title in jobs:
        gif = out_dir / f"{name}.gif"
        capture_cli_gif(cwd, cmd, gif, title)
        paths.append(gif)
    # index
    (out_dir / "README.md").write_text(
        "# Phase A GIFs\n\n"
        + "\n".join(f"- [{p.name}](./{p.name})" for p in paths)
        + "\n\nRebuild: `python3 scripts/phase_a_demos.py --only gifs`\n"
    )
    return paths


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=["secret-guard", "skill-scan", "gifs", "all"], default="all")
    args = ap.parse_args()
    results = {}
    if args.only in ("all", "secret-guard"):
        results["secret-guard"] = str(build_secret_guard())
    if args.only in ("all", "skill-scan"):
        results["skill-scan"] = str(build_skill_scan())
    if args.only in ("all", "gifs"):
        results["gifs"] = [str(p) for p in build_alpha_gifs()]
    # phase A index
    idx = ROOT / "demos" / "PHASE_A.md"
    idx.write_text(
        f"""# Phase A demos

Built by `scripts/phase_a_demos.py`.

## Videos (1080p)

| Product | File |
|---------|------|
| secret-guard | [`secret-guard/demo/secret-guard-demo-1080p.mp4`](../secret-guard/demo/secret-guard-demo-1080p.mp4) |
| agent-skill-scan | [`agent-skill-scan/demo/agent-skill-scan-demo-1080p.mp4`](../agent-skill-scan/demo/agent-skill-scan-demo-1080p.mp4) |

## GIFs

| Product | File |
|---------|------|
| eval-harness | [`phase-a-gifs/eval-harness.gif`](./phase-a-gifs/eval-harness.gif) |
| sbom-lite | [`phase-a-gifs/sbom-lite.gif`](./phase-a-gifs/sbom-lite.gif) |
| api-contract-sentinel | [`phase-a-gifs/api-contract-sentinel.gif`](./phase-a-gifs/api-contract-sentinel.gif) |

## Rebuild

```bash
python3 scripts/phase_a_demos.py
```

## Result blob

```json
{json.dumps(results, indent=2)}
```
"""
    )
    print("Index →", idx)


if __name__ == "__main__":
    main()
