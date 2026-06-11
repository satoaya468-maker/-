#!/usr/bin/env bash
# Builds the scroll-scrub frame sequence and derived images from the
# generated hero video. Requires ffmpeg. Run from the repository root.
#
# Usage: ./scripts/build-frames.sh [path/to/hero.mp4]
set -euo pipefail

VIDEO="${1:-assets/video/hero.mp4}"
BALCONY_SRC="${2:-work/balcony.png}"

if [ ! -f "$VIDEO" ]; then
  echo "Hero video not found at $VIDEO" >&2
  echo "Download it first:" >&2
  echo "  curl -L -o assets/video/hero.mp4 'https://d8j0ntlcm91z4.cloudfront.net/user_3EzgRoleznDLKIBHlEgNJvYcZmT/hf_20260611_195052_5467234a-1807-41f5-bf9d-ff1c7e40bdd4.mp4'" >&2
  exit 1
fi

mkdir -p assets/frames/hero assets/img

# 120 webp frames for the scroll scrub (8s @ 15fps)
ffmpeg -i "$VIDEO" -vf "fps=15,scale=1344:768:flags=lanczos" \
  -c:v libwebp -quality 74 -compression_level 6 \
  assets/frames/hero/frame_%03d.webp

# poster = first frame
ffmpeg -i "$VIDEO" -vf "select=eq(n\,0),scale=1344:768" -frames:v 1 \
  -c:v libwebp -quality 80 assets/img/poster.webp -y

# og-cover for social sharing
ffmpeg -i "$VIDEO" -ss 4 -frames:v 1 \
  -vf "scale=1200:675:flags=lanczos" -q:v 3 assets/img/og-cover.jpg -y

# balcony showcase photo (optional)
if [ -f "$BALCONY_SRC" ]; then
  ffmpeg -i "$BALCONY_SRC" -vf "scale=1376:-1" -c:v libwebp -quality 80 \
    assets/img/balcony.webp -y
fi

echo "Done: $(ls assets/frames/hero | wc -l) frames + poster + og-cover"
