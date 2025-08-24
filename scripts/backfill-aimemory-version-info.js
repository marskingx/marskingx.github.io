#!/usr/bin/env node

/**
 * Backfill Version Info (5碼) blocks in docs/aimemory/shared/ai-shared.md
 * For each log entry that has a "- 版本:" line but lacks the
 * "Version Info (5碼)" block, insert the block right after the version line.
 */

const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), 'docs/aimemory/shared/ai-shared.md');

function parseVersionTuple(s) {
  if (!s) return null;
  const m = String(s).match(/v?\s*(\d+)\.(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/i);
  if (!m) return null;
  const parts = [m[1], m[2], m[3], m[4], m[5] || '0'];
  return parts;
}

function buildBlock(tuple) {
  return [
    '',
    '#### Version Info (5碼)',
    `- Tuple: (${tuple.join('.')})`,
    `- major (${tuple[0]}): 重大變更`,
    `- minor (${tuple[1]}): 新功能`,
    `- patch (${tuple[2]}): 錯誤修正`,
    `- content (${tuple[3]}): 內容更新`,
    `- log (${tuple[4]}): 協作日誌遞增次數`,
  ].join('\n');
}

function backfill(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^### \[\d{4}-\d{2}-\d{2}/.test(line)) {
      // collect this entry block
      let j = i + 1;
      while (j < lines.length && !/^### \[\d{4}-\d{2}-\d{2}/.test(lines[j])) j++;
      const entry = lines.slice(i, j);
      const fixed = normalizeEntry(entry);
      out.push(...fixed);
      i = j;
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

function normalizeEntry(entryLines) {
  // entryLines starts with heading line
  let arr = [...entryLines];
  // remove any existing Version Info block
  let idx;
  while ((idx = arr.findIndex((l) => /^####\s+Version Info \(5碼\)/i.test(l))) !== -1) {
    let k = idx + 1;
    while (k < arr.length && arr[k].trim() !== '' && !/^### \[\d{4}-\d{2}-\d{2}/.test(arr[k])) k++;
    arr.splice(idx, k - idx); // remove block
  }
  // find version line
  const verIdx = arr.findIndex((l) => /^-\s*版本\s*:/i.test(l));
  if (verIdx !== -1) {
    const verText = arr[verIdx].replace(/^-\s*版本\s*:\s*/i, '').trim();
    const tuple = parseVersionTuple(verText);
    if (tuple) {
      const block = buildBlock(tuple).split('\n');
      arr.splice(verIdx + 1, 0, ...block);
    }
  }
  return arr;
}

function main() {
  if (!fs.existsSync(target)) {
    console.error('❌ 找不到檔案: ' + target);
    process.exit(1);
  }
  const original = fs.readFileSync(target, 'utf8');
  const updated = backfill(original);
  if (updated !== original) {
    fs.writeFileSync(target, updated, 'utf8');
    console.log('✅ 已補寫 Version Info (5碼) 至協作日誌');
  } else {
    console.log('ℹ️ 無需補寫，協作日誌已完整');
  }
}

if (require.main === module) {
  main();
}
