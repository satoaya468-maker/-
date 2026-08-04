#!/usr/bin/env python3
"""
Procedural macro photography of printed circuit boards.

The site ships without third-party image hosting, so the photographic layer is
rendered here. Geometry (substrate, copper, solder mask, packages, solder
joints) is composed at 3x and reduced, which is what gives the edges their
optical softness. The finishing pass — directional light, depth of field,
bokeh, tone curve, chromatic aberration, vignette and film grain — is what
makes the result read as a shallow-focus bench photograph rather than vector
art.

    python3 tools/gen_textures.py
"""

import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "img")
SS = 3  # supersampling factor


PALETTES = {
    # Deep navy board — the brand's own key.
    "navy": {
        "board": (9, 20, 36),
        "board_hi": (17, 35, 58),
        "mask": (11, 25, 44),
        "copper": (58, 86, 124),
        "copper_hi": (104, 136, 176),
        "silk": (108, 126, 150),
        "solder": (150, 168, 190),
        "accent": (0, 102, 255),
    },
    # Cooler graphite board for secondary imagery.
    "steel": {
        "board": (20, 27, 38),
        "board_hi": (36, 48, 64),
        "mask": (24, 33, 46),
        "copper": (84, 96, 112),
        "copper_hi": (132, 146, 164),
        "silk": (120, 132, 148),
        "solder": (158, 170, 186),
        "accent": (0, 102, 255),
    },
}


def jitter(color, amount, rng):
    return tuple(max(0, min(255, c + rng.randint(-amount, amount))) for c in color)


