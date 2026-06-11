#!/usr/bin/env python3
"""Builds spektr.html — a fully self-contained version of the landing page.

Inlines css/style.css, js/main.js, the favicon, the poster, the balcony
photo and all 120 hero scroll frames (as base64 data URIs), so the whole
site ships as a single HTML file.
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "spektr.html"


def data_uri(path: pathlib.Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css/style.css").read_text(encoding="utf-8")
js = (ROOT / "js/main.js").read_text(encoding="utf-8")

# --- inline media into CSS/HTML ---
balcony = data_uri(ROOT / "assets/img/balcony.webp", "image/webp")
css = css.replace('url("../assets/img/balcony.webp")', f'url("{balcony}")')

poster = data_uri(ROOT / "assets/img/poster.webp", "image/webp")
html = html.replace("url('assets/img/poster.webp')", f"url('{poster}')")

favicon = data_uri(ROOT / "assets/img/favicon.svg", "image/svg+xml")
html = html.replace('href="assets/img/favicon.svg"', f'href="{favicon}"')

# poster preload is pointless once inlined
html = re.sub(r'\s*<link rel="preload" as="image" href="assets/img/poster\.webp">', "", html)

# --- embed the frame sequence and point the engine at it ---
frames_dir = ROOT / "assets/frames/hero"
frame_files = sorted(frames_dir.glob("frame_*.webp"))
assert frame_files, "no frames found — run the asset pipeline first"
frames_js = ",\n".join(f'"{data_uri(p, "image/webp")}"' for p in frame_files)

js = js.replace(
    "const FRAME_PATH = i => `assets/frames/hero/frame_${String(i).padStart(3, \"0\")}.webp`;",
    "const FRAME_PATH = i => window.__FRAMES__[i - 1];",
)
js = js.replace("const FRAME_COUNT = 120;", f"const FRAME_COUNT = {len(frame_files)};")

# --- assemble ---
html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    "<style>\n" + css + "\n</style>",
)
html = html.replace(
    '<script src="js/main.js" defer></script>',
    "<script>\nwindow.__FRAMES__ = [\n" + frames_js + "\n];\n</script>\n<script>\n" + js + "\n</script>",
)

OUT.write_text(html, encoding="utf-8")
print(f"built {OUT.name}: {OUT.stat().st_size / 1024 / 1024:.1f} MB, {len(frame_files)} frames inlined")
