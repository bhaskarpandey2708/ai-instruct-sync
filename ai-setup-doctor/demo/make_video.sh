#!/usr/bin/env bash
# Build polished product demo: typing effect + smooth (non-jittery) Ken Burns zoom.
set -euo pipefail
cd "$(dirname "$0")"
python3 render_demo.py
open ai-setup-doctor-demo.mp4 2>/dev/null || true
ls -lh ai-setup-doctor-demo.mp4