# ------------------------------------------------------------------ pieces ---
def draw_substrate(d, w, h, pal, rng):
    d.rectangle([0, 0, w, h], fill=pal["board"])
    for _ in range(120):
        cx, cy = rng.randint(0, w), rng.randint(0, h)
        r = rng.randint(w // 12, w // 4)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=jitter(pal["board_hi"], 10, rng))


def draw_ground_pour(d, w, h, pal, rng, count=7):
    """Large copper fills with a cross-hatched relief, as on a real ground plane."""
    for _ in range(count):
        x0 = rng.randint(-w // 6, w)
        y0 = rng.randint(-h // 6, h)
        bw = rng.randint(w // 6, w // 2)
        bh = rng.randint(h // 6, h // 2)
        fill = jitter(tuple(int(c * 0.62) for c in pal["copper"]), 10, rng)
        d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=8 * SS, fill=fill)
        hatch = jitter(tuple(int(c * 0.78) for c in pal["copper"]), 8, rng)
        gap = 9 * SS
        for i in range(-bh, bw, gap):
            d.line([x0 + i, y0, x0 + i + bh, y0 + bh], fill=hatch, width=SS)


def draw_traces(d, w, h, pal, rng, density=340):
    """Manhattan-routed copper drawn as a dark body with a lit specular core."""
    step = 20 * SS
    for _ in range(density):
        x = rng.randrange(0, max(step, w), step)
        y = rng.randrange(0, max(step, h), step)
        width = rng.choice([2, 3, 3, 4, 4, 6]) * SS
        pts = [(x, y)]
        for _ in range(rng.randint(2, 6)):
            px, py = pts[-1]
            run = rng.randint(2, 10) * step
            if rng.random() < 0.5:
                pts.append((px + rng.choice([-1, 1]) * run, py))
            else:
                pts.append((px, py + rng.choice([-1, 1]) * run))

        base = jitter(pal["copper"], 18, rng)
        d.line(pts, fill=base, width=width, joint="curve")
        if width >= 3 * SS:
            d.line([(px, py - SS) for px, py in pts],
                   fill=jitter(pal["copper_hi"], 14, rng),
                   width=max(SS, width // 3), joint="curve")
        for px, py in pts:
            d.ellipse([px - width, py - width, px + width, py + width], fill=base)


def draw_vias(d, w, h, pal, rng, count=420):
    for _ in range(count):
        cx, cy = rng.randint(0, w), rng.randint(0, h)
        r = rng.randint(4, 10) * SS
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=jitter(pal["copper"], 14, rng))
        d.ellipse([cx - r + SS, cy - r + SS, cx + r - SS, cy + r - SS],
                  fill=jitter(pal["copper_hi"], 12, rng))
        ir = max(SS, r // 2)
        d.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=jitter(pal["mask"], 8, rng))


def draw_smd(d, w, h, pal, rng, count=260):
    """0603-style passives: dark body between two bright solder terminations."""
    for _ in range(count):
        cx, cy = rng.randint(0, w), rng.randint(0, h)
        long_side = rng.randint(12, 24) * SS
        short_side = rng.randint(7, 11) * SS
        horizontal = rng.random() < 0.5
        bw, bh = (long_side, short_side) if horizontal else (short_side, long_side)
        d.rounded_rectangle([cx - bw, cy - bh, cx + bw, cy + bh],
                            radius=2 * SS, fill=jitter((20, 22, 30), 10, rng))
        cap = jitter(pal["solder"], 20, rng)
        pad = max(2 * SS, long_side // 3)
        if horizontal:
            d.rectangle([cx - bw, cy - bh, cx - bw + pad, cy + bh], fill=cap)
            d.rectangle([cx + bw - pad, cy - bh, cx + bw, cy + bh], fill=cap)
        else:
            d.rectangle([cx - bw, cy - bh, cx + bw, cy - bh + pad], fill=cap)
            d.rectangle([cx - bw, cy + bh - pad, cx + bw, cy + bh], fill=cap)


def draw_ics(d, w, h, pal, rng, count=9):
    """QFP/SOIC packages with pin banks, bevelled lid and a pin-1 dot."""
    for _ in range(count):
        cx, cy = rng.randint(w // 10, w - w // 10), rng.randint(h // 10, h - h // 10)
        bw = rng.randint(52, 150) * SS
        bh = rng.randint(46, 120) * SS
        pin_len = 10 * SS
        pitch = 12 * SS

        x = cx - bw + pitch
        while x < cx + bw - pitch:
            col = jitter(pal["solder"], 24, rng)
            d.rectangle([x, cy - bh - pin_len, x + 5 * SS, cy - bh + 2 * SS], fill=col)
            d.rectangle([x, cy + bh - 2 * SS, x + 5 * SS, cy + bh + pin_len], fill=col)
            x += pitch
        y = cy - bh + pitch
        while y < cy + bh - pitch:
            col = jitter(pal["solder"], 24, rng)
            d.rectangle([cx - bw - pin_len, y, cx - bw + 2 * SS, y + 5 * SS], fill=col)
            d.rectangle([cx + bw - 2 * SS, y, cx + bw + pin_len, y + 5 * SS], fill=col)
            y += pitch

        d.rounded_rectangle([cx - bw, cy - bh, cx + bw, cy + bh],
                            radius=4 * SS, fill=jitter((30, 33, 41), 8, rng))
        d.rounded_rectangle([cx - bw + 4 * SS, cy - bh + 4 * SS,
                             cx + bw - 4 * SS, cy + bh - 4 * SS],
                            radius=3 * SS, outline=jitter((74, 80, 94), 10, rng), width=SS)
        r = 5 * SS
        px, py = cx - bw + 14 * SS, cy - bh + 14 * SS
        d.ellipse([px - r, py - r, px + r, py + r], fill=(96, 102, 116))


def draw_electrolytics(d, w, h, pal, rng, count=6):
    for _ in range(count):
        cx, cy = rng.randint(0, w), rng.randint(0, h)
        r = rng.randint(30, 62) * SS
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=jitter((18, 22, 32), 8, rng))
        d.ellipse([cx - r, cy - r, cx + r, cy + r],
                  outline=jitter((116, 128, 148), 12, rng), width=3 * SS)
        ir = int(r * 0.72)
        d.ellipse([cx - ir, cy - ir, cx + ir, cy + ir],
                  outline=jitter((84, 94, 112), 10, rng), width=SS)
        d.line([cx - ir, cy, cx + ir, cy], fill=(70, 78, 94), width=2 * SS)
        d.line([cx, cy - ir, cx, cy + ir], fill=(70, 78, 94), width=2 * SS)


def draw_connectors(d, w, h, pal, rng, count=4):
    """Shielded ports — the visual anchor a repair bench photo usually has."""
    for _ in range(count):
        cx, cy = rng.randint(0, w), rng.randint(0, h)
        bw = rng.randint(70, 150) * SS
        bh = rng.randint(30, 56) * SS
        d.rounded_rectangle([cx - bw, cy - bh, cx + bw, cy + bh], radius=3 * SS,
                            fill=jitter((132, 142, 158), 14, rng))
        d.rounded_rectangle([cx - bw + 5 * SS, cy - bh + 5 * SS,
                             cx + bw - 5 * SS, cy + bh - 5 * SS],
                            radius=2 * SS, fill=jitter((22, 26, 34), 8, rng))
        d.rounded_rectangle([cx - bw, cy - bh, cx + bw, cy - bh + 4 * SS],
                            radius=SS, fill=jitter((188, 198, 212), 12, rng))


def draw_silkscreen(d, w, h, pal, rng, count=110):
    for _ in range(count):
        cx, cy = rng.randint(0, w), rng.randint(0, h)
        bw = rng.randint(16, 46) * SS
        bh = rng.randint(11, 30) * SS
        d.rounded_rectangle([cx - bw, cy - bh, cx + bw, cy + bh],
                            radius=2 * SS, outline=jitter(pal["silk"], 16, rng), width=SS)


# --------------------------------------------------------------- finishing ---
def to_array(im):
    return np.asarray(im, dtype=np.float32) / 255.0


def to_image(arr):
    return Image.fromarray(np.clip(arr * 255.0, 0, 255).astype(np.uint8), "RGB")


def directional_light(arr, origin=(0.28, 0.18), gain=0.34, falloff=1.35):
    """Single soft key light — the strongest single cue that this is a photo."""
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = (xx / w - origin[0])
    dy = (yy / h - origin[1])
    dist = np.sqrt(dx * dx + dy * dy) / math.sqrt(2.0)
    light = 1.0 + gain * (1.0 - np.clip(dist * falloff, 0.0, 1.0)) ** 2
    light -= 0.42 * np.clip(dist * falloff, 0.0, 1.0) ** 1.7
    return arr * np.clip(light, 0.18, None)[..., None]


def desaturate(arr, amount=0.22):
    lum = (arr * np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)).sum(axis=2)
    return arr * (1 - amount) + lum[..., None] * amount


def depth_of_field(im, focus=(0.42, 0.52), plateau=0.20, max_blur=22):
    """Blend three blur levels through a radial mask with a sharp focal plateau."""
    w, h = im.size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx / w) - focus[0]) ** 2 + ((yy / h) - focus[1]) ** 2)
    d = np.clip((d - plateau) / (0.72 - plateau), 0.0, 1.0) ** 1.5

    out = to_array(im)
    for level in (0.35, 0.70, 1.0):
        blurred = to_array(im.filter(ImageFilter.GaussianBlur(max_blur * level)))
        lo = level - 0.35
        band = np.clip((d - lo) / 0.35, 0.0, 1.0)[..., None]
        out = out * (1 - band) + blurred * band
    return to_image(out)


def add_bokeh(arr, rng, count=14):
    """Out-of-focus specular discs, weighted to the defocused edges."""
    h, w = arr.shape[:2]
    layer = Image.new("RGB", (w, h), (0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        cx = rng.choice([rng.randint(0, int(w * 0.28)), rng.randint(int(w * 0.72), w)])
        cy = rng.randint(0, h)
        r = rng.randint(int(h * 0.015), int(h * 0.05))
        tint = rng.choice([(150, 180, 225), (120, 150, 205), (90, 140, 235), (200, 215, 235)])
        f = rng.uniform(0.16, 0.42)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=tuple(int(c * f) for c in tint))
    layer = layer.filter(ImageFilter.GaussianBlur(int(h * 0.012)))
    return arr + to_array(layer)


def chromatic_aberration(arr, amount=1.4):
    """Lateral CA: scale R up and B down about the centre by a fraction of a pixel."""
    h, w = arr.shape[:2]
    out = arr.copy()
    for ch, px in ((0, amount), (2, -amount)):
        scale = 1.0 + px / max(w, h)
        src = Image.fromarray(np.clip(arr[..., ch] * 255, 0, 255).astype(np.uint8), "L")
        nw, nh = int(round(w * scale)), int(round(h * scale))
        src = src.resize((nw, nh), Image.BICUBIC)
        left, top = (nw - w) // 2, (nh - h) // 2
        src = src.crop((left, top, left + w, top + h))
        out[..., ch] = np.asarray(src, dtype=np.float32) / 255.0
    return out


def tone_curve(arr, black=0.005, white=1.05, contrast=1.06, lift=0.010, exposure=1.0):
    arr = arr * exposure
    arr = (arr - black) / max(1e-4, (white - black))
    arr = np.clip(arr, 0.0, 1.0)
    arr = np.clip((arr - 0.5) * contrast + 0.5, 0.0, 1.0)
    # Roll the highlights off instead of clipping them, as a sensor does.
    arr = arr - 0.14 * np.clip((arr - 0.72) / 0.28, 0.0, 1.0) ** 2
    arr = arr * (1.0 - lift) + lift  # matte shadow lift, as on a real lens
    return np.clip(arr, 0.0, 1.0)


def vignette(arr, strength=0.34):
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx / w) - 0.5) ** 2 + ((yy / h) - 0.5) ** 2) / math.sqrt(0.5)
    return arr * (1.0 - strength * np.clip(d, 0, 1) ** 2.2)[..., None]


