/* Ракета — генератор товарной SVG-графики.
   Единая иллюстративная система: устройства рисуются кодом в одном стиле
   (мягкие градиенты, скруглённые формы, лёгкая тень-подложка).
   При подключении реального каталога заменяется на фото товара. */
(function () {
  'use strict';

  var TONES = {
    graphite: { a: '#3c3c46', b: '#16161d', line: '#5a5a66' },
    titan:    { a: '#b3b3bd', b: '#7c7c88', line: '#9a9aa6' },
    silver:   { a: '#f3f3f7', b: '#cfcfd9', line: '#b9b9c4' },
    white:    { a: '#ffffff', b: '#e3e3ea', line: '#c9c9d3' },
    midnight: { a: '#333a58', b: '#171b2e', line: '#4a5170' },
    blue:     { a: '#4a74f0', b: '#1f3da8', line: '#6b8ef4' },
    sky:      { a: '#b7cdf1', b: '#8aa8dc', line: '#a0bae8' },
    cream:    { a: '#f1e9d8', b: '#d6c9ad', line: '#c4b694' },
    black:    { a: '#26262e', b: '#0d0d12', line: '#43434e' },
    steel:    { a: '#dfe1e8', b: '#aab0bd', line: '#c3c8d2' },
    coral:    { a: '#e88673', b: '#c25743', line: '#d97361' },
    sage:     { a: '#a9b8a2', b: '#7c8f74', line: '#96a78e' }
  };

  var uid = 0;

  function esc(s) { return String(s); }

  function svgOpen(w, h) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h +
      '" fill="none" role="img" aria-hidden="true" focusable="false">';
  }

  function grad(id, t, vertical) {
    var dir = vertical ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="1"';
    return '<linearGradient id="' + id + '" ' + dir + '>' +
      '<stop offset="0" stop-color="' + t.a + '"/><stop offset="1" stop-color="' + t.b + '"/></linearGradient>';
  }

  function screenGrad(id) {
    return '<radialGradient id="' + id + '" cx="0.3" cy="0.2" r="1.2">' +
      '<stop offset="0" stop-color="#3d5ec9"/><stop offset="0.55" stop-color="#1b2650"/>' +
      '<stop offset="1" stop-color="#0a0d1f"/></radialGradient>';
  }

  function shadow(cx, cy, rx) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + Math.max(8, rx * 0.09) +
      '" fill="#0e0e12" opacity="0.08"/>';
  }

  function rr(x, y, w, h, r, fill, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r +
      '" fill="' + fill + '"' + (extra || '') + '/>';
  }

  /* Каждая функция рисует устройство в поле 480x360 */
  var DRAW = {

    phone: function (t, g, sg) {
      return shadow(240, 322, 96) +
        rr(172, 40, 136, 268, 30, 'url(#' + g + ')') +
        '<rect x="309" y="112" width="4" height="46" rx="2" fill="' + t.line + '"/>' +
        rr(180, 48, 120, 252, 23, 'url(#' + sg + ')') +
        rr(216, 60, 48, 14, 7, '#0a0a10') +
        '<circle cx="253" cy="67" r="3.4" fill="#1e2a4e"/>' +
        '<rect x="214" y="290" width="52" height="4" rx="2" fill="#ffffff" opacity="0.85"/>';
    },

    tablet: function (t, g, sg) {
      return shadow(240, 326, 120) +
        rr(140, 44, 200, 264, 22, 'url(#' + g + ')') +
        rr(148, 52, 184, 248, 15, 'url(#' + sg + ')') +
        '<circle cx="240" cy="58" r="3" fill="#0a0a10"/>';
    },

    laptop: function (t, g, sg) {
      return shadow(240, 320, 168) +
        rr(120, 52, 240, 190, 12, 'url(#' + g + ')') +
        rr(128, 60, 224, 174, 7, 'url(#' + sg + ')') +
        '<circle cx="240" cy="66" r="2.6" fill="#0a0a10"/>' +
        '<path d="M84 242h312l14 42a10 10 0 0 1-10 13H80a10 10 0 0 1-10-13z" fill="url(#' + g + ')"/>' +
        rr(210, 246, 60, 8, 4, t.b) +
        '<rect x="70" y="291" width="340" height="4" rx="2" fill="' + t.b + '" opacity="0.5"/>';
    },

    tv: function (t, g, sg) {
      return shadow(240, 324, 180) +
        rr(70, 58, 340, 204, 10, 'url(#' + g + ')') +
        rr(76, 64, 328, 192, 6, 'url(#' + sg + ')') +
        '<path d="M150 262 128 300h-24l30-38z" fill="' + t.b + '"/>' +
        '<path d="M330 262l22 38h24l-30-38z" fill="' + t.b + '"/>';
    },

    headphones: function (t, g) {
      return shadow(240, 320, 110) +
        '<path d="M148 210v-42c0-52 41-92 92-92s92 40 92 92v42" stroke="url(#' + g + ')" stroke-width="26" stroke-linecap="round"/>' +
        rr(118, 186, 62, 96, 26, 'url(#' + g + ')') +
        rr(300, 186, 62, 96, 26, 'url(#' + g + ')') +
        rr(130, 198, 38, 72, 17, t.b) +
        rr(312, 198, 38, 72, 17, t.b);
    },

    buds: function (t, g) {
      return shadow(240, 316, 104) +
        rr(150, 96, 180, 168, 46, 'url(#' + g + ')') +
        '<path d="M150 176h180" stroke="' + t.line + '" stroke-width="3"/>' +
        rr(224, 168, 32, 16, 8, t.b) +
        '<circle cx="204" cy="130" r="17" fill="' + t.b + '" opacity="0.55"/>' +
        '<circle cx="276" cy="130" r="17" fill="' + t.b + '" opacity="0.55"/>' +
        '<circle cx="352" cy="252" r="24" fill="url(#' + g + ')"/>' +
        '<rect x="344" y="268" width="15" height="38" rx="7" fill="url(#' + g + ')" transform="rotate(14 352 276)"/>';
    },

    speaker: function (t, g) {
      var dots = '';
      for (var r = 0; r < 5; r++) for (var c = 0; c < 11; c++)
        dots += '<circle cx="' + (186 + c * 11) + '" cy="' + (146 + r * 12) + '" r="2.1" fill="#ffffff" opacity="0.28"/>';
      return shadow(240, 318, 130) +
        rr(120, 104, 240, 152, 76, 'url(#' + g + ')') +
        '<path d="M158 116v128M322 116v128" stroke="' + t.line + '" stroke-width="5" stroke-linecap="round"/>' +
        dots;
    },

    boombox: function (t, g) {
      return shadow(240, 322, 140) +
        rr(110, 88, 260, 184, 20, 'url(#' + g + ')') +
        rr(126, 104, 228, 118, 10, '#efe6d2') +
        '<circle cx="180" cy="163" r="34" fill="' + t.b + '"/>' +
        '<circle cx="300" cy="163" r="34" fill="' + t.b + '"/>' +
        '<circle cx="180" cy="163" r="15" fill="' + t.a + '"/>' +
        '<circle cx="300" cy="163" r="15" fill="' + t.a + '"/>' +
        '<circle cx="146" cy="244" r="8" fill="#c9a86a"/><circle cx="172" cy="244" r="8" fill="#c9a86a"/>' +
        '<rect x="196" y="238" width="120" height="10" rx="5" fill="#0d0d12" opacity="0.4"/>';
    },

    console: function (t, g, sg) {
      return shadow(240, 326, 120) +
        '<path d="M196 52c-10 96-10 160 0 252h-30c-16-84-16-168 0-252z" fill="#e8e8ef"/>' +
        '<path d="M284 52c10 96 10 160 0 252h30c16-84 16-168 0-252z" fill="#e8e8ef"/>' +
        rr(196, 60, 88, 236, 12, 'url(#' + g + ')') +
        '<rect x="204" y="80" width="18" height="120" rx="4" fill="#0a0a10" opacity="0.5"/>' +
        '<circle cx="240" cy="270" r="6" fill="#3f6df5"/>';
    },

    gamepad: function (t, g) {
      return shadow(240, 312, 120) +
        '<path d="M140 128c-32 6-52 84-46 128 4 30 40 34 58 12l26-32h124l26 32c18 22 54 18 58-12 6-44-14-122-46-128-22-4-44 10-56 10h-88c-12 0-34-14-56-10z" fill="url(#' + g + ')"/>' +
        '<circle cx="316" cy="160" r="9" fill="#e8e8ef"/><circle cx="344" cy="184" r="9" fill="#e8e8ef"/>' +
        '<circle cx="344" cy="136" r="9" fill="#e8e8ef"/><circle cx="372" cy="160" r="9" fill="#e8e8ef"/>' +
        '<path d="M148 146v40M128 166h40" stroke="#e8e8ef" stroke-width="12" stroke-linecap="round"/>' +
        '<circle cx="205" cy="210" r="16" fill="' + t.b + '"/><circle cx="275" cy="210" r="16" fill="' + t.b + '"/>';
    },

    switchcon: function (t, g, sg) {
      return shadow(240, 314, 140) +
        rr(96, 108, 62, 148, 18, '#3f6df5') +
        rr(322, 108, 62, 148, 18, '#e5544b') +
        rr(150, 100, 180, 164, 10, 'url(#' + g + ')') +
        rr(158, 110, 164, 144, 6, 'url(#' + sg + ')') +
        '<circle cx="127" cy="150" r="13" fill="#16161d"/>' +
        '<circle cx="353" cy="216" r="13" fill="#16161d"/>';
    },

    fridge: function (t, g) {
      return shadow(240, 330, 96) +
        rr(164, 30, 152, 292, 16, 'url(#' + g + ')') +
        '<path d="M164 128h152" stroke="' + t.b + '" stroke-width="4"/>' +
        rr(178, 58, 7, 48, 3.5, '#ffffff', ' opacity="0.55"') +
        rr(178, 146, 7, 70, 3.5, '#ffffff', ' opacity="0.55"');
    },

    washer: function (t, g) {
      return shadow(240, 330, 110) +
        rr(140, 60, 200, 262, 16, 'url(#' + g + ')') +
        '<rect x="152" y="72" width="176" height="34" rx="8" fill="' + t.b + '" opacity="0.45"/>' +
        '<circle cx="308" cy="89" r="9" fill="#dfe3ee"/>' +
        '<circle cx="240" cy="210" r="66" fill="' + t.b + '"/>' +
        '<circle cx="240" cy="210" r="52" fill="url(#' + g + ')"/>' +
        '<circle cx="240" cy="210" r="36" fill="#33415f" opacity="0.75"/>' +
        '<path d="M214 196c14-12 38-12 52 0" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.4"/>';
    },

    dishwasher: function (t, g) {
      return shadow(240, 330, 110) +
        rr(140, 60, 200, 262, 14, 'url(#' + g + ')') +
        '<rect x="140" y="112" width="200" height="4" fill="' + t.b + '" opacity="0.6"/>' +
        rr(158, 80, 90, 12, 6, '#ffffff', ' opacity="0.5"') +
        '<circle cx="318" cy="86" r="7" fill="#9fe0b8"/>' +
        rr(158, 140, 164, 8, 4, '#ffffff', ' opacity="0.25"') +
        rr(158, 168, 164, 8, 4, '#ffffff', ' opacity="0.18"');
    },

    cooktop: function (t, g) {
      return shadow(240, 320, 140) +
        rr(110, 92, 260, 190, 16, 'url(#' + g + ')') +
        '<circle cx="180" cy="156" r="34" stroke="#5a6274" stroke-width="4"/>' +
        '<circle cx="300" cy="156" r="26" stroke="#5a6274" stroke-width="4"/>' +
        '<circle cx="180" cy="232" r="26" stroke="#5a6274" stroke-width="4"/>' +
        '<circle cx="300" cy="228" r="32" stroke="#d0455a" stroke-width="4"/>' +
        rr(214, 258, 52, 10, 5, '#5a6274');
    },

    oven: function (t, g, sg) {
      return shadow(240, 324, 130) +
        rr(120, 70, 240, 240, 14, 'url(#' + g + ')') +
        rr(136, 84, 208, 30, 8, t.b) +
        '<circle cx="156" cy="99" r="8" fill="#dfe3ee"/><circle cx="324" cy="99" r="8" fill="#dfe3ee"/>' +
        rr(136, 130, 208, 150, 10, t.b) +
        rr(150, 144, 180, 122, 6, 'url(#' + sg + ')') +
        rr(150, 122, 180, 5, 2.5, '#ffffff', ' opacity="0.3"');
    },

    ac: function (t, g) {
      return shadow(240, 300, 160) +
        rr(90, 110, 300, 110, 26, 'url(#' + g + ')') +
        '<path d="M110 190h260" stroke="' + t.line + '" stroke-width="3"/>' +
        '<path d="M130 204h220" stroke="' + t.line + '" stroke-width="3" opacity="0.6"/>' +
        '<circle cx="352" cy="150" r="5" fill="#9fe0b8"/>';
    },

    robot: function (t, g) {
      return shadow(240, 310, 140) +
        '<ellipse cx="240" cy="216" rx="150" ry="56" fill="url(#' + g + ')"/>' +
        '<ellipse cx="240" cy="196" rx="150" ry="56" fill="url(#' + g + ')"/>' +
        '<ellipse cx="240" cy="196" rx="118" ry="42" stroke="' + t.line + '" stroke-width="3"/>' +
        '<circle cx="240" cy="168" r="22" fill="' + t.b + '"/>' +
        '<circle cx="240" cy="168" r="10" fill="#3f6df5" opacity="0.85"/>' +
        '<path d="M150 236a120 40 0 0 0 180 0" stroke="' + t.b + '" stroke-width="5" opacity="0.5"/>';
    },

    stickvac: function (t, g) {
      return shadow(250, 322, 110) +
        '<rect x="236" y="60" width="16" height="150" rx="8" fill="url(#' + g + ')"/>' +
        '<path d="M214 52h60l-8 26h-44z" fill="' + t.b + '"/>' +
        '<circle cx="244" cy="236" r="44" fill="url(#' + g + ')"/>' +
        '<circle cx="244" cy="236" r="26" fill="#d0455a" opacity="0.85"/>' +
        '<circle cx="244" cy="236" r="12" fill="' + t.a + '"/>' +
        '<rect x="216" y="270" width="56" height="34" rx="12" fill="url(#' + g + ')"/>' +
        '<rect x="236" y="298" width="90" height="14" rx="7" fill="' + t.b + '" transform="rotate(18 236 305)"/>';
    },

    coffee: function (t, g) {
      return shadow(240, 322, 120) +
        rr(140, 56, 200, 60, 14, 'url(#' + g + ')') +
        rr(160, 116, 160, 100, 10, t.b) +
        rr(206, 116, 68, 46, 8, 'url(#' + g + ')') +
        rr(226, 162, 28, 12, 4, t.line) +
        '<path d="M226 174h10v16h-10zM244 174h10v16h-10z" fill="' + t.line + '"/>' +
        rr(196, 206, 88, 14, 7, '#efe6d2') +
        rr(140, 216, 200, 96, 14, 'url(#' + g + ')') +
        '<circle cx="308" cy="86" r="12" fill="' + t.b + '"/>';
    },

    kettle: function (t, g) {
      return shadow(236, 316, 100) +
        '<path d="M176 120c-6 60-10 96-6 132a30 30 0 0 0 30 28h72a30 30 0 0 0 30-28c4-36 0-72-6-132z" fill="url(#' + g + ')"/>' +
        '<path d="M176 132l-26 24c-6 6-4 16 6 16h16" stroke="' + t.b + '" stroke-width="12" stroke-linecap="round" fill="none"/>' +
        '<path d="M300 140c22 4 34 18 30 34" stroke="' + t.b + '" stroke-width="14" stroke-linecap="round" fill="none"/>' +
        rr(196, 96, 80, 26, 12, t.b) +
        rr(226, 82, 20, 16, 8, t.b) +
        rr(162, 288, 148, 16, 8, t.b);
    },

    blender: function (t, g, sg) {
      return shadow(240, 322, 100) +
        '<path d="M196 64h88l-12 148h-64z" fill="url(#' + sg + ')" opacity="0.9"/>' +
        '<path d="M196 64h88" stroke="' + t.line + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M284 84c18 2 28 12 26 26l-6 44" stroke="' + t.b + '" stroke-width="11" stroke-linecap="round" fill="none"/>' +
        rr(204, 212, 72, 22, 8, t.b) +
        rr(180, 234, 120, 78, 16, 'url(#' + g + ')') +
        '<circle cx="240" cy="272" r="17" fill="' + t.b + '"/>';
    },

    multicooker: function (t, g) {
      return shadow(240, 318, 110) +
        rr(150, 96, 180, 44, 22, 'url(#' + g + ')') +
        rr(222, 82, 36, 18, 9, t.b) +
        rr(140, 136, 200, 170, 26, 'url(#' + g + ')') +
        rr(160, 176, 160, 60, 12, t.b) +
        '<circle cx="240" cy="206" r="20" stroke="#8fb4ff" stroke-width="3"/>' +
        rr(214, 262, 52, 8, 4, t.line);
    },

    hairdryer: function (t, g) {
      return shadow(240, 314, 100) +
        '<circle cx="252" cy="140" r="62" fill="url(#' + g + ')"/>' +
        '<circle cx="252" cy="140" r="30" fill="' + t.b + '"/>' +
        '<circle cx="252" cy="140" r="14" fill="#d0455a" opacity="0.8"/>' +
        '<rect x="234" y="200" width="36" height="104" rx="16" fill="url(#' + g + ')"/>' +
        rr(240, 240, 24, 8, 4, t.b);
    },

    station: function (t, g) {
      return shadow(240, 318, 100) +
        rr(160, 84, 160, 214, 44, 'url(#' + g + ')') +
        '<path d="M176 118c40-16 88-16 128 0M176 146c40-16 88-16 128 0M176 174c40-16 88-16 128 0" stroke="' + t.line + '" stroke-width="3" opacity="0.5" fill="none"/>' +
        rr(186, 94, 108, 8, 4, '#8f5bd9', ' opacity="0.9"') +
        rr(186, 94, 54, 8, 4, '#3f6df5');
    },

    ministation: function (t, g) {
      return shadow(240, 300, 90) +
        '<ellipse cx="240" cy="196" rx="96" ry="84" fill="url(#' + g + ')"/>' +
        '<path d="M168 168c46-22 98-22 144 0" stroke="' + t.line + '" stroke-width="3" opacity="0.5" fill="none"/>' +
        '<ellipse cx="240" cy="128" rx="72" ry="20" fill="' + t.b + '"/>' +
        '<ellipse cx="240" cy="126" rx="58" ry="14" fill="#3f6df5" opacity="0.35"/>';
    },

    bulb: function (t, g) {
      return shadow(240, 306, 70) +
        '<circle cx="240" cy="150" r="74" fill="url(#' + g + ')"/>' +
        '<circle cx="216" cy="126" r="22" fill="#ffffff" opacity="0.35"/>' +
        '<path d="M214 220h52v14h-52zM220 240h40v12h-40zM226 258h28v12h-28z" fill="' + t.b + '"/>' +
        rr(228, 274, 24, 18, 8, t.b);
    },

    cam: function (t, g) {
      return shadow(240, 310, 80) +
        rr(190, 92, 100, 128, 34, 'url(#' + g + ')') +
        '<circle cx="240" cy="146" r="34" fill="' + t.b + '"/>' +
        '<circle cx="240" cy="146" r="18" fill="#33415f"/>' +
        '<circle cx="232" cy="138" r="6" fill="#8fb4ff" opacity="0.8"/>' +
        '<rect x="232" y="220" width="16" height="36" rx="8" fill="' + t.b + '"/>' +
        '<ellipse cx="240" cy="270" rx="52" ry="14" fill="url(#' + g + ')"/>';
    },

    plug: function (t, g) {
      return shadow(240, 306, 76) +
        rr(168, 92, 144, 144, 34, 'url(#' + g + ')') +
        '<circle cx="240" cy="164" r="46" fill="' + t.b + '"/>' +
        '<circle cx="222" cy="164" r="7" fill="#16161d"/>' +
        '<circle cx="258" cy="164" r="7" fill="#16161d"/>' +
        '<circle cx="240" cy="120" r="4" fill="#3f6df5"/>';
    },

    mouse: function (t, g) {
      return shadow(240, 306, 84) +
        '<path d="M182 132c0-44 26-70 58-70s58 26 58 70c0 62-18 118-58 118s-58-56-58-118z" fill="url(#' + g + ')"/>' +
        '<path d="M240 66v70" stroke="' + t.b + '" stroke-width="3"/>' +
        rr(234, 92, 12, 30, 6, t.b) +
        '<path d="M186 118c-20 26-24 74 2 96M294 118c20 26 24 74-2 96" stroke="' + t.b + '" stroke-width="6" stroke-linecap="round" opacity="0.5"/>';
    },

    watchband: function (t, g, sg) {
      return shadow(240, 310, 70) +
        '<path d="M214 60h52l10 56h-72zM214 300h52l10-56h-72z" fill="' + t.b + '"/>' +
        rr(196, 112, 88, 136, 30, 'url(#' + g + ')') +
        rr(204, 120, 72, 120, 24, 'url(#' + sg + ')') +
        '<rect x="284" y="150" width="5" height="26" rx="2.5" fill="' + t.line + '"/>' +
        '<text x="240" y="188" font-family="Manrope, sans-serif" font-size="26" font-weight="700" fill="#ffffff" text-anchor="middle" opacity="0.9">14:13</text>';
    },

    phonecase: function (t, g) {
      return shadow(240, 314, 80) +
        rr(174, 48, 132, 262, 30, 'url(#' + g + ')') +
        '<circle cx="240" cy="180" r="30" stroke="#ffffff" stroke-width="3" opacity="0.16"/>' +
        rr(188, 62, 52, 52, 16, t.b) +
        '<circle cx="204" cy="78" r="9" fill="' + t.a + '"/>' +
        '<circle cx="226" cy="98" r="9" fill="' + t.a + '"/>';
    },

    glass: function (t, g, sg) {
      return shadow(240, 312, 76) +
        rr(178, 46, 124, 252, 26, 'url(#' + sg + ')', ' opacity="0.35"') +
        '<rect x="178" y="46" width="124" height="252" rx="26" stroke="' + t.line + '" stroke-width="3"/>' +
        '<path d="M206 84l-14 40M232 74l-32 92" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="0.55"/>';
    },

    charger: function (t, g) {
      return shadow(240, 300, 70) +
        rr(176, 96, 128, 128, 34, 'url(#' + g + ')') +
        rr(228, 148, 24, 8, 4, t.b) +
        '<path d="M240 224v46c0 22 26 22 26 2" stroke="' + t.line + '" stroke-width="7" stroke-linecap="round" fill="none"/>';
    },

    cable: function (t, g) {
      return shadow(240, 296, 90) +
        '<path d="M120 210c30-70 90-92 120-64s-42 70-14 100 96-8 116-72" stroke="url(#' + g + ')" stroke-width="13" stroke-linecap="round" fill="none"/>' +
        rr(96, 190, 40, 24, 9, t.b) +
        rr(344, 158, 40, 24, 9, t.b);
    },

    magsafe: function (t, g) {
      return shadow(240, 296, 74) +
        '<circle cx="240" cy="164" r="62" fill="url(#' + g + ')"/>' +
        '<circle cx="240" cy="164" r="42" stroke="' + t.line + '" stroke-width="4"/>' +
        '<path d="M240 226v40c0 20 24 20 24 2" stroke="' + t.line + '" stroke-width="7" stroke-linecap="round" fill="none"/>';
    },

    powerbank: function (t, g) {
      return shadow(240, 306, 96) +
        rr(150, 108, 180, 130, 30, 'url(#' + g + ')') +
        '<circle cx="196" cy="150" r="5" fill="#8fb4ff"/><circle cx="216" cy="150" r="5" fill="#8fb4ff"/>' +
        '<circle cx="236" cy="150" r="5" fill="' + t.line + '"/><circle cx="256" cy="150" r="5" fill="' + t.line + '"/>' +
        rr(170, 190, 60, 22, 8, t.b) +
        rr(250, 190, 34, 22, 8, t.b);
    },

    bag: function (t, g) {
      return shadow(240, 312, 110) +
        '<path d="M132 132h216l-14 156a20 20 0 0 1-20 18H166a20 20 0 0 1-20-18z" fill="url(#' + g + ')"/>' +
        '<path d="M196 132c0-36 18-54 44-54s44 18 44 54" stroke="' + t.b + '" stroke-width="11" fill="none" stroke-linecap="round"/>' +
        '<path d="M140 190h200" stroke="' + t.b + '" stroke-width="4" opacity="0.6"/>' +
        rr(222, 176, 36, 28, 8, t.b);
    },

    headset: function (t, g) {
      return shadow(240, 320, 110) +
        '<path d="M148 214v-46c0-52 41-92 92-92s92 40 92 92v46" stroke="url(#' + g + ')" stroke-width="24" stroke-linecap="round"/>' +
        rr(120, 190, 58, 100, 24, 'url(#' + g + ')') +
        rr(302, 190, 58, 100, 24, 'url(#' + g + ')') +
        '<path d="M136 288c-6 26 10 40 34 34" stroke="' + t.b + '" stroke-width="10" stroke-linecap="round" fill="none"/>' +
        '<circle cx="170" cy="322" r="8" fill="' + t.b + '"/>';
    },

    monitorpc: function (t, g, sg) {
      return shadow(240, 322, 150) +
        rr(96, 60, 288, 176, 12, 'url(#' + g + ')') +
        rr(103, 67, 274, 162, 7, 'url(#' + sg + ')') +
        rr(224, 236, 32, 42, 6, 'url(#' + g + ')') +
        rr(180, 278, 120, 12, 6, 'url(#' + g + ')');
    }
  };

  window.RaketaArt = function (type, toneName, opts) {
    opts = opts || {};
    var t = TONES[toneName] || TONES.graphite;
    var id = 'ra' + (++uid);
    var g = id + 'g', sg = id + 's';
    var fn = DRAW[type] || DRAW.phone;
    var defs = '<defs>' + grad(g, t, type === 'phone' || type === 'fridge') + screenGrad(sg) + '</defs>';
    return svgOpen(480, 360) + defs + fn(t, g, sg) + '</svg>';
  };

  window.RaketaArt.tones = TONES;
})();
