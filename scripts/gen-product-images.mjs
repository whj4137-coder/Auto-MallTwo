#!/usr/bin/env node
// 生成 10 个商品的座舱风矢量插画 SVG → apps/web/public/products/{code}.svg
// 本环境无照片级文生图，故商品图为代码生成的矢量插画（非照片）；每个商品独特线稿，深色座舱主题。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../apps/web/public/products");
fs.mkdirSync(OUT, { recursive: true });

const THEME = {
  car: { from: "#16323a", to: "#0d1a20", accent: "#22d3c5", glow: "34,211,197" },
  ele: { from: "#241f3a", to: "#12151f", accent: "#9b8cff", glow: "155,140,255" },
  mem: { from: "#16403f", to: "#0e3038", accent: "#bff7f0", glow: "34,211,197" },
  svc: { from: "#3a2c16", to: "#1c1610", accent: "#ffb020", glow: "255,176,32" },
};

// 每个商品的线稿（局部坐标，已 translate(200,150)，范围约 -110..110）
const ART = {
  phy_car_001: `
    <circle cx="-44" cy="0" r="30"/>
    <path d="M-44 -30 L-44 30 M-74 0 L-14 0"/>
    <rect x="6" y="-72" width="86" height="144" rx="14"/>
    <line x1="22" y1="-72" x2="76" y2="-72"/>
    <circle cx="49" cy="52" r="6"/>`,
  phy_car_002: `
    <path d="M-78 -16 L78 -16 L60 70 L-60 70 Z"/>
    <path d="M-78 -16 L-92 -54 L-30 -54 L-12 -16"/>
    <path d="M78 -16 L92 -54 L30 -54 L12 -16"/>
    <line x1="-12" y1="-16" x2="-12" y2="70"/>
    <line x1="12" y1="-16" x2="12" y2="70"/>
    <path d="M-20 -54 Q0 -74 20 -54"/>`,
  phy_car_003: `
    <rect x="-34" y="-6" width="68" height="78" rx="14"/>
    <rect x="-46" y="-30" width="92" height="26" rx="8"/>
    <line x1="-46" y1="-17" x2="46" y2="-17"/>
    <path d="M-14 -56 Q-26 -42 -14 -30"/>
    <path d="M2 -64 Q-10 -47 2 -30"/>
    <path d="M18 -56 Q6 -42 18 -30"/>`,
  phy_ele_001: `
    <rect x="-80" y="-46" width="160" height="92" rx="16"/>
    <circle cx="-18" cy="0" r="34"/>
    <circle cx="-18" cy="0" r="16"/>
    <rect x="40" y="-22" width="30" height="20" rx="4"/>
    <circle cx="55" cy="28" r="5"/>
    <path d="M-30 -46 L-30 -64 L0 -64 L0 -46"/>`,
  phy_ele_002: `
    <rect x="-58" y="-58" width="116" height="116" rx="20"/>
    <rect x="-34" y="-30" width="20" height="34" rx="5"/>
    <rect x="14" y="-30" width="20" height="34" rx="5"/>
    <path d="M-58 36 Q-96 36 -96 70"/>
    <path d="M58 36 Q96 36 96 70"/>`,
  mem_001: `
    <rect x="-92" y="-58" width="184" height="116" rx="16" transform="rotate(-7)"/>
    <rect x="-72" y="-30" width="34" height="26" rx="5" transform="rotate(-7)"/>
    <path d="M44 -26 l9 18 20 3 -15 14 4 20 -18 -10 -18 10 4 -20 -15 -14 20 -3 z" transform="rotate(-7)"/>`,
  mem_002: `
    <rect x="-92" y="-58" width="184" height="116" rx="16" transform="rotate(-7)"/>
    <path d="M-66 -6 L-50 -30 L-30 -12 L-10 -34 L-10 -6 Z" transform="rotate(-7)"/>
    <path d="M28 -30 l7 14 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2 z" transform="rotate(-7)"/>`,
  svc_charge_001: `
    <path d="M-80 60 L-80 6 L-54 6 L-54 -22 L-26 -22 L-26 6 L80 6 L80 60 Z" opacity="0.5"/>
    <line x1="-66" y1="20" x2="-66" y2="44"/><line x1="-40" y1="20" x2="-40" y2="44"/>
    <line x1="0" y1="20" x2="0" y2="44"/><line x1="26" y1="20" x2="26" y2="44"/><line x1="52" y1="20" x2="52" y2="44"/>
    <path d="M18 -64 L-18 -6 L6 -6 L-6 56 L34 -14 L8 -14 Z" fill="rgba(255,176,32,0.18)"/>`,
  svc_charge_002: `
    <path d="M0 -70 C-44 -70 -64 -36 -64 -8 C-64 34 0 78 0 78 C0 78 64 34 64 -8 C64 -36 44 -70 0 -70 Z"/>
    <path d="M8 -44 L-14 4 L4 4 L-6 44 L24 -12 L4 -12 Z" fill="rgba(255,176,32,0.2)"/>`,
  svc_life_001: `
    <path d="M0 -68 C-30 -28 -46 -8 -46 18 C-46 46 -22 66 0 66 C22 66 46 46 46 18 C46 -8 30 -28 0 -68 Z"/>
    <path d="M-18 14 Q-18 -2 -2 -2" />
    <path d="M40 -44 l5 11 12 2 -9 8 2 12 -10 -6 -10 6 2 -12 -9 -8 12 -2 z" fill="rgba(255,176,32,0.25)"/>`,
};

const THEME_OF = (code) =>
  code.startsWith("mem") ? THEME.mem
  : code.startsWith("svc") ? THEME.svc
  : code.startsWith("phy_ele") ? THEME.ele
  : THEME.car;

function svg(code) {
  const t = THEME_OF(code);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-label="${code}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/>
    </linearGradient>
    <radialGradient id="gl" cx="0.72" cy="0.12" r="0.7">
      <stop offset="0" stop-color="rgba(${t.glow},0.30)"/><stop offset="0.6" stop-color="rgba(${t.glow},0)"/>
    </radialGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0 H0 V32" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <rect width="400" height="300" fill="url(#grid)"/>
  <rect width="400" height="300" fill="url(#gl)"/>
  <g fill="none" stroke="rgba(${t.glow},0.5)" stroke-width="1.5">
    <path d="M16 16 h14 M16 16 v14"/><path d="M384 16 h-14 M384 16 v14"/>
    <path d="M16 284 h14 M16 284 v-14"/><path d="M384 284 h-14 M384 284 v-14"/>
  </g>
  <g transform="translate(200,150)" fill="none" stroke="${t.accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    ${ART[code].trim()}
  </g>
  <text x="20" y="282" font-family="IBM Plex Mono, monospace" font-size="12" fill="rgba(255,255,255,0.28)">${code}</text>
</svg>`;
}

const codes = Object.keys(ART);
for (const code of codes) fs.writeFileSync(path.join(OUT, `${code}.svg`), svg(code));
console.log(`✓ 生成 ${codes.length} 张商品矢量插画 → apps/web/public/products/`);