def grain(arr, rng, sigma=0.016):
    """Zero-mean grain, slightly stronger in the shadows as on real film."""
    h, w = arr.shape[:2]
    gen = np.random.default_rng(rng.randint(0, 2**31))
    mono = gen.normal(0.0, sigma, (h, w)).astype(np.float32)
    chroma = gen.normal(0.0, sigma * 0.35, (h, w, 3)).astype(np.float32)
    weight = (1.25 - np.clip(arr.mean(axis=2), 0, 1) * 0.75)[..., None]
    return arr + (mono[..., None] + chroma) * weight


# ------------------------------------------------------------------ render ---
def render(name, size, palette="navy", seed=7, focus=(0.42, 0.52), plateau=0.20,
           blur=22, density=340, light=(0.28, 0.18), exposure=1.0, quality=88):
    rng = random.Random(seed)
    pal = PALETTES[palette]
    w, h = size[0] * SS, size[1] * SS

    im = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(im)

    draw_substrate(d, w, h, pal, rng)
    draw_ground_pour(d, w, h, pal, rng)
    draw_traces(d, w, h, pal, rng, density=density)
    draw_silkscreen(d, w, h, pal, rng)
    draw_vias(d, w, h, pal, rng)
    draw_smd(d, w, h, pal, rng)
    draw_ics(d, w, h, pal, rng)
    draw_electrolytics(d, w, h, pal, rng)
    draw_connectors(d, w, h, pal, rng)

    im = im.resize(size, Image.LANCZOS)

    arr = directional_light(to_array(im), origin=light)
    im = depth_of_field(to_image(arr), focus=focus, plateau=plateau, max_blur=blur)

    arr = add_bokeh(to_array(im), rng)
    arr = chromatic_aberration(arr)
    arr = desaturate(arr)
    arr = tone_curve(arr, exposure=exposure)
    arr = vignette(arr)
    arr = grain(arr, rng)

    path = os.path.join(OUT, name)
    to_image(arr).save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    print(f"{name}  {size[0]}x{size[1]}  {os.path.getsize(path) // 1024} KB")


def main():
    os.makedirs(OUT, exist_ok=True)
    render("board-hero.jpg", (1280, 960), "navy", seed=21,
           focus=(0.40, 0.44), plateau=0.24, blur=24, light=(0.24, 0.14), exposure=1.05)
    render("board-dark.jpg", (1600, 700), "navy", seed=54,
           focus=(0.30, 0.52), plateau=0.26, blur=26, density=300, light=(0.18, 0.20),
           exposure=0.78)
    render("board-bench.jpg", (1200, 900), "steel", seed=88,
           focus=(0.56, 0.44), plateau=0.22, blur=22, light=(0.68, 0.16), exposure=1.0)
    render("board-strip.jpg", (1600, 420), "steel", seed=13,
           focus=(0.50, 0.50), plateau=0.30, blur=24, density=260, light=(0.30, 0.10),
           exposure=0.85)


if __name__ == "__main__":
    main()
