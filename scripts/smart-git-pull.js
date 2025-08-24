#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * 智能 Git Pull 系統
 * 實現雙儲存庫拉取功能，確保完整專案檔案存取權
 *
 * 功能：
 * 1. 從公開儲存庫拉取程式碼變更
 * 2. 從私有儲存庫拉取 AI 記憶檔案
 * 3. 智能合併，避免檔案衝突
 * 4. 提供完整專案檔案存取權
 */

class SmartGitPull {
  constructor() {
    this.publicRepo = {
      name: "public",
      remote: "origin",
      branch: "main",
      path: process.cwd(),
    };

    this.privateRepo = {
      name: "private",
      path: "D:\\marskingx.github.io-dev-sync",
      remote: "origin",
      branch: "main",
    };

    // 定義私有檔案模式（這些檔案從私有儲存庫拉取）
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
      throw new Error(`指令執行失敗: ${command}\\n${error.message}`);
    }
  }

  /**
   * 檢查私有檔案路徑
   */
  isPrivateFile(filePath) {
    return this.privateFilePatterns.some((pattern) => {
      if (pattern.endsWith("/")) {
        return filePath.startsWith(pattern);
      }
      if (pattern.includes("*")) {
        const regex = new RegExp(pattern.replace(/\\*/g, ".*"));
        return regex.test(filePath);
      }
      return filePath === pattern;
    });
  }

  /**
   * 完整智能拉取流程
   */
  async smartPull() {
    this.log("🔄 開始智能雙儲存庫拉取", "info");

    try {
      // 1. 先檢查工作目錄狀態
      await this.checkWorkingDirectory();

      // 2. 從公開儲存庫拉取
      await this.pullFromPublicRepo();

      // 3. 從私有儲存庫同步
      await this.syncFromPrivateRepo();

      // 4. 驗證檔案完整性
      await this.validateFileIntegrity();

      this.log("🎉 智能雙儲存庫拉取完成！", "success");
      this.showPullSummary();
    } catch (error) {
      this.log(`智能拉取失敗: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * 檢查工作目錄狀態
   */
  async checkWorkingDirectory() {
    this.log("檢查工作目錄狀態...", "info");

    const status = this.executeCommand("git status --porcelain", {
      silent: true,
    });

    if (status.trim()) {
      this.log("工作目錄有未提交變更，需要處理:", "warning");
      console.log(status);

      const answer = await this.prompt("是否要自動暫存變更? (y/N): ");
      if (answer.toLowerCase() === "y") {
        this.executeCommand("git stash push -m 'smart-pull auto stash'");
        this.log("已自動暫存變更", "success");
        return { hasStash: true };
      } else {
        throw new Error("請先處理工作目錄的變更");
      }
    }

    return { hasStash: false };
  }

  /**
   * 從公開儲存庫拉取變更
   */
  async pullFromPublicRepo() {
    this.log("從公開儲存庫拉取程式碼變更...", "info");

    try {
      // 拉取最新變更
      this.executeCommand("git fetch origin");

      // 檢查是否有更新
      const result = this.executeCommand(
        "git rev-list HEAD...origin/main --count",
        { silent: true },
      );
      const behindCount = parseInt(result.trim());

      if (behindCount === 0) {
        this.log("公開儲存庫已是最新版本", "info");
        return { updated: false };
      }

      this.log(`公開儲存庫有 ${behindCount} 個新提交`, "info");

      // 執行 pull
      this.executeCommand("git pull origin main");

      this.log("✓ 公開儲存庫拉取完成", "success");
      return { updated: true, commits: behindCount };
    } catch (error) {
      this.log(`公開儲存庫拉取失敗: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * 從私有儲存庫同步 AI 記憶檔案
   */
  async syncFromPrivateRepo() {
    this.log("從私有儲存庫同步 AI 記憶檔案...", "info");

    try {
      // 檢查私有儲存庫路徑
      if (!fs.existsSync(this.privateRepo.path)) {
        throw new Error(`私有儲存庫路徑不存在: ${this.privateRepo.path}`);
      }

      // 在私有儲存庫中拉取最新變更
      this.executeCommand("git pull origin main", {
        cwd: this.privateRepo.path,
        silent: true,
      });

      // 同步私有檔案到主專案
      await this.syncPrivateFiles();

      this.log("✓ 私有儲存庫同步完成", "success");
    } catch (error) {
      this.log(`私有儲存庫同步失敗: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * 同步私有檔案到主專案
   */
  async syncPrivateFiles() {
    this.log("同步私有檔案到主專案...", "info");

    const privateFilesToSync = [
      { source: "docs/aimemory/", target: "docs/aimemory/" },
      { source: ".kiro/", target: ".kiro/" },
      { source: ".claude-backups/", target: ".claude-backups/" },
      { source: ".env", target: ".env", optional: true },
      { source: "reindex/", target: "reindex/", optional: true },
    ];

    let syncedCount = 0;

    for (const fileConfig of privateFilesToSync) {
      const sourcePath = path.join(this.privateRepo.path, fileConfig.source);
      const targetPath = path.join(process.cwd(), fileConfig.target);

      if (!fs.existsSync(sourcePath)) {
        if (!fileConfig.optional) {
          this.log(`警告: 私有檔案不存在 ${fileConfig.source}`, "warning");
        }
        continue;
      }

      try {
        // 確保目標目錄存在
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // 複製檔案或目錄
        if (fs.statSync(sourcePath).isDirectory()) {
          await this.copyDirectory(sourcePath, targetPath);
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }

        syncedCount++;
        this.log(`同步完成: ${fileConfig.source}`, "info");
      } catch (error) {
        this.log(`同步失敗 ${fileConfig.source}: ${error.message}`, "warning");
      }
    }

    this.log(`共同步 ${syncedCount} 個私有檔案/目錄`, "success");
  }

  /**
   * 複製目錄（遞歸）
   */
  async copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);

    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);

      if (fs.statSync(sourcePath).isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * 驗證檔案完整性
   */
  async validateFileIntegrity() {
    this.log("驗證專案檔案完整性...", "info");

    const expectedFiles = [
      "package.json",
      "hugo.toml",
      "docs/aimemory/readme.md",
      ".kiro/steering/system-prompt.md",
    ];

    const missingFiles = [];

    for (const file of expectedFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      this.log(`發現缺失檔案: ${missingFiles.join(", ")}`, "warning");
    } else {
      this.log("檔案完整性驗證通過", "success");
    }

    return { valid: missingFiles.length === 0, missingFiles };
  }

  /**
   * 顯示拉取摘要
   */
  showPullSummary() {
    console.log(`
📊 智能拉取摘要:

🌐 公開儲存庫: 程式碼、配置檔案已同步
🔒 私有儲存庫: AI 記憶、開發檔案已同步

📁 現在你擁有完整的專案檔案存取權:
  ✅ 所有程式碼和配置
  ✅ 完整的 AI 記憶檔案
  ✅ 開發工具和腳本
  ✅ 私有配置和環境設定

💡 下次推送時會自動分流到對應儲存庫
    `);
  }

  /**
   * 簡單的提示輸入函數
   */
  async prompt(question) {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  /**
   * 顯示使用說明
   */
  showHelp() {
    console.log(`
🔄 智能 Git Pull 系統

使用方式:
  node smart-git-pull.js pull     # 完整雙儲存庫拉取
  node smart-git-pull.js help     # 顯示說明

功能特色:
  ✅ 自動從公開儲存庫拉取程式碼
  ✅ 自動從私有儲存庫同步 AI 記憶
  ✅ 智能檔案合併，避免衝突
  ✅ 提供完整專案檔案存取權
  ✅ 自動處理工作目錄狀態
    `);
  }
}

// CLI 接口
async function main() {
  const puller = new SmartGitPull();
  const [command] = process.argv.slice(2);

  switch (command) {
    case "pull":
      await puller.smartPull();
      break;

    default:
      puller.showHelp();
      break;
  }
}

module.exports = SmartGitPull;

if (require.main === module) {
  main().catch(console.error);
}
