#!/usr/bin/env node

/**
 * Simple Markdown fixer for common issues:
 * - MD040: add language to fenced code blocks (heuristics)
 * - MD031: ensure blank lines around fenced code blocks
 */

const fs = require('fs');
const path = require('path');

function guessLang(block) {
  const text = block.join('\n');
  if (/^\s*\{[\s\S]*\}\s*$/.test(text) || /:\s*\{/.test(text)) return 'json';
  if (/^\s*<[^>]+>/.test(text)) return 'html';
  if (/^\s*#\!|\bnpm\s+run\b|\bgit\s+\b|^\s*echo\b/m.test(text)) return 'bash';
  if (/^\s*<\?php/.test(text)) return 'php';
  return 'text';
}

function fixContent(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```\s*$/.test(line)) {
      // start of a fence with no language
      // collect block
      const block = [];
      let j = i + 1;
      while (j < lines.length && !/^```\s*$/.test(lines[j])) {
        block.push(lines[j]);
        j++;
      }
      const lang = guessLang(block);
      // ensure blank line above
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push('```' + lang);
      out.push(...block);
      out.push('```');
      // ensure blank line after
      if (j + 1 < lines.length && lines[j + 1].trim() !== '') out.push('');
      i = j + 1;
      continue;
    }
    // ensure blank line around fences with language (after)
    if (/^```[a-zA-Z]+\s*$/.test(line)) {
      // before
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push(line);
      i++;
      // copy block
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        out.push(lines[i]);
        i++;
      }
      if (i < lines.length && /^```\s*$/.test(lines[i])) {
        out.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim() !== '') out.push('');
      continue;
    }
    out.push(line);
    i++;
  }
  // ensure trailing newline
  if (out.length && out[out.length - 1] !== '') out.push('');
  return out.join('\n');
}

function processFile(p) {
  try {
    const original = fs.readFileSync(p, 'utf8');
    const fixed = fixContent(original);
    if (fixed !== original) {
      fs.writeFileSync(p, fixed, 'utf8');
      console.log('✔ fixed', p);
    }
  } catch (e) {
    console.warn('skip', p, e.message);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node scripts/md-fixer.js <file ...>');
    process.exit(1);
  }
  args.forEach((f) => processFile(path.resolve(f)));
}

if (require.main === module) main();

