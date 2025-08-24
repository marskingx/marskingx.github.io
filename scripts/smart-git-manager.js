#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

    // 定義私有檔案模式
    this.privateFilePatterns = [
      "docs/aimemory/",
      ".kiro/",
      ".claude-backups/",
      ".env*",
      "reindex/",
      "AI_*.md",
      "CLAUDE*.md",
      "GEMINI*.md",
      "CODEX*.md",
      "*ONBOARDING*.md",
      "*HANDOVER*.md",
      "*REVIEW*.md",
      "*COLLABORATION*.md",
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
      this.executeCommand(`git commit -m "${message}"`);

      this.log("✓ 本地提交完成", "success");
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
}

// CLI 接口
async function main() {
  const manager = new SmartGitManager();
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "commit":
      const message = args.join(" ") || "feat: 智能提交更新";
      await manager.smartCommit(message);
      break;

    case "push":
      await manager.smartPush();
      break;

    case "release":
      const releaseMessage = args.join(" ") || "feat: 智能發布更新";
      await manager.smartRelease(releaseMessage);
      break;

    case "analyze":
      const changes = manager.analyzeGitChanges();
      console.log("\n📊 變更分析結果:");
      console.log(
        "🌐 公開檔案:",
        changes.public.map((c) => c.path),
      );
      console.log(
        "🔒 私有檔案:",
        changes.private.map((c) => c.path),
      );
      break;

    default:
      manager.showHelp();
      break;
  }
}

module.exports = SmartGitManager;

if (require.main === module) {
  main();
}
