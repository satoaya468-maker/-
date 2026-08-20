# Шрифт

На проекте одна гарнитура — **Golos Text** (Paratype), SIL Open Font
License 1.1, текст лицензии рядом: `OFL-GolosText.txt`.

Файлы — сабсеты, собранные из оригинальных TTF с Google Fonts:
начертания 400 / 500 / 600 / 700, кириллица, базовая латиница, цифры,
типографские знаки (`₽ № × ° « » — – … ← ↑ → ↓ ✓`).

**44 КБ на все четыре начертания** вместо примерно 190 КБ у полных
субсетов Google Fonts. Лимит проекта — 60 КБ.

Крупные числа набираются тем же Golos Text 700 крупным кеглем
с `letter-spacing: -0.03em` — отдельной гарнитуры под цифры на проекте нет.

Пересобрать (нужен `pyftsubset` из `fonttools`):

```bash
pyftsubset golos-400.ttf --output-file=golos-text-400.woff2 --flavor=woff2 \
  --unicodes="U+0020-007E,U+00A0,U+00AB,U+00BB,U+00B0,U+00D7,U+2010-2015,U+2018-201F,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2116,U+2212,U+20BD,U+2190-2193,U+2713,U+0400-045F,U+0490-0491,U+04E2-04E3" \
  --layout-features=kern,liga,calt,tnum --no-hinting --desubroutinize
```
