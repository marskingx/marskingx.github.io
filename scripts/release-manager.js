#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const PrivateRepoHandler = require("./private-repo-handler");

/**
 * Release Manager
 * 統一管理公開和私有儲存庫的發布流程
 */

class ReleaseManager {
  constructor() {
    this.privateHandler = new PrivateRepoHandler();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  log(message, type = "info") {
    const prefix = {
      info: "📝",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      question: "❓",
    };

    console.log(`${prefix[type]} ${message}`);
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(`❓ ${prompt}`, (answer) => {
        resolve(answer);
      });
    });
  }

  executeCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: "utf8",
        stdio: options.silent ? "pipe" : "inherit",
        ...options,
      });
      return result;
    } catch (error) {
      throw new Error(`命令執行失敗: ${command}\\n錯誤: ${error.message}`);
    }
  }

  getCurrentVersion() {
    try {
      const versionFile = path.join(__dirname, "..", ".version");
      if (fs.existsSync(versionFile)) {
        const versionData = JSON.parse(fs.readFileSync(versionFile, "utf8"));
        return versionData.version;
      }

      const packageJson = path.join(__dirname, "..", "package.json");
      if (fs.existsSync(packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(packageJson, "utf8"));
        return pkg.version;
      }

      throw new Error("找不到版本資訊");
    } catch (error) {
      throw new Error(`讀取版本失敗: ${error.message}`);
    }
  }

  validatePreConditions() {
    this.log("檢查發布前置條件...", "info");

    // 檢查是否在 main 分支
    const currentBranch = this.executeCommand("git branch --show-current", {
      silent: true,
    }).trim();
    if (currentBranch !== "main") {
      throw new Error(`必須在 main 分支執行發布，目前在 ${currentBranch} 分支`);
    }

    // 檢查工作目錄是否乾淨
    const status = this.executeCommand("git status --porcelain", {
      silent: true,
    }).trim();
    if (status) {
      throw new Error(`工作目錄有未提交的變更:\\n${status}`);
    }

    // 檢查是否與遠端同步
    this.executeCommand("git fetch origin main");
    const behind = this.executeCommand(
      "git rev-list --count HEAD..origin/main",
      { silent: true },
    ).trim();
    if (parseInt(behind) > 0) {
      throw new Error(`本地分支落後遠端 ${behind} 個提交，請先執行 git pull`);
    }

    this.log("✓ 前置條件檢查通過", "success");
  }

  async promptVersionType() {
    const currentVersion = this.getCurrentVersion();
    this.log(`目前版本: ${currentVersion}`);

    console.log(`
📋 請選擇版本類型:
  1. patch - 錯誤修復 (${this.getNextVersion(currentVersion, "patch")})
  2. minor - 新功能 (${this.getNextVersion(currentVersion, "minor")})  
  3. major - 重大更新 (${this.getNextVersion(currentVersion, "major")})
    `);

    const answer = await this.question("請選擇 (1-3): ");

    const typeMap = { 1: "patch", 2: "minor", 3: "major" };
    const versionType = typeMap[answer];

    if (!versionType) {
      throw new Error("無效的選擇");
    }

    const newVersion = this.getNextVersion(currentVersion, versionType);
    const confirm = await this.question(`確認發布版本 ${newVersion}? (y/N): `);

    if (confirm.toLowerCase() !== "y") {
      throw new Error("取消發布");
    }

    return { type: versionType, version: newVersion };
  }

  getNextVersion(current, type) {
    const parts = current.split(".");
    let [major, minor, patch] = parts.map(Number);

    switch (type) {
      case "major":
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case "minor":
        minor += 1;
        patch = 0;
        break;
      case "patch":
        patch += 1;
        break;
    }

    return `${major}.${minor}.${patch}.0`;
  }

  async executePublicRepoRelease(versionType) {
    this.log("開始公開儲存庫發布流程...", "info");

    try {
      // 執行版本更新
      this.executeCommand(`npm run version:${versionType}`);
      this.log("✓ 版本更新完成");

      return { success: true };
    } catch (error) {
      this.log(`公開儲存庫發布失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async syncPrivateRepo(newVersion) {
    this.log("同步私有儲存庫...", "info");

    try {
      // 推送 AI 記憶變更
      const pushResult = await this.privateHandler.pushChanges(
        `sync: AI memory update for release ${newVersion}`,
      );

      if (!pushResult.success) {
        throw new Error(pushResult.error);
      }

      // 建立相同的版本標籤
      const tagResult = await this.privateHandler.createTag(
        `v${newVersion.replace(".0", "")}`,
      );

      if (!tagResult.success) {
        throw new Error(tagResult.error);
      }

      this.log("✓ 私有儲存庫同步完成", "success");
      return { success: true };
    } catch (error) {
      this.log(`私有儲存庫同步失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async startRelease() {
    this.log("🚀 開始發布流程", "info");

    try {
      // 驗證前置條件
      this.validatePreConditions();

      // 提示版本選擇
      const { type: versionType, version: newVersion } =
        await this.promptVersionType();

      this.log(`準備發布版本 ${newVersion}`, "info");

      // 執行公開儲存庫發布
      const publicResult = await this.executePublicRepoRelease(versionType);
      if (!publicResult.success) {
        throw new Error(`公開儲存庫發布失敗: ${publicResult.error}`);
      }

      // 同步私有儲存庫
      const privateResult = await this.syncPrivateRepo(newVersion);
      if (!privateResult.success) {
        this.log("⚠️ 私有儲存庫同步失敗，但公開儲存庫發布成功", "warning");
        this.log(`請手動同步私有儲存庫，版本: ${newVersion}`, "warning");
      }

      this.log(`🎉 發布完成！版本: ${newVersion}`, "success");
      this.log("執行以下指令來部署: npm run release:deploy", "info");
    } catch (error) {
      this.log(`發布失敗: ${error.message}`, "error");
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async memoryPush(message) {
    this.log("推送記憶到私有儲存庫...", "info");

    try {
      const result = await this.privateHandler.pushChanges(message);

      if (result.success) {
        this.log("✓ 記憶推送成功", "success");
      } else {
        this.log(`記憶推送失敗: ${result.error}`, "error");
        process.exit(1);
      }
    } catch (error) {
      this.log(`記憶推送失敗: ${error.message}`, "error");
      process.exit(1);
    }
  }

  async memoryPull() {
    this.log("從私有儲存庫拉取記憶...", "info");

    try {
      const result = await this.privateHandler.pullChanges();

      if (result.success) {
        this.log("✓ 記憶拉取成功", "success");
      } else {
        this.log(`記憶拉取失敗: ${result.error}`, "error");
        process.exit(1);
      }
    } catch (error) {
      this.log(`記憶拉取失敗: ${error.message}`, "error");
      process.exit(1);
    }
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new ReleaseManager();

  switch (command) {
    case "start":
      await manager.startRelease();
      break;

    case "memory:push":
      const message = args[1] || "sync: AI memory update";
      await manager.memoryPush(message);
      break;

    case "memory:pull":
      await manager.memoryPull();
      break;

    default:
      console.log(`
🚀 發布管理系統

使用方法:
  node release-manager.js <command> [options]

指令:
  start              - 開始互動式發布流程
  memory:push [msg]  - 推送記憶到私有儲存庫
  memory:pull        - 從私有儲存庫拉取記憶

範例:
  node release-manager.js start
  node release-manager.js memory:push "update AI protocols"
  node release-manager.js memory:pull
      `);
  }
}

module.exports = ReleaseManager;

if (require.main === module) {
  main();
}
