#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

class SmartGitManager {
  constructor() {
    this.publicRepo = { name: "public", remote: "origin", branch: "main" };
    this.privateRepo = { name: "private", path: "D:\\marskingx.github.io-dev-sync", remote: "origin", branch: "main" };
    this.mirrorPaths = ['docs/aimemory', '.kiro'];
    this.privateFilePatterns = [
      "docs/", ".kiro/", ".claude-backups/", ".claude/", "reindex/", "AI_*.md", "CLAUDE*.md",
      "GEMINI*.md", "CODEX*.md", "*ONBOARDING*.md", "*HANDOVER*.md", "*REVIEW*.md", "*COLLABORATION*.md",
      "GSC_*.md", "GSC_*.txt", ".ai-lock.json", ".env*", "*.log", "*.temp", "*.tmp", "git_log_temp.txt",
      ".idea/", ".vscode/", ".code-workspace", ".venv/", "venv/", "scripts/venv/", "*.pyc",
      "__pycache__/", "*.egg-info/", "*.backup", "*.bak", "*~", ".gitignore-backup", ".gitignore-private",
      "*.zip", "*.tar.gz", "*.rar", "BRANCH_ANALYSIS_REPORT.md", "CHANGELOG.md", "HUGO.md", "prompt.md",
      "README-NEWSLETTER-POPUP.md", "VERSION_MANAGEMENT.md", "*HUGO_INTEGRATION*.md", "*HUGO_UPGRADE*.md",
      "*HUGO_REPORT*.md", "*CTR-Optimization*.md", "*SEO*.md", "GSC-CTR-Optimization-Prompt.md",
      "MULTI-AI-COLLABORATION.md", ".github/MAILCHIMP_*.md", "Claude-Code-Usage-Monitor/", ".gitlab-ci.yml",
      "netlify.toml", "vercel.json", "amplify.yml", "vercel-build.sh", "Dmarskingx.github.io.markdownlint.json",
      "docs/temp.txt",
    ];
  }

  log(message, type = "info") {
    const prefix = { info: "📝", success: "✅", error: "❌", warning: "⚠️" };
    console.log(`${prefix[type]} ${message}`);
  }

  executeCommand(command, options = {}) {
    try {
      return execSync(command, { encoding: "utf8", stdio: options.silent ? "pipe" : "inherit", cwd: options.cwd || process.cwd(), ...options });
    } catch (error) {
      if (options.ignoreError) return null;
      throw new Error(`指令執行失敗: ${command}\n${error.message}`);
    }
  }

  isPrivateFile(filePath) {
    return this.privateFilePatterns.some((pattern) => {
      if (pattern.endsWith("/")) return filePath.startsWith(pattern);
      if (pattern.includes("*")) return new RegExp(pattern.replace(/\*/g, ".*")).test(filePath);
      return filePath === pattern;
    });
  }

  analyzeGitChanges() {
    this.log("分析 Git 變更狀態...", "info");
    const statusOutput = this.executeCommand("git status --porcelain", { silent: true });
    const lines = statusOutput.trim().split("\n").filter(Boolean);
    const changes = { public: [], private: [], untracked: [] };

    for (const line of lines) {
      if (line.length < 3) continue;

      const status = line.substring(0, 2);
      const filePath = line.substring(3);

      // 跳過空路徑或無效行
      if (!filePath || filePath.trim() === '') continue;

      // 檢查是否有任何變更（包括已暫存和工作目錄變更）
      const hasChanges = status[0] !== ' ' || status[1] !== ' ';
      if (!hasChanges) continue;

      if (this.isPrivateFile(filePath)) changes.private.push({ status, path: filePath });
      else changes.public.push({ status, path: filePath });
      if (status.includes("?")) changes.untracked.push({ status, path: filePath });
    }

    this.log(`🔍 檢測結果: 公開 ${changes.public.length} 個, 私有 ${changes.private.length} 個, 未追蹤 ${changes.untracked.length} 個`, "info");
    return changes;
  }

