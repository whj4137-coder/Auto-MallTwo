#!/usr/bin/env node
// SSOT 字面值校验（CLAUDE.md §7/§8）。
// 原理：镜像文件定义 SSOT —— copy.ts(§11 文案) + seed.ts(§10 数据)。
// 其它任何源码文件出现这些"业务字面值"，即视为重复 SSOT（应改为从 @apex/shared 或 API 引用），判违规。
// 只针对含中文的业务字面值（产品名/地址/车辆/账号/锁定文案），避免误伤 UI 通用词。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COPY_FILE = "packages/shared/src/copy.ts";
const SEED_FILE = "apps/server/src/store/seed.ts";

// 镜像文件本身 + 不含业务字面值的文件，跳过扫描
const SKIP = new Set([COPY_FILE, SEED_FILE]);

const CJK = /[一-龥]/;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

// 从镜像文件抽取"含中文的双引号字符串"作为 SSOT 真值。
// 排除类目显示名（结构性 UI 词汇，多处复用、非可锁文案/PII）——即 categoryCode 同行的 name。
function extractLiterals(rel) {
  const src = read(rel);
  const out = new Set();
  for (const line of src.split("\n")) {
    if (/categoryCode/.test(line)) continue; // 跳过类目名
    for (const m of line.matchAll(/"([^"]+)"/g)) {
      const s = m[1];
      if (CJK.test(s) && s.length >= 2) out.add(s);
    }
  }
  return out;
}

// 仅当字面值作为「完整字符串」或「完整 JSX 文本节点」出现才判违规，
// 避免短词作为更长合法字符串/标签文本的子串造成误报（如 "登录" ⊂ "请先登录"/"已登录"）。
function hits(line, lit) {
  return (
    line.includes(`"${lit}"`) ||
    line.includes(`'${lit}'`) ||
    line.includes("`" + lit + "`") ||
    line.includes(`>${lit}<`)
  );
}

// 去掉注释（//... 与 /* ... */），避免中文注释误报
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => l.replace(/\/\/.*$/, ""))
    .join("\n");
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(name)) acc.push(full);
  }
  return acc;
}

const canonical = new Set([...extractLiterals(COPY_FILE), ...extractLiterals(SEED_FILE)]);

const targets = [
  ...walk(path.join(ROOT, "apps")),
  ...walk(path.join(ROOT, "packages")),
];

const violations = [];
for (const abs of targets) {
  const rel = path.relative(ROOT, abs);
  if (SKIP.has(rel)) continue;
  const lines = stripComments(read(rel)).split("\n");
  lines.forEach((line, i) => {
    for (const lit of canonical) {
      if (hits(line, lit)) violations.push({ rel, line: i + 1, lit });
    }
  });
}

if (violations.length) {
  console.error(`✗ SSOT 字面值校验失败：发现 ${violations.length} 处硬编码业务字面值（应从 @apex/shared 或后端 API 取，不得在代码里重抄 §10/§11）`);
  for (const v of violations) console.error(`  ${v.rel}:${v.line}  「${v.lit}」`);
  process.exit(1);
}
console.log(`✓ SSOT 字面值校验通过（${canonical.size} 个锁定字面值，扫描 ${targets.length} 文件，0 重复）`);
