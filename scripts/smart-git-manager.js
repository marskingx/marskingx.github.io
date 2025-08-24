#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
// const path = require("path"); // 暫時不使用

/**
 * Smart Git Manager
 * 智能 Git 管理系統 - 實現選擇性推送功能
 *
 * 功能：
 * 1. 分析 Git 變更，區分公開/私有檔案
 * 2. 自動將 AI 記憶檔案推送到私有儲存庫
 * 3. 將網站程式碼推送到公開儲存庫
 */

class SmartGitManager {
  constructor() {
    this.publicRepo = {
      name: "public",
      remote: "origin",
      branch: "main",
    };

    this.privateRepo = {
      name: "private",
      path: "D:\\marskingx.github.io-dev-sync",
      remote: "origin",
      branch: "main",
    };

    // 定義私有檔案模式 - 完整控制所有非網站必要檔案
    this.privateFilePatterns = [
      // AI 協作系統檔案
      "docs/",
      "docs/aimemory/",
      ".kiro/",
      ".claude-backups/",
      ".claude/",
      "reindex/",
      "AI_*.md",
      "CLAUDE*.md",
      "GEMINI*.md",
      "CODEX*.md",
      "*ONBOARDING*.md",
      "*HANDOVER*.md",
      "*REVIEW*.md",
      "*COLLABORATION*.md",
      "GSC_*.md",
      "GSC_*.txt",
      ".ai-lock.json",

      // 開發環境檔案
      ".env*",
      "*.log",
      "*.temp",
      "*.tmp",
      "git_log_temp.txt",

      // IDE 設定檔案
      ".idea/",
      ".vscode/",
      "*.code-workspace",

      // Python 開發環境
      ".venv/",
      "venv/",
      "scripts/venv/",
      "*.pyc",
      "__pycache__/",
      "*.egg-info/",

      // 備份檔案
      "*.backup",
      "*.bak",
      "*~",
      ".gitignore-backup",
      ".gitignore-private",

      // 壓縮檔案 (開發用)
      "*.zip",
      "*.tar.gz",
      "*.rar",

      // 開發文檔與分析報告
      "BRANCH_ANALYSIS_REPORT.md",
      "CHANGELOG.md",
      "HUGO.md",
      "prompt.md",
      "README-NEWSLETTER-POPUP.md",
      "VERSION_MANAGEMENT.md",
      "*HUGO_INTEGRATION*.md",
      "*HUGO_UPGRADE*.md",
      "*HUGO_REPORT*.md",
      "*CTR-Optimization*.md",
      "*SEO*.md",
      "GSC-CTR-Optimization-Prompt.md",
      "MULTI-AI-COLLABORATION.md",

      // GitHub 相關文檔
      ".github/MAILCHIMP_*.md",

      // External repositories and tools
      "Claude-Code-Usage-Monitor/",

      // 舊版及專案根目錄設定檔
      ".gitlab-ci.yml",
      "netlify.toml",
      "vercel.json",
      "amplify.yml",
      "vercel-build.sh",
      "Dmarskingx.github.io.markdownlint.json",

      // 臨時檔案
      "docs/temp.txt",
    ];
  }

  log(message, type = "info") {
    const prefix = {
      info: "📝",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    };
    console.log(`${prefix[type]} ${message}`);
  }

  executeCommand(command, options = {}) {
    try {
      return execSync(command, {
        encoding: "utf8",
        stdio: options.silent ? "pipe" : "inherit",
        cwd: options.cwd || process.cwd(),
        ...options,
      });
    } catch (error) {
      throw new Error(`指令執行失敗: ${command}\n${error.message}`);
    }
  }

  /**
   * 檢查檔案是否為私有檔案
   */
  isPrivateFile(filePath) {
    return this.privateFilePatterns.some((pattern) => {
      if (pattern.endsWith("/")) {
        return filePath.startsWith(pattern);
      }
      if (pattern.includes("*")) {
        const regex = new RegExp(pattern.replace(/\*/g, ".*"));
        return regex.test(filePath);
      }
      return filePath === pattern;
    });
  }

  /**
   * 分析 Git 狀態，區分公開/私有變更
   */
  analyzeGitChanges() {
    this.log("分析 Git 變更狀態...", "info");

    const statusOutput = this.executeCommand("git status --porcelain", {
      silent: true,
    });
    const lines = statusOutput
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);

    const changes = {
      public: [],
      private: [],
      untracked: [],
    };

    for (const line of lines) {
      const status = line.substring(0, 2);
      const filePath = line.substring(3);

      if (this.isPrivateFile(filePath)) {
        changes.private.push({ status, path: filePath });
      } else {
        changes.public.push({ status, path: filePath });
      }

      if (status.includes("?")) {
        changes.untracked.push({ status, path: filePath });
      }
    }