  async smartCommit(message) {
    const changes = this.analyzeGitChanges();

    if (changes.public.length === 0 && changes.private.length === 0) {
      this.log("沒有變更需要提交", "info");
      return { success: true };
    }

    this.log(`
📊 變更分析:`, "info");
    this.log(`🌐 公開檔案: ${changes.public.length} 個`, "info");
    this.log(`🔒 私有檔案: ${changes.private.length} 個`, "info");

    try {
      // 1. 先處理所有變更（暫存）
      this.executeCommand("git add .");

      // 使用已暫存內容建立更可靠的摘要
      const staged = this.getStagedNameStatus(process.cwd());
      const enhancedMessage = this.buildCommitMessage(message, changes, staged);
      this.executeCommand(`git commit -m "${enhancedMessage}"`, { stdio: 'inherit' });

      this.log("✓ 本地提交完成", "success");
      // 2. 先遞增 5碼版本的第5碼（協作日誌），再追加協作日誌（Claude 自動）
      try {
        // bump log version
        this.executeCommand(`${process.execPath} scripts/version-manager.js log`, { silent: true });
        const version = this.readProjectVersion();
        const topFiles = (staged.files || []).slice(0, 10).join(', ');

        // 解析提交訊息類型
        const commitTypeMatch = message.match(/^([a-z]+):/);
        let versionCategory = 'log'; // 預設為 log
        if (commitTypeMatch) {
          const type = commitTypeMatch[1];
          switch (type) {
            case 'feat': versionCategory = 'minor'; break;
            case 'fix': versionCategory = 'patch'; break;
            case 'docs':
            case 'content': versionCategory = 'content'; break;
            case 'major': versionCategory = 'major'; break; // 假設有明確的 major 類型
            default: versionCategory = 'log'; break;
          }
        }

        const logTask = `${versionCategory}/AI上版`;

        const logCmd = [
          process.execPath,
          'scripts/aimemory-log-update.js',
          '--agent', 'Claude',
          '--task', logTask,
          '--summary', message,
          '--reason', '執行AI上版流程',
          '--method', '使用智能Git管理系統進行檔案分類和自動提交',
          '--result', '成功完成AI上版並更新協作日誌',
          '--status', '已完成',
          '--no-bump',
        ];
        if (topFiles) {
          logCmd.push('--files', topFiles);
        }
        if (version) {
          logCmd.push('--version', version);
        }
        this.executeCommand(logCmd.map((s)=> (s.includes(' ') ? `"${s}"` : s)).join(' '), { silent: true });
        this.log('已自動更新協作日誌', 'success');
      } catch (e) {
        this.log(`協作日誌更新失敗: ${e.message}`, 'warning');
      }

      return { success: true, changes };
    } catch (error) {
      this.log(`提交失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async smartPush(options = {}) {
    const { skipPublic = false, skipPrivate = false } = options;
    const results = [];

    try {
      // 1. 推送到私有儲存庫
      if (!skipPrivate) {
        this.log("推送 AI 記憶到私有儲存庫...", "info");
        const privateResult = await this.pushToPrivateRepo();
        results.push(privateResult);
      }

      // 2. 推送到公開儲存庫（過濾私有檔案）
      if (!skipPublic) {
        this.log("推送程式碼到公開儲存庫...", "info");
        const publicResult = await this.pushToPublicRepo();
        results.push(publicResult);
      }

      const allSuccess = results.every((r) => r.success);

      if (allSuccess) {
        this.log("🎉 智能推送完成！", "success");
      } else {
        this.log("⚠️ 部分推送失敗，請檢查結果", "warning");
      }

      return { success: allSuccess, results };
    } catch (error) {
      this.log(`智能推送失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async pushToPrivateRepo() {
    try {
      // 檢查私有儲存庫路徑
      if (!fs.existsSync(this.privateRepo.path)) {
        throw new Error(`私有儲存庫路徑不存在: ${this.privateRepo.path}`);
      }

      // 在推送前鏡射指定目錄到私有庫（確保私有檔案被追蹤）
      try {
        this.log('鏡射檔案到私有儲存庫...', 'info');
        this.mirrorToPrivate(this.mirrorPaths);
        this.log('鏡射完成', 'success');
      } catch (e) {
        this.log(`鏡射失敗: ${e.message}`, 'warning');
      }

      // 同步當前變更到私有儲存庫
      const PrivateRepoHandler = require("./private-repo-handler");
      const handler = new PrivateRepoHandler();

      const result = await handler.pushChanges("sync: 智能同步 AI 記憶檔案");

      if (result.success) {
        this.log("✓ 私有儲存庫同步完成", "success");
      }

      return result;
    } catch (error) {
      this.log(`私有儲存庫推送失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async pushToPublicRepo() {
    try {
      // 推送到公開儲存庫（Git 會自動根據 .gitignore 過濾）
      this.executeCommand("git push origin main");
      this.executeCommand("git push --tags");

      this.log("✓ 公開儲存庫推送完成", "success");
      return { success: true };
    } catch (error) {
      this.log(`公開儲存庫推送失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async smartRelease(message = "feat: 智能發布更新") {
    this.log("🚀 開始智能發布流程", "info");

    try {
      // 1. AI上版
      const commitResult = await this.smartCommit(message);
      if (!commitResult.success) {
        throw new Error("提交失敗");
      }

      // 2. 智能推送
      const pushResult = await this.smartPush();
      if (!pushResult.success) {
        throw new Error("推送失敗");
      }

      this.log("🎉 智能發布完成！", "success");
      return { success: true };
    } catch (error) {
      this.log(`智能發布失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  mirrorToPrivate(paths) {
    const pathLib = require('path');
    paths.forEach((rel) => {
      const src = pathLib.join(process.cwd(), rel);
      const dst = pathLib.join(this.privateRepo.path, rel);
      if (!fs.existsSync(src)) return;
      fs.mkdirSync(pathLib.dirname(dst), { recursive: true });
      fs.cpSync(src, dst, { recursive: true, force: true });
    });
  }

  buildCommitMessage(baseMessage, changes, staged = { lines: [], files: [], counts: {} }) {
    const msg = baseMessage && baseMessage.trim().length > 0 ? baseMessage.trim() : "feat: AI上版更新";
    const lines = [msg, "", "## Change Summary"];

    const stageFiles = (staged.files || []).slice(0, 20);
    if (stageFiles.length) {
      lines.push(`- Files: ${stageFiles.join(", ")}`);
    }

    return lines.join("\n");
  }

  getStagedNameStatus(cwd) {
    try {
      const out = this.executeCommand('git diff --cached --name-status', { cwd, silent: true });
      const lines = out.trim().split(/\n/).filter(Boolean);
      const files = [];
      lines.forEach((l) => {
        const m = l.match(/^([MADRCU])\s+(.+)$/);
        if (m) files.push(m[2]);
      });
      return { lines, files, counts: {} };
    } catch {
      return { lines: [], files: [], counts: {} };
    }
  }

  readProjectVersion() {
    try {
      const txt = fs.readFileSync('.version', 'utf8');
      const obj = JSON.parse(txt);
      if (obj && obj.version) return obj.version;
    } catch {}
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.version || '';
    } catch {}
    return '';
  }

  showHelp() {
    console.log(`
🤖 智能 Git 管理系統

使用方式:
  node smart-git-manager.js commit [message]    # AI上版
  node smart-git-manager.js push                # 智能推送
  node smart-git-manager.js release [message]   # 完整智能發布
  node smart-git-manager.js analyze             # 分析變更狀態

功能特色:
  ✅ 自動區分公開/私有檔案
  ✅ AI 記憶檔案自動推送到私有儲存庫
  ✅ 程式碼推送到公開儲存庫
  ✅ 避免敏感資料意外洩漏
    `);
  }
}

// CLI 接口
async function main() {
  const manager = new SmartGitManager();
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "commit": {
      const message = args.join(" ") || "feat: AI上版更新";
      await manager.smartCommit(message);
      break;
    }

    case "push": {
      await manager.smartPush();
      break;
    }

    case "release": {
      const releaseMessage = args.join(" ") || "feat: 智能發布更新";
      await manager.smartRelease(releaseMessage);
      break;
    }

    case "analyze": {
      const changes = manager.analyzeGitChanges();
      manager.log(
        `📊 變更分析結果: 公開 ${changes.public.length} 個，私有 ${changes.private.length} 個`,
        "info"
      );
      break;
    }

    default:
      manager.showHelp();
      break;
  }
}

module.exports = SmartGitManager;

if (require.main === module) {
  main();
}
