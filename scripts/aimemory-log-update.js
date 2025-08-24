#!/usr/bin/env node

/**
 * AI Memory Log Updater
 * Append standardized collaboration log entries to docs/aimemory/shared/ai-shared.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs(argv) {
  const args = {};
  let key = null;
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith('--')) {
      key = tok.replace(/^--/, '');
      // boolean flag
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) {
        args[key] = true;
        key = null;
      }
    } else if (key) {
      if (args[key]) {
        // support multi-value flags
        if (!Array.isArray(args[key])) args[key] = [args[key]];
        args[key].push(tok);
      } else {
        args[key] = tok;
      }
      key = null;
    }
  }
  return args;
}

function usage() {
  console.log('\n🧠 AI Memory Log Updater');
  console.log('\nUsage:');
  console.log('  node ./scripts/aimemory-log-update.js \\');
  console.log('    --agent Codex \\');
  console.log('    --task "短述" \\');
  console.log('    --summary "摘要" \\');
  console.log('    [--reason "原因"] [--method "方法"] [--result "結果"] \\');
  console.log('    [--files "a.md,b.md"] [--status done] [--version v3.4.1.0]');
  console.log('\nNotes:');
  console.log('  - Writes to docs/aimemory/shared/ai-shared.md under "協作日誌" section.');
}

function nowDateTime() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
}

function normalizeList(val) {
  if (!val) return null;
  if (Array.isArray(val)) return val.join(', ');
  return String(val)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ');
}

function buildEntry({ date, time, agent, task, summary, files, status, version, reason, method, result }) {
  const lines = [];
  const when = time ? `${date} ${time}` : date;
  lines.push(`### [${when}] - ${agent}`);
  
  // 新格式: 版本, 任務, 摘要, 原因, 方法, 結果, 狀態, 變更檔
  if (version) {
    const vstr = String(version).startsWith('v') ? version : `v${version}`;
    lines.push(`- 版本: ${vstr}`);
  }
  if (task) lines.push(`- 任務: ${task}`);
  if (summary) lines.push(`- 摘要: ${summary}`);
  if (reason) lines.push(`- 原因: ${reason}`);
  if (method) lines.push(`- 方法: ${method}`);
  if (result) lines.push(`- 結果: ${result}`);
  if (status) lines.push(`- 狀態: ${status}`);
  if (files) lines.push(`- 變更檔: ${files}`);
  
  lines.push('');
  return lines.join('\n');
}

function insertAfterHeading(md, headingRegex, entryText) {
  const lines = md.split(/\r?\n/);
  let idx = lines.findIndex((l) => headingRegex.test(l));
  if (idx === -1) {
    // If heading not found, append a new section at end
    return (
      md.replace(/\s*$/, '') +
      '\n\n## 協作日誌 (Collaboration Log)\n\n' +
      entryText
    );
  }
  // find insertion point just after the heading and optional blank line
  let insertAt = idx + 1;
  if (lines[insertAt] && lines[insertAt].trim() !== '') {
    // ensure a blank line after heading
    lines.splice(insertAt, 0, '');
    insertAt++;
  } else {
    // skip a single blank line if present to keep newest-first directly under heading
    insertAt++;
  }
  lines.splice(insertAt, 0, entryText);
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const agent = args.agent || 'Codex';
  const task = args.task || '';
  const summary = args.summary || '';
  const reason = args.reason || '';
  const method = args.method || '';
  const result = args.result || '';
  const status = args.status || '';
  let version = args.version || '';
  const dt = nowDateTime();
  const date = args.date || dt.date;
  const time = args.time || dt.time;
  const files = normalizeList(args.files);
  const noBump = !!args['no-bump'];

  if (!task && !summary) {
    usage();
    process.exit(1);
  }

  const repoRoot = process.cwd();
  // 補充版本：若未提供 --version，嘗試從 .version 讀取
  if (!version) {
    try {
      const vObj = JSON.parse(fs.readFileSync(path.join(repoRoot, '.version'), 'utf8'));
      if (vObj && vObj.version) version = vObj.version;
    } catch {}
  }
  const targetPath = path.join(
    repoRoot,
    'docs/aimemory/shared/ai-shared.md',
  );
  if (!fs.existsSync(targetPath)) {
    console.error('❌ 找不到共用記憶檔案: ' + targetPath);
    process.exit(1);
  }

  const original = fs.readFileSync(targetPath, 'utf8');
  const entry = buildEntry({ date, time, agent, task, summary, files, status, version, reason, method, result });
  const updated = insertAfterHeading(
    original,
    /^##\s+協作日誌/i,
    entry,
  );

  fs.writeFileSync(targetPath, updated, 'utf8');
  console.log('✅ 已追加協作日誌到 ai-shared.md');

  // 自動遞增 5 碼版本的第 5 碼（協作日誌）
  if (!noBump) {
    try {
      execSync(`${process.execPath} ${path.join(repoRoot, 'scripts/version-manager.js')} log`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('⚠️ 無法自動更新日誌版本碼:', e.message);
    }
  }
}

main().catch((e) => {
  console.error('❌ 發生錯誤: ' + e.message);
  process.exit(1);
});
