#!/usr/bin/env bash
# Скачивает медиа «Балкон для души» из Higgsfield CDN в assets/media/
# и переписывает ссылки в index.html на локальные пути.
# Запуск из корня репозитория:  ./scripts/localize-media.sh
set -euo pipefail

BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3FfEK3Fe2DmNEO1Ae85VEOcjQYt"

FILES=(
  "hf_20260629_122846_2db98207-ccc9-4a7a-a5e4-f75383223b4a.png"               # hero (постер + OG)
  "hf_20260629_123919_1e751cf6-53a3-4584-8e42-c6cc51fe664b.mp4"               # hero видео
  "hf_20260629_123851_311730f2-1dd1-4e53-8aa1-c8c237cdd9af.png"               # showcase
  "hf_20260629_123756_0976ce77-eab2-47ab-91d1-b03b12bff90b.png"               # работа 1
  "hf_20260629_123756_0976ce77-eab2-47ab-91d1-b03b12bff90b_min.webp"
  "hf_20260629_123225_4b19a92e-fb80-4103-9312-be3d251055b3.png"               # работа 2
  "hf_20260629_123225_4b19a92e-fb80-4103-9312-be3d251055b3_min.webp"
  "hf_20260629_123535_cfb74f72-8143-4c6b-b563-b25ebaf3a73c.png"               # работа 3
  "hf_20260629_123535_cfb74f72-8143-4c6b-b563-b25ebaf3a73c_min.webp"
  "hf_20260629_123045_404184d4-42d1-4a6b-bf5d-8e9ef462cc76.png"               # работа 4
  "hf_20260629_123045_404184d4-42d1-4a6b-bf5d-8e9ef462cc76_min.webp"
)

mkdir -p assets/media

for f in "${FILES[@]}"; do
  echo "→ $f"
  curl -fsSL -o "assets/media/$f" "$BASE/$f"
done

# Заменяем CDN-префикс на локальный путь во всех страницах (имена файлов сохраняются)
for page in *.html; do
  sed -i.bak "s#$BASE/#assets/media/#g" "$page" && rm -f "$page.bak"
done

echo "Готово: медиа в assets/media/, ссылки во всех .html переписаны на локальные."