    return changes;
  }

  /**
   * 智能提交 - 分別處理公開和私有變更
   */
  async smartCommit(message) {
    const changes = this.analyzeGitChanges();

    if (changes.public.length === 0 && changes.private.length === 0) {
      this.log("沒有變更需要提交", "info");
      return { success: true };
    }

    this.log(`\n📊 變更分析:`, "info");
    this.log(`🌐 公開檔案: ${changes.public.length} 個`, "info");
    this.log(`🔒 私有檔案: ${changes.private.length} 個`, "info");

    try {
      // 1. 先處理所有變更（暫存）
      this.executeCommand("git add .");

      // 自動生成補充的提交內容摘要
      const enhancedMessage = this.buildCommitMessage(message, changes);
      this.executeCommand(`git commit -m "${enhancedMessage}"`);

      this.log("✓ 本地提交完成", "success");
      // 2. 先遞增 5碼版本的第5碼（協作日誌），再追加協作日誌（Codex 自動）
      try {
        // bump log version
        this.executeCommand(`${process.execPath} scripts/version-manager.js log`, { silent: true });
        const version = this.readProjectVersion();
        const fileList = [...changes.public, ...changes.private]
          .map((c) => c.path)
          .slice(0, 10)
          .join(', ');
        const logCmd = [
          process.execPath,
          'scripts/aimemory-log-update.js',
          '--agent', 'Codex',
          '--task', '智能提交',
          '--summary', message,
          '--no-bump',
        ];
        if (fileList) {
          logCmd.push('--files', fileList);
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

  /**
   * 智能推送 - 將私有檔案推送到私有儲存庫，公開檔案推送到公開儲存庫
   */
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

  /**
   * 推送到私有儲存庫
   */
  async pushToPrivateRepo() {
    try {
      // 檢查私有儲存庫路徑
      if (!fs.existsSync(this.privateRepo.path)) {
        throw new Error(`私有儲存庫路徑不存在: ${this.privateRepo.path}`);
      }

      // 同步當前變更到私有儲存庫
      const PrivateRepoHandler = require("./private-repo-handler");
      const handler = new PrivateRepoHandler();

      // 產生簡易摘要訊息
      let commitMsg = "sync: 智能同步 AI 記憶檔案";
      try {
        const st = await handler.getStatus();
        if (st && st.hasChanges) {
          const lines = (st.changes || "").trim().split(/\n/).filter(Boolean);
          const counts = { M: 0, A: 0, D: 0, R: 0, C: 0, Q: 0 };
          const files = [];
          lines.forEach((l) => {
            const code = l.slice(0, 2);
            const p = l.slice(3);
            if (code.includes("M")) counts.M++; else if (code.includes("A")) counts.A++; else if (code.includes("D")) counts.D++; else if (code.includes("R")) counts.R++; else if (code.includes("C")) counts.C++; else if (code.includes("?")) counts.Q++;
            files.push(p);
          });
          const top = files.slice(0, 20).join(", ");
          commitMsg += `\n\n## Change Summary\n- Changes: ${lines.length} (M:${counts.M} A:${counts.A} D:${counts.D})`;
          if (top) commitMsg += `\n- Files: ${top}`;
        }
      } catch {}

      const result = await handler.pushChanges(commitMsg);

      if (result.success) {
        this.log("✓ 私有儲存庫同步完成", "success");
      }

      return result;
    } catch (error) {
      this.log(`私有儲存庫推送失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  /**
   * 推送到公開儲存庫
   */
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

  /**
   * 完整的智能發布流程
   */
  async smartRelease(message = "feat: 智能發布更新") {
    this.log("🚀 開始智能發布流程", "info");

    try {
      // 1. 智能提交
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

  /**
   * 顯示使用說明
   */
  showHelp() {
    console.log(`
🤖 智能 Git 管理系統

使用方式:
  node smart-git-manager.js commit [message]    # 智能提交
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

  /**
   * 生成提交訊息摘要（含變更統計與檔案清單）
   */
  buildCommitMessage(baseMessage, changes) {
    const msg = baseMessage && baseMessage.trim().length > 0 ? baseMessage.trim() : "feat: 智能提交更新";
    const summarize = (arr) => {
      const stat = { M: 0, A: 0, D: 0, R: 0, C: 0, Q: 0 };
      arr.forEach((i) => {
        const s = i.status || "";
        if (s.includes("M")) stat.M++;
        else if (s.includes("A")) stat.A++;
        else if (s.includes("D")) stat.D++;
        else if (s.includes("R")) stat.R++;
        else if (s.includes("C")) stat.C++;
        else if (s.includes("?")) stat.Q++;
      });
      return stat;
    };

    const pubStat = summarize(changes.public);
    const priStat = summarize(changes.private);

    const top = (arr) => arr.map((c) => c.path).slice(0, 20);
    const pubFiles = top(changes.public);
    const priFiles = top(changes.private);

    const lines = [
      msg,
      "",
      "## Change Summary",
      `- Public: ${changes.public.length} (M:${pubStat.M} A:${pubStat.A} D:${pubStat.D})`,
      `- Private: ${changes.private.length} (M:${priStat.M} A:${priStat.A} D:${priStat.D})`,
    ];
    if (pubFiles.length) lines.push(`- Files(public): ${pubFiles.join(", ")}`);
    if (priFiles.length) lines.push(`- Files(private): ${priFiles.join(", ")}`);

    // 附上目前 5 碼版本
    try {
      const v = this.readProjectVersion();
      if (v) lines.push(`- Version: ${v}`);
    } catch {}

    return lines.join("\n");
  }

  /**
   * 讀取專案四段式版本，回退到 package.json 版本
   */
  readProjectVersion() {
    try {
      const txt = require('fs').readFileSync('.version', 'utf8');
      const obj = JSON.parse(txt);
      if (obj && obj.version) return obj.version;
    } catch {}
    try {
      const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
      return pkg.version || '';
    } catch {}
    return '';
  }
}

// CLI 接口
async function main() {
  const manager = new SmartGitManager();
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "commit": {
      const message = args.join(" ") || "feat: 智能提交更新";
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
      // console.log("\n📊 變更分析結果:");
      // console.log(
      //   "🌐 公開檔案:",
      //   changes.public.map((c) => c.path),
      // );
      // console.log(
      //   "🔒 私有檔案:",
      //   changes.private.map((c) => c.path),
      // );
      manager.log(
        `\n📊 變更分析結果: 公開 ${changes.public.length} 個，私有 ${changes.private.length} 個`,
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
